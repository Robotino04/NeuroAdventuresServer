import { error, json } from "@sveltejs/kit";
import { ScoreboardEntry, isValidJSONForScoreboardEntry } from "$lib/ScoreboardEntry";
import * as fs from "fs";
import { getGuildMemberInfo, isDiscordUserInfo } from "$lib/discordAuth.js";
import { allGamemodes } from "$lib/Gamemode.js";
import { building } from "$app/environment";
import DatabaseConstructor, { type Database } from "better-sqlite3";

let db: Database;

type Queries = {
    insertScore: string,
    getPlaceOfNewestScoreByPlayer: string,
    getTopScoresOfGamemode: string,
    getNumScoresOfGamemode: string,
    getHistoricHighscoresOfGamemode: string,
    getNumHistoricHighscoresOfGamemode: string,
};


let queries: Queries;

if (!building) {
    const read = (name: string) => fs.readFileSync(`./SQL/${name}.sql`, { encoding: "utf8" });

    db = new DatabaseConstructor("./data/db.sqlite");
    db.prepare(read("schema")).run();

    queries = {
        insertScore: read("insertScore"),
        getPlaceOfNewestScoreByPlayer: read("getPlaceOfNewestScoreByPlayer"),
        getTopScoresOfGamemode: read("getTopScoresOfGamemode"),
        getNumScoresOfGamemode: read("getNumScoresOfGamemode"),
        getHistoricHighscoresOfGamemode: read("getHistoricHighscoresOfGamemode"),
        getNumHistoricHighscoresOfGamemode: read("getNumHistoricHighscoresOfGamemode"),
    };
}

function shutdownGracefully() {
    db.close();
    console.log("DB connection closed.");
    process.exit(0);
}

if (!building) {
    process.on('SIGINT', shutdownGracefully);
    process.on('SIGTERM', shutdownGracefully);
}

let submissions_on_cooldown: Map<string, Date> = new Map<string, Date>();

const MAX_OUT_OF_TIME_DIFFERENCE_MS = 1 * 60 * 60 * 1000; // 1 hour
const MAX_SCORE = 20_000;
const SUBMISSION_TIMEOUT_MS = 10 * 1000; // 1 minute
const MIN_PLAYERNAME_LENGTH = 4;


function handleRateLimiting(userID: string) {
    if (submissions_on_cooldown.get(userID) !== undefined) {
        let time_since_submission = (new Date().getTime() - submissions_on_cooldown.get(userID)!.getTime());

        if (time_since_submission < SUBMISSION_TIMEOUT_MS) {
            let time_left = (SUBMISSION_TIMEOUT_MS - time_since_submission) / 1000;
            console.log("rate limited");
            throw error(429, `You can only submit scores every ${SUBMISSION_TIMEOUT_MS / 1000} seconds. (${time_left}s left)`);
        }
        else {
            // a new time will be set below
        }
    }

    submissions_on_cooldown.set(userID, new Date());
}

function detectObviousCheats(entry: ScoreboardEntry) {
    if (entry.score >= MAX_SCORE) {
        console.log("cheated score");
        throw error(403, "Impossible submission.");
    }
}

function detectImpossibleEntries(entry: ScoreboardEntry) {
    if (entry.score < 500) {
        console.log("score too low");
        throw error(400, "Score is too low. Must be above 500.");
    }

    if (entry.username.length < MIN_PLAYERNAME_LENGTH) {
        console.log("player name too short");
        throw error(400, `Player name is too short. Use at least ${MIN_PLAYERNAME_LENGTH} characters.`);
    }
}

export async function GET({ url }) {
    if (url.searchParams.get('n') === null) {
        throw error(400, `Request must include number of scores as query.`);
    }

    const o = parseInt(url.searchParams.get('o') ?? "0");
    const n = parseInt(url.searchParams.get('n')!);
    let gamemode = url.searchParams.get('gamemode');

    if (n > 500) {
        throw error(400, `Only request up to 500 scores at once.`);
    }

    if (gamemode !== null) {
        if (!allGamemodes.includes(gamemode as any)) {
            throw error(400, `Gamemode must be one of ${allGamemodes.join(", ")}.`);
        }
    }

    let rows = db.prepare(queries.getHistoricHighscoresOfGamemode).all([gamemode, o, n]);


    let num_scores = db.prepare(queries.getNumHistoricHighscoresOfGamemode).get([gamemode]);
    num_scores = (num_scores as any)["COUNT(*)"];

    return json({ scores: rows, num_scores });
}

function containsAccessToken(obj: any): obj is { discord_access_token: string } {
    return typeof obj.discord_access_token === "string";
}

const DISCORD_API_URL: string = import.meta.env.VITE_DISCORD_API_URL;
export async function POST({ request, cookies, getClientAddress }) {
    var discord_access_token = request.headers.get("Authorization");
    if (!discord_access_token) {
        throw error(401, "Must include access token.");
    }
    discord_access_token = discord_access_token.split(" ")[1];

    const body = await request.json();
    console.log(discord_access_token);
    console.log(body);


    const userInfo = await fetch(`${DISCORD_API_URL}/users/@me`, {
        headers: { 'Authorization': `Bearer ${discord_access_token}` }
    });
    const userInfoBody = await userInfo.json();
    console.log(userInfoBody);

    if (userInfo.status !== 200 || !isDiscordUserInfo(userInfoBody)) {
        console.log("discord auth error");
        throw error(500, `Discord said no. Maybe refresh your access token. (${JSON.stringify(userInfoBody)})`);
    }
    handleRateLimiting(userInfoBody.id);

    if (!isValidJSONForScoreboardEntry(body)) {
        console.log("invalid data");
        throw error(400, "Invalid data layout.");
    }

    var entry = new ScoreboardEntry(body);
    entry.user_id = userInfoBody.id;
    entry.global_name = userInfoBody.global_name;
    entry.username = userInfoBody.global_name;

    const guildInfo = await getGuildMemberInfo(discord_access_token, "574720535888396288");
    if (guildInfo.nick !== null && guildInfo.nick !== undefined) {
        entry.username = guildInfo.nick.replace(/\([^)]*\)/g, "").replace(/\[[^)]*\]/g, "").trim();
        if (entry.username.length <= 3) {
            entry.username = entry.global_name;
        }
    }

    console.log(guildInfo)

    detectImpossibleEntries(entry);
    detectObviousCheats(entry);

    db.prepare(queries.insertScore).run([
        entry.username,
        entry.global_name,
        entry.user_id,
        entry.score,
        entry.server_time.toISOString().slice(0, 19).replace('T', ' '),
        entry.gamemode
    ]);
    console.log("score inserted");

    entry.place = (db.prepare(queries.getPlaceOfNewestScoreByPlayer).get([entry.user_id]) as any)["place"];
    console.log(entry);

    return json(entry, { status: 201 });
}