import { Request, Response } from "express";
import { ApiError } from "../../utils/apiError";
import * as service from "./testRuns.service";

export async function listHandler(req: Request, res: Response) {
  const projectId = req.query.project_id as string | undefined;
  if (!projectId) throw ApiError.badRequest("project_id query param is required");
  const runs = await service.listTestRuns(projectId);
  res.json({ success: true, data: runs });
}

export async function createHandler(req: Request, res: Response) {
  const run = await service.createTestRun(req.user!.id, req.body);
  res.status(201).json({ success: true, data: run });
}

export async function getHandler(req: Request, res: Response) {
  const run = await service.getTestRun(req.params.id);
  res.json({ success: true, data: run });
}

export async function updateHandler(req: Request, res: Response) {
  const run = await service.updateTestRun(req.params.id, req.body);
  res.json({ success: true, data: run });
}

export async function assignCasesHandler(req: Request, res: Response) {
  const run = await service.assignTestCases(req.params.id, req.user!.id, req.body.testCaseIds);
  res.status(201).json({ success: true, data: run });
}
