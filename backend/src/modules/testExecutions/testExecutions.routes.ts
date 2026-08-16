import { Router } from "express";
import { authenticate } from "../../middleware/auth";
import { validateBody } from "../../middleware/validate";
import { asyncHandler } from "../../utils/asyncHandler";
import * as controller from "./testExecutions.controller";
import { importResultsSchema, recordResultSchema } from "./testExecutions.schema";

export const testExecutionsRouter = Router();
testExecutionsRouter.use(authenticate);

testExecutionsRouter.get("/", asyncHandler(controller.listHandler));
testExecutionsRouter.get("/:id", asyncHandler(controller.getHandler));
testExecutionsRouter.patch("/:id", validateBody(recordResultSchema), asyncHandler(controller.recordResultHandler));
testExecutionsRouter.post("/import", validateBody(importResultsSchema), asyncHandler(controller.importHandler));
