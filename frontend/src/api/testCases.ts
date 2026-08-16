import { apiClient } from "./client";
import { TestCase, TestCaseStatus, TestStep } from "../types";

export async function listTestCases(suiteId: string) {
  const res = await apiClient.get<{ data: TestCase[] }>(`/test-cases?suite_id=${suiteId}&limit=100`);
  return res.data.data;
}

export async function getTestCase(id: string) {
  const res = await apiClient.get<{ data: TestCase }>(`/test-cases/${id}`);
  return res.data.data;
}

export interface CreateTestCaseInput {
  suiteId: string;
  title: string;
  description?: string;
  preconditions?: string;
  priority: string;
  type: string;
  requirementId?: string;
  steps: TestStep[];
}

export async function createTestCase(input: CreateTestCaseInput) {
  const res = await apiClient.post<{ data: TestCase }>("/test-cases", input);
  return res.data.data;
}

export async function updateTestCaseStatus(id: string, status: TestCaseStatus) {
  const res = await apiClient.patch<{ data: TestCase }>(`/test-cases/${id}/status`, { status });
  return res.data.data;
}
