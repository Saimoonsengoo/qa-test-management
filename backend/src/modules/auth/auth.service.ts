import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { env } from "../../config/env";
import { prisma } from "../../config/prisma";
import { ApiError } from "../../utils/apiError";
import { LoginInput, RegisterInput } from "./auth.schema";

function signToken(userId: string) {
  return jwt.sign({ sub: userId }, env.jwtSecret, { expiresIn: env.jwtExpiresIn });
}

function toPublicUser(user: {
  id: string;
  name: string;
  email: string;
  status: string;
  role: { id: string; name: string };
}) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    status: user.status,
    role: user.role,
  };
}

export async function register(input: RegisterInput) {
  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) {
    throw ApiError.conflict("An account with this email already exists");
  }

  const role = await prisma.role.findUnique({ where: { name: input.roleName } });
  if (!role) {
    throw ApiError.badRequest(`Unknown role: ${input.roleName}`);
  }

  const passwordHash = await bcrypt.hash(input.password, 10);

  const user = await prisma.user.create({
    data: {
      name: input.name,
      email: input.email,
      password: passwordHash,
      roleId: role.id,
    },
    include: { role: true },
  });

  return { token: signToken(user.id), user: toPublicUser(user) };
}

export async function login(input: LoginInput) {
  const user = await prisma.user.findUnique({
    where: { email: input.email },
    include: { role: true },
  });

  if (!user || user.status !== "ACTIVE") {
    throw ApiError.unauthorized("Invalid email or password");
  }

  const passwordMatches = await bcrypt.compare(input.password, user.password);
  if (!passwordMatches) {
    throw ApiError.unauthorized("Invalid email or password");
  }

  return { token: signToken(user.id), user: toPublicUser(user) };
}

export async function getCurrentUser(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { role: true },
  });
  if (!user) throw ApiError.notFound("User not found");
  return toPublicUser(user);
}
