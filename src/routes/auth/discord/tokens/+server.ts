import { currentDiscordTokens } from "$lib/currentDiscordTokens";

import { error, json, redirect } from "@sveltejs/kit";

export async function GET({ url }) {
  // fetch returnCode set in the URL parameters.
  const state = url.searchParams.get('state');
  
  if (state === null) {
    throw error(400, "Request must contain a state.");
  }

  const tokens = currentDiscordTokens.get(state);
  
  if (tokens === undefined) {
    throw error(503);
  }
  const data = {
    access_token: tokens.access_token,
    refresh_token: tokens.refresh_token,
  };
  clearTimeout(tokens.timeout);
  currentDiscordTokens.delete(state);


  return json(data);
}