import urllib.request
import json
import os

os.makedirs('data', exist_ok=True)

sites = ['empiredrop', 'csdrop']
base_url = 'https://ronen.gg/api/'

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
}

for site in sites:
    try:
        url = base_url + site
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req) as response:
            data = json.loads(response.read().decode())
            
            with open(f'data/{site}.json', 'w', encoding='utf-8') as f:
                json.dump(data, f, ensure_ascii=False, indent=4)
                
        print(f"Successfully fetched and updated {site}.json")
    except Exception as e:
        print(f"Error fetching {site}: {e}")
