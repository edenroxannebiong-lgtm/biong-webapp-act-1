export type UserRole = 'freelancer' | 'client';

export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  role: UserRole;
  createdAt: any;
  updatedAt: any;
}

export type FileCategory = 'design' | 'document' | 'asset' | 'contract' | 'feedback' | 'other';

export interface VaultFile {
  id: string;
  userId: string;
  name: string;
  size: number;
  type: string;
  category: FileCategory;
  clientName?: string;
  uploadedBy: string;
  uploadedByRole: UserRole;
  downloadCount: number;
  notes?: string;
  previewUrl?: string;
  createdAt: any;
  updatedAt: any;
}

export interface ClientRecord {
  id: string;
  userId: string;
  name: string;
  email: string;
  company?: string;
  status: 'active' | 'archived';
  createdAt: any;
  updatedAt: any;
}

export interface FileFilterState {
  searchQuery: string;
  category: 'all' | FileCategory;
  client: string; // 'all' or specific client name
  sortBy: 'date-desc' | 'date-asc' | 'name-asc' | 'size-desc';
}
