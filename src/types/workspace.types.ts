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

export interface RoomFileContent extends RoomFile {
  content: string;
}

export interface VersionEntry {
  id: number;
  versionNumber: number;
  createdAt: string;
  authorName: string | null;
  authorEmail: string | null;
  fileId: number;
  contentPreview: string;
  message?: string;
}

export interface VersionRevertResult {
  fileId: number;
  filePath: string;
  content: string;
  revertedFromVersion: number;
  newVersion: number;
  updatedAt: string;
  updatedByEmail: string | null;
}
