import { Router } from "express";
import { authenticate, requireRole } from "../../middleware/auth";
import { asyncHandler } from "../../utils/asyncHandler";
import * as controller from "./roles.controller";

export const rolesRouter = Router();
rolesRouter.use(authenticate);

rolesRouter.get("/", asyncHandler(controller.listRolesHandler));
rolesRouter.post("/:id/permissions", requireRole("Admin"), asyncHandler(controller.assignPermissionHandler));
rolesRouter.delete(
  "/:id/permissions/:permissionId",
  requireRole("Admin"),
  asyncHandler(controller.removePermissionHandler)
);

export const permissionsRouter = Router();
permissionsRouter.use(authenticate);
permissionsRouter.get("/", asyncHandler(controller.listPermissionsHandler));
