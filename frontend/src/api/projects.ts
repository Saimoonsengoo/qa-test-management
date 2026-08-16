import { apiClient } from "./client";
import { Project, ProjectMember } from "../types";

export async function listProjects() {
  const res = await apiClient.get<{ data: Project[] }>("/projects?limit=100");
  return res.data.data;
}

export async function getProject(id: string) {
  const res = await apiClient.get<{ data: Project & { members: ProjectMember[] } }>(`/projects/${id}`);
  return res.data.data;
}

export async function createProject(input: { name: string; key: string; description?: string }) {
  const res = await apiClient.post<{ data: Project }>("/projects", input);
  return res.data.data;
}

export async function addMember(projectId: string, userId: string, projectRole: string) {
  const res = await apiClient.post(`/projects/${projectId}/members`, { userId, projectRole });
  return res.data.data;
}

export async function removeMember(projectId: string, userId: string) {
  await apiClient.delete(`/projects/${projectId}/members/${userId}`);
}
