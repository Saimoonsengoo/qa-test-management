import { Request, Response } from "express";
import { getPagination, paginatedResponse } from "../../utils/pagination";
import * as service from "./testCases.service";

export async function listHandler(req: Request, res: Response) {
  const pagination = getPagination(req);
  const { data, total } = await service.listTestCases(pagination, {
    suiteId: req.query.suite_id as string | undefined,
    status: req.query.status as string | undefined,
    priority: req.query.priority as string | undefined,
    requirementId: req.query.requirement_id as string | undefined,
  });
  res.json(paginatedResponse(data, total, pagination));
}

export async function createHandler(req: Request, res: Response) {
  const testCase = await service.createTestCase(req.user!.id, req.body);
  res.status(201).json({ success: true, data: testCase });
}

export async function getHandler(req: Request, res: Response) {
  const testCase = await service.getTestCase(req.params.id);
  res.json({ success: true, data: testCase });
}

export async function updateHandler(req: Request, res: Response) {
  const testCase = await service.updateTestCase(req.params.id, req.user!.id, req.body);
  res.json({ success: true, data: testCase });
}

export async function updateStatusHandler(req: Request, res: Response) {
  const testCase = await service.updateStatus(req.params.id, req.user!.id, req.body.status);
  res.json({ success: true, data: testCase });
}

export async function archiveHandler(req: Request, res: Response) {
  const testCase = await service.archiveTestCase(req.params.id, req.user!.id);
  res.json({ success: true, data: testCase });
}

export async function historyHandler(req: Request, res: Response) {
  const history = await service.getHistory(req.params.id);
  res.json({ success: true, data: history });
}
