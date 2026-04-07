import type { Request, Response } from "express";
import * as AuthService from "../services/auth.service";
import jwt from "jsonwebtoken";

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
export async function beginRegistration(req: Request, res: Response) {
	try {
		const { email } = req.body;
		const rpID = process.env.WEBAUTHN_RP_ID ?? req.hostname;
		const rpName = process.env.WEBAUTHN_RP_NAME ?? "Lounastutka";

		const options = await AuthService.createRegistrationOptions(email, rpID, rpName);
		if (!options || !options.challenge) throw new Error("Invalid registration opts");
		res.json(options);
	} catch (error: unknown) {
		return res.status(500).json({ error: "Something went wrong with the request" });
	}
}

// src: https://simplewebauthn.dev/docs/packages/server#2-verify-registration-response
export async function finishRegistration(req: Request, res: Response) {
	try {
		const { email, attestationResponse } = req.body;
		const expectedOrigin = process.env.WEBAUTHN_ORIGIN ?? `${req.protocol}//${req.get("host")}`;
		const expectedRPID = process.env.WEBAUTHN_RP_ID ?? req.hostname;

		const result = await AuthService.verifyRegistration(
			email, attestationResponse, expectedOrigin, expectedRPID);
		res.json(result);
	} catch (error: unknown) {
		return res.status(500).json({ error: "Something went wrong with registration" });
	}
}

export async function registerPassword(req: Request, res: Response) {
	try {
		const { email, password } = req.body as { email?: string; password?: string };
		if (!email || !password) {
			return res.status(400).json({ error: "Email and password are required." });
		}
		if (password.length < 8) {
			return res.status(400).json({ error: "Password must be at least 8 characters." });
		}

		const user = await AuthService.registerPassword(email, password);
		if (!user) return res.status(401).json({ error: "User could not be created" });
		const token = signToken(user.id, user.email);
		return res.status(201).json({
			authenticated: true,
			token,
			user: {
				email: user.email,
			},
		});
	} catch (error: unknown) {
		return res.status(500).json({ error: "Something went wrong with registration" });
	}
}

export async function loginPassword(req: Request, res: Response) {
	try {
		const { email, password } = req.body as { email?: string; password?: string };
		if (!email || !password) {
			return res.status(400).json({ error: "Email and password are required." });
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
		return res.status(500).json({ error: "Something went wrong with registration" });
	}
}
// src: https://simplewebauthn.dev/docs/packages/server#1-generate-authentication-options
export async function beginAuthentication(req: Request, res: Response) {
	try {
		const { email } = req.body;
		const rpID = process.env.WEBAUTHN_RP_ID ?? req.hostname;
		const options = await AuthService.createAuthenticationOptions(email, rpID);
		if (!options || !options.challenge) {
			return res.status(404).json({ error: "Invalid authentication opts" });
		}
		res.json(options);
	} catch (error: unknown) {
		return res.status(500).json({ error: "Something went wrong with authentication" });
	}
}

// src: https://simplewebauthn.dev/docs/packages/server#2-verify-authentication-response
export async function finishAuthentication(req: Request, res: Response) {
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
				return res.status(401).json({
					error: "Unable to authenticate user"
				});
			}
			const token = signToken(user.id, user.email);
			return res.json({ ...result, token });
		}
		res.json(result);
	} catch (error: unknown) {
		return res.status(500).json({ error: "Something went wrong with authentication" });
	}
}


