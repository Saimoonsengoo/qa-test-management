import { Router } from "express";
import { authenticate } from "../../middleware/auth";
import { validateBody } from "../../middleware/validate";
import { asyncHandler } from "../../utils/asyncHandler";
import * as controller from "./defects.controller";
import { createDefectSchema, updateDefectSchema, updateDefectStatusSchema } from "./defects.schema";

export const defectsRouter = Router();
defectsRouter.use(authenticate);

defectsRouter.get("/", asyncHandler(controller.listHandler));
defectsRouter.post("/", validateBody(createDefectSchema), asyncHandler(controller.createHandler));
defectsRouter.get("/:id", asyncHandler(controller.getHandler));
defectsRouter.put("/:id", validateBody(updateDefectSchema), asyncHandler(controller.updateHandler));
defectsRouter.patch("/:id/status", validateBody(updateDefectStatusSchema), asyncHandler(controller.updateStatusHandler));
