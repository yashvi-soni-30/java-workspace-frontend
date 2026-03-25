import Editor, { type Monaco, type OnMount } from "@monaco-editor/react";
import { useTheme } from "@/hooks/useTheme";
import type { WorkspaceIssue } from "@/api/analysisApi";
import { useEffect, useRef } from "react";

interface EditorPanelProps {
  code: string;
  fileName?: string;
  onChange: (value: string) => void;
  issues?: WorkspaceIssue[];
}

const markerSeverity = {
  high: 8,
  medium: 4,
  low: 2,
} as const;

const EditorPanel = ({ code, fileName = "DataProcessor.java", onChange, issues = [] }: EditorPanelProps) => {
  const { theme } = useTheme();
  const editorRef = useRef<Parameters<OnMount>[0] | null>(null);
  const monacoRef = useRef<Monaco | null>(null);

  useEffect(() => {
    if (!editorRef.current || !monacoRef.current) {
      return;
    }

    const model = editorRef.current.getModel();
    if (!model) {
      return;
    }

    const markers = issues.map((issue) => ({
      severity: markerSeverity[issue.severity],
      startLineNumber: Math.max(issue.line, 1),
      startColumn: 1,
      endLineNumber: Math.max(issue.line, 1),
      endColumn: model.getLineMaxColumn(Math.max(issue.line, 1)),
      message: `${issue.title}: ${issue.explanation}\nFix: ${issue.suggestion}`,
      source: "code-optimization",
    }));

    monacoRef.current.editor.setModelMarkers(model, "java-workspace-issues", markers);
  }, [issues]);

  const handleEditorDidMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;
  };

  return (
    <div className="flex-1 workspace-panel overflow-hidden flex flex-col">
      <div className="h-8 border-b border-border flex items-center px-3 gap-2 shrink-0">
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-destructive/60" />
          <div className="w-2.5 h-2.5 rounded-full bg-warning/60" />
          <div className="w-2.5 h-2.5 rounded-full bg-primary/60" />
        </div>
        <span className="text-xs text-muted-foreground font-mono ml-2">{fileName}</span>
      </div>
      <div className="flex-1">
        <Editor
          height="100%"
          language="java"
          theme={theme === "dark" ? "vs-dark" : "light"}
          value={code}
          onChange={(value) => onChange(value || "")}
          onMount={handleEditorDidMount}
          options={{
            fontSize: 13,
            fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
            minimap: { enabled: true, scale: 1 },
            scrollBeyondLastLine: false,
            smoothScrolling: true,
            cursorBlinking: "smooth",
            cursorSmoothCaretAnimation: "on",
            padding: { top: 12 },
            lineHeight: 20,
            renderLineHighlight: "all",
            bracketPairColorization: { enabled: true },
            glyphMargin: true,
          }}
        />
      </div>
    </div>
  );
};

export default EditorPanel;
