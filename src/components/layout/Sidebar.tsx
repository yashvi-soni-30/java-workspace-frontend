import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Save, Hash } from "lucide-react";
import type { RoomFile, RoomMember, VersionEntry } from "@/types/workspace.types";
import VersionHistory from "@/components/workspace/VersionHistory";

interface SidebarProps {
  roomCode: string;
  roomName: string;
  roomMembers: RoomMember[];
  roomFiles: RoomFile[];
  versions: VersionEntry[];
  loadingVersions?: boolean;
  activeFileId?: number | null;
  canManageMembers: boolean;
  canSaveVersions: boolean;
  canRevertVersions: boolean;
  onSaveVersion: () => Promise<void>;
  onJoinRoom: (roomCode: string) => Promise<void>;
  onAddMember: (email: string) => Promise<void>;
  onUpdateMemberPermissions: (
    memberUserId: number,
    permissions: {
      canEditFiles?: boolean;
      canSaveVersions?: boolean;
      canRevertVersions?: boolean;
    }
  ) => Promise<void>;
  onSelectFile: (fileId: number) => Promise<void>;
  onCreateFile: (filePath: string) => Promise<void>;
  onRevertVersion: (versionId: number) => Promise<void>;
}

const Sidebar = ({
  roomCode,
  roomName,
  roomMembers,
  roomFiles,
  versions,
  loadingVersions = false,
  activeFileId,
  canManageMembers,
  canSaveVersions,
  canRevertVersions,
  onSaveVersion,
  onJoinRoom,
  onAddMember,
  onUpdateMemberPermissions,
  onSelectFile,
  onCreateFile,
  onRevertVersion,
}: SidebarProps) => {
  const [joinRoom, setJoinRoom] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [newFileName, setNewFileName] = useState("");

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

  const handleCreateFile = async () => {
    if (!newFileName.trim()) {
      return;
    }
    await onCreateFile(newFileName.trim());
    setNewFileName("");
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
            <div key={member.id} className="text-[11px] text-foreground space-y-1.5">
              <div className="flex items-center justify-between gap-2">
                <span className="truncate">{member.name}</span>
                <span className="text-[10px] text-muted-foreground">{member.owner ? "owner" : "member"}</span>
              </div>
              {canManageMembers && !member.owner && (
                <div className="flex flex-wrap gap-1">
                  <Button
                    type="button"
                    variant={member.canEditFiles ? "default" : "outline"}
                    size="sm"
                    className="h-6 px-2 text-[10px]"
                    onClick={() =>
                      void onUpdateMemberPermissions(member.id, { canEditFiles: !member.canEditFiles })
                    }
                  >
                    Edit
                  </Button>
                  <Button
                    type="button"
                    variant={member.canSaveVersions ? "default" : "outline"}
                    size="sm"
                    className="h-6 px-2 text-[10px]"
                    onClick={() =>
                      void onUpdateMemberPermissions(member.id, { canSaveVersions: !member.canSaveVersions })
                    }
                  >
                    Save
                  </Button>
                  <Button
                    type="button"
                    variant={member.canRevertVersions ? "default" : "outline"}
                    size="sm"
                    className="h-6 px-2 text-[10px]"
                    onClick={() =>
                      void onUpdateMemberPermissions(member.id, { canRevertVersions: !member.canRevertVersions })
                    }
                  >
                    Revert
                  </Button>
                </div>
              )}
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
        <div className="flex gap-1.5 mb-2">
          <Input
            placeholder="New file, e.g. Utils.java"
            value={newFileName}
            onChange={(e) => setNewFileName(e.target.value)}
            className="h-7 text-xs bg-surface border-border"
          />
          <Button size="sm" className="h-7 text-xs px-2 shrink-0" onClick={handleCreateFile}>New</Button>
        </div>
        <div className="space-y-1.5 max-h-24 overflow-y-auto">
          {roomFiles.length === 0 && <p className="text-[11px] text-muted-foreground">No files yet</p>}
          {roomFiles.map((file) => (
            <button
              key={file.id}
              className={`w-full text-left text-[11px] truncate rounded px-1 py-0.5 transition-colors ${
                activeFileId === file.id ? "bg-primary/15 text-primary" : "text-foreground hover:bg-surface"
              }`}
              onClick={() => void onSelectFile(file.id)}
              type="button"
            >
              {file.filePath}
            </button>
          ))}
        </div>
      </div>

      {/* Version Control */}
      <div className="p-3 border-b border-border">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Version Control</h3>
        <Button size="sm" className="w-full h-8 text-xs gap-1.5" onClick={onSaveVersion} disabled={!canSaveVersions}>
          <Save className="h-3 w-3" /> Save Version
        </Button>
      </div>

      {/* Version History */}
      <div className="flex-1 overflow-y-auto p-3">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">History</h3>
        <VersionHistory
          versions={versions}
          loading={loadingVersions}
          onRevert={onRevertVersion}
          canRevert={canRevertVersions}
        />
      </div>
    </aside>
  );
};

export default Sidebar;
