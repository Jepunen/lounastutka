/**
 * Restaurant data routes are located here (non protected).
 *
 * Routes for public access to restaurant information
 * and their associated menu items. 
 *
 * @remarks
 * All routes are mounted under `/api/restaurant`.
 *
 * Controller:
 * - `getRestaurantAndMenuData`: returns all restaurants with their menus
 *
 * @packageDocumentation
 */

import { Router } from "express";
import { getRestaurantAndMenuData } from "../controllers/restaurant.controller.ts";
const router: Router = Router();

/**
 * Fetches all restaurant data including menu items.
 *
 * @route GET /get-restaurant-data
 * @returns JSON array of restaurants with their associated menu items
 * @remarks
 * This endpoint is public and does not require authentication.
 */
router.get("/get-restaurant-data", getRestaurantAndMenuData);

export default router;
