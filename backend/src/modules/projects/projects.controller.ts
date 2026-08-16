import { Request, Response } from "express";
import { getPagination, paginatedResponse } from "../../utils/pagination";
import * as service from "./projects.service";

export async function listHandler(req: Request, res: Response) {
  const pagination = getPagination(req);
  const { data, total } = await service.listProjects(pagination, req.query.status as string | undefined);
  res.json(paginatedResponse(data, total, pagination));
}

export async function createHandler(req: Request, res: Response) {
  const project = await service.createProject(req.user!.id, req.body);
  res.status(201).json({ success: true, data: project });
}

export async function getHandler(req: Request, res: Response) {
  const project = await service.getProject(req.params.id);
  res.json({ success: true, data: project });
}

export async function updateHandler(req: Request, res: Response) {
  const project = await service.updateProject(req.params.id, req.body);
  res.json({ success: true, data: project });
}

export async function archiveHandler(req: Request, res: Response) {
  const project = await service.archiveProject(req.params.id);
  res.json({ success: true, data: project });
}

export async function addMemberHandler(req: Request, res: Response) {
  const member = await service.addMember(req.params.id, req.body);
  res.status(201).json({ success: true, data: member });
}

export async function removeMemberHandler(req: Request, res: Response) {
  await service.removeMember(req.params.id, req.params.userId);
  res.json({ success: true, data: null });
}
