import { apiClient } from "./client";
import { DashboardSummary } from "../types";

export async function getDashboardSummary(projectId?: string) {
  const query = projectId ? `?project_id=${projectId}` : "";
  const res = await apiClient.get<{ data: DashboardSummary }>(`/dashboard/summary${query}`);
  return res.data.data;
}
