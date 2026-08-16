import { Router } from "express";
import { authenticate } from "../../middleware/auth";
import { asyncHandler } from "../../utils/asyncHandler";
import * as controller from "./notifications.controller";

export const notificationsRouter = Router();
notificationsRouter.use(authenticate);

notificationsRouter.get("/", asyncHandler(controller.listHandler));
notificationsRouter.patch("/:id/read", asyncHandler(controller.markReadHandler));
notificationsRouter.patch("/read-all", asyncHandler(controller.markAllReadHandler));
