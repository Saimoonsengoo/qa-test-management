import { Router } from "express";
import { authenticate } from "../../middleware/auth";
import { validateBody } from "../../middleware/validate";
import { asyncHandler } from "../../utils/asyncHandler";
import * as controller from "./testSuites.controller";
import { createSuiteSchema, updateSuiteSchema } from "./testSuites.schema";

export const testSuitesRouter = Router();
testSuitesRouter.use(authenticate);

testSuitesRouter.get("/", asyncHandler(controller.listHandler));
testSuitesRouter.post("/", validateBody(createSuiteSchema), asyncHandler(controller.createHandler));
testSuitesRouter.get("/:id", asyncHandler(controller.getHandler));
testSuitesRouter.put("/:id", validateBody(updateSuiteSchema), asyncHandler(controller.updateHandler));
testSuitesRouter.delete("/:id", asyncHandler(controller.archiveHandler));
