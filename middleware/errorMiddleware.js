/**
 * Error Middleware
 *
 * Context: Catches and formats errors across the app, ensuring consistent handling and developer-friendly debugging.
 *
 * Purpose: Provides centralized error handling for unmatched routes and runtime exceptions, including Mongoose-specific errors.
 *
 * Workflow:
 * notFound middleware intercepts requests to undefined routes.
 * Constructs a 404 error with the original URL.
 * Forwards the error to the next middleware.
 * errorHandler middleware formats and responds to errors.
 * Sets HTTP status code (defaults to 500 if unset).
 * Detects Mongoose CastError for invalid ObjectId lookups and adjusts status/message.
 * Sends JSON response with error message and stack trace (hidden in production).
 *
 * Notes:
 * Stack trace visibility toggled by NODE_ENV.
 * CastError handling ensures clarity for database lookup failures.
 * Exported for use in app.js to enforce consistent error formatting across all routes.
 */
const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

const errorHandler = (err, req, res, next) => {
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);
  let message = err.message;

  if (err.name === "CastError" && err.kind === "ObjectId") {
    statusCode = 404;
    message = "Resource not found";
  }

  res.json({
    message: message,
    stack: process.env.NODE_ENV === "production" ? null : err.stack,
  });
};

module.exports = {
  notFound,
  errorHandler,
};
