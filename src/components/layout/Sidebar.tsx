import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { versionHistory as mockVersions } from "@/data/mockData";
import { GitBranch, Save, RotateCcw, Hash } from "lucide-react";
import type { RoomFile, RoomMember } from "@/types/workspace.types";

interface SidebarProps {
  roomCode: string;
  roomName: string;
  roomMembers: RoomMember[];
  roomFiles: RoomFile[];
  canManageMembers: boolean;
  onSaveVersion: () => void;
  onJoinRoom: (roomCode: string) => Promise<void>;
  onAddMember: (email: string) => Promise<void>;
}

const Sidebar = ({
  roomCode,
  roomName,
  roomMembers,
  roomFiles,
  canManageMembers,
  onSaveVersion,
  onJoinRoom,
  onAddMember,
}: SidebarProps) => {
  const [joinRoom, setJoinRoom] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");

  const handleJoin = async () => {
    if (!joinRoom.trim()) {
      return;
    }
    await onJoinRoom(joinRoom.trim());
    setJoinRoom("");
  };

  const handleInvite = async () => {
    if (!inviteEmail.trim()) {
      return;
    }
    await onAddMember(inviteEmail.trim());
    setInviteEmail("");
  };

  return (
    <aside className="w-64 workspace-panel flex flex-col overflow-hidden shrink-0">
      {/* Room Info */}
      <div className="p-3 border-b border-border">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Room Info</h3>
        <div className="flex items-center gap-2 bg-surface rounded-md px-2 py-1.5 mb-2">
          <Hash className="h-3 w-3 text-muted-foreground" />
          <span className="text-xs font-mono text-foreground truncate">{roomCode}</span>
        </div>
        <p className="text-xs text-foreground font-medium mb-2 truncate">{roomName}</p>
        <div className="flex gap-1.5">
          <Input
            placeholder="Room code..."
            value={joinRoom}
            onChange={(e) => setJoinRoom(e.target.value)}
            className="h-7 text-xs bg-surface border-border"
          />
          <Button size="sm" className="h-7 text-xs px-2 shrink-0" onClick={handleJoin}>Join</Button>
        </div>
      </div>

      <div className="p-3 border-b border-border">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Members</h3>
        <div className="space-y-1.5 mb-2 max-h-28 overflow-y-auto">
          {roomMembers.map((member) => (
            <div key={member.id} className="text-[11px] text-foreground flex items-center justify-between gap-2">
              <span className="truncate">{member.name}</span>
              <span className="text-[10px] text-muted-foreground">{member.owner ? "owner" : "member"}</span>
            </div>
          ))}
        </div>
        {canManageMembers && (
          <div className="flex gap-1.5">
            <Input
              placeholder="Add by email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              className="h-7 text-xs bg-surface border-border"
            />
            <Button size="sm" className="h-7 text-xs px-2 shrink-0" onClick={handleInvite}>Add</Button>
          </div>
        )}
      </div>

      <div className="p-3 border-b border-border">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Active Files</h3>
        <div className="space-y-1.5 max-h-24 overflow-y-auto">
          {roomFiles.length === 0 && <p className="text-[11px] text-muted-foreground">No files yet</p>}
          {roomFiles.map((file) => (
            <div key={file.id} className="text-[11px] text-foreground truncate">
              {file.filePath}
            </div>
          ))}
        </div>
      </div>

      {/* Version Control */}
      <div className="p-3 border-b border-border">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Version Control</h3>
        <Button size="sm" className="w-full h-8 text-xs gap-1.5" onClick={onSaveVersion}>
          <Save className="h-3 w-3" /> Save Version
        </Button>
      </div>

      {/* Version History */}
      <div className="flex-1 overflow-y-auto p-3">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">History</h3>
        <div className="space-y-2">
          {mockVersions.map((v) => (
            <div key={v.id} className="bg-surface rounded-md p-2 group">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1">
                  <GitBranch className="h-3 w-3 text-primary" />
                  <span className="text-xs font-semibold text-foreground">v{v.version}</span>
                </div>
                <Button variant="ghost" size="sm" className="h-5 px-1.5 text-[10px] opacity-0 group-hover:opacity-100 transition-opacity">
                  <RotateCcw className="h-2.5 w-2.5 mr-0.5" /> Revert
                </Button>
              </div>
              <p className="text-[11px] text-muted-foreground truncate">{v.message}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{v.author} • {new Date(v.timestamp).toLocaleTimeString()}</p>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
