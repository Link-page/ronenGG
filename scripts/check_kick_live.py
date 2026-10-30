"""Writes data/kick_live.json ({"is_live": true|false}) for the Kick live badge.

Uses Kick's official public API with an OAuth client-credentials token.
Requires the KICK_CLIENT_ID and KICK_CLIENT_SECRET environment variables
(GitHub Actions secrets). Any failure is logged and recorded as offline.

Usage: python scripts/check_kick_live.py
"""
import os

import requests

from lib.output import write_json

CHANNEL_SLUG = "ronengg"
TOKEN_URL = "https://id.kick.com/oauth/token"
CHANNELS_URL = "https://api.kick.com/public/v1/channels"
OUTPUT_FILE = "data/kick_live.json"
TIMEOUT_SECONDS = 10


def get_access_token(client_id, client_secret):
    """Exchanges app credentials for a short-lived bearer token."""
    resp = requests.post(
        TOKEN_URL,
        data={
            "grant_type": "client_credentials",
            "client_id": client_id,
            "client_secret": client_secret,
        },
        timeout=TIMEOUT_SECONDS,
    )
    resp.raise_for_status()
    return resp.json()["access_token"]


def parse_is_live(channels_payload):
    """Reads the live flag from a /public/v1/channels response body."""
    data = channels_payload.get("data", [])
    if data:
        return bool(data[0].get("stream", {}).get("is_live", False))
    return False


def fetch_is_live(client_id, client_secret):
    """Returns whether the channel is live; any error is logged and means offline."""
    if not client_id or not client_secret:
        print("Missing KICK_CLIENT_ID / KICK_CLIENT_SECRET environment variables.")
        return False

    try:
        token = get_access_token(client_id, client_secret)
        res = requests.get(
            CHANNELS_URL,
            headers={"Authorization": f"Bearer {token}"},
            params={"slug": CHANNEL_SLUG},
            timeout=TIMEOUT_SECONDS,
        )
        if res.status_code == 200:
            return parse_is_live(res.json())
        print(f"Failed to fetch channel: {res.status_code} - {res.text[:300]}")
    except Exception as e:
        print("Error fetching live status:", e)
    return False


def main():
    is_live = fetch_is_live(
        os.environ.get("KICK_CLIENT_ID"),
        os.environ.get("KICK_CLIENT_SECRET"),
    )
    write_json(OUTPUT_FILE, {"is_live": is_live})


if __name__ == "__main__":
    main()
