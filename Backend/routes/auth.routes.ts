// NOTE: Documentation should follow "typedoc" style for automatic generation

/**
 * Authentication routes for registration and login.
 *
 * These endpoints handle WebAuthn registration/authentication as well as
 * password‑based registration and login. Each route applies validation
 * middleware before corresponding controller takes action.
 *
 * @remarks
 * All routes mounted under `/api/auth`
 *
 * Middleware:
 * - `verifyEmail`: ensures a valid email is provided
 * - `verifyPassword`: ensures password meets security requirements
 * - `validate`: runs express-validator result checking
 *
 * Controllers:
 * - `beginRegistration`, `finishRegistration`
 * - `beginAuthentication`, `finishAuthentication`
 * - `registerPassword`, `loginPassword`
 *
 * @packageDocumentation
 */

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

/**
 * Creates WebAuthn registration options for a new user.
 */
router.post("/create-registration-options", verifyEmail, validate, beginRegistration);

/**
 * Creates WebAuthn authentication options for an existing user.
 */
router.post("/create-authentication-options", verifyEmail, validate, beginAuthentication);

/**
 * Registers a user using email & password.
 */
router.post("/register-password", verifyEmail, verifyPassword, validate, registerPassword);

/**
 * Logs in a user using email & password.
 */
router.post("/login-password", verifyEmail, verifyPassword, validate, loginPassword);

/**
 * Completes WebAuthn registration after the client returns the credential response.
 */
router.post("/finish-registration", verifyEmail, validate, finishRegistration);

/**
 * Completes WebAuthn authentication after the client returns the credential response.
 */
router.post("/finish-authentication", verifyEmail, validate, finishAuthentication);

export default router;

