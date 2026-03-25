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
import { analyzeJavaWorkspace } from "@/lib/javaAnalysisApi";
import { addRoomMember, getRoomByCode, getRoomFiles, getRoomMembers, joinRoom } from "@/api/workspaceApi";
import type { RoomFile, RoomMember, RoomSummary } from "@/types/workspace.types";
import { useAuth } from "@/hooks/useAuth";

const Workspace = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { roomId } = useParams();
  const [code, setCode] = useState(defaultJavaCode);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(analysisResults);
  const [issues, setIssues] = useState(issuesList);
  const [backendAvailable, setBackendAvailable] = useState(true);
  const [room, setRoom] = useState<RoomSummary | null>(null);
  const [roomMembers, setRoomMembers] = useState<RoomMember[]>([]);
  const [roomFiles, setRoomFiles] = useState<RoomFile[]>([]);
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
      navigate("/dashboard");
      return;
    }
    void loadRoomContext(roomId);
  }, [roomId]);

  const handleAnalyze = async () => {
    setAnalyzing(true);
    toast.info("Running backend analysis...");

    try {
      const result = await analyzeJavaWorkspace(code, roomId || "demo");
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
        const result = await analyzeJavaWorkspace(code, roomId || "workspace");
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
    const blob = new Blob([code], { type: "text/x-java-source" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "DataProcessor.java";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("File downloaded!");
  };

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setCode(ev.target?.result as string);
        toast.success(`Loaded ${file.name}`);
      };
      reader.readAsText(file);
    }
  };

  const handleSaveVersion = () => {
    toast.success("Version saved!");
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

  const canManageMembers = Boolean(room && user.email === room.ownerEmail);

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
            <span className="text-xs font-mono text-foreground">{room?.roomCode}</span>
          </div>
          <div className="flex items-center gap-1.5 bg-surface rounded-md px-2 py-1">
            <Users className="h-3 w-3 text-primary" />
            <div className="flex -space-x-1.5">
              {roomMembers.slice(0, 5).map((member, idx) => (
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
            <span className="text-[10px] text-muted-foreground">{roomMembers.length} members</span>
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
          roomCode={room?.roomCode || roomId || "workspace"}
          roomName={room?.roomName || "Workspace"}
          roomMembers={roomMembers}
          roomFiles={roomFiles}
          canManageMembers={canManageMembers}
          onSaveVersion={handleSaveVersion}
          onJoinRoom={handleJoinRoom}
          onAddMember={handleAddMember}
        />
        <EditorPanel code={code} onChange={setCode} issues={issues} />

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
