import type { RoomFile, RoomFileContent, RoomMember, RoomSummary, VersionEntry, VersionRevertResult } from "@/types/workspace.types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";
const TOKEN_KEY = "cjw-token";

interface WorkspaceRequestPayload {
  roomName?: string;
  roomCode?: string;
  memberEmail?: string;
  filePath?: string;
  language?: string;
  content?: string;
  versionMessage?: string;
}

async function parseResponse<T>(response: Response): Promise<T> {
  const text = await response.text();
  const data = text ? JSON.parse(text) : {};

  if (!response.ok) {
    const message = data?.error || data?.message || "Workspace request failed";
    throw new Error(message);
  }

  return data as T;
}

function getAuthToken(): string {
  const token = localStorage.getItem(TOKEN_KEY);
  if (!token) {
    throw new Error("You are not logged in");
  }

  return token;
}

function authHeaders(): HeadersInit {
  const token = getAuthToken();
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

async function workspaceRequest<T>(
  path: string,
  method: "GET" | "POST" | "PUT",
  payload?: WorkspaceRequestPayload
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: authHeaders(),
    body: payload ? JSON.stringify(payload) : undefined,
  });

  return parseResponse<T>(response);
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

export function getRoomFiles(roomId: number): Promise<RoomFile[]> {
  return workspaceRequest<RoomFile[]>(`/api/workspaces/rooms/${roomId}/files`, "GET");
}

export function getRoomFile(roomId: number, fileId: number): Promise<RoomFileContent> {
  return workspaceRequest<RoomFileContent>(`/api/workspaces/rooms/${roomId}/files/${fileId}`, "GET");
}

export function createRoomFile(roomId: number, filePath: string, content = ""): Promise<RoomFileContent> {
  return workspaceRequest<RoomFileContent>(`/api/workspaces/rooms/${roomId}/files`, "POST", { filePath, content, language: "java" });
}

export function saveRoomFile(roomId: number, fileId: number, content: string, filePath?: string): Promise<RoomFileContent> {
  return workspaceRequest<RoomFileContent>(`/api/workspaces/rooms/${roomId}/files/${fileId}`, "PUT", { content, filePath, language: "java" });
}

export async function uploadRoomJavaFile(roomId: number, file: File): Promise<RoomFileContent> {
  const token = getAuthToken();
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_BASE_URL}/api/workspaces/rooms/${roomId}/files/upload`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  return parseResponse<RoomFileContent>(response);
}

export async function downloadRoomFile(roomId: number, fileId: number): Promise<{ blob: Blob; fileName: string }> {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}/api/workspaces/rooms/${roomId}/files/${fileId}/download`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const text = await response.text();
    const data = text ? JSON.parse(text) : {};
    throw new Error(data?.error || data?.message || "Download failed");
  }

  const blob = await response.blob();
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
