import { z } from "zod";

export const recordResultSchema = z.object({
  status: z.enum(["NOT_RUN", "PASSED", "FAILED", "BLOCKED", "SKIPPED"]),
  actualResult: z.string().optional(),
  comment: z.string().optional(),
});

// Mirrors POST /api/test-executions/import in API Overview.md — the hook for
// feeding real Playwright JSON-reporter output straight into a test run.
const importRowSchema = z.object({
  testCaseId: z.string(),
  status: z.enum(["PASSED", "FAILED", "BLOCKED", "SKIPPED"]),
  actualResult: z.string().optional(),
  comment: z.string().optional(),
});

export const importResultsSchema = z.object({
  testRunId: z.string(),
  results: z.array(importRowSchema).min(1),
});

export type RecordResultInput = z.infer<typeof recordResultSchema>;
export type ImportResultsInput = z.infer<typeof importResultsSchema>;
