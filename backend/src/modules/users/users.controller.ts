import { Request, Response } from "express";
import * as service from "./users.service";

export async function listHandler(_req: Request, res: Response) {
  const users = await service.listUsers();
  res.json({ success: true, data: users });
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
  const user = await service.updateUser(req.params.id, req.body);
  res.json({ success: true, data: user });
}

export async function updateStatusHandler(req: Request, res: Response) {
  const user = await service.updateUserStatus(req.params.id, req.body.status);
  res.json({ success: true, data: user });
}
