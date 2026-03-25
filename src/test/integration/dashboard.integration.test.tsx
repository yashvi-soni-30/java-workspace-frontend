import { describe, expect, it, beforeEach, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { render, screen, waitFor } from "@testing-library/react";
import Dashboard from "@/pages/Dashboard";
import * as workspaceApi from "@/api/workspaceApi";
import * as dashboardApi from "@/api/dashboardApi";

vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => ({
    user: { name: "Integration Owner", email: "owner@example.com" },
    logout: vi.fn(),
  }),
}));

vi.mock("@/hooks/useTheme", () => ({
  useTheme: () => ({
    theme: "light",
    toggleTheme: vi.fn(),
  }),
}));

vi.mock("@/components/dashboard/DashboardMetrics", () => ({
  default: ({ totals }: { totals: { rooms: number } }) => (
    <div data-testid="dashboard-metrics">Rooms: {totals.rooms}</div>
  ),
}));

describe("Dashboard integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("loads rooms and dashboard summary", async () => {
    vi.spyOn(workspaceApi, "getMyRooms").mockResolvedValue([
      {
        id: 1,
        roomCode: "ABCD12",
        roomName: "Core Room",
        ownerEmail: "owner@example.com",
        memberCount: 2,
        fileCount: 1,
        createdAt: new Date().toISOString(),
      },
    ]);

    vi.spyOn(dashboardApi, "getDashboardSummary").mockResolvedValue({
      totals: { rooms: 1, files: 1, versions: 2, analyses: 1 },
      performance: { averageScore: 90, bestScore: 95, latestRiskLevel: "LOW" },
      rooms: [
        {
          id: 1,
          roomCode: "ABCD12",
          roomName: "Core Room",
          ownerEmail: "owner@example.com",
          memberCount: 2,
          fileCount: 1,
          createdAt: new Date().toISOString(),
        },
      ],
      recentActivity: [
        {
          type: "VERSION_SAVED",
          title: "Version saved",
          description: "Demo.java saved as v1",
          createdAt: new Date().toISOString(),
        },
      ],
    });

    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );

    expect(await screen.findByText("Core Room")).toBeInTheDocument();
    expect(screen.getByText("Version saved")).toBeInTheDocument();
    expect(screen.getByTestId("dashboard-metrics")).toHaveTextContent("Rooms: 1");

    await waitFor(() => {
      expect(workspaceApi.getMyRooms).toHaveBeenCalledTimes(1);
      expect(dashboardApi.getDashboardSummary).toHaveBeenCalledTimes(1);
    });
  });
});
