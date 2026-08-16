import { Request, Response } from "express";
import * as service from "./roles.service";

export async function listRolesHandler(_req: Request, res: Response) {
  const roles = await service.listRoles();
  res.json({ success: true, data: roles });
}

export async function listPermissionsHandler(_req: Request, res: Response) {
  const permissions = await service.listPermissions();
  res.json({ success: true, data: permissions });
}

export async function createRoleHandler(req: Request, res: Response) {
  const role = await service.createRole(req.body);
  res.status(201).json({ success: true, data: role });
}

export async function updateRoleHandler(req: Request, res: Response) {
  const role = await service.updateRole(req.params.id, req.body);
  res.json({ success: true, data: role });
}

export async function deleteRoleHandler(req: Request, res: Response) {
  const result = await service.deleteRole(req.params.id);
  res.json({ success: true, data: result });
}

export async function assignPermissionHandler(req: Request, res: Response) {
  const { id } = req.params;
  const { permissionId } = req.body as { permissionId: string };
  const link = await service.assignPermission(id, permissionId);
  res.status(201).json({ success: true, data: link });
}

export async function removePermissionHandler(req: Request, res: Response) {
  const { id, permissionId } = req.params;
  await service.removePermission(id, permissionId);
  res.json({ success: true, data: null });
}
