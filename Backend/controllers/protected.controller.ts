import type { Response, NextFunction } from "express";
import type { AuthenticatedRequest } from "../middleware/auth.middleware";
import { AppError } from "../utils/error.ts";
import {
  previewRestaurantFromUrl,
  parseWebsiteToDatabaseBasedOnURL,
  addRestaurantInformationToDatabase
} from "../services/protected.service.ts";

/**
 * Test endpoint to verify that authentication is functioning correctly.
 *
 * @remarks
 * Route GET /api/protected/hello-there
 *
 * This route is protected and requires a valid JWT.
 *
 *
 * @param req: Authenticated request containing user information
 * @param res: Express response object
 * @returns A simple JSON message confirming access to a protected route
 */
export async function helloThere(req: AuthenticatedRequest, res: Response) {
  res.status(200).json({ msg: "Hello There but from protected!" });
}

/**
 * Parses restaurant data from an external website and stores it in the database.
 *
 * @remarks
 * Route POST /api/protected/parse-from-site
 *
 * This route is protected and requires a valid JWT.
 *
 * The provided URL is forwarded to a microservice that extracts restaurant
 * information. The parsed data is then validated and inserted into the database.
 *
 *
 * @param req.body.restaurantUrl: URL of the restaurant page to parse
 * @returns A success message once the restaurant has been parsed and stored
 *
 * @throws AppError if `restaurantUrl` is missing or invalid
 * @throws AppError if parsing or database insertion fails
 */
export async function previewFromSite(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const { restaurantUrl } = req.body;
    if (!restaurantUrl || typeof restaurantUrl !== "string") {
      throw new AppError("restaurantUrl is required.", 400);
    }
    const data = await previewRestaurantFromUrl(restaurantUrl);
    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
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

/**
 * For adding restaurant information manually to the database.
 *
 * @remarks
 * Route POST /api/protected/add-restaurant-information
 *
 * This route is protected and requires a valid JWT.
 *
 * The request body must contain a valid restaurant data object. The data is
 * validated and then inserted into the database.
 *
 *
 * @param req.body.restaurantData: Object containing restaurant fields
 * @returns A success message once the restaurant has been added
 *
 * @throws AppError if `restaurantData` is missing or invalid
 * @throws AppError if database insertion fails
 */
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

