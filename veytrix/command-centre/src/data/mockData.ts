import { User, Session, SystemHealth, Log, Transaction, CreditTransaction, AIModel, AIJob, SupportTicket, Feedback, AuditEvent, FeatureFlag, Announcement, Backup, Role } from '../types';

export const mockUsers: User[] = [
  { id: 'usr_1', name: 'Alice Smith', email: 'alice@example.com', plan: 'Pro', status: 'Active', credits: 450, usage: 120, joinedAt: '2025-01-15T10:00:00Z', lastLoginAt: '2025-08-26T09:00:00Z' },
  { id: 'usr_2', name: 'Bob Jones', email: 'bob@example.com', plan: 'Free', status: 'Suspended', credits: 0, usage: 50, joinedAt: '2025-03-20T14:30:00Z', lastLoginAt: '2025-08-20T11:15:00Z' },
  { id: 'usr_3', name: 'Charlie Day', email: 'charlie@example.com', plan: 'Premium', status: 'Active', credits: 2500, usage: 2100, joinedAt: '2024-11-05T08:20:00Z', lastLoginAt: '2025-08-26T12:45:00Z' },
  { id: 'usr_4', name: 'Diana Prince', email: 'diana@example.com', plan: 'Enterprise', status: 'Active', credits: 10000, usage: 8500, joinedAt: '2024-06-12T16:00:00Z', lastLoginAt: '2025-08-26T10:30:00Z' },
  { id: 'usr_5', name: 'Eve Hacker', email: 'eve@example.com', plan: 'Free', status: 'Banned', credits: 0, usage: 0, joinedAt: '2025-07-01T09:10:00Z', lastLoginAt: '2025-07-02T10:00:00Z' },
];

export const mockSystemHealth: SystemHealth[] = [
  { id: 'sys_1', service: 'Frontend', status: 'Operational', latencyMs: 45, uptimePercent: 99.99, lastChecked: '2025-08-26T10:15:00Z' },
  { id: 'sys_2', service: 'Backend API', status: 'Operational', latencyMs: 120, uptimePercent: 99.95, lastChecked: '2025-08-26T10:15:00Z' },
  { id: 'sys_3', service: 'Database', status: 'Operational', latencyMs: 8, uptimePercent: 99.99, lastChecked: '2025-08-26T10:15:00Z' },
  { id: 'sys_4', service: 'Supabase Auth', status: 'Operational', latencyMs: 85, uptimePercent: 99.99, lastChecked: '2025-08-26T10:15:00Z' },
  { id: 'sys_5', service: 'Storage', status: 'Degraded', latencyMs: 450, uptimePercent: 99.5, lastChecked: '2025-08-26T10:15:00Z' },
  { id: 'sys_6', service: 'Email Delivery', status: 'Operational', latencyMs: 250, uptimePercent: 99.9, lastChecked: '2025-08-26T10:15:00Z' },
  { id: 'sys_7', service: 'Payment Gateway', status: 'Operational', latencyMs: 320, uptimePercent: 99.99, lastChecked: '2025-08-26T10:15:00Z' },
];

export const mockAIModels: AIModel[] = [
  { id: 'mod_1', name: 'GPT-4o', version: '2024-05-13', status: 'Active', provider: 'OpenAI', usageCount: 154200, successRate: 99.2, avgLatencyMs: 1200 },
  { id: 'mod_2', name: 'Claude 3.5 Sonnet', version: '20240620', status: 'Active', provider: 'Anthropic', usageCount: 89000, successRate: 98.8, avgLatencyMs: 850 },
  { id: 'mod_3', name: 'Gemini 1.5 Pro', version: 'latest', status: 'Active', provider: 'Google', usageCount: 45000, successRate: 97.5, avgLatencyMs: 1500 },
  { id: 'mod_4', name: 'Llama 3 70B', version: 'v3', status: 'Beta', provider: 'Meta', usageCount: 12000, successRate: 94.0, avgLatencyMs: 2100 },
  { id: 'mod_5', name: 'GPT-3.5 Turbo', version: '0125', status: 'Deprecated', provider: 'OpenAI', usageCount: 500000, successRate: 99.9, avgLatencyMs: 400 },
];

export const mockAIJobs: AIJob[] = [
  { id: 'job_101', userId: 'usr_1', modelId: 'mod_1', type: 'Text Generation', status: 'Completed', startedAt: '2025-08-26T12:00:00Z', completedAt: '2025-08-26T12:00:05Z', durationMs: 4500 },
  { id: 'job_102', userId: 'usr_3', modelId: 'mod_2', type: 'Code Analysis', status: 'Completed', startedAt: '2025-08-26T12:05:00Z', completedAt: '2025-08-26T12:05:12Z', durationMs: 11800 },
  { id: 'job_103', userId: 'usr_4', modelId: 'mod_3', type: 'Data Extraction', status: 'Failed', startedAt: '2025-08-26T12:10:00Z', durationMs: 30000, error: 'Timeout waiting for provider response.' },
  { id: 'job_104', userId: 'usr_1', modelId: 'mod_1', type: 'Text Generation', status: 'Processing', startedAt: '2025-08-26T12:15:00Z' },
  { id: 'job_105', userId: 'usr_2', modelId: 'mod_4', type: 'Chat', status: 'Queued', startedAt: '2025-08-26T12:16:00Z' },
];

export const mockLogs: Log[] = [
  { id: 'log_1', timestamp: '2025-08-26T12:10:00Z', severity: 'Error', category: 'API', event: 'Timeout from AI Provider', service: 'AI Gateway', requestId: 'req_a1b2', status: 504 },
  { id: 'log_2', timestamp: '2025-08-26T12:05:00Z', severity: 'Info', category: 'Authentication', event: 'User login successful', service: 'Auth API', user: 'usr_3', status: 200 },
  { id: 'log_3', timestamp: '2025-08-26T11:50:00Z', severity: 'Warning', category: 'System', event: 'High memory usage detected', service: 'Worker Node 3', status: 200 },
  { id: 'log_4', timestamp: '2025-08-26T10:15:00Z', severity: 'Critical', category: 'Security', event: 'Multiple failed login attempts', service: 'Auth API', user: 'usr_5', status: 401, details: '5 attempts from IP 192.168.1.5' },
];

export const mockTransactions: Transaction[] = [
  { id: 'tx_001', userId: 'usr_1', amount: 20.00, plan: 'Pro', paymentMethod: 'Card ending in 4242', status: 'Successful', date: '2025-08-01T10:00:00Z' },
  { id: 'tx_002', userId: 'usr_3', amount: 100.00, plan: 'Premium', paymentMethod: 'Card ending in 1111', status: 'Successful', date: '2025-08-05T14:20:00Z' },
  { id: 'tx_003', userId: 'usr_2', amount: 20.00, plan: 'Pro', paymentMethod: 'Card ending in 5555', status: 'Failed', date: '2025-08-20T09:15:00Z' },
];

export const mockSupportTickets: SupportTicket[] = [
  { id: 'tic_1001', userId: 'usr_1', subject: 'Cannot access my projects', priority: 'High', status: 'Open', createdAt: '2025-08-25T14:00:00Z', updatedAt: '2025-08-25T14:00:00Z' },
  { id: 'tic_1002', userId: 'usr_3', subject: 'Billing question', priority: 'Low', status: 'Resolved', createdAt: '2025-08-20T10:00:00Z', updatedAt: '2025-08-21T11:30:00Z', assignedStaff: 'Sarah Support' },
  { id: 'tic_1003', userId: 'usr_4', subject: 'API Rate limit increase', priority: 'Medium', status: 'Pending', createdAt: '2025-08-26T09:00:00Z', updatedAt: '2025-08-26T10:15:00Z', assignedStaff: 'Mike Admin' },
];

export const mockAuditLogs: AuditEvent[] = [
  { id: 'aud_1', timestamp: '2025-08-26T10:30:00Z', controller: 'official@mavrostech.in', action: 'Banned User', target: 'usr_5', ip: '10.0.0.1', result: 'Success' },
  { id: 'aud_2', timestamp: '2025-08-26T11:00:00Z', controller: 'official@mavrostech.in', action: 'Refund Transaction', target: 'tx_003', ip: '10.0.0.1', result: 'Failed' },
  { id: 'aud_3', timestamp: '2025-08-25T14:00:00Z', controller: 'official@mavrostech.in', action: 'Updated Feature Flag', target: 'ff_beta_access', ip: '10.0.0.1', result: 'Success' },
];

export const mockSessions: Session[] = [
  { id: 'sess_1', userId: 'usr_1', device: 'MacBook Pro', os: 'macOS 14', browser: 'Chrome 127', ip: '192.168.1.10', location: 'New York, US', loginTime: '2025-08-26T09:00:00Z', lastActive: '2025-08-26T12:15:00Z', status: 'Active' },
  { id: 'sess_2', userId: 'usr_3', device: 'iPhone 15', os: 'iOS 17', browser: 'Safari', ip: '10.0.0.55', location: 'London, UK', loginTime: '2025-08-26T11:30:00Z', lastActive: '2025-08-26T12:45:00Z', status: 'Active' },
  { id: 'sess_3', userId: 'usr_5', device: 'Unknown Device', os: 'Windows 10', browser: 'Firefox 115', ip: '192.168.1.5', location: 'Unknown', loginTime: '2025-07-01T09:10:00Z', lastActive: '2025-07-02T10:00:00Z', status: 'Suspicious' },
];
