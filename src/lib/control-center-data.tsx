import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export type Status = string;

export interface User {
  id: string;
  name: string;
  email: string;
  plan: string;
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

export interface CreditTx {
  id: string;
  user: string;
  type: "purchase" | "consumption" | "refund" | "grant";
  amount: number;
  balance: number;
  reference: string;
  date: string;
}

export interface Ticket {
  id: string;
  subject: string;
  user: string;
  priority: string;
  status: Status;
  agent: string;
  category: string;
  createdAt: string;
  updatedAt: string;
  messages: { author: string; role: string; body: string; at: string }[];
  notes: { author: string; body: string; at: string }[];
}

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

type Model = {
  id: string;
  name: string;
  family: string;
  versions: string[];
  status: Status;
  latencyMs: number;
  costPer1k: number;
  jobs24h: number;
  errorRate: number;
};
type Plan = {
  id: string;
  name: string;
  description: string;
  price: number;
  cycle: string;
  users: number;
  status: Status;
  credits: number;
  features: string[];
};
type Activity = { id: string; actor: string; action: string; at: string; channel: string };
type Series = Record<string, string | number>;
type DbRow = Record<string, unknown>;
type QueryResult = { data: DbRow[] | null; error: Error | null };
type QueryBuilder = {
  select: (columns: string) => QueryBuilder;
  order: (column: string, options: { ascending: boolean }) => Promise<QueryResult>;
};
type DbClient = { from: (table: string) => QueryBuilder };
type Session = {
  id: string;
  user: string;
  ip: string;
  device: string;
  location: string;
  status: Status;
  startedAt: string;
  lastSeen: string;
};
type Feedback = {
  id: string;
  user: string;
  type: string;
  sentiment: string;
  score: number;
  title: string;
  votes: number;
  status: Status;
  createdAt: string;
};
type Announcement = {
  id: string;
  title: string;
  audience: string;
  status: Status;
  scheduledFor: string;
  createdBy: string;
  message: string;
};
type FeatureFlag = {
  id: string;
  key: string;
  name: string;
  description: string;
  enabled: boolean;
  environment: string;
  rollout: number;
  audience: string;
  updatedAt: string;
};
type Backup = {
  id: string;
  type: string;
  scope: string;
  size: string;
  status: Status;
  startedAt: string;
  durationMs: number;
  retention: string;
  location: string;
};
type EmailHistory = {
  id: string;
  to: string;
  subject: string;
  template: string;
  status: Status;
  opens: number;
  sentAt: string;
};
type Role = {
  id: string;
  name: string;
  description: string;
  members: number;
  scope: string;
  system: boolean;
};
type PermissionGroup = { group: string; keys: string[] };
type Incident = {
  id: string;
  title: string;
  service: string;
  impact: string;
  resolvedAt: string | null;
  startedAt: string;
  severity: Status;
};
type Service = {
  id: string;
  name: string;
  category: string;
  region: string;
  status: Status;
  responseMs: number;
  uptime: number;
  incidents: number;
  lastChecked: string;
};
type SettingsSection = {
  id: string;
  title: string;
  fields: {
    key: string;
    label: string;
    type: string;
    value: string | boolean;
    options?: string[];
  }[];
};
type Queue = {
  depth: number;
  running: number;
  retrying: number;
  deadLetter: number;
  oldestWaitSec: number;
  throughputPerMin: number;
  workers: number;
  workersHealthy: number;
};
type Kpis = {
  activeUsers: number;
  signups: number;
  revenue: number;
  aiJobs: number;
  failedJobs: number;
  activeUsersDelta?: number;
  signupsDelta?: number;
  revenueDelta?: number;
  aiJobsDelta?: number;
  failedJobsDelta?: number;
  queueDelta?: number;
};

export const EMPTY_DATA = {
  users: [] as User[],
  jobs: [] as Job[],
  transactions: [] as Transaction[],
  creditTransactions: [] as CreditTx[],
  auditLogs: [] as AuditLog[],
  logs: [] as LogEntry[],
  models: [] as Model[],
  plans: [] as Plan[],
  activity: [] as Activity[],
  sessions: [] as Session[],
  tickets: [] as Ticket[],
  feedback: [] as Feedback[],
  announcements: [] as Announcement[],
  featureFlags: [] as FeatureFlag[],
  backups: [] as Backup[],
  revenueSeries: [] as Series[],
  userGrowthSeries: [] as Series[],
  jobActivitySeries: [] as Series[],
  latencySeries: [] as Series[],
  modelMixSeries: [] as Series[],
  creditsSeries: [] as Series[],
  emailHistory: [] as EmailHistory[],
  roles: [] as Role[],
  permissionGroups: [] as PermissionGroup[],
  permissionMatrix: {} as Record<string, string[]>,
  incidents: [] as Incident[],
  services: [] as Service[],
  settingsSections: [] as SettingsSection[],
  queue: null as Queue | null,
  kpis: null as Kpis | null,
};

function numberValue(value: unknown) {
  return typeof value === "number" ? value : Number(value ?? 0);
}

function stringValue(value: unknown, fallback = "Not configured") {
  return typeof value === "string" && value.length > 0 ? value : fallback;
}

async function loadData() {
  if (!supabase) return EMPTY_DATA;
  const client = supabase as unknown as DbClient;

  const [
    usersResult,
    plansResult,
    subscriptionsResult,
    transactionsResult,
    jobsResult,
    usageResult,
    auditsResult,
  ] = await Promise.all([
    client.from("users").select("*").order("created_at", { ascending: false }),
    client.from("plans").select("*").order("created_at", { ascending: false }),
    client.from("subscriptions").select("*").order("created_at", { ascending: false }),
    client.from("transactions").select("*").order("created_at", { ascending: false }),
    client.from("ai_jobs").select("*").order("created_at", { ascending: false }),
    client.from("ai_usage").select("*").order("usage_date", { ascending: true }),
    client.from("audit_logs").select("*").order("created_at", { ascending: false }),
  ]);
  const firstError = [
    usersResult,
    plansResult,
    subscriptionsResult,
    transactionsResult,
    jobsResult,
    usageResult,
    auditsResult,
  ].find((result) => result.error)?.error;
  if (firstError) throw firstError;

  const users: User[] = ((usersResult.data ?? []) as DbRow[]).map((row) => {
    const metadata =
      row.metadata && typeof row.metadata === "object" && !Array.isArray(row.metadata)
        ? (row.metadata as Record<string, unknown>)
        : {};
    const plan = typeof metadata.plan === "string" ? metadata.plan : "Not configured";
    return {
      id: stringValue(row.id, ""),
      name: stringValue(row.full_name, stringValue(row.email)),
      email: stringValue(row.email, ""),
      plan,
      credits: numberValue(metadata.credits),
      usage: numberValue(metadata.usage),
      status: stringValue(row.status),
      role: typeof metadata.role === "string" ? metadata.role : "Not configured",
      country: stringValue(row.country),
      twoFactor: metadata.two_factor === true,
      lastLogin: typeof metadata.last_login === "string" ? metadata.last_login : "",
      createdAt: stringValue(row.created_at, ""),
      mrr: numberValue(metadata.mrr),
    };
  });
  const userById = new Map(users.map((user) => [user.id, user]));
  const subscriptions = subscriptionsResult.data ?? [];
  const plans: Plan[] = ((plansResult.data ?? []) as DbRow[]).map((row) => {
    const limits =
      row.limits && typeof row.limits === "object" && !Array.isArray(row.limits)
        ? (row.limits as Record<string, unknown>)
        : {};
    const features = Array.isArray(row.features)
      ? row.features.filter((item): item is string => typeof item === "string")
      : [];
    return {
      id: stringValue(row.id, ""),
      name: stringValue(row.name, ""),
      description: stringValue(row.description, ""),
      price: numberValue(row.price),
      cycle: stringValue(row.billing_interval),
      users: subscriptions.filter((subscription: DbRow) => subscription.plan_id === row.id).length,
      status: row.is_active ? "active" : "archived",
      credits: numberValue(limits.credits),
      features,
    };
  });
  const transactions: Transaction[] = ((transactionsResult.data ?? []) as DbRow[]).map((row) => ({
    id: stringValue(row.id, ""),
    user: userById.get(stringValue(row.user_id, ""))?.email || "Not configured",
    plan: userById.get(stringValue(row.user_id, ""))?.plan || "Not configured",
    amount: numberValue(row.amount),
    method: "Not configured",
    status: stringValue(row.status),
    date: stringValue(row.created_at, ""),
    invoice: stringValue(row.external_reference),
  }));
  const jobs: Job[] = ((jobsResult.data ?? []) as DbRow[]).map((row) => ({
    id: stringValue(row.id, ""),
    user: userById.get(stringValue(row.user_id, ""))?.email || "Not configured",
    userId: stringValue(row.user_id, ""),
    model: stringValue(row.model),
    version: "Not configured",
    status: row.status === "processing" ? "running" : stringValue(row.status),
    tokens: numberValue(row.total_tokens),
    credits: numberValue(row.estimated_cost),
    startedAt: stringValue(row.started_at, stringValue(row.created_at, "")),
    completedAt: typeof row.completed_at === "string" ? row.completed_at : null,
    durationMs:
      typeof row.started_at === "string" && typeof row.completed_at === "string"
        ? Math.max(0, new Date(row.completed_at).getTime() - new Date(row.started_at).getTime())
        : 0,
    failureReason: typeof row.error_message === "string" ? row.error_message : null,
    region: "Not configured",
  }));
  const auditLogs: AuditLog[] = ((auditsResult.data ?? []) as DbRow[]).map((row) => ({
    id: stringValue(row.id, ""),
    timestamp: stringValue(row.created_at, ""),
    actor: row.actor_user_id
      ? userById.get(stringValue(row.actor_user_id, ""))?.email || "Not configured"
      : "System",
    action: stringValue(row.action),
    resource: stringValue(row.entity_type),
    resourceId: stringValue(row.entity_id),
    ip: stringValue(row.ip_address),
    device: stringValue(row.user_agent),
    result: "success" as const,
    metadata:
      row.metadata && typeof row.metadata === "object" && !Array.isArray(row.metadata)
        ? (Object.fromEntries(Object.entries(row.metadata)) as Record<string, string>)
        : {},
  }));
  const usage: DbRow[] = usageResult.data ?? [];
  const revenueSeries = transactions.reduce<Series[]>((series, transaction) => {
    const month = transaction.date.slice(0, 7);
    const current = series.find((item) => item.month === month);
    if (current) current.mrr = numberValue(current.mrr) + transaction.amount;
    else series.push({ month, mrr: transaction.amount });
    return series;
  }, []);
  const userGrowthSeries = users.reduce<Series[]>((series, user) => {
    const month = user.createdAt.slice(0, 7);
    const current = series.find((item) => item.month === month);
    if (current) current.signups = numberValue(current.signups) + 1;
    else series.push({ month, signups: 1 });
    return series;
  }, []);
  const modelMixSeries = usage.reduce<Series[]>((series, row) => {
    const model = stringValue(row.model);
    const current = series.find((item) => item.name === model);
    if (current) current.value = numberValue(current.value) + numberValue(row.request_count);
    else series.push({ name: model, value: numberValue(row.request_count) });
    return series;
  }, []);

  const revenue = transactions
    .filter((transaction) => transaction.status === "completed")
    .reduce((total, transaction) => total + transaction.amount, 0);
  const kpis: Kpis | null =
    users.length || jobs.length || transactions.length
      ? {
          activeUsers: users.filter((user) => user.status === "active").length,
          signups: users.length,
          revenue,
          aiJobs: jobs.length,
          failedJobs: jobs.filter((job) => job.status === "failed").length,
        }
      : null;
  return {
    ...EMPTY_DATA,
    users,
    plans,
    transactions,
    jobs,
    auditLogs,
    revenueSeries,
    userGrowthSeries,
    modelMixSeries,
    kpis,
  };
}

export function useControlCenterData() {
  const query = useQuery({
    queryKey: ["control-center-data"],
    queryFn: loadData,
    staleTime: 30_000,
  });
  return {
    ...(query.data ?? EMPTY_DATA),
    isLoading: query.isLoading,
    error: query.error,
    isConfigured: Boolean(supabase),
    refetch: query.refetch,
  };
}

export function fmtDate(iso: string) {
  return iso ? new Date(iso).toISOString().slice(0, 10) : "Not configured";
}
export function fmtDateTime(iso: string) {
  return iso ? new Date(iso).toISOString().replace("T", " ").slice(0, 19) + "Z" : "Not configured";
}
export function relative(iso: string) {
  return iso
    ? new Intl.RelativeTimeFormat("en", { numeric: "auto" }).format(
        Math.round((new Date(iso).getTime() - Date.now()) / 60000),
        "minute",
      )
    : "Not configured";
}
export function money(value: number, currency = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(value);
}
export function compact(value: number) {
  return new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(
    value,
  );
}
