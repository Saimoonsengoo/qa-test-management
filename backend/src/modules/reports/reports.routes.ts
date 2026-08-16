import { Router } from "express";
import { authenticate } from "../../middleware/auth";
import { asyncHandler } from "../../utils/asyncHandler";
import { coverageHandler, defectSummaryHandler, executionSummaryHandler } from "./reports.controller";

export const reportsRouter = Router();
reportsRouter.use(authenticate);

reportsRouter.get("/execution-summary", asyncHandler(executionSummaryHandler));
reportsRouter.get("/coverage", asyncHandler(coverageHandler));
reportsRouter.get("/defect-summary", asyncHandler(defectSummaryHandler));
