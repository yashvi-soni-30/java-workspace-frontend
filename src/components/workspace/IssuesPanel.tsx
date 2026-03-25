import { AlertCircle, AlertTriangle, Info } from "lucide-react";
import type { WorkspaceIssue } from "@/api/analysisApi";

const severityConfig = {
  high: { icon: AlertCircle, classes: "severity-high", label: "High" },
  medium: { icon: AlertTriangle, classes: "severity-medium", label: "Medium" },
  low: { icon: Info, classes: "severity-low", label: "Low" },
};

const issueTypeLabel: Record<WorkspaceIssue["type"], string> = {
  COMPILER_ERROR: "Compiler",
  WARNING: "Warning",
  PERFORMANCE: "Performance",
  MAINTAINABILITY: "Maintainability",
  SECURITY: "Security",
  STYLE: "Style",
};

interface IssuesPanelProps {
  issues: WorkspaceIssue[];
}

const IssuesPanel = ({ issues }: IssuesPanelProps) => {
  return (
    <div className="p-4 space-y-3 animate-fade-in">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-muted-foreground">{issues.length} issues found</span>
      </div>
      {issues.map((issue) => {
        const config = severityConfig[issue.severity];
        const Icon = config.icon;
        return (
          <div key={issue.id} className="bg-surface rounded-lg p-3 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <Icon className="h-3.5 w-3.5 shrink-0" />
                <span className="text-xs font-semibold text-foreground">{issue.title}</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-[10px] font-medium px-1.5 py-0.5 rounded border border-border text-muted-foreground bg-background/40">
                  {issueTypeLabel[issue.type]}
                </span>
                <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border ${config.classes}`}>
                  {config.label}
                </span>
              </div>
            </div>
            <p className="text-[11px] text-muted-foreground font-mono">Line {issue.line}</p>
            <p className="text-[11px] text-muted-foreground">{issue.explanation}</p>
            <div className="bg-primary/5 border border-primary/10 rounded p-2">
              <p className="text-[11px] text-primary font-medium">Fix: {issue.suggestion}</p>
            </div>
            <p className="text-[10px] text-muted-foreground italic">Impact: {issue.impact}</p>
          </div>
        );
      })}
    </div>
  );
};

export default IssuesPanel;
