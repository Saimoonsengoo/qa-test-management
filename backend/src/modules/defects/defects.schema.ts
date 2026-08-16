import { z } from "zod";

export const createDefectSchema = z.object({
  projectId: z.string(),
  testCaseId: z.string().optional(),
  executionId: z.string().optional(),
  title: z.string().min(2),
  description: z.string().min(1),
  severity: z.enum(["BLOCKER", "CRITICAL", "MAJOR", "MINOR", "TRIVIAL"]),
  priority: z.enum(["CRITICAL", "HIGH", "MEDIUM", "LOW"]),
  assigneeId: z.string().optional(),
  stepsToReproduce: z.string().min(1),
  expectedResult: z.string().min(1),
  actualResult: z.string().min(1),
});

export const updateDefectSchema = z.object({
  title: z.string().min(2).optional(),
  description: z.string().optional(),
  severity: z.enum(["BLOCKER", "CRITICAL", "MAJOR", "MINOR", "TRIVIAL"]).optional(),
  priority: z.enum(["CRITICAL", "HIGH", "MEDIUM", "LOW"]).optional(),
  assigneeId: z.string().nullable().optional(),
  stepsToReproduce: z.string().optional(),
  expectedResult: z.string().optional(),
  actualResult: z.string().optional(),
});

export const updateDefectStatusSchema = z.object({
  status: z.enum(["NEW", "ASSIGNED", "IN_PROGRESS", "RESOLVED", "RETEST", "CLOSED", "REOPENED", "REJECTED"]),
});

export type CreateDefectInput = z.infer<typeof createDefectSchema>;
export type UpdateDefectInput = z.infer<typeof updateDefectSchema>;
