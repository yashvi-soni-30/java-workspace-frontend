import type { RoomActivity, RoomFile, RoomFileContent, RoomMember, RoomSummary, VersionEntry, VersionRevertResult } from "@/types/workspace.types";
import { apiBlob, apiJson, authBearerHeader, authJsonHeaders } from "@/api/axiosClient";

interface WorkspaceRequestPayload {
  roomName?: string;
  roomCode?: string;
  memberEmail?: string;
  filePath?: string;
  language?: string;
  content?: string;
  versionMessage?: string;
  expectedUpdatedAt?: string;
  canEditFiles?: boolean;
  canSaveVersions?: boolean;
  canRevertVersions?: boolean;
}

function authHeaders(): HeadersInit {
  return authJsonHeaders();
}

async function workspaceRequest<T>(
  path: string,
  method: "GET" | "POST" | "PUT",
  payload?: WorkspaceRequestPayload
): Promise<T> {
  return apiJson<T>(path, {
    method,
    headers: authHeaders(),
    body: payload ? JSON.stringify(payload) : undefined,
    auth: false,
  });
}

export function createRoom(roomName: string): Promise<RoomSummary> {
  return workspaceRequest<RoomSummary>("/api/workspaces/rooms", "POST", { roomName });
}

export function joinRoom(roomCode: string): Promise<RoomSummary> {
  return workspaceRequest<RoomSummary>("/api/workspaces/rooms/join", "POST", { roomCode });
}

export function getMyRooms(): Promise<RoomSummary[]> {
  return workspaceRequest<RoomSummary[]>("/api/workspaces/rooms", "GET");
}

export function getRoomByCode(roomCode: string): Promise<RoomSummary> {
  return workspaceRequest<RoomSummary>(`/api/workspaces/rooms/by-code/${encodeURIComponent(roomCode)}`, "GET");
}

export function getRoomMembers(roomId: number): Promise<RoomMember[]> {
  return workspaceRequest<RoomMember[]>(`/api/workspaces/rooms/${roomId}/members`, "GET");
}

export function addRoomMember(roomId: number, memberEmail: string): Promise<RoomSummary> {
  return workspaceRequest<RoomSummary>(`/api/workspaces/rooms/${roomId}/members`, "POST", { memberEmail });
}

export function updateRoomMemberPermissions(
  roomId: number,
  memberUserId: number,
  permissions: {
    canEditFiles?: boolean;
    canSaveVersions?: boolean;
    canRevertVersions?: boolean;
  }
): Promise<RoomMember> {
  return workspaceRequest<RoomMember>(
    `/api/workspaces/rooms/${roomId}/members/${memberUserId}/permissions`,
    "PUT",
    permissions
  );
}

export function getRoomFiles(roomId: number): Promise<RoomFile[]> {
  return workspaceRequest<RoomFile[]>(`/api/workspaces/rooms/${roomId}/files`, "GET");
}

export function getRoomActivity(roomId: number): Promise<RoomActivity[]> {
  return workspaceRequest<RoomActivity[]>(`/api/workspaces/rooms/${roomId}/activity`, "GET");
}

export function getRoomFile(roomId: number, fileId: number): Promise<RoomFileContent> {
  return workspaceRequest<RoomFileContent>(`/api/workspaces/rooms/${roomId}/files/${fileId}`, "GET");
}

export function createRoomFile(roomId: number, filePath: string, content = ""): Promise<RoomFileContent> {
  return workspaceRequest<RoomFileContent>(`/api/workspaces/rooms/${roomId}/files`, "POST", { filePath, content, language: "java" });
}

export function saveRoomFile(
  roomId: number,
  fileId: number,
  content: string,
  expectedUpdatedAt: string,
  filePath?: string
): Promise<RoomFileContent> {
  return workspaceRequest<RoomFileContent>(`/api/workspaces/rooms/${roomId}/files/${fileId}`, "PUT", {
    content,
    filePath,
    language: "java",
    expectedUpdatedAt,
  });
}

export async function uploadRoomJavaFile(roomId: number, file: File): Promise<RoomFileContent> {
  const formData = new FormData();
  formData.append("file", file);

  return apiJson<RoomFileContent>(`/api/workspaces/rooms/${roomId}/files/upload`, {
    method: "POST",
    headers: authBearerHeader(),
    body: formData,
  });
}

export async function downloadRoomFile(roomId: number, fileId: number): Promise<{ blob: Blob; fileName: string }> {
  const { blob, response } = await apiBlob(`/api/workspaces/rooms/${roomId}/files/${fileId}/download`, {
    method: "GET",
    headers: authBearerHeader(),
  });

  const disposition = response.headers.get("content-disposition") || "";
  const match = disposition.match(/filename=\"?([^\";]+)\"?/i);
  const fileName = match?.[1] || "code.java";

  return { blob, fileName };
}

export function saveVersionSnapshot(
  roomId: number,
  fileId: number,
  content: string,
  versionMessage?: string
): Promise<VersionEntry> {
  return workspaceRequest<VersionEntry>(`/api/workspaces/rooms/${roomId}/files/${fileId}/versions`, "POST", {
    content,
    versionMessage,
  });
}

export function getFileVersions(roomId: number, fileId: number): Promise<VersionEntry[]> {
  return workspaceRequest<VersionEntry[]>(`/api/workspaces/rooms/${roomId}/files/${fileId}/versions`, "GET");
}

export function revertFileVersion(roomId: number, fileId: number, versionId: number): Promise<VersionRevertResult> {
  return workspaceRequest<VersionRevertResult>(
    `/api/workspaces/rooms/${roomId}/files/${fileId}/versions/${versionId}/revert`,
    "POST"
  );
}
