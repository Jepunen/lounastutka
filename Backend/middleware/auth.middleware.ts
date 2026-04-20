/*
* NOTE: USE THIS FOR PROTECTED ROUTES AS MIDDLEWARE
*
* */

/**
 * Authentication middleware for protected API routes.
 *
 * @remarks
 * This middleware is responsible for JWT sent in the `Authorization` header 
 * and its validation using the `Bearer <token>` format. 
 * If the token is valid, the decoded user information is attached 
 * to the request object as `req.authUser`.
 * 
 * If the token is missing, malformed, expired, or invalid, the middleware
 * responds with a `401 Unauthorized` error and does not call `next()`.
 *
 * This middleware should be applied to any route that requires the user
 * to be authenticated, should be added in routes/ folder.
 *
 * Utilized src: https://www.digitalocean.com/community/tutorials/nodejs-jwt-expressjs
 *
 * @packageDocumentation
 */
import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

/**
 * Extends Express request type that includes authenticated user data.
 *
 * @property authUser: Populated when a valid JWT is provided.
 */
export type AuthenticatedRequest = Request & {
  authUser?: {
    userId: number;
    email: string;
  };
};

/**
 * Expected format for JWT payload
 */
type JwtPayload = {
  userId: number;
  email: string;
};

/**
 * Middleware does the verification for the JWT from the `Authorization` header.
 *
 * @remarks
 * The header must follow the format:
 * ```
 * Authorization: Bearer <token>
 * ```
 *
 * If verification succeeds, the decoded payload is attached to
 * `req.authUser`. Otherwise, a `401 Unauthorized` response is sent.
 *
 * @param req: Incoming request, extended with `authUser`
 * @param res: Express response object
 * @param next: Callback to continue request processing
 *
 * @returns Sends a 401 response on failure, otherwise calls `next()`
 */
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
