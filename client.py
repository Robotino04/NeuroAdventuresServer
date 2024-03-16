import requests
import webbrowser
import secrets
import time
from pprint import pprint

BASE_URL = "http://localhost:5173/neuroadventures"
DISCORD_API_URL = "https://discordapp.com/api"

global_headers = {
    "Accept": "*/*",
    "User-Agent": "Neuro Adventures! client (https://someurl.example.com)",
}


def authenticate():
    state = secrets.token_hex(16)

    webbrowser.open(f"{BASE_URL}/auth/discord/redirect?state={state}")

    while (
        response := requests.request(
            "GET",
            f"{BASE_URL}/auth/discord/tokens?state={state}",
            data="",
            headers=global_headers,
        )
    ).status_code == 503:
        # retry until response is no longer 503 Unavailable
        # probably add a timeout for real use
        time.sleep(1)

    if response.status_code != 200:
        raise RuntimeError("Authentication failed")

    json = response.json()
    return json["access_token"], json["refresh_token"]


def get_user_info(tokens):
    headers = global_headers.copy()
    headers.update({"Authorization": f"Bearer {tokens[0]}"})
    response = requests.request(
        "GET",
        f"{DISCORD_API_URL}/oauth2/@me",
        data="",
        headers=headers,
    )

    if response.status_code != 200:
        raise RuntimeError("Authentication failed")

    json = response.json()
    return json["user"]


def refresh_if_needed(tokens):
    try:
        get_user_info(tokens)
        return tokens
    
    except RuntimeError:
        headers = global_headers.copy()
        headers.update({"Authorization": f"Bearer {tokens[1]}"})
        response = requests.request(
            "POST",
            f"{BASE_URL}/auth/discord/refresh",
            data="",
            headers=headers,
        )

        if response.status_code != 200:
            raise RuntimeError("Authentication failed")

        json = response.json()
        return json["access_token"], json["refresh_token"]


def revoke(tokens):
    headers = global_headers.copy()
    headers.update({"Authorization": f"Bearer {tokens[0]}"})
    response = requests.request(
        "POST",
        f"{BASE_URL}/auth/discord/revoke",
        data="",
        headers=headers,
    )

    if response.status_code != 200:
        raise RuntimeError("Authentication failed")

tokens = authenticate()
tokens = refresh_if_needed(tokens)
print(get_user_info(tokens))
revoke(tokens)