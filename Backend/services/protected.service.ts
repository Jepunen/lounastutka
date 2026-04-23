// Global error class
import { AppError } from "../utils/error.ts";

import type { RestaurantModel } from "../database/models.ts";
import db from "../database/helpers";

// NOTE: we omit the ID as postgresql should create it
type MicroserviceDataResponse = {
  type: string;
  position: [number, number];
  name: string;
  category: string;
  stars: number;
  reviews: number;
  address: string;
  description: string;
  todayHours: string;
  lunchTime: string;
  priceLevel: string;
  phone: string;
  website: string;
  tags: string[];
  todayMenu: string[];
};

// Call the microservice and return the parsed data without saving it.
export async function previewRestaurantFromUrl(restaurantUrl: string): Promise<MicroserviceDataResponse> {
  const microserviceUrl = process.env.MICROSERVICE_URL ?? "http://microservice:8100/scrape";
  const res = await fetch(microserviceUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ urls: restaurantUrl }),
  });
  if (!res.ok) throw new AppError("Site parsing failed", 500);
  const data: any = await res.json();
  if (!data || typeof data !== "object" || !data.name) {
    throw new AppError("Invalid data from microservice.", 400);
  }
  return data as MicroserviceDataResponse;
}

// Call the Microservice for parsing the website based on the given URL
// then store the information to the database if its valid.
export async function parseWebsiteToDatabaseBasedOnURL(restaurantUrl: string): Promise<number> {
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

  if (!res.ok) throw new AppError("Site parsing failed", 500);
  const data: any = await res.json();

  // NOTE: This is not a scalable solution but due to budget constraints it is what it is.
  if (!data || typeof data !== "object") {
    throw new AppError("Invalid restaurant data.", 400);
  }
  if (!data.name) {
    throw new AppError("Restaurant name is missing.", 400);
  }
  if (!data.address || !(data.address.length > 0)) {
    throw new AppError("Restaurant address is missing.", 400);
  }
  if (!Array.isArray(data.position) ||
    data.position.length !== 2 ||
    typeof data.position[0] !== "number" ||
    typeof data.position[1] !== "number"
  ) {
    throw new AppError("Restaurant coordinates are missing.", 400);
  }


  // We want to format the data here for the database helpers to separate concerns
  // Separate to the different models 
  const msFormat: MicroserviceDataResponse = {
    type: data.type ?? "restaurant",
    position: data.position,
    name: data.name,
    category: data.category ?? null,
    stars: typeof data.stars === "number" ? data.stars : null,
    reviews: typeof data.reviews === "number" ? data.reviews : null,
    address: data.address,
    description: data.description ?? null,
    todayHours: data.todayHours ?? null,
    lunchTime: data.lunchTime ?? null,
    priceLevel: data.priceLevel ?? null,
    phone: data.phone ?? null,
    website: data.website ?? null,
    tags: Array.isArray(data.tags) ? data.tags : [],
    todayMenu: Array.isArray(data.todayMenu) ? data.todayMenu : [],
  };

  const restFormat: RestaurantModel = {
    name: msFormat.name,
    address: msFormat.address,
    lat: msFormat.position[0],
    lon: msFormat.position[1],
    category: msFormat.category,
    description: msFormat.description,
    phone: msFormat.phone,
    website: msFormat.website,
    priceLevel: msFormat.priceLevel,
    stars: msFormat.stars,
    reviews: msFormat.reviews,
  };

  const restaurantId = await db.addRestaurantData(restFormat);
  if (!restaurantId) throw new AppError("Could not add restaurant.", 400);

  const menuId = await db.addMenuToRestaurant(restaurantId, msFormat.todayMenu);
  if (!menuId) throw new AppError("Could not add menu for a restaurant.", 400);

  return restaurantId;
}

export async function addRestaurantInformationToDatabase(data: RestaurantModel | any): Promise<number> {
  // It is at this stage we need to ask, when do we want to store the restaurant and when not
  // I think there should be some basic information available from the restaurant for it to be added
  // This can be in part verified by the frontend in terms of that all required fields contain some data
  // Then comes the question of dublicates, how should the dublicates be considered?
  // Should you be able to add a new restaurant to address that already has restaurant in it?
  // What about same restaurant but now in lowercase?
  // For now, due to time constraints, we check that the restaurant has name, 
  // address and coordinates (for map pin)
  if (!data || typeof data !== "object") {
    throw new AppError("Invalid restaurant data.", 400);
  }
  if (!data.name) {
    throw new AppError("Restaurant name is missing.", 400);
  }
  if (!data.address || !(data.address.length > 0)) {
    throw new AppError("Restaurant address is missing.", 400);
  }
  // Sanity check for the coordinates
  if (!Array.isArray(data.position) ||
    data.position.length !== 2 ||
    typeof data.position[0] !== "number" ||
    typeof data.position[1] !== "number"
  ) {
    throw new AppError("Restaurant coordinates are missing.", 400);
  }

  const restFormat: RestaurantModel = {
    name: data.name,
    address: data.address,
    lat: data.position[0],
    lon: data.position[1],
    category: data.category ?? null,
    description: data.description ?? null,
    phone: data.phone ?? null,
    website: data.website ?? null,
    priceLevel: data.priceLevel ?? null,
    stars: typeof data.stars === "number" ? data.stars : null,
    reviews: typeof data.reviews === "number" ? data.reviews : null,
  };

  const restaurantId = await db.addRestaurantData(restFormat);
  if (!restaurantId) throw new AppError("Could not add restaurant.", 400);

  const menuItems: string[] = Array.isArray(data.todayMenu) ? data.todayMenu.filter(Boolean) : [];
  if (menuItems.length > 0) {
    const menuId = await db.addMenuToRestaurant(restaurantId, menuItems);
    if (!menuId) throw new AppError("Could not add menu for restaurant.", 400);
  }

  return restaurantId;
}

