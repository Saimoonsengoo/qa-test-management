import { Router } from "express";
import { authenticate } from "../../middleware/auth";
import { validateBody } from "../../middleware/validate";
import { asyncHandler } from "../../utils/asyncHandler";
import * as controller from "./testCases.controller";
import { createTestCaseSchema, updateStatusSchema, updateTestCaseSchema } from "./testCases.schema";

export const testCasesRouter = Router();
testCasesRouter.use(authenticate);

testCasesRouter.get("/", asyncHandler(controller.listHandler));
testCasesRouter.post("/", validateBody(createTestCaseSchema), asyncHandler(controller.createHandler));
testCasesRouter.get("/:id", asyncHandler(controller.getHandler));
testCasesRouter.put("/:id", validateBody(updateTestCaseSchema), asyncHandler(controller.updateHandler));
testCasesRouter.patch("/:id/status", validateBody(updateStatusSchema), asyncHandler(controller.updateStatusHandler));
testCasesRouter.delete("/:id", asyncHandler(controller.archiveHandler));
testCasesRouter.get("/:id/history", asyncHandler(controller.historyHandler));
