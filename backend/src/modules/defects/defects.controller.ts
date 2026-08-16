import { Request, Response } from "express";
import { getPagination, paginatedResponse } from "../../utils/pagination";
import * as service from "./defects.service";

export async function listHandler(req: Request, res: Response) {
  const pagination = getPagination(req);
  const { data, total } = await service.listDefects(pagination, {
    projectId: req.query.project_id as string | undefined,
    status: req.query.status as string | undefined,
    severity: req.query.severity as string | undefined,
    priority: req.query.priority as string | undefined,
    assigneeId: req.query.assignee_id as string | undefined,
  });
  res.json(paginatedResponse(data, total, pagination));
}

export async function createHandler(req: Request, res: Response) {
  const defect = await service.createDefect(req.user!.id, req.body);
  res.status(201).json({ success: true, data: defect });
}

export async function getHandler(req: Request, res: Response) {
  const defect = await service.getDefect(req.params.id);
  res.json({ success: true, data: defect });
}

export async function updateHandler(req: Request, res: Response) {
  const defect = await service.updateDefect(req.params.id, req.body);
  res.json({ success: true, data: defect });
}

export async function updateStatusHandler(req: Request, res: Response) {
  const defect = await service.updateDefectStatus(req.params.id, req.user!.id, req.body.status);
  res.json({ success: true, data: defect });
}
