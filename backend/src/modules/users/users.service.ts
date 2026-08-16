import bcrypt from "bcryptjs";
import { prisma } from "../../config/prisma";
import { ApiError } from "../../utils/apiError";

const publicSelect = {
  id: true,
  name: true,
  email: true,
  status: true,
  createdAt: true,
  role: { select: { id: true, name: true } },
};

export async function listUsers() {
  return prisma.user.findMany({ select: publicSelect, orderBy: { name: "asc" } });
}

export async function createUser(input: { name: string; email: string; password: string; roleId: string }) {
  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) throw ApiError.conflict("A user with this email already exists");

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

export async function updateUser(id: string, input: { name?: string; roleId?: string }) {
  await getUser(id);
  return prisma.user.update({ where: { id }, data: input, select: publicSelect });
}

export async function updateUserStatus(id: string, status: "ACTIVE" | "INACTIVE") {
  await getUser(id);
  return prisma.user.update({ where: { id }, data: { status }, select: publicSelect });
}
