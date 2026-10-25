// Shared TypeScript types for TrustVault frontend.
// These mirror the (planned) backend DTOs. Keep them in sync with the
// API contract documented in frontend/API_CONTRACT.md.

export type Role = 'Admin' | 'Owner' | 'Viewer';

export interface User {
  id: string;
  email: string;
  displayName: string;
  role: Role;
  createdAt?: string;
}

export interface AuthResponse {
  accessToken: string;
  tokenType: string;
  expiresAt: string;
  user: User;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  displayName: string;
}

export interface Document {
  id: string;
  name: string;
  originalFileName: string;
  contentType: string;
  sizeBytes: number;
  ownerId: string;
  ownerName?: string;
  uploadedAt: string;
  description?: string;
  tags?: string;
}

export type PermissionLevel = 'Read' | 'Edit' | 'Owner';

export interface DocumentPermission {
  id: string;
  documentId: string;
  userId: string;
  userEmail?: string;
  userName?: string;
  level: PermissionLevel;
  grantedAt: string;
  expiresAt?: string | null;
  revokedAt?: string | null;
  isActive: boolean;
}

export interface ShareRequest {
  documentId: string;
  userId: string;
  level: PermissionLevel;
  expiresAt?: string | null;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  actorId: string;
  actorEmail?: string;
  action: string;
  targetDocumentId?: string | null;
  targetDocumentName?: string | null;
  outcome: 'Success' | 'Denied' | 'Error';
  ipAddress?: string;
  correlationId?: string;
  details?: string;
}

export interface ApiError {
  status: number;
  message: string;
  details?: unknown;
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}
