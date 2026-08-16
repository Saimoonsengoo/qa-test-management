import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { prisma } from "../config/prisma";
import { ApiError } from "../utils/apiError";

export interface AuthUser {
  id: string;
  email: string;
  roleId: string;
  roleName: string;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

interface JwtPayload {
  sub: string;
}

// Verifies the Bearer token and attaches the current user + role to req.user.
// Every protected route in API Overview.md goes through this first.
export async function authenticate(
  req: Request,
  _res: Response,
  next: NextFunction
) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    throw ApiError.unauthorized("Missing or malformed Authorization header");
  }

  const token = header.slice("Bearer ".length);

  let payload: JwtPayload;
  try {
    payload = jwt.verify(token, env.jwtSecret) as JwtPayload;
  } catch {
    throw ApiError.unauthorized("Invalid or expired token");
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.sub },
    include: { role: true },
  });

  if (!user || user.status !== "ACTIVE") {
    throw ApiError.unauthorized("Account is not active");
  }

  req.user = {
    id: user.id,
    email: user.email,
    roleId: user.roleId,
    roleName: user.role.name,
  };
  next();
}

// Coarse role gate for system-level actions (e.g. only Admins manage users).
// Project-scoped permission checks (via project_members.projectRole) live in
// each module's service layer instead, since they depend on which project.
export function requireRole(...allowedRoles: string[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user || !allowedRoles.includes(req.user.roleName)) {
      throw ApiError.forbidden("You do not have permission to perform this action");
    }
    next();
  };
}
