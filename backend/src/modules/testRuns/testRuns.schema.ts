import { z } from "zod";

export const createTestRunSchema = z.object({
  projectId: z.string(),
  name: z.string().min(2),
  buildVersion: z.string().optional(),
  environment: z.string().optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
});

export const updateTestRunSchema = z.object({
  name: z.string().min(2).optional(),
  buildVersion: z.string().optional(),
  environment: z.string().optional(),
  status: z.enum(["NOT_STARTED", "IN_PROGRESS", "COMPLETED"]).optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
});

export const assignCasesSchema = z.object({
  testCaseIds: z.array(z.string()).min(1),
});

export type CreateTestRunInput = z.infer<typeof createTestRunSchema>;
export type UpdateTestRunInput = z.infer<typeof updateTestRunSchema>;
