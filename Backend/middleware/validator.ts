import { validationResult } from "express-validator";
import { AppError } from "../utils/error";

// src: https://medium.com/@jyotijingar/express-validator-middleware-for-handling-validation-at-the-request-level-in-express-js-bb263c55e3de

// From email / password validation check errors and move on
export function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const msg = errors.array()[0].msg;
    throw new AppError(msg, 400);
  }
  next();
}
