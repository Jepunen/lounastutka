// NOTE: Custom error class and its handler to log full error to docker
// and give client more generic type without potentially sensitive information 
// src: https://oneuptime.com/blog/post/2026-01-31-bun-rest-api/view
import type { Request, Response, NextFunction } from "express";

export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode = 500, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
  }
}

export default function handleError(
  error: unknown,
  req: Request,
  res: Response,
  next: NextFunction
) {
  // const err = error instanceof Error ? error: new Error(String(error));
  const err = error as any;

  const status = err.statusCode || 500;

  // Log full error to backend logs (Docker should capture this)
  console.error("ERROR:", {
    message: err.message,
    stack: err.stack,
    name: err.name,
    status,
    route: req.originalUrl,
    method: req.method,
  });

  // Send generic message to client
  const clientMessage = err.isOperational
    ? err.message
    : "An unexpected error occurred";

  res.status(status).json({ error: clientMessage });
}
