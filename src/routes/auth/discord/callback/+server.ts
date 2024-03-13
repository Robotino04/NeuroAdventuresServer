import { currentDiscordTokens } from "$lib/currentDiscordTokens";

import { turnCodeToTokens as turnCodeIntoTokens } from "$lib/discordAuth.js";
import { error, json, redirect } from "@sveltejs/kit";

export async function GET({ url }) {
  // fetch returnCode set in the URL parameters.
  const returnCode = url.searchParams.get('code');
  const state = url.searchParams.get('state');

  if (returnCode === null || returnCode === undefined) {
    throw error(400, "Request must contain code and state.");
  }
  if (state === null || state === undefined) {
    throw error(400, "Request must contain code and state.");
  }
  const tokens = await turnCodeIntoTokens(returnCode)

  console.log(tokens);

  // redirect to front page in case of error
  if (tokens.error) {
    throw error(500, `Discord error: ${tokens.error}`);
  }

  clearTimeout(currentDiscordTokens.get(state)?.timeout);

  currentDiscordTokens.set(state, {
    access_token: tokens.access_token,
    refresh_token: tokens.refresh_token,
    timeout: setTimeout(() => {
      currentDiscordTokens.delete(state);
    }, 5 * 60 * 1000),
  });
  console.log("Added tokens");

  throw redirect(302, "loginSuccess");
}