import { redirect } from "@sveltejs/kit";

import { DISCORD_CLIENT_ID, DISCORD_REDIRECT_URI, DISCORD_TOKEN_SCOPES } from '$env/static/private';

const DISCORD_ENDPOINT = `https://discord.com/api/oauth2/authorize?client_id=${DISCORD_CLIENT_ID}&redirect_uri=${encodeURIComponent(DISCORD_REDIRECT_URI)}&response_type=code&scope=${DISCORD_TOKEN_SCOPES}`;

export async function GET({ url }) {
	throw redirect(302, DISCORD_ENDPOINT + "&" + url.searchParams.toString());
}