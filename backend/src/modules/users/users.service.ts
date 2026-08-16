import bcrypt from "bcryptjs";
import { prisma } from "../../config/prisma";
import { ApiError } from "../../utils/apiError";
import { PaginationParams, paginatedResponse } from "../../utils/pagination";

const publicSelect = {
  id: true,
  name: true,
  email: true,
  status: true,
  createdAt: true,
  updatedAt: true,
  role: { select: { id: true, name: true } },
};

export interface ListUsersFilters {
  search?: string;
  roleId?: string;
  status?: "ACTIVE" | "INACTIVE";
}

// Supports the User List screen (search + role/status filters) from
// Documents/TestHub/02 - Modules/User Management.md §3.2, paginated the
// same way every other list endpoint in the API is (see API Overview.md).
export async function listUsers(filters: ListUsersFilters, pagination: PaginationParams) {
  const where = {
    ...(filters.roleId ? { roleId: filters.roleId } : {}),
    ...(filters.status ? { status: filters.status } : {}),
    ...(filters.search
      ? {
          OR: [
            { name: { contains: filters.search, mode: "insensitive" as const } },
            { email: { contains: filters.search, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: publicSelect,
      orderBy: { name: "asc" },
      skip: pagination.skip,
      take: pagination.take,
    }),
    prisma.user.count({ where }),
  ]);

  return paginatedResponse(users, total, pagination);
}

export async function createUser(input: { name: string; email: string; password: string; roleId: string }) {
  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) throw ApiError.conflict("A user with this email already exists");

  await assertRoleExists(input.roleId);

  const password = await bcrypt.hash(input.password, 10);
  return prisma.user.create({
    data: { ...input, password },
    select: publicSelect,
  });
}

export async function getUser(id: string) {
  const user = await prisma.user.findUnique({ where: { id }, select: publicSelect });
  if (!user) throw ApiError.notFound("User not found");
  return user;
}

export async function updateUser(id: string, input: { name?: string; roleId?: string }, currentUserId: string) {
  const target = await getUser(id);

  if (input.roleId) {
    await assertRoleExists(input.roleId);
    // BR-006 guard: never let the last active Admin be demoted, including by themselves.
    if (target.role.name === "Admin" && input.roleId !== target.role.id) {
      await assertNotLastActiveAdmin(id, "Reassigning this user's role would leave the system with no Admin");
    }
  }

  return prisma.user.update({ where: { id }, data: input, select: publicSelect });
}

export async function updateUserStatus(id: string, status: "ACTIVE" | "INACTIVE", currentUserId: string) {
  const target = await getUser(id);

  if (status === "INACTIVE") {
    if (id === currentUserId) {
      throw ApiError.badRequest("You cannot deactivate your own account");
    }
    if (target.role.name === "Admin") {
      await assertNotLastActiveAdmin(id, "Deactivating this user would leave the system with no active Admin");
    }
  }

  return prisma.user.update({ where: { id }, data: { status }, select: publicSelect });
}

// Admin-initiated password reset (User Management §7 future enhancement,
// now supported for cases where a user is locked out of their account).
export async function resetPassword(id: string, newPassword: string) {
  await getUser(id);
  const password = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({ where: { id }, data: { password } });
  return { reset: true };
}

async function assertRoleExists(roleId: string) {
  const role = await prisma.role.findUnique({ where: { id: roleId } });
  if (!role) throw ApiError.badRequest("Selected role does not exist");
}

async function assertNotLastActiveAdmin(excludingUserId: string, message: string) {
  const otherActiveAdmins = await prisma.user.count({
    where: {
      id: { not: excludingUserId },
      status: "ACTIVE",
      role: { name: "Admin" },
    },
  });
  if (otherActiveAdmins === 0) {
    throw ApiError.conflict(message);
  }
}
