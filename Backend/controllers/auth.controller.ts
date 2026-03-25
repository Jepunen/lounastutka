import type { Request, Response } from "express";
import * as AuthService from "../services/auth.service";
import jwt from "jsonwebtoken";



// NOTE: We can return the options to the frontend for @simplewebauthn/browser start/verify methods

// src: https://simplewebauthn.dev/docs/packages/server#1-generate-registration-options
export async function beginRegistration(req: Request, res: Response) {
	const { email } = req.body;
	const options = await AuthService.createRegistrationOptions(email);
	res.json(options);
}

// src: https://simplewebauthn.dev/docs/packages/server#2-verify-registration-response
export async function finishRegistration(req: Request, res: Response) {
	const { email, attestationResponse } = req.body;
	const result = await AuthService.verifyRegistration(email, attestationResponse);
	res.json(result);
}

// src: https://simplewebauthn.dev/docs/packages/server#1-generate-authentication-options
export async function beginAuthentication(req: Request, res: Response) {
	const { email } = req.body;
	const options = await AuthService.createAuthenticationOptions(email);
	res.json(options);
}

// src: https://simplewebauthn.dev/docs/packages/server#2-verify-authentication-response
export async function finishAuthentication(req: Request, res: Response) {
	const { email, assertionResponse } = req.body;
	const result = await AuthService.verifyAuthentication(email, assertionResponse);

	// Send the JWT token for user session
	if (result?.verified) {
		// TODO: REMOVE THE DEVELOPMENT STUFF
		const jwtSec: string = process.env.JWT_SECRET ?? "DEV_CHANGE_THIS_SECRET";
		const expires: any = process.env.JWT_EXPIRES_IN ?? "1d";
		const token = jwt.sign(
			{ payload: email, },
			jwtSec,
			{ expiresIn: expires });
		res.json({ ...result, token });
	}
	res.json(result);
}


