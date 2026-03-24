import { dashboardStats, analysisResults, issuesList, versionHistory } from "@/data/mockData";
import { Layers, BarChart3, TrendingUp, Users, AlertCircle, GitBranch } from "lucide-react";

const metrics = [
  { label: "Workspaces", value: dashboardStats.totalWorkspaces, icon: Layers, color: "text-primary" },
  { label: "Analyses", value: dashboardStats.totalAnalyses, icon: BarChart3, color: "text-accent" },
  { label: "Improvements", value: dashboardStats.performanceImprovements, icon: TrendingUp, color: "text-primary" },
  { label: "Collaborators", value: dashboardStats.activeCollaborations, icon: Users, color: "text-warning" },
];

const DashboardMetrics = () => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((m) => (
        <div key={m.label} className="stat-card">
          <div className="flex items-center justify-between mb-2">
            <m.icon className={`h-5 w-5 ${m.color}`} />
          </div>
          <p className="text-2xl font-bold text-foreground">{m.value}</p>
          <p className="text-xs text-muted-foreground mt-1">{m.label}</p>
        </div>
      ))}
    </div>
  );
};

export default DashboardMetrics;
