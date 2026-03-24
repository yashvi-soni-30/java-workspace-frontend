export type IssueSeverity = "high" | "medium" | "low";

export interface WorkspaceIssue {
  id: string;
  title: string;
  line: number;
  severity: IssueSeverity;
  explanation: string;
  suggestion: string;
  impact: string;
}

export interface WorkspaceAnalysis {
  cyclomaticComplexity: number;
  maxComplexity: number;
  timeComplexity: string;
  performanceScore: number;
  riskLevel: "High" | "Medium" | "Low";
  linesOfCode: number;
  methodCount: number;
}

interface FullReviewApiResponse {
  optimization: {
    issues: Array<{
      id: string;
      title: string;
      line: number;
      severity: "HIGH" | "MEDIUM" | "LOW";
      explanation: string;
      suggestedFix: string;
      impact: string;
    }>;
  };
  analysis: {
    complexity: {
      cyclomaticComplexity: number;
      estimatedTimeComplexity: string;
      performanceScore: number;
      riskLevel: "High" | "Medium" | "Low";
      totalLines: number;
      methodCount: number;
    };
  };
}

export interface WorkspaceReviewResult {
  analysis: WorkspaceAnalysis;
  issues: WorkspaceIssue[];
}

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL ?? "http://127.0.0.1:8081";

export async function analyzeJavaWorkspace(code: string, roomId: string): Promise<WorkspaceReviewResult> {
  const response = await fetch(`${API_BASE_URL}/api/v1/analyzer/java/full`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      workspaceName: roomId,
      entryFile: "src/DataProcessor.java",
      files: {
        "src/DataProcessor.java": code,
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`Backend request failed with status ${response.status}`);
  }

  const payload = (await response.json()) as FullReviewApiResponse;

  return {
    analysis: {
      cyclomaticComplexity: payload.analysis.complexity.cyclomaticComplexity,
      maxComplexity: Math.max(payload.analysis.complexity.cyclomaticComplexity, 30),
      timeComplexity: payload.analysis.complexity.estimatedTimeComplexity,
      performanceScore: payload.analysis.complexity.performanceScore,
      riskLevel: payload.analysis.complexity.riskLevel,
      linesOfCode: payload.analysis.complexity.totalLines,
      methodCount: payload.analysis.complexity.methodCount,
    },
    issues: payload.optimization.issues.map((issue) => ({
      id: issue.id,
      title: issue.title,
      line: issue.line,
      severity: issue.severity.toLowerCase() as IssueSeverity,
      explanation: issue.explanation,
      suggestion: issue.suggestedFix,
      impact: issue.impact,
    })),
  };
}
