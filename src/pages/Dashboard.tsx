import { Link, Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import Navbar from "@/components/layout/Navbar";
import DashboardMetrics from "@/components/dashboard/DashboardMetrics";
import { recentWorkspaces } from "@/data/mockData";
import { Button } from "@/components/ui/button";
import { Plus, ExternalLink, Users } from "lucide-react";

const Dashboard = () => {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <main className="flex-1 p-6 max-w-6xl mx-auto w-full">
        <div className="flex items-center justify-between mb-6 animate-slide-up">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Welcome, {user.name}</h1>
            <p className="text-sm text-muted-foreground">Your Java workspaces overview</p>
          </div>
          <Link to={`/workspace/room-${Date.now().toString(36)}`}>
            <Button size="sm" className="gap-1.5">
              <Plus className="h-3.5 w-3.5" /> New Workspace
            </Button>
          </Link>
        </div>

        <div className="animate-slide-up" style={{ animationDelay: "100ms" }}>
          <DashboardMetrics />
        </div>

        <div className="mt-8 animate-slide-up" style={{ animationDelay: "200ms" }}>
          <h2 className="text-lg font-semibold text-foreground mb-4">Recent Workspaces</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {recentWorkspaces.map((ws) => (
              <div key={ws.id} className="stat-card flex items-center justify-between">
                <div className="min-w-0">
                  <h3 className="text-sm font-semibold text-foreground truncate">{ws.name}</h3>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-[11px] text-muted-foreground font-mono">{ws.id}</span>
                    <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                      <Users className="h-3 w-3" /> {ws.collaborators}
                    </span>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1">
                    {new Date(ws.lastModified).toLocaleDateString()}
                  </p>
                </div>
                <Link to={`/workspace/${ws.id}`}>
                  <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
