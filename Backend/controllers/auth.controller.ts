import type { Request, Response, NextFunction } from "express";
import * as AuthService from "../services/auth.service";
import jwt from "jsonwebtoken";
import { AppError } from "../utils/error.ts";

// Create the token for authenticated users
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

// src: https://simplewebauthn.dev/docs/packages/server#1-generate-registration-options
export async function beginRegistration(req: Request, res: Response, next: NextFunction) {
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

// src: https://simplewebauthn.dev/docs/packages/server#2-verify-registration-response
export async function finishRegistration(req: Request, res: Response, next: NextFunction) {
	try {
		const { email, attestationResponse } = req.body;
		const expectedOrigin = process.env.WEBAUTHN_ORIGIN ?? `${req.protocol}//${req.get("host")}`;
		const expectedRPID = process.env.WEBAUTHN_RP_ID ?? req.hostname;

		const result = await AuthService.verifyRegistration(
			email, attestationResponse, expectedOrigin, expectedRPID);
		res.json(result);
	} catch (error: unknown) {
		next(error);
	}
}

export async function registerPassword(req: Request, res: Response, next: NextFunction) {
	try {
		const { email, password } = req.body as { email?: string; password?: string };
		if (!email || !password) {
			throw new AppError("Email and password are required.", 400);
		}

		// TODO: Move password requirements to frontend, could keep this as backup for now without frontend
		if (password.length < 8) {
			throw new AppError("Password must be at least 8 characters.", 400);
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

export async function loginPassword(req: Request, res: Response, next: NextFunction) {
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

// src: https://simplewebauthn.dev/docs/packages/server#1-generate-authentication-options
export async function beginAuthentication(req: Request, res: Response, next: NextFunction) {
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

// src: https://simplewebauthn.dev/docs/packages/server#2-verify-authentication-response
export async function finishAuthentication(req: Request, res: Response, next: NextFunction) {
	try {
		const { email, assertionResponse } = req.body;
		const expectedOrigin = process.env.WEBAUTHN_ORIGIN ?? `${req.protocol}//${req.get("host")}`;
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


