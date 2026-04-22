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
 *
 * @route POST /create-registration-options
 * @middleware verifyEmail, validate
 * @returns JSON containing WebAuthn registration options
 */
router.post("/create-registration-options", verifyEmail, validate, beginRegistration);

/**
 * Creates WebAuthn authentication options for an existing user.
 *
 * @route POST /create-authentication-options
 * @middleware verifyEmail, validate
 * @returns JSON containing WebAuthn authentication options
 */
router.post("/create-authentication-options", verifyEmail, validate, beginAuthentication);

/**
 * Registers a user using email & password.
 *
 * @route POST /register-password
 * @middleware verifyEmail, verifyPassword, validate
 * @returns Confirmation of successful registration
 */
router.post("/register-password", verifyEmail, verifyPassword, validate, registerPassword);

/**
 * Logs in a user using email & password.
 *
 * @route POST /login-password
 * @middleware verifyEmail, verifyPassword, validate
 * @returns Authentication token and user info
 */
router.post("/login-password", verifyEmail, verifyPassword, validate, loginPassword);

/**
 * Completes WebAuthn registration after the client returns the credential response.
 *
 * @route POST /finish-registration
 * @middleware verifyEmail, validate
 * @returns Confirmation of successful WebAuthn registration
 */
router.post("/finish-registration", verifyEmail, validate, finishRegistration);

/**
 * Completes WebAuthn authentication after the client returns the credential response.
 *
 * @route POST /finish-authentication
 * @middleware verifyEmail, validate
 * @returns Authentication token and user info
 */
router.post("/finish-authentication", verifyEmail, validate, finishAuthentication);

export default router;

