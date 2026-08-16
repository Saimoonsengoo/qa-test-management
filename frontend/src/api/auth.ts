import { apiClient } from "./client";
import { AuthUser } from "../types";

export async function login(email: string, password: string) {
  const res = await apiClient.post<{ data: { token: string; user: AuthUser } }>("/auth/login", { email, password });
  return res.data.data;
}

export async function register(name: string, email: string, password: string) {
  const res = await apiClient.post<{ data: { token: string; user: AuthUser } }>("/auth/register", {
    name,
    email,
    password,
  });
  return res.data.data;
}

export async function me() {
  const res = await apiClient.get<{ data: AuthUser }>("/auth/me");
  return res.data.data;
}
