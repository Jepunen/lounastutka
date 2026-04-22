import type { NextFunction, Request, Response } from "express";
import { validationResult } from "express-validator";
import { AppError } from "../utils/error";

/**
 * Validation result handler for express-validator middleware chains.
 *
 * @remarks
 * This middleware should be placed **after** one or more express-validator
 * validation rules. It inspects the accumulated validation errors and 
 * throws an `AppError` if any validation rule failed.
 *
 * NOTE: At this time only the **first** validation error is used for the response.
 *
 * If no validation errors are present, the request proceeds to the next
 * middleware or controller.
 * Utilized src: https://medium.com/@jyotijingar/express-validator-middleware-for-handling-validation-at-the-request-level-in-express-js-bb263c55e3de
 *
 * @param req: Incoming Express request
 * @param res: Express response object
 * @param next: Callback to continue request processing
 *
 * @throws AppError if validation errors exist
 */
export function validate(req: Request, res: Response, next: NextFunction) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // Array of errors but for now take the first
    const first = errors.array()[0];
    const msg = first?.msg ?? "Error could not be defined.";
    throw new AppError(msg, 400);
  }
  next();
}

