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
 * - `previewFromSite`: parses restaurant data from a given URL and responds with the data
 * - `parseFromSite`: parses restaurant data from a given URL and stores it to database
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
 */
router.get("/hello-there", authenticateToken, helloThere);

/**
 * Parses restaurant data from an external website and returns the data.
 */
router.post("/preview-from-site", authenticateToken, previewFromSite);

/**
 * Parses restaurant data from an external website and stores the data.
 */
router.post("/parse-from-site", authenticateToken, parseFromSite);

/**
 * Adds restaurant information manually to the database.
 */
router.post("/add-restaurant-information", authenticateToken, addRestaurantInfo);

export default router;
