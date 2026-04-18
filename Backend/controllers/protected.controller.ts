import type { Response, NextFunction } from "express";
import type { AuthenticatedRequest } from "../middleware/auth.middleware";
import { AppError } from "../utils/error.ts";
import {
  parseWebsiteBasedOnURL,
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
    // Pass the url to the microservice.
    const res = await parseWebsiteBasedOnURL(restaurantUrl);

    // if (!res.ok) {
    //   throw new AppError("Could not find site.", 400);
    // }
  } catch (error: unknown) {
    next(error);
  }
  res.status(200).json({ msg: "Site parsed and added to the database." });
}

export async function addRestaurantInfo(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  // TODO: Again, we should parse the req against malicious actions.
  try {
    const { email } = req.body;
  } catch (error: unknown) {
    next(error);
  }
  res.status(200).json({ msg: "Restaurant information added successfully." });
}

