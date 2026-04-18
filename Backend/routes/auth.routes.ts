// NOTE: Keep this tidy please
import { Router } from "express";
import {
	beginRegistration,
	finishRegistration,
	beginAuthentication,
	finishAuthentication,
	registerPassword,
	loginPassword
} from "../controllers/auth.controller";
import { verifyEmail, verifyPassword } from "../middleware/auth.validator.ts";
import { validate } from "../middleware/validator.ts";

const router: Router = Router();

router.post("/create-registration-options", verifyEmail, validate, beginRegistration);
router.post("/create-authentication-options", verifyEmail, validate, beginAuthentication);
router.post("/register-password", verifyEmail, verifyPassword, validate, registerPassword);
router.post("/login-password", verifyEmail, verifyPassword, validate, loginPassword);

router.post("/finish-registration", verifyEmail, validate, finishRegistration);
router.post("/finish-authentication", verifyEmail, validate, finishAuthentication);

export default router;

