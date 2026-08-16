import { z } from "zod";

export const createSuiteSchema = z.object({
  projectId: z.string(),
  parentId: z.string().optional(),
  name: z.string().min(2),
  description: z.string().optional(),
});

export const updateSuiteSchema = z.object({
  name: z.string().min(2).optional(),
  description: z.string().optional(),
  status: z.enum(["ACTIVE", "ARCHIVED"]).optional(),
  parentId: z.string().nullable().optional(),
});

export type CreateSuiteInput = z.infer<typeof createSuiteSchema>;
export type UpdateSuiteInput = z.infer<typeof updateSuiteSchema>;
