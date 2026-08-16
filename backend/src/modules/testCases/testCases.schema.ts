import { z } from "zod";

const stepSchema = z.object({
  stepNumber: z.number().int().positive(),
  action: z.string().min(1),
  testData: z.string().optional(),
  expectedResult: z.string().min(1),
});

export const createTestCaseSchema = z.object({
  suiteId: z.string(),
  requirementId: z.string().optional(),
  title: z.string().min(2),
  description: z.string().optional(),
  preconditions: z.string().optional(),
  priority: z.enum(["CRITICAL", "HIGH", "MEDIUM", "LOW"]).default("MEDIUM"),
  type: z
    .enum(["FUNCTIONAL", "REGRESSION", "SMOKE", "SANITY", "INTEGRATION", "UI", "API", "SECURITY"])
    .default("FUNCTIONAL"),
  steps: z.array(stepSchema).default([]),
});

export const updateTestCaseSchema = z.object({
  title: z.string().min(2).optional(),
  description: z.string().optional(),
  preconditions: z.string().optional(),
  priority: z.enum(["CRITICAL", "HIGH", "MEDIUM", "LOW"]).optional(),
  type: z
    .enum(["FUNCTIONAL", "REGRESSION", "SMOKE", "SANITY", "INTEGRATION", "UI", "API", "SECURITY"])
    .optional(),
  requirementId: z.string().optional(),
  steps: z.array(stepSchema).optional(),
});

export const updateStatusSchema = z.object({
  status: z.enum(["DRAFT", "REVIEW", "READY", "DEPRECATED"]),
});

export type CreateTestCaseInput = z.infer<typeof createTestCaseSchema>;
export type UpdateTestCaseInput = z.infer<typeof updateTestCaseSchema>;
