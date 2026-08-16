import { Request, Response } from "express";
import { getPagination } from "../../utils/pagination";
import * as service from "./users.service";

export async function listHandler(req: Request, res: Response) {
  const statusParam = req.query.status;
  const filters = {
    search: typeof req.query.search === "string" ? req.query.search : undefined,
    roleId: typeof req.query.roleId === "string" ? req.query.roleId : undefined,
    status: statusParam === "ACTIVE" || statusParam === "INACTIVE" ? statusParam : undefined,
  };
  const result = await service.listUsers(filters, getPagination(req));
  res.json(result);
}

export async function createHandler(req: Request, res: Response) {
  const user = await service.createUser(req.body);
  res.status(201).json({ success: true, data: user });
}

export async function getHandler(req: Request, res: Response) {
  const user = await service.getUser(req.params.id);
  res.json({ success: true, data: user });
}

export async function updateHandler(req: Request, res: Response) {
  const user = await service.updateUser(req.params.id, req.body, req.user!.id);
  res.json({ success: true, data: user });
}

export async function updateStatusHandler(req: Request, res: Response) {
  const user = await service.updateUserStatus(req.params.id, req.body.status, req.user!.id);
  res.json({ success: true, data: user });
}

export async function resetPasswordHandler(req: Request, res: Response) {
  const result = await service.resetPassword(req.params.id, req.body.password);
  res.json({ success: true, data: result });
}
