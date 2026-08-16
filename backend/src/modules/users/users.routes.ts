import { Router } from "express";
import { authenticate, requireRole } from "../../middleware/auth";
import { validateBody } from "../../middleware/validate";
import { asyncHandler } from "../../utils/asyncHandler";
import * as controller from "./users.controller";
import { createUserSchema, updateStatusSchema, updateUserSchema } from "./users.schema";

export const usersRouter = Router();
usersRouter.use(authenticate);

// User administration is restricted to Admins (BR-006 / FR-035..038).
usersRouter.get("/", requireRole("Admin"), asyncHandler(controller.listHandler));
usersRouter.post("/", requireRole("Admin"), validateBody(createUserSchema), asyncHandler(controller.createHandler));
usersRouter.get("/:id", requireRole("Admin"), asyncHandler(controller.getHandler));
usersRouter.put("/:id", requireRole("Admin"), validateBody(updateUserSchema), asyncHandler(controller.updateHandler));
usersRouter.patch(
  "/:id/status",
  requireRole("Admin"),
  validateBody(updateStatusSchema),
  asyncHandler(controller.updateStatusHandler)
);
