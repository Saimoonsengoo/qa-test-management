import { z } from "zod";

export const createProjectSchema = z.object({
  name: z.string().min(2),
  key: z.string().min(2).max(10).regex(/^[A-Z0-9]+$/, "Key must be uppercase letters/numbers"),
  description: z.string().optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
});

export const updateProjectSchema = z.object({
  name: z.string().min(2).optional(),
  description: z.string().optional(),
  status: z.enum(["PLANNING", "ACTIVE", "ON_HOLD", "COMPLETED", "ARCHIVED"]).optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
});

export const addMemberSchema = z.object({
  userId: z.string(),
  projectRole: z.string().min(2),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
export type AddMemberInput = z.infer<typeof addMemberSchema>;
