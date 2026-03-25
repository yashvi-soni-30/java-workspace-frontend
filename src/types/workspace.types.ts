export interface RoomSummary {
  id: number;
  roomCode: string;
  roomName: string;
  createdAt: string;
  ownerEmail: string;
  memberCount: number;
  fileCount: number;
}

export interface RoomMember {
  id: number;
  name: string;
  email: string;
  joinedAt: string;
  owner: boolean;
}

export interface RoomFile {
  id: number;
  filePath: string;
  language: string;
  updatedAt: string;
  updatedByEmail: string | null;
}
