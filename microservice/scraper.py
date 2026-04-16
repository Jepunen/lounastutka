from fastapi import FastAPI
import requests
from bs4 import BeautifulSoup
import re

app = FastAPI()

def geocode_address(address):
    url = "https://nominatim.openstreetmap.org/search"
    params = {"q": address, "format": "json", "limit": 1}
    headers = {"User-Agent": "lounastutka"}

    res = requests.get(url, params=params, headers=headers)
    data = res.json()

    if data:
        return {"lat": data[0]["lat"], "lon": data[0]["lon"]}
    return None


def scrape(url):
    res = requests.get(url)
    soup = BeautifulSoup(res.text, "lxml")

    results = []

    for div in soup.find_all("div"):
        text = div.get_text("\n").strip()
        lines = [l.strip() for l in text.split("\n") if l.strip()]

        if len(lines) < 3:
            continue

        name = lines[0]
        menu = []
        address = None

        for line in lines:
            if re.search(r"\d+[,.]?\d*\s?€", line):
                menu.append({"name": line})

            if "katu" in line.lower():
                address = line

        if menu:
            coords = geocode_address(address) if address else None

            results.append({
                "name": name,
                "address": address,
                "coordinates": coords,
                "menu": menu
            })

    return results


@app.post("/scrape")
def scrape_urls(payload: dict):
    urls = payload.get("urls", [])
    all_results = []

    for url in urls:
        try:
            data = scrape(url)
            all_results.extend(data)
        except Exception as e:
            print("Error:", e)

    return all_results