import { Router } from "express";
import { authenticate } from "../../middleware/auth";
import { asyncHandler } from "../../utils/asyncHandler";
import { summaryHandler } from "./dashboard.controller";

export const dashboardRouter = Router();
dashboardRouter.get("/summary", authenticate, asyncHandler(summaryHandler));
