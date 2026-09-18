export type Status = 'Operational' | 'Degraded' | 'Down' | 'Checking';
export type JobStatus = 'Queued' | 'Processing' | 'Completed' | 'Failed' | 'Cancelled';
export type TicketStatus = 'Open' | 'Pending' | 'Resolved' | 'Closed';

export interface User {
  id: string;
  name: string;
  email: string;
  plan: string;
  status: 'Active' | 'Suspended' | 'Banned';
  credits: number;
  usage: number;
  joinedAt: string;
  lastLoginAt: string;
  avatarUrl?: string;
  projectsCount?: number;
  exportsCount?: number;
}

export interface Session {
  id: string;
  userId: string;
  device: string;
  os: string;
  browser: string;
  ip: string;
  location: string;
  loginTime: string;
  lastActive: string;
  status: 'Active' | 'Revoked' | 'Suspicious';
}

export interface SystemHealth {
  id: string;
  service: string;
  status: Status;
  latencyMs: number;
  uptimePercent: number;
  lastChecked: string;
}

export interface Log {
  id: string;
  timestamp: string;
  severity: 'Info' | 'Warning' | 'Error' | 'Critical';
  category: 'Application' | 'API' | 'Errors' | 'Security' | 'Authentication' | 'System';
  event: string;
  service: string;
  user?: string;
  requestId?: string;
  status: number;
  details?: string;
}

export interface Transaction {
  id: string;
  userId: string;
  amount: number;
  plan: string;
  paymentMethod: string;
  status: 'Successful' | 'Pending' | 'Failed' | 'Refunded';
  date: string;
}

export interface CreditTransaction {
  id: string;
  userId: string;
  transactionId: string;
  credits: number;
  type: 'Credit' | 'Debit';
  reason: string;
  date: string;
}

export interface AIModel {
  id: string;
  name: string;
  version: string;
  status: 'Active' | 'Deprecated' | 'Beta';
  provider: string;
  usageCount: number;
  successRate: number;
  avgLatencyMs: number;
}

export interface AIJob {
  id: string;
  userId: string;
  modelId: string;
  type: string;
  status: JobStatus;
  startedAt: string;
  completedAt?: string;
  durationMs?: number;
  error?: string;
}

export interface SupportTicket {
  id: string;
  userId: string;
  subject: string;
  description?: string;
  email?: string;
  category?: string;
  priority: 'Low' | 'Medium' | 'High' | 'Urgent' | 'Critical';
  status: TicketStatus;
  attachmentUrl?: string | null;
  attachmentName?: string | null;
  createdAt: string;
  updatedAt: string;
  assignedStaff?: string;
}

export interface Feedback {
  id: string;
  userId: string;
  rating: number;
  category: 'Bug' | 'Feature' | 'UX' | 'Performance' | 'General';
  feedbackText: string;
  date: string;
  status: 'New' | 'Reviewed' | 'Actioned';
}

export interface AuditEvent {
  id: string;
  timestamp: string;
  controller: string;
  action: string;
  target: string;
  ip: string;
  result: 'Success' | 'Failed';
}

export interface FeatureFlag {
  id: string;
  name: string;
  key: string;
  status: boolean;
  environment: 'Production' | 'Staging' | 'Development';
  rolloutPercentage: number;
  lastUpdated: string;
}

export type AnnouncementType = 'System Update' | 'Offer' | 'Promotion' | 'Maintenance' | 'Feature Release' | 'Security Alert' | 'General';
export type AnnouncementPriority = 'Low' | 'Medium' | 'High' | 'Critical';
export type AnnouncementStatus = 'Draft' | 'Scheduled' | 'Active' | 'Expired' | 'Archived';
export type TargetAudience = 'All Users' | 'Free Users' | 'Pro Users' | 'Premium Users' | 'Admins Only';

export interface Announcement {
  id: string;
  title: string;
  message: string;
  announcementType: AnnouncementType;
  priority: AnnouncementPriority;
  status: AnnouncementStatus;
  targetAudience: TargetAudience;
  ctaText?: string;
  ctaUrl?: string;
  bannerColor?: string;
  icon?: string;
  startsAt?: string;
  expiresAt?: string;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
  viewsCount?: number;
  clicksCount?: number;
  dismissalsCount?: number;
}

export interface Backup {
  id: string;
  name: string;
  type: 'Full' | 'Incremental' | 'Config';
  sizeBytes: number;
  createdAt: string;
  status: 'Completed' | 'InProgress' | 'Failed';
  retentionDays: number;
}

export interface Role {
  id: string;
  name: string;
  usersCount: number;
}
