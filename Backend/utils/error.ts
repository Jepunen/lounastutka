// NOTE: Custom error class to log full error to docker
// and give client more generic type without potentially sensitive information 
// src: https://oneuptime.com/blog/post/2026-01-31-bun-rest-api/view
// The handler is found under middleware

export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode = 500, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
  }
}

