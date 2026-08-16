import { apiClient } from "./client";
import { TestSuite } from "../types";

export async function listSuites(projectId: string) {
  const res = await apiClient.get<{ data: TestSuite[] }>(`/test-suites?project_id=${projectId}`);
  return res.data.data;
}

export async function createSuite(input: { projectId: string; name: string; description?: string; parentId?: string }) {
  const res = await apiClient.post<{ data: TestSuite }>("/test-suites", input);
  return res.data.data;
}
