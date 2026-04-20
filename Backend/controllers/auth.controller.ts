import type { Request, Response, NextFunction } from "express";
import * as AuthService from "../services/auth.service";
import jwt from "jsonwebtoken";
import { AppError } from "../utils/error.ts";
import type {
  BeginRegistrationBody,
  BeginAuthenticationBody,
  FinishRegistrationBody,
  FinishAuthenticationBody,
  PasswordLoginBody,
  PasswordAuthenticationResponse,
  FinishRegistrationResponse,
  FinishAuthenticationResponse
} from "./types.ts";

import type {
  PublicKeyCredentialCreationOptionsJSON,
  PublicKeyCredentialRequestOptionsJSON
} from "@simplewebauthn/server";

/**
 * Sign a JWT token for authenticated users.
 *
 * @remarks
 * Helper used internally by authentication and registration
 * controllers to generate a session token.
 *
 * The token contains:
 * - `userId`
 * - `email`
 * and is built with the secret + expiration defined in environment variables.
 *
 * @param userId: The user's database ID
 * @param email: The user's email address
 * @returns A signed JWT token string
 */
function signToken(userId: number, email: string) {
  const jwtSec: string = process.env.JWT_SECRET ?? "DEV_CHANGE_THIS_SECRET";
  const expires: any = process.env.JWT_EXPIRES_IN ?? "1d";
  return jwt.sign(
    { userId, email },
    jwtSec,
    { expiresIn: expires },
  );
}

// NOTE: We can return the options to the frontend for @simplewebauthn/browser start/verify methods

/**
 * Begin WebAuthn registration by generating registration options.
 *
 * @remarks
 * Route POST /api/auth/create-registration-options
 *
 * This endpoint returns the WebAuthn registration challenge and parameters
 *
 * Src: https://simplewebauthn.dev/docs/packages/server#1-generate-registration-options
 *
 *
 * @param req.body.email: Email of the user attempting to register
 * @returns JSON containing WebAuthn registration options
 * @throws AppError if registration options cannot be generated
 */
export async function beginRegistration(
  req: Request<unknown, BeginRegistrationBody>,
  res: Response<PublicKeyCredentialCreationOptionsJSON>,
  next: NextFunction
) {
  try {
    const { email } = req.body;
    const rpID = process.env.WEBAUTHN_RP_ID ?? req.hostname;
    const rpName = process.env.WEBAUTHN_RP_NAME ?? "Lounastutka";

    const options = await AuthService.createRegistrationOptions(email, rpID, rpName);
    if (!options || !options.challenge) throw new AppError("Invalid registration opts", 400);
    res.json(options);
  } catch (error: unknown) {
    next(error);
  }
}

/**
 * Complete WebAuthn registration by verifying the attestation response.
 *
 * @remarks
 * Route POST /api/auth/finish-registration
 *
 * After the browser creates a credential, it sends the attestation response
 * back to this endpoint. If verification succeeds, the users account is created
 * and a JWT token is returned.
 *
 * Src: https://simplewebauthn.dev/docs/packages/server#2-verify-registration-response
 *
 *
 * @param req.body.email: Email of the registering user
 * @param req.body.attestationResponse: WebAuthn attestation response
 * @returns JSON containing verification result and JWT token if successfully verified
 * @throws AppError if verification fails or user cannot be created
 */
export async function finishRegistration(
  req: Request<unknown, FinishRegistrationBody>,
  res: Response<FinishRegistrationResponse>,
  next: NextFunction) {
  try {
    const { email, attestationResponse } = req.body;
    const expectedOrigin = process.env.WEBAUTHN_ORIGIN ?? `${req.protocol}://${req.get("host")}`;
    const expectedRPID = process.env.WEBAUTHN_RP_ID ?? req.hostname;

    const result = await AuthService.verifyRegistration(
      email, attestationResponse, expectedOrigin, expectedRPID);
    if (result?.verified) {
      const user = await AuthService.getUserByEmail(email);
      if (!user) {
        throw new AppError("Unable to register user.", 401);
      }
      const token = signToken(user.id, user.email);

      return res.json({ ...result, token });
    }
    res.json(result);
  } catch (error: unknown) {
    next(error);
  }
}
/**
 * Register a user using email & password.
 *
 * @remarks
 * Route POST /api/auth/register-password
 *
 * This is included as backup or alternative to WebAuthn registration 
 * as the functionality is still rather new.
 *
 * @param req.body.email: User email
 * @param req.body.password: User password
 * @returns JSON containing authentication status, token, and user info
 * @throws AppError if email/password missing or user creation fails
 */
export async function registerPassword(
  req: Request<unknown, PasswordLoginBody>,
  res: Response<PasswordAuthenticationResponse>,
  next: NextFunction) {
  try {
    const { email, password } = req.body as { email?: string; password?: string };
    if (!email || !password) {
      throw new AppError("Email and password are required.", 400);
    }

    const user = await AuthService.registerPassword(email, password);
    if (!user) throw new AppError("User could not be created.", 401);

    const token = signToken(user.id, user.email);
    return res.status(201).json({
      authenticated: true,
      token,
      user: {
        email: user.email,
      },
    });
  } catch (error: unknown) {
    next(error);
  }
}

/**
 * Authenticate using email & password. 
 *
 * @remarks
 * Route POST /api/auth/login-password
 *
 * @param req.body.email: Users email.
 * @param req.body.password: Users plain password 
 * @returns JSON containing authentication status, token and user info
 * @throws AppError if credentials do not match or are missing.
 * */
export async function loginPassword(
  req: Request<unknown, PasswordLoginBody>,
  res: Response<PasswordAuthenticationResponse>,
  next: NextFunction) {
  try {
    const { email, password } = req.body as { email?: string; password?: string };
    if (!email || !password) {
      throw new AppError("Email and password are required.", 400);
    }

    const user = await AuthService.loginPassword(email, password);
    const token = signToken(user.id, user.email);
    return res.status(200).json({
      authenticated: true,
      token,
      user: {
        email: user.email,
      },
    });
  } catch (error: unknown) {
    next(error);
  }
}

/**
 * Begin WebAuthn authentication by generating authentication options.
 *
 * @remarks
 * Route POST /api/auth/create-authentication-options
 *
 * This endpoint returns the challenge and parameters needed for the browser
 * to begin WebAuthn authentication.
 *
 * Src: https://simplewebauthn.dev/docs/packages/server#1-generate-authentication-options
 *
 *
 * Route POST /api/auth/create-authentication-options
 * Route POST /api/auth/create-authentication-options
 * @param req.body.email: Email of the user attempting to authenticate
 * @returns JSON containing WebAuthn authentication options
 * @throws AppError if authentication options cannot be generated
 */
export async function beginAuthentication(
  req: Request<unknown, BeginAuthenticationBody>,
  res: Response<PublicKeyCredentialRequestOptionsJSON>,
  next: NextFunction
) {
  try {
    const { email } = req.body;
    const rpID = process.env.WEBAUTHN_RP_ID ?? req.hostname;
    const options = await AuthService.createAuthenticationOptions(email, rpID);
    if (!options || !options.challenge) {
      throw new AppError("Invalid authentication options", 400);
    }
    res.json(options);
  } catch (error: unknown) {
    next(error);
  }
}

/**
 * Complete WebAuthn authentication by verifying the assertion response.
 *
 * @remarks
 * Route POST /api/auth/finish-authentication
 * 
 * If verification succeeds, a JWT token is returned for session management.
 *
 * Src: https://simplewebauthn.dev/docs/packages/server#2-verify-authentication-response
 *
 *
 * @param req.body.email: User email
 * @param req.body.assertionResponse: WebAuthn assertion response
 * @returns JSON containing verification result and JWT token if successfully verified
 * @throws AppError if verification fails or user cannot be found
 */
export async function finishAuthentication(
  req: Request<unknown, FinishAuthenticationBody>,
  res: Response<FinishAuthenticationResponse>,
  next: NextFunction
) {
  try {
    const { email, assertionResponse } = req.body;
    const expectedOrigin = process.env.WEBAUTHN_ORIGIN ?? `${req.protocol}://${req.get("host")}`;
    const expectedRPID = process.env.WEBAUTHN_RP_ID ?? req.hostname;

    const result = await AuthService.verifyAuthentication(
      email, assertionResponse, expectedOrigin, expectedRPID);
    // Send the JWT token for user session
    if (result?.verified) {
      // Verify that the user can be found from db
      const user = await AuthService.getUserByEmail(email);
      if (!user) {
        throw new AppError("Unable to authenticate user.", 401);
      }
      const token = signToken(user.id, user.email);

      return res.json({ ...result, token });
    }
    res.json(result);
  } catch (error: unknown) {
    next(error);
  }
}


