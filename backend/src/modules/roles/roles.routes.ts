import { Router } from "express";
import { authenticate, requireRole } from "../../middleware/auth";
import { validateBody } from "../../middleware/validate";
import { asyncHandler } from "../../utils/asyncHandler";
import * as controller from "./roles.controller";
import { assignPermissionSchema, createRoleSchema, updateRoleSchema } from "./roles.schema";

export const rolesRouter = Router();
rolesRouter.use(authenticate);

rolesRouter.get("/", asyncHandler(controller.listRolesHandler));
rolesRouter.post("/", requireRole("Admin"), validateBody(createRoleSchema), asyncHandler(controller.createRoleHandler));
rolesRouter.put("/:id", requireRole("Admin"), validateBody(updateRoleSchema), asyncHandler(controller.updateRoleHandler));
rolesRouter.delete("/:id", requireRole("Admin"), asyncHandler(controller.deleteRoleHandler));
rolesRouter.post(
  "/:id/permissions",
  requireRole("Admin"),
  validateBody(assignPermissionSchema),
  asyncHandler(controller.assignPermissionHandler)
);
rolesRouter.delete(
  "/:id/permissions/:permissionId",
  requireRole("Admin"),
  asyncHandler(controller.removePermissionHandler)
);

export const permissionsRouter = Router();
permissionsRouter.use(authenticate);
permissionsRouter.get("/", asyncHandler(controller.listPermissionsHandler));
