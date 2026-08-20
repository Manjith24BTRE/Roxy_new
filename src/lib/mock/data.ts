/**
 * Mock data layer for Veytrix Control Centre.
 * All values are deterministic so the UI is stable across renders/SSR.
 * Replace the `services/*` accessors with REST calls later; these shapes are the contract.
 */

export type Status =
  | "operational"
  | "degraded"
  | "down"
  | "maintenance"
  | "active"
  | "suspended"
  | "banned"
  | "pending"
  | "queued"
  | "running"
  | "completed"
  | "failed"
  | "retrying"
  | "cancelled"
  | "open"
  | "assigned"
  | "in_progress"
  | "waiting"
  | "resolved"
  | "closed"
  | "success"
  | "refunded"
  | "draft"
  | "scheduled"
  | "published"
  | "archived"
  | "enabled"
  | "disabled"
  | "info"
  | "warning"
  | "error"
  | "critical"
  | "debug";

let seed = 987654321;
function rnd() {
  seed = (seed * 1664525 + 1013904223) % 4294967296;
  return seed / 4294967296;
}
function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(rnd() * arr.length)]!;
}
function int(min: number, max: number) {
  return Math.floor(rnd() * (max - min + 1)) + min;
}

const BASE = Date.UTC(2026, 7, 18, 18, 0, 0);
export function ago(minutes: number) {
  return new Date(BASE - minutes * 60_000).toISOString();
}
export function fmtDate(iso: string) {
  const d = new Date(iso);
  return d.toISOString().slice(0, 10);
}
export function fmtDateTime(iso: string) {
  return new Date(iso).toISOString().replace("T", " ").slice(0, 19) + "Z";
}
export function relative(iso: string) {
  const diff = Math.max(1, Math.round((BASE - new Date(iso).getTime()) / 60000));
  if (diff < 60) return `${diff}m ago`;
  if (diff < 1440) return `${Math.round(diff / 60)}h ago`;
  return `${Math.round(diff / 1440)}d ago`;
}
export function money(n: number, currency = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(n);
}
export function compact(n: number) {
  return new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(n);
}

const FIRST = [
  "Aria", "Noah", "Mila", "Kai", "Ines", "Theo", "Zara", "Omar", "Lena", "Ravi",
  "Yuki", "Sofia", "Diego", "Nadia", "Elias", "Priya", "Jonas", "Amara", "Liam", "Chen",
];
const LAST = [
  "Okafor", "Lindqvist", "Moreau", "Tanaka", "Silva", "Haddad", "Novak", "Iyer",
  "Kowalski", "Bergman", "Duarte", "Rahman", "Fischer", "Costa", "Nakamura", "Volkov",
];
const DOMAINS = ["veytrix.io", "northwind.co", "lumenlabs.ai", "acme-corp.com", "pixelforge.dev"];
const PLANS = ["Starter", "Growth", "Scale", "Enterprise"] as const;
const COUNTRIES = ["US", "DE", "IN", "BR", "JP", "SE", "GB", "SG", "AU", "CA"];

export interface User {
  id: string;
  name: string;
  email: string;
  plan: (typeof PLANS)[number];
  credits: number;
  usage: number;
  status: Status;
  role: string;
  country: string;
  twoFactor: boolean;
  lastLogin: string;
  createdAt: string;
  mrr: number;
}

export const users: User[] = Array.from({ length: 64 }, (_, i) => {
  const name = `${pick(FIRST)} ${pick(LAST)}`;
  const plan = pick(PLANS);
  const status = pick<Status>([
    "active", "active", "active", "active", "active", "active", "pending", "suspended", "banned",
  ]);
  return {
    id: `usr_${(10482 + i * 7).toString(36).toUpperCase()}`,
    name,
    email: `${name.toLowerCase().replace(/[^a-z]/g, ".")}@${pick(DOMAINS)}`,
    plan,
    credits: int(0, 240) * 25,
    usage: int(2, 99),
    status,
    role: pick(["Member", "Member", "Member", "Owner", "Billing Admin"]),
    country: pick(COUNTRIES),
    twoFactor: rnd() > 0.45,
    lastLogin: ago(int(3, 20000)),
    createdAt: ago(int(2000, 500000)),
    mrr: plan === "Enterprise" ? 1490 : plan === "Scale" ? 399 : plan === "Growth" ? 99 : 29,
  };
});

export interface ServiceHealth {
  id: string;
  name: string;
  category: string;
  status: Status;
  responseMs: number;
  uptime: number;
  lastChecked: string;
  region: string;
  incidents: number;
}

export const services: ServiceHealth[] = [
  ["Frontend", "Edge", "operational", 84, 99.99, "global"],
  ["Backend API", "Compute", "operational", 141, 99.97, "us-east-1"],
  ["Database", "Data", "degraded", 312, 99.82, "us-east-1"],
  ["Supabase", "Data", "operational", 118, 99.95, "eu-west-1"],
  ["Object Storage", "Data", "operational", 96, 99.99, "global"],
  ["Email Delivery", "Messaging", "degraded", 640, 99.41, "us-east-1"],
  ["Payments", "Billing", "operational", 209, 99.98, "global"],
  ["Inference Cluster", "AI", "maintenance", 0, 99.6, "us-west-2"],
].map(([name, category, status, responseMs, uptime, region], i) => ({
  id: `svc_${i + 1}`,
  name: name as string,
  category: category as string,
  status: status as Status,
  responseMs: responseMs as number,
  uptime: uptime as number,
  lastChecked: ago(int(1, 5)),
  region: region as string,
  incidents: int(0, 4),
}));

export interface Incident {
  id: string;
  title: string;
  service: string;
  severity: Status;
  startedAt: string;
  resolvedAt: string | null;
  impact: string;
}

export const incidents: Incident[] = [
  {
    id: "inc_2291",
    title: "Elevated read latency on primary replica",
    service: "Database",
    severity: "warning",
    startedAt: ago(96),
    resolvedAt: null,
    impact: "Dashboard queries 2-4x slower for ~8% of tenants.",
  },
  {
    id: "inc_2288",
    title: "Transactional email queue backlog",
    service: "Email Delivery",
    severity: "warning",
    startedAt: ago(310),
    resolvedAt: null,
    impact: "Password reset emails delayed up to 6 minutes.",
  },
  {
    id: "inc_2280",
    title: "Scheduled GPU node rotation",
    service: "Inference Cluster",
    severity: "info",
    startedAt: ago(720),
    resolvedAt: null,
    impact: "Reduced concurrency on veytrix-vision-2.",
  },
  {
    id: "inc_2274",
    title: "Payments webhook signature mismatch",
    service: "Payments",
    severity: "critical",
    startedAt: ago(4300),
    resolvedAt: ago(4180),
    impact: "141 webhooks retried, no revenue loss.",
  },
  {
    id: "inc_2270",
    title: "CDN cache purge propagation delay",
    service: "Frontend",
    severity: "info",
    startedAt: ago(9800),
    resolvedAt: ago(9700),
    impact: "Stale assets served in APAC for 12 minutes.",
  },
];

export interface LogEntry {
  id: string;
  kind: "error" | "api" | "performance" | "crash" | "security";
  timestamp: string;
  severity: Status;
  service: string;
  endpoint: string;
  user: string;
  requestId: string;
  message: string;
  statusCode: number;
  durationMs: number;
}

const ENDPOINTS = [
  "/v1/jobs/submit", "/v1/jobs/:id", "/v1/models", "/v1/users/:id", "/v1/billing/charge",
  "/v1/credits/consume", "/v1/auth/session", "/v1/webhooks/payments", "/v1/storage/upload",
];
const SERVICES = ["api-gateway", "job-runner", "billing-svc", "auth-svc", "storage-svc", "inference"];
const MESSAGES: Record<LogEntry["kind"], string[]> = {
  error: [
    "Unhandled rejection in job dispatcher",
    "Postgres connection pool exhausted",
    "Upstream model timeout after 30000ms",
    "Invalid payload schema for submit request",
    "Credit ledger write conflict, retrying",
  ],
  api: [
    "Request completed",
    "Request completed with retry",
    "Rate limit applied to tenant",
    "Cache miss, upstream fetch",
    "Idempotency key replayed",
  ],
  performance: [
    "p95 latency above threshold",
    "Slow query detected (seq scan)",
    "Cold start on inference worker",
    "Queue wait time exceeded SLO",
    "Payload size above soft limit",
  ],
  crash: [
    "Worker process exited with SIGSEGV",
    "OOM killed during batch inference",
    "Panic: nil pointer dereference in scheduler",
    "Container restart loop detected",
  ],
  security: [
    "Failed login attempt (bad password)",
    "Suspicious login from new geography",
    "API key used from unrecognised ASN",
    "2FA challenge failed 3 times",
    "Admin impersonation session started",
  ],
};

export const logs: LogEntry[] = (
  ["error", "api", "performance", "crash", "security"] as const
).flatMap((kind) =>
  Array.from({ length: 42 }, (_, i) => {
    const sev =
      kind === "crash"
        ? pick<Status>(["critical", "error"])
        : kind === "error"
          ? pick<Status>(["error", "error", "warning", "critical"])
          : kind === "security"
            ? pick<Status>(["warning", "critical", "info"])
            : pick<Status>(["info", "info", "warning", "debug"]);
    const code = pick([200, 200, 200, 201, 400, 401, 429, 500, 502, 503]);
    return {
      id: `log_${kind}_${i}`,
      kind,
      timestamp: ago(int(1, 2600)),
      severity: sev,
      service: pick(SERVICES),
      endpoint: pick(ENDPOINTS),
      user: pick(users).email,
      requestId: `req_${(1e12 + int(1, 9e11)).toString(36)}`,
      message: pick(MESSAGES[kind]),
      statusCode: code,
      durationMs: int(12, 4200),
    };
  }).sort((a, b) => b.timestamp.localeCompare(a.timestamp)),
);

export interface Job {
  id: string;
  user: string;
  userId: string;
  model: string;
  version: string;
  status: Status;
  tokens: number;
  credits: number;
  startedAt: string;
  completedAt: string | null;
  durationMs: number;
  failureReason: string | null;
  region: string;
}

export const models = [
  { id: "mdl_vtx_text_4", name: "veytrix-text-4", family: "Text", versions: ["4.2.1", "4.1.9", "4.0.3"], status: "operational" as Status, latencyMs: 480, costPer1k: 0.012, jobs24h: 18422, errorRate: 0.4 },
  { id: "mdl_vtx_vision_2", name: "veytrix-vision-2", family: "Vision", versions: ["2.3.0", "2.2.4"], status: "degraded" as Status, latencyMs: 1320, costPer1k: 0.038, jobs24h: 6210, errorRate: 3.1 },
  { id: "mdl_vtx_voice_1", name: "veytrix-voice-1", family: "Audio", versions: ["1.8.2", "1.7.0"], status: "operational" as Status, latencyMs: 910, costPer1k: 0.021, jobs24h: 3980, errorRate: 1.2 },
  { id: "mdl_vtx_embed_3", name: "veytrix-embed-3", family: "Embedding", versions: ["3.1.0"], status: "operational" as Status, latencyMs: 96, costPer1k: 0.0008, jobs24h: 41200, errorRate: 0.1 },
  { id: "mdl_vtx_rerank_1", name: "veytrix-rerank-1", family: "Ranking", versions: ["1.2.2", "1.1.0"], status: "maintenance" as Status, latencyMs: 210, costPer1k: 0.004, jobs24h: 1180, errorRate: 0.9 },
];

const FAILURES = [
  "Upstream model timeout (30s)",
  "Insufficient credits at execution time",
  "Invalid input schema: missing `prompt`",
  "GPU node evicted mid-execution",
  "Content policy violation detected",
];

export const jobs: Job[] = Array.from({ length: 90 }, (_, i) => {
  const m = pick(models);
  const status = pick<Status>([
    "completed", "completed", "completed", "completed", "running", "queued", "failed", "retrying", "cancelled",
  ]);
  const u = pick(users);
  const dur = int(400, 42000);
  return {
    id: `job_${(90000 + i * 13).toString(36).toUpperCase()}`,
    user: u.email,
    userId: u.id,
    model: m.name,
    version: m.versions[0]!,
    status,
    tokens: int(120, 48000),
    credits: int(1, 320),
    startedAt: ago(int(1, 3000)),
    completedAt: status === "completed" || status === "failed" ? ago(int(1, 2990)) : null,
    durationMs: dur,
    failureReason: status === "failed" || status === "retrying" ? pick(FAILURES) : null,
    region: pick(["us-east-1", "us-west-2", "eu-west-1", "ap-south-1"]),
  };
}).sort((a, b) => b.startedAt.localeCompare(a.startedAt));

export interface Transaction {
  id: string;
  user: string;
  plan: string;
  amount: number;
  method: string;
  status: Status;
  date: string;
  invoice: string;
}

export const transactions: Transaction[] = Array.from({ length: 56 }, (_, i) => {
  const u = pick(users);
  return {
    id: `txn_${(70000 + i * 11).toString(36).toUpperCase()}`,
    user: u.email,
    plan: u.plan,
    amount: pick([29, 99, 399, 1490, 250, 500]),
    method: pick(["Visa •••• 4242", "Mastercard •••• 8210", "ACH Transfer", "Amex •••• 1005", "Wire"]),
    status: pick<Status>(["success", "success", "success", "success", "pending", "failed", "refunded"]),
    date: ago(int(20, 60000)),
    invoice: `INV-2026-${1200 + i}`,
  };
}).sort((a, b) => b.date.localeCompare(a.date));

export const plans = [
  { id: "pln_starter", name: "Starter", price: 29, cycle: "Monthly", users: 4820, status: "active" as Status, credits: 2500, features: ["2,500 credits / mo", "Community support", "1 workspace", "Core models"] },
  { id: "pln_growth", name: "Growth", price: 99, cycle: "Monthly", users: 2140, status: "active" as Status, credits: 12000, features: ["12,000 credits / mo", "Email support", "5 workspaces", "All text models"] },
  { id: "pln_scale", name: "Scale", price: 399, cycle: "Monthly", users: 610, status: "active" as Status, credits: 60000, features: ["60,000 credits / mo", "Priority support", "Unlimited workspaces", "Vision + Voice"] },
  { id: "pln_enterprise", name: "Enterprise", price: 1490, cycle: "Annual", users: 84, status: "active" as Status, credits: 400000, features: ["Custom credit pool", "Dedicated CSM", "SSO / SCIM", "Private inference"] },
  { id: "pln_legacy", name: "Legacy Pro", price: 149, cycle: "Monthly", users: 37, status: "archived" as Status, credits: 20000, features: ["Grandfathered pricing", "No new signups"] },
];

export interface CreditTx {
  id: string;
  user: string;
  type: "purchase" | "consumption" | "refund" | "grant";
  amount: number;
  balance: number;
  reference: string;
  date: string;
}

export const creditTransactions: CreditTx[] = Array.from({ length: 48 }, (_, i) => {
  const type = pick(["purchase", "consumption", "consumption", "consumption", "refund", "grant"] as const);
  const amount = type === "consumption" ? -int(5, 900) : int(50, 5000);
  return {
    id: `crd_${(40000 + i * 17).toString(36).toUpperCase()}`,
    user: pick(users).email,
    type,
    amount,
    balance: int(200, 90000),
    reference: type === "consumption" ? `job_${(90000 + i).toString(36).toUpperCase()}` : `INV-2026-${1300 + i}`,
    date: ago(int(5, 40000)),
  };
}).sort((a, b) => b.date.localeCompare(a.date));

export interface Ticket {
  id: string;
  subject: string;
  user: string;
  priority: "low" | "medium" | "high" | "urgent";
  status: Status;
  agent: string;
  category: string;
  createdAt: string;
  updatedAt: string;
  messages: { author: string; role: "customer" | "agent" | "system"; body: string; at: string }[];
  notes: { author: string; body: string; at: string }[];
}

const SUBJECTS = [
  "Credits deducted for a failed job",
  "Cannot enable SSO for our workspace",
  "Vision model returning 502 intermittently",
  "Request refund for duplicate charge",
  "API key rotation locked us out",
  "Rate limit seems lower than plan states",
  "Invoice missing VAT identifier",
  "Voice generation quality regression",
  "Bulk export of usage data",
  "Seat count not updating after upgrade",
];

export const tickets: Ticket[] = Array.from({ length: 28 }, (_, i) => {
  const u = pick(users);
  const created = ago(int(30, 26000));
  return {
    id: `tkt_${4100 + i}`,
    subject: SUBJECTS[i % SUBJECTS.length]!,
    user: u.email,
    priority: pick(["low", "medium", "medium", "high", "urgent"] as const),
    status: pick<Status>(["open", "assigned", "in_progress", "waiting", "resolved", "closed"]),
    agent: pick(["M. Ferreira", "S. Adeyemi", "J. Brandt", "Unassigned", "K. Watanabe"]),
    category: pick(["Billing", "Technical", "Account", "AI Operations", "Security"]),
    createdAt: created,
    updatedAt: ago(int(5, 2000)),
    messages: [
      { author: u.name, role: "customer", body: "Hi — we are seeing this on production since this morning. Could you take a look? Happy to provide request IDs.", at: created },
      { author: "S. Adeyemi", role: "agent", body: "Thanks for reaching out. I've pulled the request traces and can reproduce it on our side. Escalating to AI Operations now.", at: ago(int(20, 900)) },
      { author: "system", role: "system", body: "Priority raised and ticket assigned to AI Operations queue.", at: ago(int(10, 800)) },
    ],
    notes: [
      { author: "J. Brandt", body: "Correlated with inc_2291 — replica latency. Hold on refund until confirmed.", at: ago(int(10, 600)) },
    ],
  };
});

export const feedback = Array.from({ length: 22 }, (_, i) => ({
  id: `fbk_${900 + i}`,
  user: pick(users).email,
  type: pick(["Feature Request", "Bug Report", "Praise", "Complaint"]),
  sentiment: pick(["positive", "neutral", "negative"]),
  score: int(1, 10),
  title: pick([
    "Add per-workspace credit budgets",
    "Dark mode for the customer portal",
    "Webhook retries should be configurable",
    "Job history export as CSV",
    "SAML group mapping",
    "Faster cold starts on vision models",
  ]),
  votes: int(3, 240),
  status: pick<Status>(["open", "in_progress", "resolved", "closed"]),
  createdAt: ago(int(100, 60000)),
}));

export interface AuditLog {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  resource: string;
  resourceId: string;
  ip: string;
  device: string;
  result: "success" | "failed";
  metadata: Record<string, string>;
}

const ACTIONS = [
  "USER_SUSPENDED", "USER_BANNED", "REFUND_ISSUED", "ROLE_UPDATED", "PERMISSION_CHANGED",
  "AI_JOB_RETRIED", "SETTINGS_UPDATED", "BACKUP_CREATED", "FEATURE_FLAG_TOGGLED", "API_KEY_REVOKED",
];
const ADMINS = ["ops.admin@veytrix.io", "finance.admin@veytrix.io", "s.adeyemi@veytrix.io", "j.brandt@veytrix.io", "root@veytrix.io"];

export const auditLogs: AuditLog[] = Array.from({ length: 64 }, (_, i) => {
  const action = pick(ACTIONS);
  return {
    id: `aud_${(30000 + i * 19).toString(36).toUpperCase()}`,
    timestamp: ago(int(2, 30000)),
    actor: pick(ADMINS),
    action,
    resource: action.startsWith("USER") ? "User" : action.includes("REFUND") ? "Transaction" : action.includes("ROLE") || action.includes("PERMISSION") ? "Role" : action.includes("JOB") ? "AI Job" : "System",
    resourceId: pick(users).id,
    ip: `${int(12, 220)}.${int(0, 255)}.${int(0, 255)}.${int(1, 254)}`,
    device: pick(["macOS · Chrome 141", "Windows · Edge 139", "Linux · Firefox 140", "iOS · Safari 18", "API Client"]),
    result: (rnd() > 0.12 ? "success" : "failed") as "success" | "failed",
    metadata: { reason: pick(["Manual review", "Fraud signal", "Customer request", "Policy enforcement"]), ticket: `tkt_${4100 + int(0, 27)}` },
  };
}).sort((a, b) => b.timestamp.localeCompare(a.timestamp));

export const activity = Array.from({ length: 40 }, (_, i) => ({
  id: `act_${i}`,
  actor: pick([...ADMINS, ...users.slice(0, 10).map((u) => u.email)]),
  action: pick([
    "signed in", "upgraded to Scale", "submitted 12 AI jobs", "rotated an API key",
    "invited a teammate", "purchased 10,000 credits", "opened a support ticket",
    "enabled two-factor authentication", "downgraded to Growth", "exported usage report",
  ]),
  at: ago(int(1, 4000)),
  channel: pick(["Web App", "API", "Admin Console", "Mobile"]),
}));

export const sessions = Array.from({ length: 34 }, (_, i) => {
  const u = pick(users);
  return {
    id: `ses_${(50000 + i * 23).toString(36).toUpperCase()}`,
    user: u.email,
    ip: `${int(12, 220)}.${int(0, 255)}.${int(0, 255)}.${int(1, 254)}`,
    device: pick(["macOS · Chrome 141", "Windows · Edge 139", "Android · Chrome 141", "iOS · Safari 18", "Linux · Firefox 140"]),
    location: pick(["Berlin, DE", "Austin, US", "Mumbai, IN", "Tokyo, JP", "São Paulo, BR", "Stockholm, SE"]),
    status: pick<Status>(["active", "active", "active", "pending"]),
    startedAt: ago(int(5, 8000)),
    lastSeen: ago(int(1, 400)),
  };
});

export const roles = [
  { id: "rol_super", name: "Super Admin", description: "Unrestricted access to every surface, including destructive operations.", members: 3, scope: "Global", system: true },
  { id: "rol_admin", name: "Admin", description: "Day-to-day platform administration without billing refunds.", members: 11, scope: "Global", system: true },
  { id: "rol_ai", name: "AI Operator", description: "Manages models, versions, job queues and retries.", members: 7, scope: "AI Operations", system: false },
  { id: "rol_fin", name: "Finance Admin", description: "Billing, invoices, refunds and revenue reporting.", members: 5, scope: "Billing", system: false },
  { id: "rol_support", name: "Support Agent", description: "Handles tickets, feedback and limited user actions.", members: 18, scope: "Support", system: false },
  { id: "rol_analyst", name: "Analyst", description: "Read-only access to analytics, logs and reports.", members: 9, scope: "Read Only", system: false },
];

export const permissionGroups = [
  { group: "Users", keys: ["users.read", "users.update", "users.suspend"] },
  { group: "Billing", keys: ["billing.read", "billing.refund"] },
  { group: "AI", keys: ["ai.models.read", "ai.models.manage", "jobs.read", "jobs.retry"] },
  { group: "Support", keys: ["tickets.read"] },
  { group: "Platform", keys: ["audit.read", "settings.manage"] },
];

export const permissionMatrix: Record<string, string[]> = {
  "Super Admin": ["users.read", "users.update", "users.suspend", "billing.read", "billing.refund", "ai.models.read", "ai.models.manage", "jobs.read", "jobs.retry", "tickets.read", "audit.read", "settings.manage"],
  Admin: ["users.read", "users.update", "users.suspend", "billing.read", "ai.models.read", "jobs.read", "jobs.retry", "tickets.read", "audit.read", "settings.manage"],
  "AI Operator": ["ai.models.read", "ai.models.manage", "jobs.read", "jobs.retry", "users.read"],
  "Finance Admin": ["billing.read", "billing.refund", "users.read", "audit.read"],
  "Support Agent": ["tickets.read", "users.read", "users.update", "jobs.read"],
  Analyst: ["users.read", "billing.read", "jobs.read", "ai.models.read", "audit.read"],
};

export const announcements = [
  { id: "ann_41", title: "Scheduled maintenance: inference cluster rotation", audience: "All users", status: "scheduled" as Status, scheduledFor: ago(-2880), createdBy: "ops.admin@veytrix.io", message: "We will rotate GPU nodes in us-west-2. Expect reduced concurrency on veytrix-vision-2 for up to 45 minutes." },
  { id: "ann_40", title: "veytrix-text-4.2.1 is now generally available", audience: "Growth, Scale, Enterprise", status: "published" as Status, scheduledFor: ago(1440), createdBy: "s.adeyemi@veytrix.io", message: "Improved instruction following and a 22% latency reduction at p95." },
  { id: "ann_39", title: "Updated fair-use policy for credit rollovers", audience: "All users", status: "published" as Status, scheduledFor: ago(8600), createdBy: "finance.admin@veytrix.io", message: "Unused credits now roll over for 60 days on annual plans." },
  { id: "ann_38", title: "Beta: workspace-level credit budgets", audience: "Enterprise", status: "draft" as Status, scheduledFor: ago(-10080), createdBy: "j.brandt@veytrix.io", message: "Set hard and soft credit ceilings per workspace with alerting." },
  { id: "ann_37", title: "Legacy Pro plan sunset notice", audience: "Legacy Pro", status: "archived" as Status, scheduledFor: ago(40000), createdBy: "root@veytrix.io", message: "Legacy Pro will be retired on 2026-12-01. Migration credits provided." },
];

export const featureFlags = [
  { id: "flg_1", key: "new_ai_model", name: "New AI Model", description: "Routes eligible traffic to veytrix-text-4.2.1.", enabled: true, environment: "Production", rollout: 65, audience: "Growth + Scale", updatedAt: ago(320) },
  { id: "flg_2", key: "voice_generation", name: "Voice Generation", description: "Exposes veytrix-voice-1 endpoints in the customer portal.", enabled: true, environment: "Production", rollout: 100, audience: "All users", updatedAt: ago(2200) },
  { id: "flg_3", key: "beta_dashboard", name: "Beta Dashboard", description: "New analytics dashboard with per-workspace breakdowns.", enabled: false, environment: "Staging", rollout: 20, audience: "Internal", updatedAt: ago(880) },
  { id: "flg_4", key: "experimental_features", name: "Experimental Features", description: "Master switch for all unreleased surfaces.", enabled: false, environment: "Development", rollout: 5, audience: "Veytrix staff", updatedAt: ago(5400) },
  { id: "flg_5", key: "credit_budgets", name: "Workspace Credit Budgets", description: "Hard and soft credit ceilings per workspace.", enabled: true, environment: "Staging", rollout: 40, audience: "Enterprise", updatedAt: ago(120) },
];

export const backups = Array.from({ length: 18 }, (_, i) => ({
  id: `bkp_${(20000 + i * 29).toString(36).toUpperCase()}`,
  type: pick(["Database", "Storage", "Configuration"]),
  scope: pick(["Full", "Incremental", "Snapshot"]),
  size: `${(rnd() * 90 + 2).toFixed(1)} GB`,
  status: pick<Status>(["completed", "completed", "completed", "running", "failed"]),
  startedAt: ago(int(60, 30000)),
  durationMs: int(40000, 900000),
  retention: pick(["7 days", "30 days", "90 days", "1 year"]),
  location: pick(["us-east-1", "eu-west-1", "ap-south-1"]),
}));

// ---------- chart series ----------
export const revenueSeries = Array.from({ length: 12 }, (_, i) => ({
  month: ["Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug"][i]!,
  mrr: 182000 + i * 11400 + int(-6000, 9000),
  expansion: 14000 + i * 1600 + int(-2000, 3000),
  churn: 9000 + int(-2500, 4200),
}));

export const userGrowthSeries = Array.from({ length: 12 }, (_, i) => ({
  month: ["Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug"][i]!,
  active: 21000 + i * 1850 + int(-800, 1400),
  signups: 1400 + i * 130 + int(-260, 420),
}));

export const jobActivitySeries = Array.from({ length: 24 }, (_, i) => ({
  hour: `${String(i).padStart(2, "0")}:00`,
  completed: 800 + Math.round(Math.sin(i / 3.4) * 420) + int(-90, 140),
  failed: 20 + int(0, 46),
  queued: 40 + int(0, 130),
}));

export const latencySeries = Array.from({ length: 24 }, (_, i) => ({
  hour: `${String(i).padStart(2, "0")}:00`,
  p50: 120 + int(-20, 40),
  p95: 380 + int(-60, 180),
  p99: 720 + int(-120, 420),
}));

export const modelMixSeries = models.map((m) => ({ name: m.name, value: m.jobs24h }));

export const creditsSeries = Array.from({ length: 12 }, (_, i) => ({
  month: ["Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug"][i]!,
  purchased: 900000 + i * 42000 + int(-30000, 50000),
  consumed: 760000 + i * 46000 + int(-30000, 60000),
}));

export const queue = {
  depth: 342,
  running: 58,
  retrying: 17,
  deadLetter: 6,
  oldestWaitSec: 94,
  throughputPerMin: 1240,
  workers: 48,
  workersHealthy: 45,
};

export const kpis = {
  activeUsers: 34218,
  activeUsersDelta: 4.8,
  signups: 1842,
  signupsDelta: 12.3,
  revenue: 318420,
  revenueDelta: 6.1,
  aiJobs: 71892,
  aiJobsDelta: 9.4,
  failedJobs: 486,
  failedJobsDelta: -14.2,
  queueDepth: queue.depth,
  queueDelta: 2.7,
};

export const settingsSections = [
  {
    id: "general",
    title: "General",
    fields: [
      { key: "platform_name", label: "Platform name", type: "text", value: "Veytrix" },
      { key: "support_email", label: "Support email", type: "text", value: "support@veytrix.io" },
      { key: "default_timezone", label: "Default timezone", type: "select", value: "UTC", options: ["UTC", "Europe/Berlin", "America/New_York", "Asia/Kolkata"] },
      { key: "public_status_page", label: "Public status page", type: "toggle", value: true },
    ],
  },
  {
    id: "security",
    title: "Security",
    fields: [
      { key: "enforce_2fa", label: "Enforce 2FA for admins", type: "toggle", value: true },
      { key: "session_timeout", label: "Session timeout (minutes)", type: "text", value: "45" },
      { key: "ip_allowlist", label: "Admin IP allowlist", type: "toggle", value: false },
      { key: "password_policy", label: "Password policy", type: "select", value: "Strong", options: ["Standard", "Strong", "Paranoid"] },
    ],
  },
  {
    id: "ai",
    title: "AI",
    fields: [
      { key: "default_model", label: "Default model", type: "select", value: "veytrix-text-4", options: ["veytrix-text-4", "veytrix-vision-2", "veytrix-voice-1"] },
      { key: "max_concurrency", label: "Max concurrency per tenant", type: "text", value: "24" },
      { key: "auto_retry", label: "Auto-retry failed jobs", type: "toggle", value: true },
      { key: "content_filter", label: "Content policy filter", type: "toggle", value: true },
    ],
  },
  {
    id: "email",
    title: "Email",
    fields: [
      { key: "provider", label: "Provider", type: "select", value: "Postmark", options: ["Postmark", "SES", "Sendgrid"] },
      { key: "from_address", label: "From address", type: "text", value: "no-reply@veytrix.io" },
      { key: "digest", label: "Weekly ops digest", type: "toggle", value: true },
    ],
  },
  {
    id: "payments",
    title: "Payments",
    fields: [
      { key: "currency", label: "Base currency", type: "select", value: "USD", options: ["USD", "EUR", "GBP"] },
      { key: "dunning", label: "Automatic dunning", type: "toggle", value: true },
      { key: "grace_days", label: "Grace period (days)", type: "text", value: "7" },
    ],
  },
  {
    id: "storage",
    title: "Storage",
    fields: [
      { key: "region", label: "Primary region", type: "select", value: "us-east-1", options: ["us-east-1", "eu-west-1", "ap-south-1"] },
      { key: "retention", label: "Artifact retention (days)", type: "text", value: "90" },
      { key: "encryption", label: "Encrypt at rest", type: "toggle", value: true },
    ],
  },
  {
    id: "notifications",
    title: "Notifications",
    fields: [
      { key: "pager", label: "Page on critical incidents", type: "toggle", value: true },
      { key: "slack", label: "Slack channel", type: "text", value: "#veytrix-ops" },
      { key: "threshold", label: "Error-rate alert threshold (%)", type: "text", value: "2.5" },
    ],
  },
  {
    id: "maintenance",
    title: "Maintenance",
    fields: [
      { key: "maintenance_mode", label: "Maintenance mode", type: "toggle", value: false },
      { key: "banner", label: "Maintenance banner text", type: "text", value: "Scheduled maintenance in progress." },
      { key: "read_only", label: "Read-only mode", type: "toggle", value: false },
    ],
  },
] as const;

export const emailHistory = Array.from({ length: 24 }, (_, i) => ({
  id: `eml_${800 + i}`,
  to: pick(users).email,
  subject: pick(["Password reset", "Invoice INV-2026-1288", "Your job has completed", "Credit balance low", "Welcome to Veytrix", "Ticket updated"]),
  template: pick(["auth.reset", "billing.invoice", "jobs.completed", "credits.low", "onboarding.welcome", "support.update"]),
  status: pick<Status>(["success", "success", "success", "pending", "failed"]),
  opens: int(0, 4),
  sentAt: ago(int(5, 20000)),
}));
