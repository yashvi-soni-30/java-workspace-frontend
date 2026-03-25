import type { RoomFile, RoomMember, RoomSummary } from "@/types/workspace.types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";
const TOKEN_KEY = "cjw-token";

interface WorkspaceRequestPayload {
  roomName?: string;
  roomCode?: string;
  memberEmail?: string;
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

function authHeaders(): HeadersInit {
  const token = localStorage.getItem(TOKEN_KEY);
  if (!token) {
    throw new Error("You are not logged in");
  }

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

async function workspaceRequest<T>(
  path: string,
  method: "GET" | "POST",
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
