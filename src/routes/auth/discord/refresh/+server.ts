import { json } from '@sveltejs/kit';

import { DISCORD_API_URL, DISCORD_CLIENT_ID, DISCORD_CLIENT_SECRET } from '$env/static/private';

export async function POST({ request }) {
  var discord_refresh_token = request.headers.get("Authorization");
  if (!discord_refresh_token) {
    return json({ error: 'No refresh token found' }, { status: 400 });
  }
  discord_refresh_token = discord_refresh_token.split(" ")[1];

  const data = new URLSearchParams({
    'grant_type': 'refresh_token',
    'refresh_token': discord_refresh_token
  });

  const headers = {
    'Content-Type': 'application/x-www-form-urlencoded',
    'Authorization': 'Basic ' + btoa(DISCORD_CLIENT_ID + ':' + DISCORD_CLIENT_SECRET)
  };

  const dc_request = await fetch(`${DISCORD_API_URL}/oauth2/token`, {
    method: 'POST',
    headers: headers,
    body: data
  });

  const response = await dc_request.json();

  if (response.error) {
    return json({ error: response.error }, { status: 500 });
  }

  return json({
    access_token: response.access_token,
    refresh_token: response.refresh_token
  })
}