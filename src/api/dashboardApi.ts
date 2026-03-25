import type { DashboardSummary } from "@/types/workspace.types";
import { apiJson } from "@/api/axiosClient";

export async function getDashboardSummary(): Promise<DashboardSummary> {
  return apiJson<DashboardSummary>("/api/dashboard", {
    method: "GET",
    auth: true,
  });
}
