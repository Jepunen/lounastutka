import { body } from "express-validator";

// Simple email, password validation setup midware
// NOTE: as passkeys do not require password, we want to separate these methods for different routes.

export const verifyEmail = [
  body("email")
    .trim()
    .toLowerCase()
    .isEmail()
    .withMessage("Invalid email format."),
];

export const verifyPassword = [
  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters."),
];
