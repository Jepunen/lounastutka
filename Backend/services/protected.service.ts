// Global error class
import { AppError } from "../utils/error.ts";

import db from "../database/helpers";

// Call the Microservice for parsing the website based on the given URL
// then store the information to the database if its valid.
export async function parseWebsiteBasedOnURL(restaurantUrl: string) {
  const microserviceUrl = process.env.MICROSERVICE_URL ?? "http://microservice:8100/scrape";
  const res = await fetch(microserviceUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(
      {
        urls: restaurantUrl
      }),
  });

  if (!res) throw new AppError("Site parsing failed", 500);
  const data = await res.json();
  if (!data) throw new AppError("Data could not be parsed", 400);

  const restaurantId = await db.addRestaurantData(data); // data is formatted in helpers.ts (type ScrapedRestaurant)

  return restaurantId;
}

// TODO: Database schema based typescript model here
export async function addRestaurantInformationToDatabase({ }) {
  // TODO: Validate data from frontend...
  //
  // const res = await db.addRestaurantData(tsFormattedData);

  // WARNING: unsure what to return yet.
  return true;
}

