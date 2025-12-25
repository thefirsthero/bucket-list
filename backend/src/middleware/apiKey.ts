import { Request, Response, NextFunction } from "express";

/**
 * Middleware to verify API key from X-API-Key header
 * Protects all routes except health check and auth endpoints
 */
export const verifyApiKey = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  // Skip authentication for health check and auth endpoints
  if (req.path === "/health" || req.path.startsWith("/api/auth")) {
    return next();
  }

  // Get API key from environment
  const validApiKey = process.env.API_KEY;

  // If no API key is configured, allow all requests (development mode)
  if (!validApiKey) {
    return next();
  }

  // Get API key from request header
  const apiKey = req.headers["x-api-key"] as string;

  // Verify API key
  if (!apiKey || apiKey !== validApiKey) {
    res.status(401).json({ error: "Invalid or missing API key" });
    return;
  }

  next();
};
