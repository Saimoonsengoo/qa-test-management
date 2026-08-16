import { Router } from "express";
import { authenticate } from "../../middleware/auth";
import { validateBody } from "../../middleware/validate";
import { asyncHandler } from "../../utils/asyncHandler";
import * as controller from "./testRuns.controller";
import { assignCasesSchema, createTestRunSchema, updateTestRunSchema } from "./testRuns.schema";

export const testRunsRouter = Router();
testRunsRouter.use(authenticate);

testRunsRouter.get("/", asyncHandler(controller.listHandler));
testRunsRouter.post("/", validateBody(createTestRunSchema), asyncHandler(controller.createHandler));
testRunsRouter.get("/:id", asyncHandler(controller.getHandler));
testRunsRouter.put("/:id", validateBody(updateTestRunSchema), asyncHandler(controller.updateHandler));
testRunsRouter.post("/:id/test-cases", validateBody(assignCasesSchema), asyncHandler(controller.assignCasesHandler));
