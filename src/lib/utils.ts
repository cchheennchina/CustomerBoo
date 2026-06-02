import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number) {
  if (amount >= 10000) return `${(amount / 10000).toFixed(0)}万`;
  return `${amount.toLocaleString("zh-CN")}元`;
}

export function formatDate(date: Date | string | null | undefined) {
  if (!date) return "—";
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

export function parseJson<T>(value: string, fallback: T): T {
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

export function healthStatusLabel(status: string) {
  switch (status) {
    case "HEALTHY":
      return "健康";
    case "SUBHEALTHY":
      return "亚健康";
    case "DANGEROUS":
      return "危险";
    default:
      return status;
  }
}

export function healthStatusColor(status: string) {
  switch (status) {
    case "HEALTHY":
      return "text-emerald-400";
    case "SUBHEALTHY":
      return "text-amber-400";
    case "DANGEROUS":
      return "text-rose-400";
    default:
      return "text-white/70";
  }
}

export function riskLevelLabel(level: string) {
  switch (level) {
    case "HIGH":
      return "高";
    case "MEDIUM":
      return "中";
    case "LOW":
      return "低";
    default:
      return level;
  }
}
