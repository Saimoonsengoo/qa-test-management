import { Request, Response } from "express";
import { prisma } from "../../config/prisma";
import { ApiError } from "../../utils/apiError";

export async function listRolesHandler(_req: Request, res: Response) {
  const roles = await prisma.role.findMany({ include: { rolePermissions: { include: { permission: true } } } });
  res.json({ success: true, data: roles });
}

export async function listPermissionsHandler(_req: Request, res: Response) {
  const permissions = await prisma.permission.findMany();
  res.json({ success: true, data: permissions });
}

export async function assignPermissionHandler(req: Request, res: Response) {
  const { id } = req.params;
  const { permissionId } = req.body as { permissionId: string };
  if (!permissionId) throw ApiError.badRequest("permissionId is required");

  const link = await prisma.rolePermission.upsert({
    where: { roleId_permissionId: { roleId: id, permissionId } },
    create: { roleId: id, permissionId },
    update: {},
  });
  res.status(201).json({ success: true, data: link });
}

export async function removePermissionHandler(req: Request, res: Response) {
  const { id, permissionId } = req.params;
  await prisma.rolePermission.deleteMany({ where: { roleId: id, permissionId } });
  res.json({ success: true, data: null });
}
