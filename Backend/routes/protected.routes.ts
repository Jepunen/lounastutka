import { authenticateToken } from "../middleware/auth.middleware.ts";
import { helloThere, parseFromSite, addRestaurantInfo } from "../controllers/protected.controller.ts";
import { Router } from "express";

const router: Router = Router();

// Test route for authentication
router.get("/hello-there", authenticateToken, helloThere);

// Restaurant addition, information urls for authenticated users.
router.post("/parse-from-site", authenticateToken, parseFromSite);
router.post("/add-restaurant-information", authenticateToken, addRestaurantInfo);

export default router;
