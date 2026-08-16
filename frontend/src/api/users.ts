import { apiClient } from "./client";
import { ManagedUser } from "../types";

export interface ListUsersParams {
  search?: string;
  roleId?: string;
  status?: "ACTIVE" | "INACTIVE";
  page?: number;
  limit?: number;
}

export interface ListUsersResult {
  data: ManagedUser[];
  page: number;
  limit: number;
  total: number;
}

export async function listUsers(params: ListUsersParams = {}) {
  const query = new URLSearchParams();
  if (params.search) query.set("search", params.search);
  if (params.roleId) query.set("roleId", params.roleId);
  if (params.status) query.set("status", params.status);
  query.set("page", String(params.page ?? 1));
  query.set("limit", String(params.limit ?? 20));

  const res = await apiClient.get<ListUsersResult>(`/users?${query.toString()}`);
  return res.data;
}

export async function createUser(input: { name: string; email: string; password: string; roleId: string }) {
  const res = await apiClient.post<{ data: ManagedUser }>("/users", input);
  return res.data.data;
}

export async function updateUser(id: string, input: { name?: string; roleId?: string }) {
  const res = await apiClient.put<{ data: ManagedUser }>(`/users/${id}`, input);
  return res.data.data;
}

export async function updateUserStatus(id: string, status: "ACTIVE" | "INACTIVE") {
  const res = await apiClient.patch<{ data: ManagedUser }>(`/users/${id}/status`, { status });
  return res.data.data;
}

export async function resetPassword(id: string, password: string) {
  await apiClient.patch(`/users/${id}/reset-password`, { password });
}
