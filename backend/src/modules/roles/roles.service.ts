import { prisma } from "../../config/prisma";
import { ApiError } from "../../utils/apiError";

// The "Admin" role is the system's root role (seed.ts) — renaming or
// deleting it could lock every Admin-gated route (requireRole("Admin"))
// out of the whole app, so it's protected the same way the last active
// Admin user is protected in users.service.ts.
const PROTECTED_ROLE_NAME = "Admin";

export async function listRoles() {
  return prisma.role.findMany({
    include: { rolePermissions: { include: { permission: true } }, _count: { select: { users: true } } },
    orderBy: { name: "asc" },
  });
}

export async function listPermissions() {
  return prisma.permission.findMany({ orderBy: { name: "asc" } });
}

export async function createRole(input: { name: string; description?: string }) {
  const existing = await prisma.role.findUnique({ where: { name: input.name } });
  if (existing) throw ApiError.conflict("A role with this name already exists");
  return prisma.role.create({ data: input });
}

export async function updateRole(id: string, input: { name?: string; description?: string }) {
  const role = await getRoleOrThrow(id);
  if (role.name === PROTECTED_ROLE_NAME && input.name && input.name !== PROTECTED_ROLE_NAME) {
    throw ApiError.forbidden(`The "${PROTECTED_ROLE_NAME}" role cannot be renamed`);
  }
  return prisma.role.update({ where: { id }, data: input });
}

export async function deleteRole(id: string) {
  const role = await prisma.role.findUnique({ where: { id }, include: { _count: { select: { users: true } } } });
  if (!role) throw ApiError.notFound("Role not found");

  if (role.name === PROTECTED_ROLE_NAME) {
    throw ApiError.forbidden(`The "${PROTECTED_ROLE_NAME}" role cannot be deleted`);
  }
  if (role._count.users > 0) {
    throw ApiError.conflict(`Cannot delete "${role.name}" — ${role._count.users} user(s) still have this role`);
  }

  await prisma.role.delete({ where: { id } });
  return { deleted: true };
}

export async function assignPermission(roleId: string, permissionId: string) {
  await getRoleOrThrow(roleId);
  const permission = await prisma.permission.findUnique({ where: { id: permissionId } });
  if (!permission) throw ApiError.badRequest("Permission does not exist");

  return prisma.rolePermission.upsert({
    where: { roleId_permissionId: { roleId, permissionId } },
    create: { roleId, permissionId },
    update: {},
  });
}

export async function removePermission(roleId: string, permissionId: string) {
  await getRoleOrThrow(roleId);
  await prisma.rolePermission.deleteMany({ where: { roleId, permissionId } });
}

async function getRoleOrThrow(id: string) {
  const role = await prisma.role.findUnique({ where: { id } });
  if (!role) throw ApiError.notFound("Role not found");
  return role;
}
