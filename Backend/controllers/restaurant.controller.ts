import type { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/error.ts";
import { getAllRestaurantData } from "../services/restaurant.service.ts";
import type { AllRestaurantData } from "../services/restaurant.service.ts";

/**
 * Get all restaurant data with menus.
 *
 * @remarks
 * Route: GET /api/restaurant/get-restaurant-data
 *
 * This endpoint returns a list of all restaurants stored in the database,
 * each including its associated menu items (if any exists).  
 *
 * @returns JSON array of restaurants with menu items
 * @throws AppError if data query fails
 */
export async function getRestaurantAndMenuData(
  req: Request,
  res: Response<AllRestaurantData[]>,
  next: NextFunction
) {
  try {
    const restaurantData: AllRestaurantData[] = await getAllRestaurantData();

    if (!restaurantData) throw new AppError("Could not fetch restaurant data", 404);
    return res.status(200).json(restaurantData);

  } catch (error) {
    next(error)
  }
}

