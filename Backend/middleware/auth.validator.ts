import { body } from "express-validator";

// Simple email, password validation setup midware
// NOTE: as passkeys do not require password, we want to separate these methods for different routes.

/**
 * Email validation middleware for routes that require a valid email address.
 *
 * @remarks
 * If validation fails, the error message `"Invalid email format."`
 * will be included in the express-validator error result and should be handled
 * by the global `validate` middleware.
 *
 */
export const verifyEmail = [
  body("email")
    .trim()
    .toLowerCase()
    .isEmail()
    .withMessage("Invalid email format."),
];

/**
 * Password validation middleware for routes that require a valid password.
 *
 * @remarks
 * If validation fails, the error message `"Password must be at least 8 characters."`
 * will be included in the express-validator error result and should be handled
 * by the global `validate` middleware.
 *
 */
export const verifyPassword = [
  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters."),
];
