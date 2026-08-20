import {
  Activity,
  BarChart3,
  Bell,
  Boxes,
  CircleDollarSign,
  Coins,
  CreditCard,
  FileClock,
  FileText,
  Flag,
  Gauge,
  HardDriveDownload,
  KeyRound,
  LayoutDashboard,
  LifeBuoy,
  MessageSquare,
  MonitorCog,
  Radar,
  ScrollText,
  Settings,
  ShieldCheck,
  Users,
  Waypoints,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface NavItem {
  label: string;
  to: string;
  icon: LucideIcon;
  badge?: string;
}

export interface NavSection {
  title: string;
  items: NavItem[];
}

export const navSections: NavSection[] = [
  {
    title: "Main",
    items: [
      { label: "Dashboard", to: "/", icon: LayoutDashboard },
      { label: "System Health", to: "/system-health", icon: Gauge, badge: "2" },
      { label: "Monitoring", to: "/monitoring", icon: Radar },
      { label: "Logs", to: "/logs", icon: ScrollText },
    ],
  },
  {
    title: "Management",
    items: [
      { label: "Users", to: "/users", icon: Users },
      { label: "Activity", to: "/activity", icon: Activity },
      { label: "Sessions", to: "/sessions", icon: MonitorCog },
      { label: "Models", to: "/models", icon: Boxes },
      { label: "Jobs", to: "/jobs", icon: Waypoints, badge: "58" },
      { label: "Analytics", to: "/analytics", icon: BarChart3 },
    ],
  },
  {
    title: "Billing",
    items: [
      { label: "Plans", to: "/plans", icon: CircleDollarSign },
      { label: "Transactions", to: "/transactions", icon: CreditCard },
      { label: "Credits", to: "/credits", icon: Coins },
    ],
  },
  {
    title: "Support",
    items: [
      { label: "Tickets", to: "/tickets", icon: LifeBuoy, badge: "12" },
      { label: "Feedback", to: "/feedback", icon: MessageSquare },
    ],
  },
  {
    title: "Security",
    items: [
      { label: "Roles", to: "/roles", icon: ShieldCheck },
      { label: "Permissions", to: "/permissions", icon: KeyRound },
      { label: "Audit Logs", to: "/audit-logs", icon: FileClock },
    ],
  },
  {
    title: "System",
    items: [
      { label: "Announcements", to: "/announcements", icon: Bell },
      { label: "Platform Settings", to: "/settings", icon: Settings },
      { label: "Feature Flags", to: "/feature-flags", icon: Flag },
      { label: "Backups", to: "/backups", icon: HardDriveDownload },
    ],
  },
];

export const allNavItems: NavItem[] = navSections.flatMap((s) => s.items);
export const docsIcon = FileText;
