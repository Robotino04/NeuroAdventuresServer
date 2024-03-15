import requests
import webbrowser
import secrets
import time
from pprint import pprint

baseUrl = "http://localhost:5173/neuroadventures"


headersList = {
    "Accept": "*/*",
    "User-Agent": "Neuro Adventures! client (https://someurl.example.com)" 
}

def authenticate():
    state = secrets.token_hex(16)

    webbrowser.open(baseUrl + f"/auth/discord/redirect?state={state}")

    reqUrl = baseUrl + f"/auth/discord/tokens?state={state}"
    while (response := requests.request("GET", reqUrl, data="",  headers=headersList)).status_code == 503:
        # retry until response is no longer 503 Unavailable
        # probably add a timeout for real use
        time.sleep(1)

    if (response.status_code != 200):
        raise RuntimeError("Authentication failed")

    json = response.json()
    return json["access_token"], json["refresh_token"]

tokens = authenticate()
pprint(tokens)