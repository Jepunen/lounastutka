/*
* NOTE: USE THIS FOR PROTECTED ROUTES AS MIDDLEWARE
*
* src: https://www.digitalocean.com/community/tutorials/nodejs-jwt-expressjs
* */
import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

export type AuthenticatedRequest = Request & {
	authUser?: {
		userId: number;
		email: string;
	};
};

type JwtPayload = {
	userId: number;
	email: string;
};

export function authenticateToken(
	req: AuthenticatedRequest,
	res: Response,
	next: NextFunction,
) {
	const authHeader = req.headers.authorization;
	if (!authHeader?.startsWith("Bearer ")) {
		return res.status(401).json({ error: "Missing Bearer token." });
	}

	const token = authHeader.slice("Bearer ".length);
	// WARNING: PLEASE Define in .env 
	const jwtSec: string = process.env.JWT_SECRET ?? "DEV_CHANGE_THIS_SECRET";

	try {
		const payload = jwt.verify(token, jwtSec) as JwtPayload;
		req.authUser = {
			userId: payload.userId,
			email: payload.email,
		};
		next();
	} catch {
		return res.status(401).json({ error: "Invalid or expired token." });
	}
}
