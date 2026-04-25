import requests
from bs4 import BeautifulSoup
import re
import random
import requests
from fastapi import FastAPI
from pydantic import BaseModel
from typing import List

app = FastAPI()

class ScrapeRequest(BaseModel):
    urls: str


# Mock restaurant data
def get_mock_restaurant():
    names = ["Ravintola Testi", "Lounas Kulma", "Food Place", "Cafe Random"]
    foods = ["Chicken pasta", "Salmon soup", "Beef stew", "Veggie bowl", "Pizza"]
    
    return {
        "id": random.randint(1, 100000),
        "type": "restaurant",
        "position": random_lappeenranta_coords(),
        "name": random.choice(names),
        "category": "Ravintola",
        "stars": round(random.uniform(3.5, 5.0), 1),
        "reviews": random.randint(10, 300),
        "address": "Random street 1",
        "description": "A nice restaurant",
        "todayHours": "10:00-15:00",
        "lunchTime": "11:00-14:00",
        "priceLevel": f"Lunch {random.randint(10, 15)} EUR",
        "phone": "0456767676",
        "website": "https://example.fi",
        "tags": ["lunch", "random"],
        "todayMenu": random.sample(foods, k=3),
    }

# scraper code for one site
# DOESNT WORK YET
def scrape_aalef():
    url = "https://www.aalef.fi/#ravintolat"

    res = requests.get(url)
    soup = BeautifulSoup(res.text, "lxml")

    menu_items = []

    for li in soup.find_all("li"):
        text = li.get_text(strip=True)
        if len(text) > 3:
            menu_items.append(text)

    if not menu_items:
        # fallback if parsing fails
        menu_items = ["Chicken pasta", "Salad", "Soup"]

    return {
        "id": 1,
        "type": "restaurant",
        "position": [61.05692, 28.19061],
        "name": "Aalef",
        "category": "Ravintola",
        "stars": 4.9,
        "reviews": 120,
        "address": "Villimiehenkatu 1",
        "description": "Aalef lunch restaurant",
        "todayHours": "10:00-15:00",
        "lunchTime": "11:00-14:00",
        "priceLevel": "Lunch 12 EUR",
        "phone": "9999",
        "website": url,
        "tags": ["lunch", "aalef"],
        "todayMenu": menu_items[:5],
    }

# randomize locations for lappeenranta restaurants
def random_lappeenranta_coords():
    center_lat = 61.058
    center_lon = 28.188

    return [
        round(random.gauss(center_lat, 0.02), 6),
        round(random.gauss(center_lon, 0.03), 6),
    ]

# the actual route
@app.post("/scrape")
def scrape(request: ScrapeRequest):
    url = request.urls.lower()

    if "aalef.fi" in url:
        return scrape_aalef()

    return get_mock_restaurant()

# testing purposes
@app.get("/health")
def health():
    return {"status": "ok"}
