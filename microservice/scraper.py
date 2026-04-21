import requests
from bs4 import BeautifulSoup
import re
from fastapi import FastAPI
from pydantic import BaseModel
from typing import List

app = FastAPI()

# scraper code
"""
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
"""

class ScrapeRequest(BaseModel):
    urls: str


# Mock restaurant data
def get_mock_restaurant():
    return {
        "id": 1,
        "type": "restaurant",
        "position": [61.05692, 28.19061],
        "name": "Aalef",
        "category": "Ravintola",
        "stars": 4.9,
        "reviews": 120,
        "address": "Villimiehenkatu 1",
        "description": "something",
        "todayHours": "10:00-15:00",
        "lunchTime": "11:00-14:00",
        "priceLevel": "Lunch 12 EUR",
        "phone": "9999",
        "website": "https://example.fi",
        "tags": ["something", "test", "vegetarian"],
        "todayMenu": ["Salmon", "bread", "soup"],
    }


@app.post("/scrape")
def scrape(request: ScrapeRequest):

    return get_mock_restaurant()

    """def scrape_urls(payload: dict):
    urls = payload.get("urls", [])
    all_results = []

    for url in urls:
        try:
            data = scrape(url)
            all_results.extend(data)
        except Exception as e:
            print("Error:", e)

    return all_results"""


@app.get("/health")
def health():
    return {"status": "ok"}