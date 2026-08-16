import { apiClient } from "./client";
import { Permission, Role } from "../types";

export async function listRoles() {
  const res = await apiClient.get<{ data: Role[] }>("/roles");
  return res.data.data;
}

export async function listPermissions() {
  const res = await apiClient.get<{ data: Permission[] }>("/permissions");
  return res.data.data;
}

export async function createRole(input: { name: string; description?: string }) {
  const res = await apiClient.post<{ data: Role }>("/roles", input);
  return res.data.data;
}

export async function updateRole(id: string, input: { name?: string; description?: string }) {
  const res = await apiClient.put<{ data: Role }>(`/roles/${id}`, input);
  return res.data.data;
}

export async function deleteRole(id: string) {
  await apiClient.delete(`/roles/${id}`);
}

export async function assignPermission(roleId: string, permissionId: string) {
  await apiClient.post(`/roles/${roleId}/permissions`, { permissionId });
}

export async function removePermission(roleId: string, permissionId: string) {
  await apiClient.delete(`/roles/${roleId}/permissions/${permissionId}`);
}
