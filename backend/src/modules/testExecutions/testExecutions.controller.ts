import { Request, Response } from "express";
import { ApiError } from "../../utils/apiError";
import * as service from "./testExecutions.service";

export async function listHandler(req: Request, res: Response) {
  const testRunId = req.query.test_run_id as string | undefined;
  if (!testRunId) throw ApiError.badRequest("test_run_id query param is required");
  const executions = await service.listExecutions(testRunId);
  res.json({ success: true, data: executions });
}

export async function getHandler(req: Request, res: Response) {
  const execution = await service.getExecution(req.params.id);
  res.json({ success: true, data: execution });
}

export async function recordResultHandler(req: Request, res: Response) {
  const execution = await service.recordResult(req.params.id, req.user!.id, req.body);
  res.json({ success: true, data: execution });
}

export async function importHandler(req: Request, res: Response) {
  const results = await service.importResults(req.user!.id, req.body);
  res.status(201).json({ success: true, data: results });
}
