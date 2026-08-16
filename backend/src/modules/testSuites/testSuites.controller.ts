import { Request, Response } from "express";
import { ApiError } from "../../utils/apiError";
import * as service from "./testSuites.service";

export async function listHandler(req: Request, res: Response) {
  const projectId = req.query.project_id as string | undefined;
  if (!projectId) throw ApiError.badRequest("project_id query param is required");
  const suites = await service.listSuites(projectId);
  res.json({ success: true, data: suites });
}

export async function createHandler(req: Request, res: Response) {
  const suite = await service.createSuite(req.body);
  res.status(201).json({ success: true, data: suite });
}

export async function getHandler(req: Request, res: Response) {
  const suite = await service.getSuite(req.params.id);
  res.json({ success: true, data: suite });
}

export async function updateHandler(req: Request, res: Response) {
  const suite = await service.updateSuite(req.params.id, req.body);
  res.json({ success: true, data: suite });
}

export async function archiveHandler(req: Request, res: Response) {
  const suite = await service.archiveSuite(req.params.id);
  res.json({ success: true, data: suite });
}
