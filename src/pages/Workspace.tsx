import { useEffect, useRef, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";
import EditorPanel from "@/components/workspace/EditorPanel";
import AnalysisPanel from "@/components/workspace/AnalysisPanel";
import IssuesPanel from "@/components/workspace/IssuesPanel";
import LearningPanel from "@/components/workspace/LearningPanel";
import { analysisResults, defaultJavaCode, issuesList } from "@/data/mockData";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Download, Upload, Zap, Hash, Users } from "lucide-react";
import { toast } from "sonner";
import { analyzeJavaWorkspace } from "@/api/analysisApi";
import type { WorkspaceAnalysis, WorkspaceIssue } from "@/api/analysisApi";
import {
  addRoomMember,
  createRoomFile,
  downloadRoomFile,
  getFileVersions,
  getRoomByCode,
  getRoomFile,
  getRoomFiles,
  getRoomMembers,
  joinRoom,
  revertFileVersion,
  saveVersionSnapshot,
  uploadRoomJavaFile,
} from "@/api/workspaceApi";
import type { RoomFile, RoomMember, RoomSummary, VersionEntry } from "@/types/workspace.types";
import { useAuth } from "@/hooks/useAuth";

const Workspace = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { roomId } = useParams();
  const isStandalone = !roomId;
  const [code, setCode] = useState(defaultJavaCode);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<WorkspaceAnalysis>(analysisResults as WorkspaceAnalysis);
  const [issues, setIssues] = useState<WorkspaceIssue[]>(issuesList as WorkspaceIssue[]);
  const [backendAvailable, setBackendAvailable] = useState(true);
  const [room, setRoom] = useState<RoomSummary | null>(null);
  const [roomMembers, setRoomMembers] = useState<RoomMember[]>([]);
  const [roomFiles, setRoomFiles] = useState<RoomFile[]>([]);
  const [versions, setVersions] = useState<VersionEntry[]>([]);
  const [loadingVersions, setLoadingVersions] = useState(false);
  const [activeFileId, setActiveFileId] = useState<number | null>(null);
  const [activeFileName, setActiveFileName] = useState("DataProcessor.java");
  const [loadingRoom, setLoadingRoom] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const loadRoomContext = async (codeValue: string) => {
    setLoadingRoom(true);
    try {
      const roomDetails = await getRoomByCode(codeValue);
      const [members, files] = await Promise.all([
        getRoomMembers(roomDetails.id),
        getRoomFiles(roomDetails.id),
      ]);
      setRoom(roomDetails);
      setRoomMembers(members);
      setRoomFiles(files);

      if (files.length > 0) {
        const firstFile = await getRoomFile(roomDetails.id, files[0].id);
        const history = await getFileVersions(roomDetails.id, files[0].id);
        setActiveFileId(firstFile.id);
        setActiveFileName(firstFile.filePath);
        setCode(firstFile.content || "");
        setVersions(history);
      } else {
        setActiveFileId(null);
        setActiveFileName("DataProcessor.java");
        setCode(defaultJavaCode);
        setVersions([]);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to load room";
      toast.error(message);
      navigate("/dashboard");
    } finally {
      setLoadingRoom(false);
    }
  };

  useEffect(() => {
    if (!roomId) {
      setLoadingRoom(false);
      setRoom(null);
      setRoomMembers([]);
      setRoomFiles([]);
      setVersions([]);
      setActiveFileId(null);
      setActiveFileName("DataProcessor.java");
      return;
    }
    void loadRoomContext(roomId);
  }, [roomId]);

  const handleAnalyze = async () => {
    setAnalyzing(true);
    toast.info("Running backend analysis...");

    try {
      const result = await analyzeJavaWorkspace(code, roomId || `solo-${user.email}`);
      setAnalysis(result.analysis);
      setIssues(result.issues);
      setBackendAvailable(true);
      toast.success("Analysis complete! Live backend results loaded.");
    } catch (error) {
      setBackendAvailable(false);
      const message = error instanceof Error ? error.message : "Unable to reach backend service.";
      toast.error(message);
    } finally {
      setAnalyzing(false);
    }
  };

  useEffect(() => {
    const timeoutId = window.setTimeout(async () => {
      try {
        const result = await analyzeJavaWorkspace(code, roomId || `solo-${user.email}`);
        setAnalysis(result.analysis);
        setIssues(result.issues);
        setBackendAvailable(true);
      } catch {
        setBackendAvailable(false);
      }
    }, 700);

    return () => window.clearTimeout(timeoutId);
  }, [code, roomId]);

  const handleDownload = () => {
    const triggerDownload = (blob: Blob, fileName: string) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      a.click();
      URL.revokeObjectURL(url);
    };

    if (!isStandalone && room && activeFileId) {
      void (async () => {
        try {
          const { blob, fileName } = await downloadRoomFile(room.id, activeFileId);
          triggerDownload(blob, fileName);
          toast.success("File downloaded!");
        } catch (error) {
          const message = error instanceof Error ? error.message : "Download failed";
          toast.error(message);
        }
      })();
      return;
    }

    triggerDownload(new Blob([code], { type: "text/x-java-source" }), activeFileName || "DataProcessor.java");
    toast.success("File downloaded!");
  };

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      return;
    }

    if (!isStandalone && room) {
      void (async () => {
        try {
          const uploaded = await uploadRoomJavaFile(room.id, file);
          const files = await getRoomFiles(room.id);
          setRoomFiles(files);
          setActiveFileId(uploaded.id);
          setActiveFileName(uploaded.filePath);
          setCode(uploaded.content || "");
          const history = await getFileVersions(room.id, uploaded.id);
          setVersions(history);
          toast.success(`Uploaded ${uploaded.filePath}`);
        } catch (error) {
          const message = error instanceof Error ? error.message : "Upload failed";
          toast.error(message);
        } finally {
          if (fileInputRef.current) {
            fileInputRef.current.value = "";
          }
        }
      })();
      return;
    }

    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setCode(ev.target?.result as string);
        setActiveFileName(file.name || "DataProcessor.java");
        toast.success(`Loaded ${file.name}`);
      };
      reader.readAsText(file);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSaveVersion = async () => {
    if (!isStandalone && room && activeFileId) {
      try {
        await saveVersionSnapshot(room.id, activeFileId, code);
        const files = await getRoomFiles(room.id);
        const history = await getFileVersions(room.id, activeFileId);
        setRoomFiles(files);
        setVersions(history);
        toast.success("Version saved");
        return;
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unable to save version";
        toast.error(message);
        return;
      }
    }

    toast.success("Version saved!");
  };

  const handleSelectFile = async (fileId: number) => {
    if (!room) {
      return;
    }

    try {
      const file = await getRoomFile(room.id, fileId);
      setLoadingVersions(true);
      const history = await getFileVersions(room.id, fileId);
      setActiveFileId(file.id);
      setActiveFileName(file.filePath);
      setCode(file.content || "");
      setVersions(history);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to open file";
      toast.error(message);
    } finally {
      setLoadingVersions(false);
    }
  };

  const handleCreateFile = async (filePath: string) => {
    if (isStandalone || !room) {
      toast.info("Create file is available inside a room");
      return;
    }

    try {
      const created = await createRoomFile(room.id, filePath, "");
      const files = await getRoomFiles(room.id);
      setRoomFiles(files);
      setActiveFileId(created.id);
      setActiveFileName(created.filePath);
      setCode(created.content || "");
      setVersions([]);
      toast.success(`Created ${created.filePath}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to create file";
      toast.error(message);
    }
  };

  const handleJoinRoom = async (roomCode: string) => {
    try {
      const joined = await joinRoom(roomCode);
      toast.success(`Joined room ${joined.roomCode}`);
      navigate(`/workspace/${joined.roomCode}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to join room";
      toast.error(message);
    }
  };

  const handleAddMember = async (memberEmail: string) => {
    if (!room) {
      return;
    }

    try {
      await addRoomMember(room.id, memberEmail);
      const members = await getRoomMembers(room.id);
      setRoomMembers(members);
      toast.success("Member added");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to add member";
      toast.error(message);
    }
  };

  const handleRevertVersion = async (versionId: number) => {
    if (!room || !activeFileId) {
      return;
    }

    try {
      const reverted = await revertFileVersion(room.id, activeFileId, versionId);
      setCode(reverted.content || "");
      const files = await getRoomFiles(room.id);
      const history = await getFileVersions(room.id, activeFileId);
      setRoomFiles(files);
      setVersions(history);
      toast.success(`Reverted to v${reverted.revertedFromVersion}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to revert version";
      toast.error(message);
    }
  };

  const canManageMembers = Boolean(room && user.email === room.ownerEmail);
  const visibleMembers = isStandalone
    ? [{ id: 0, name: user.name, email: user.email, joinedAt: new Date().toISOString(), owner: true }]
    : roomMembers;

  if (loadingRoom) {
    return (
      <div className="h-screen grid place-items-center bg-background text-muted-foreground text-sm">
        Loading room...
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      <Navbar>
        <div className="flex items-center gap-2 ml-2">
          <div className="flex items-center gap-1.5 bg-surface rounded-md px-2 py-1">
            <Hash className="h-3 w-3 text-muted-foreground" />
            <span className="text-xs font-mono text-foreground">{isStandalone ? "STANDALONE" : room?.roomCode}</span>
          </div>
          <div className="flex items-center gap-1.5 bg-surface rounded-md px-2 py-1">
            <Users className="h-3 w-3 text-primary" />
            <div className="flex -space-x-1.5">
              {visibleMembers.slice(0, 5).map((member, idx) => (
                <div
                  key={member.id}
                  className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold border-2 border-card"
                  style={{ backgroundColor: ["#ef4444", "#3b82f6", "#22c55e", "#f59e0b", "#a855f7"][idx % 5], color: "#fff" }}
                  title={member.name}
                >
                  {member.name.charAt(0).toUpperCase()}
                </div>
              ))}
            </div>
            <span className="text-[10px] text-muted-foreground">{visibleMembers.length} members</span>
          </div>
        </div>
        <div className="flex-1" />
        <div className="flex items-center gap-1.5">
          {!backendAvailable && (
            <span className="text-[10px] text-warning px-2">Live error highlight offline</span>
          )}
          <input ref={fileInputRef} type="file" accept=".java" onChange={handleUpload} className="hidden" />
          <Button variant="ghost" size="sm" className="h-7 text-xs gap-1" onClick={() => fileInputRef.current?.click()}>
            <Upload className="h-3 w-3" /> Upload
          </Button>
          <Button variant="ghost" size="sm" className="h-7 text-xs gap-1" onClick={handleDownload}>
            <Download className="h-3 w-3" /> Download
          </Button>
          <Button size="sm" className="h-7 text-xs gap-1" onClick={handleAnalyze} disabled={analyzing}>
            <Zap className={`h-3 w-3 ${analyzing ? "animate-pulse-glow" : ""}`} />
            {analyzing ? "Analyzing..." : "Analyze"}
          </Button>
        </div>
      </Navbar>

      <div className="flex-1 flex overflow-hidden">
        <Sidebar
          roomCode={isStandalone ? "STANDALONE" : room?.roomCode || roomId || "workspace"}
          roomName={isStandalone ? "Personal Workspace" : room?.roomName || "Workspace"}
          roomMembers={roomMembers}
          roomFiles={roomFiles}
          versions={versions}
          loadingVersions={loadingVersions}
          activeFileId={activeFileId}
          canManageMembers={canManageMembers}
          onSaveVersion={handleSaveVersion}
          onJoinRoom={handleJoinRoom}
          onAddMember={handleAddMember}
          onSelectFile={handleSelectFile}
          onCreateFile={handleCreateFile}
          onRevertVersion={handleRevertVersion}
        />
        <EditorPanel code={code} fileName={activeFileName} onChange={setCode} issues={issues} />

        <div className="w-80 workspace-panel flex flex-col overflow-hidden shrink-0">
          <Tabs defaultValue="analysis" className="flex flex-col h-full">
            <TabsList className="w-full rounded-none border-b border-border bg-transparent h-9 px-2">
              <TabsTrigger value="analysis" className="text-xs flex-1 data-[state=active]:bg-surface rounded-md h-6">Analysis</TabsTrigger>
              <TabsTrigger value="issues" className="text-xs flex-1 data-[state=active]:bg-surface rounded-md h-6">Issues</TabsTrigger>
              <TabsTrigger value="learning" className="text-xs flex-1 data-[state=active]:bg-surface rounded-md h-6">Learning</TabsTrigger>
            </TabsList>
            <ScrollArea className="flex-1">
              <TabsContent value="analysis" className="mt-0"><AnalysisPanel result={analysis} /></TabsContent>
              <TabsContent value="issues" className="mt-0"><IssuesPanel issues={issues} /></TabsContent>
              <TabsContent value="learning" className="mt-0"><LearningPanel /></TabsContent>
            </ScrollArea>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Workspace;
