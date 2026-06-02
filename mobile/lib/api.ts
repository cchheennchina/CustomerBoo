import { getApiBaseUrl, getToken } from "./auth";

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const baseUrl = await getApiBaseUrl();
  const token = await getToken();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new ApiError(data.error ?? "请求失败", res.status);
  }
  return data as T;
}

export async function login(username: string, password: string) {
  const baseUrl = await getApiBaseUrl();
  const res = await fetch(`${baseUrl}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new ApiError(data.error ?? "登录失败", res.status);
  return data as {
    success: boolean;
    token: string;
    user: { displayName: string; username: string; role: string };
  };
}

export async function fetchDashboard() {
  return apiFetch<{
    avgScore: number;
    distribution: { healthy: number; subhealthy: number; dangerous: number };
    brief: { summary: string; priority: Array<Record<string, unknown>> };
  }>("/api/mobile/dashboard");
}

export async function fetchOpportunities(status?: string) {
  const q = status ? `?status=${status}` : "";
  return apiFetch<{ opportunities: Array<Record<string, unknown>> }>(
    `/api/mobile/opportunities${q}`
  );
}

export async function fetchOpportunity(id: string) {
  return apiFetch<{ opportunity: Record<string, unknown>; deductions: unknown[] }>(
    `/api/mobile/opportunities/${id}`
  );
}

export async function fetchFollowUps() {
  return apiFetch<{
    tasks: Array<Record<string, unknown>>;
    reminders: Array<Record<string, unknown>>;
    risks: Array<Record<string, unknown>>;
  }>("/api/mobile/follow-ups");
}

export async function createRiskPlan(riskId: string) {
  return apiFetch<{ message: string }>("/api/risks/plan", {
    method: "POST",
    body: JSON.stringify({ riskId }),
  });
}
