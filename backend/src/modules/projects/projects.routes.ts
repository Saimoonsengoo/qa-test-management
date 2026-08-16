import { Router } from "express";
import { authenticate } from "../../middleware/auth";
import { validateBody } from "../../middleware/validate";
import { asyncHandler } from "../../utils/asyncHandler";
import * as controller from "./projects.controller";
import { addMemberSchema, createProjectSchema, updateProjectSchema } from "./projects.schema";

export const projectsRouter = Router();
projectsRouter.use(authenticate);

projectsRouter.get("/", asyncHandler(controller.listHandler));
projectsRouter.post("/", validateBody(createProjectSchema), asyncHandler(controller.createHandler));
projectsRouter.get("/:id", asyncHandler(controller.getHandler));
projectsRouter.put("/:id", validateBody(updateProjectSchema), asyncHandler(controller.updateHandler));
projectsRouter.delete("/:id", asyncHandler(controller.archiveHandler));
projectsRouter.post("/:id/members", validateBody(addMemberSchema), asyncHandler(controller.addMemberHandler));
projectsRouter.delete("/:id/members/:userId", asyncHandler(controller.removeMemberHandler));
