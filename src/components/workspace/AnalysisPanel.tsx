import { Activity, Clock, Gauge, AlertTriangle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import type { WorkspaceAnalysis } from "@/api/analysisApi";

interface AnalysisPanelProps {
  result: WorkspaceAnalysis;
}

const AnalysisPanel = ({ result }: AnalysisPanelProps) => {
  const complexityPct = (result.cyclomaticComplexity / result.maxComplexity) * 100;

  const riskColor =
    result.riskLevel === "High"
      ? "text-destructive"
      : result.riskLevel === "Medium"
        ? "text-warning"
        : "text-primary";

  return (
    <div className="p-4 space-y-5 animate-fade-in">
      <div className="text-center">
        <div className="relative w-28 h-28 mx-auto mb-3">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="42" fill="none" stroke="hsl(var(--border))" strokeWidth="8" />
            <circle
              cx="50"
              cy="50"
              r="42"
              fill="none"
              stroke="hsl(var(--primary))"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={`${result.performanceScore * 2.64} 264`}
              className="transition-all duration-1000"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold text-foreground">{result.performanceScore}</span>
            <span className="text-[10px] text-muted-foreground">/ 100</span>
          </div>
        </div>
        <p className="text-sm font-medium text-foreground">Performance Score</p>
      </div>

      <div className="space-y-3">
        <div className="bg-surface rounded-lg p-3">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-2">
              <Activity className="h-3.5 w-3.5 text-primary" />
              <span className="text-xs font-medium text-foreground">Cyclomatic Complexity</span>
            </div>
            <span className="text-xs font-mono text-foreground">{result.cyclomaticComplexity}</span>
          </div>
          <Progress value={complexityPct} className="h-1.5" />
        </div>

        <div className="bg-surface rounded-lg p-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-3.5 w-3.5 text-accent" />
            <span className="text-xs font-medium text-foreground">Time Complexity</span>
          </div>
          <span className="text-xs font-mono bg-accent/10 text-accent px-2 py-0.5 rounded">
            {result.timeComplexity}
          </span>
        </div>

        <div className="bg-surface rounded-lg p-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className={`h-3.5 w-3.5 ${riskColor}`} />
            <span className="text-xs font-medium text-foreground">Risk Level</span>
          </div>
          <span className={`text-xs font-semibold ${riskColor}`}>{result.riskLevel}</span>
        </div>

        <div className="bg-surface rounded-lg p-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Gauge className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-xs font-medium text-foreground">Lines / Methods</span>
          </div>
          <span className="text-xs font-mono text-muted-foreground">
            {result.linesOfCode} / {result.methodCount}
          </span>
        </div>
      </div>
    </div>
  );
};

export default AnalysisPanel;
