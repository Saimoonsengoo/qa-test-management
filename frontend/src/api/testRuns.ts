import { apiClient } from "./client";
import { TestExecution, TestRun } from "../types";

export async function listRuns(projectId: string) {
  const res = await apiClient.get<{ data: TestRun[] }>(`/test-runs?project_id=${projectId}`);
  return res.data.data;
}

export async function createRun(input: { projectId: string; name: string; buildVersion?: string; environment?: string }) {
  const res = await apiClient.post<{ data: TestRun }>("/test-runs", input);
  return res.data.data;
}

export async function getRun(id: string) {
  const res = await apiClient.get<{ data: TestRun & { executions: TestExecution[] } }>(`/test-runs/${id}`);
  return res.data.data;
}

export async function assignCases(runId: string, testCaseIds: string[]) {
  const res = await apiClient.post(`/test-runs/${runId}/test-cases`, { testCaseIds });
  return res.data.data;
}

export async function recordResult(
  executionId: string,
  input: { status: string; actualResult?: string; comment?: string }
) {
  const res = await apiClient.patch<{ data: TestExecution }>(`/test-executions/${executionId}`, input);
  return res.data.data;
}
