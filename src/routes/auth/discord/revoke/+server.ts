import { json } from '@sveltejs/kit';

import { DISCORD_CLIENT_ID, DISCORD_CLIENT_SECRET } from '$env/static/private';

export async function POST({ request }) {
  var discord_access_token = request.headers.get("Authorization");
  if (!discord_access_token) {
    return json({ error: 'No access token found' }, { status: 400 });
  }
  discord_access_token = discord_access_token.split(" ")[1];

  const data = new URLSearchParams({
    'token': discord_access_token,
    'token_type_hint': 'access_token'
  });

  const headers = {
    'Content-Type': 'application/x-www-form-urlencoded',
    'Authorization': 'Basic ' + btoa(DISCORD_CLIENT_ID + ':' + DISCORD_CLIENT_SECRET)
  };

  // performing a Fetch request to Discord's token endpoint
  const dc_request = await fetch("https://discord.com/api/oauth2/token/revoke", {
    method: 'POST',
    headers: headers,
    body: data
  });

  const response = await dc_request.json();

  if (response.error) {
    return json({ error: response.error }, { status: 500 });
  }

  return new Response(null, { status: 200 });
}