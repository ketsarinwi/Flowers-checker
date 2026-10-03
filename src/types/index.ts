export type FlowerTier = 'ม่วง' | 'ส้ม' | 'แดง';

export interface Flower {
  id: string;
  name: string;
  tier: FlowerTier;
  imageUrl?: string;
  driveFileId?: string;
  driveWebViewLink?: string;
  notes?: string;
  createdAt: number;
  updatedAt: number;
}

export interface Member {
  id: string;
  guildName: string; // ชื่อในกิลด์
  lineName: string;  // ชื่อในไลน์
  name?: string;     // Backward compatibility fallback
  avatarColor?: string;
  flowerIds: string[]; // List of Flower IDs
  createdAt: number;
  updatedAt: number;
}

export interface GoogleDriveUser {
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
}

export interface SyncStatus {
  lastUpdated: number;
  isSyncing: boolean;
  autoRefreshInterval: number; // in seconds (0 = disabled)
  isLive: boolean;
}
