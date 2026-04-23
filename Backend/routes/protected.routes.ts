/**
 * Protected routes requiring authentication.
 *
 * Endpoints for authenticated users.
 * Allows parsing restaurant data from external sources, and manually
 * adding restaurant information to the database.
 *
 * @remarks
 * All routes are mounted under `/api/protected`.
 *
 * Middleware:
 * - `authenticateToken`: validates JWT and attaches user info to request
 *
 * Controllers:
 * - `helloThere`: simple authenticated test endpoint
 * - `parseFromSite`: parses restaurant data from a given URL
 * - `addRestaurantInfo`: manually inserts restaurant data into the database
 *
 * @packageDocumentation
 */

import { authenticateToken } from "../middleware/auth.middleware.ts";
import { helloThere, previewFromSite, parseFromSite, addRestaurantInfo } from "../controllers/protected.controller.ts";
import { Router } from "express";

const router: Router = Router();

/**
 * Test endpoint to verify authentication.
 *
 * @route GET /hello-there
 * @middleware authenticateToken
 * @returns A simple JSON message confirming authentication
 */
router.get("/hello-there", authenticateToken, helloThere);

/**
 * Parses restaurant data from an external website.
 *
 * @route POST /parse-from-site
 * @middleware authenticateToken
 * @param req.body.restaurantUrl: The URL to parse restaurant data from
 * @returns Parsed restaurant data from the external source
 * @throws AppError if parsing fails or URL is invalid
 */
router.post("/preview-from-site", authenticateToken, previewFromSite);
router.post("/parse-from-site", authenticateToken, parseFromSite);

/**
 * Adds restaurant information manually to the database.
 *
 * @route POST /add-restaurant-information
 * @middleware authenticateToken
 * @param req.body: Restaurant data fields
 * @returns Confirmation of successful insertion
 * @throws AppError if validation or database insertion fails
 */
router.post("/add-restaurant-information", authenticateToken, addRestaurantInfo);

export default router;
