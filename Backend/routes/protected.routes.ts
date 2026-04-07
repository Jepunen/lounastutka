import { authenticateToken } from "../middleware/auth.middleware.ts";
import { helloThere } from "../controllers/protected.controller.ts";
import { Router } from "express";


const router: Router = Router();

router.post("/hello-there", authenticateToken, helloThere);

export default router;
