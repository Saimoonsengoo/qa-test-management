import { Router } from "express";
import { authenticate } from "../../middleware/auth";
import { asyncHandler } from "../../utils/asyncHandler";
import * as controller from "./attachments.controller";

export const attachmentsRouter = Router();
attachmentsRouter.use(authenticate);

attachmentsRouter.get("/", asyncHandler(controller.listHandler));
attachmentsRouter.post("/", asyncHandler(controller.createHandler));
attachmentsRouter.delete("/:id", asyncHandler(controller.deleteHandler));
