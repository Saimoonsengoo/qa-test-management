import { apiClient } from "./client";
import { Defect } from "../types";

export async function listDefects(projectId: string, filters: Record<string, string> = {}) {
  const params = new URLSearchParams({ project_id: projectId, limit: "100", ...filters });
  const res = await apiClient.get<{ data: Defect[] }>(`/defects?${params.toString()}`);
  return res.data.data;
}

export async function getDefect(id: string) {
  const res = await apiClient.get<{ data: Defect }>(`/defects/${id}`);
  return res.data.data;
}

export interface CreateDefectInput {
  projectId: string;
  testCaseId?: string;
  title: string;
  description: string;
  severity: string;
  priority: string;
  stepsToReproduce: string;
  expectedResult: string;
  actualResult: string;
}

export async function createDefect(input: CreateDefectInput) {
  const res = await apiClient.post<{ data: Defect }>("/defects", input);
  return res.data.data;
}

export async function updateDefectStatus(id: string, status: string) {
  const res = await apiClient.patch<{ data: Defect }>(`/defects/${id}/status`, { status });
  return res.data.data;
}
