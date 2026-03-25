import { apiJson } from "@/api/axiosClient";

export type IssueSeverity = "high" | "medium" | "low";
export type IssueType =
	| "COMPILER_ERROR"
	| "WARNING"
	| "PERFORMANCE"
	| "MAINTAINABILITY"
	| "SECURITY"
	| "STYLE";

export interface WorkspaceIssue {
	id: string;
	type: IssueType;
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
			type: IssueType;
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

export async function analyzeJavaWorkspace(code: string, workspaceName: string): Promise<WorkspaceReviewResult> {
	const payload = await apiJson<FullReviewApiResponse>("/api/v1/analyzer/java/full", {
		method: "POST",
		auth: true,
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			workspaceName,
			entryFile: "src/DataProcessor.java",
			files: {
				"src/DataProcessor.java": code,
			},
		}),
	});

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
			type: issue.type,
			title: issue.title,
			line: issue.line,
			severity: issue.severity.toLowerCase() as IssueSeverity,
			explanation: issue.explanation,
			suggestion: issue.suggestedFix,
			impact: issue.impact,
		})),
	};
}
