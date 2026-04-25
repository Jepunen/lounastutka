# Microservice (Scraper Service)

This microservice is responsible for retrieving restaurant and lunch menu data for the Lounastutka application.

## Overview

The service exposes a simple HTTP API that:

* Receives a restaurant URL
* Returns structured restaurant + menu data
* Provides either real or mock data depending on the source

## Behavior

* **Aalef URL (`https://www.aalef.fi/#ravintolat`)**

  * Attempts to scrape real menu data for the current day

* **All other URLs**

  * Returns randomized mock data (for now)
  * Locations are constrained within the Lappeenranta area

## API

### `POST /scrape`

Request:

```json
{
  "url": "https://example.com"
}
```

Example response:

```json
{
  "id": 1,
  "type": "restaurant",
  "position": [61.05, 28.19],
  "name": "Restaurant Name",
  "category": "Ravintola",
  "stars": 4.5,
  "reviews": 120,
  "address": "Example street 1",
  "description": "Description",
  "todayHours": "10:00-15:00",
  "lunchTime": "11:00-14:00",
  "priceLevel": "Lunch 12 EUR",
  "phone": "000000",
  "website": "https://example.com",
  "tags": ["lunch"],
  "todayMenu": ["Food 1", "Food 2"]
}
```

---

### `GET /health`

Returns service health status:

```json
{ "status": "ok" }
```

---

## Running locally

```bash
docker compose up --build microservice
```

---
