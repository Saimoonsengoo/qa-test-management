import { z } from "zod";

export const createRoleSchema = z.object({
  name: z.string().min(2).max(40),
  description: z.string().max(200).optional(),
});

export const updateRoleSchema = z.object({
  name: z.string().min(2).max(40).optional(),
  description: z.string().max(200).optional(),
});

export const assignPermissionSchema = z.object({
  permissionId: z.string().min(1),
});
