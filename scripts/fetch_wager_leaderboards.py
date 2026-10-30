"""Mirrors the EmpireDrop / CSDrop wager leaderboards into data/<site>.json.

The data comes from the ronen.gg API and feeds the leaderboard widget in the
CODES & LEADERBOARDS view. A failing site is logged and skipped, leaving its
previous file in place.

Usage: python scripts/fetch_wager_leaderboards.py
"""
import json
import urllib.request

from lib.output import write_json

SITES = ("empiredrop", "csdrop")
BASE_URL = "https://ronen.gg/api/"
HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
}


def fetch_leaderboard(site):
    """Downloads and parses one site's leaderboard JSON."""
    req = urllib.request.Request(BASE_URL + site, headers=HEADERS)
    with urllib.request.urlopen(req) as response:
        return json.loads(response.read().decode())


def main():
    for site in SITES:
        try:
            data = fetch_leaderboard(site)
            write_json(f"data/{site}.json", data, ensure_ascii=False, indent=4)
            print(f"Successfully fetched and updated {site}.json")
        except Exception as e:
            print(f"Error fetching {site}: {e}")


if __name__ == "__main__":
    main()
