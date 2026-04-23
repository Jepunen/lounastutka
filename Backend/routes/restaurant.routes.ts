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
 */
router.get("/get-restaurant-data", getRestaurantAndMenuData);

export default router;
