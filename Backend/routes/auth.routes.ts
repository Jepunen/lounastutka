// NOTE: Keep this tidy please
import { Router } from "express";
import {
	beginRegistration,
	finishRegistration,
	beginAuthentication,
	finishAuthentication
} from "../controllers/auth.controller";

const router: Router = Router();

router.post("/create-registration-options", beginRegistration);
router.post("/create-authentication-options", beginAuthentication);

router.post("/finish-registration", finishRegistration);
router.post("/finish-authentication", finishAuthentication);

export default router;

