import type { Request, Response, NextFunction } from "express";

export default function handleError(
  error: unknown,
  req: Request,
  res: Response,
  next: NextFunction
) {
  const err = error as any;
  const status = err.statusCode || 500;

  console.error("ERROR:", {
    message: err.message,
    stack: err.stack,
    name: err.name,
    status,
    route: req.originalUrl,
    method: req.method,
  });

  const clientMessage = err.isOperational
    ? err.message
    : "An unexpected error occurred";

  res.status(status).json({ error: clientMessage });
}

