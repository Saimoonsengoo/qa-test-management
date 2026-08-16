import { NextFunction, Request, Response } from "express";
import { ApiError } from "../utils/apiError";

// Central error handler — every route funnels errors here via asyncHandler.
// Always responds with the standard { success: false, message } shape from
// API Overview.md so the frontend never has to guess the error format.
export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  if (err instanceof ApiError) {
    return res.status(err.status).json({ success: false, message: err.message });
  }

  console.error(err);
  return res.status(500).json({ success: false, message: "Internal server error" });
}

export function notFoundHandler(_req: Request, res: Response) {
  res.status(404).json({ success: false, message: "Route not found" });
}
