import type { Response, NextFunction } from "express";
import type { AuthenticatedRequest } from "../middleware/auth.middleware";
import { AppError } from "../utils/error.ts";
import {
  parseWebsiteToDatabaseBasedOnURL,
  addRestaurantInformationToDatabase
} from "../services/protected.service.ts";

// Test route for authentication testing
export async function helloThere(req: AuthenticatedRequest, res: Response) {
  res.status(200).json({ msg: "Hello There but from protected!" });
}

export async function parseFromSite(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  // TODO: We need to somehow parse the url against injections to the microservice.
  try {
    const { restaurantUrl } = req.body;

    if (!restaurantUrl || typeof restaurantUrl !== "string") {
      throw new AppError("restaurantUrl is required.", 400);
    }

    // NOTE: we might need this to fetch the added restaurant information to be added to the map view.
    const restaurantId = await parseWebsiteToDatabaseBasedOnURL(restaurantUrl);

    res.status(200).json({
      msg: "Site parsed and added to the database."
    });
  } catch (error: unknown) {
    next(error);
  }
}

export async function addRestaurantInfo(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  // TODO: Again, we should parse the req against malicious actions.
  try {
    const { restaurantData } = req.body;

    if (!restaurantData || typeof restaurantData !== "object") {
      throw new AppError("Restaurant data is required.", 400);
    }

    // NOTE: we might need this to fetch the added restaurant information to be added to the map view.
    const restaurantId = await addRestaurantInformationToDatabase(restaurantData);

    res.status(200).json({
      msg: "Restaurant information added successfully.",
    });
  } catch (error) {
    next(error);
  }
}

