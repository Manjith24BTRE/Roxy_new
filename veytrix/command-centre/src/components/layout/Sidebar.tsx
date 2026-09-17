import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, Activity, HeartPulse, ScrollText, 
  Users, UserCircle, Key, ShieldAlert,
  BrainCircuit, Database, LineChart, 
  CreditCard, Banknote, Coins,
  Ticket, MessageSquare, Megaphone, Settings, ToggleLeft, Save
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

const navGroups = [
  {
    title: 'OPERATIONS',
    items: [
      { label: 'Dashboard', path: '/command-centre/dashboard', icon: LayoutDashboard },
      { label: 'System Health', path: '/command-centre/system-health', icon: HeartPulse },
      { label: 'Monitoring', path: '/command-centre/monitoring', icon: Activity },
      { label: 'Logs', path: '/command-centre/logs', icon: ScrollText },
    ]
  },
  {
    title: 'PLATFORM',
    items: [
      { label: 'Users', path: '/command-centre/users', icon: Users },
      { label: 'Activity', path: '/command-centre/activity', icon: Activity },
      { label: 'Sessions', path: '/command-centre/sessions', icon: UserCircle },
    ]
  },
  {
    title: 'AI OPERATIONS',
    items: [
      { label: 'Models', path: '/command-centre/models', icon: BrainCircuit },
      { label: 'Jobs', path: '/command-centre/jobs', icon: Database },
      { label: 'Analytics', path: '/command-centre/analytics', icon: LineChart },
    ]
  },
  {
    title: 'BILLING',
    items: [
      { label: 'Plans', path: '/command-centre/plans', icon: CreditCard },
      { label: 'Transactions', path: '/command-centre/transactions', icon: Banknote },
      { label: 'Credits', path: '/command-centre/credits', icon: Coins },
    ]
  },
  {
    title: 'SUPPORT',
    items: [
      { label: 'Tickets', path: '/command-centre/tickets', icon: Ticket },
      { label: 'Feedback', path: '/command-centre/feedback', icon: MessageSquare },
    ]
  },
  {
    title: 'ACCESS CONTROL',
    items: [
      { label: 'Roles', path: '/command-centre/roles', icon: Users },
      { label: 'Permissions', path: '/command-centre/permissions', icon: Key },
      { label: 'Audit Logs', path: '/command-centre/audit-logs', icon: ShieldAlert },
    ]
  },
  {
    title: 'PLATFORM MANAGEMENT',
    items: [
      { label: 'Announcements', path: '/command-centre/announcements', icon: Megaphone },
      { label: 'Platform Settings', path: '/command-centre/platform-settings', icon: Settings },
      { label: 'Feature Flags', path: '/command-centre/feature-flags', icon: ToggleLeft },
      { label: 'Backups', path: '/command-centre/backups', icon: Save },
    ]
  }
];

export const Sidebar = ({ isOpen }: { isOpen: boolean }) => {
  return (
    <aside className={cn(
      "fixed inset-y-0 left-0 z-40 w-64 bg-[#0A102A] text-[#8695C3] border-r border-[#1D2B64] flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 overflow-hidden",
      isOpen ? "translate-x-0" : "-translate-x-full"
    )}>
      <div className="h-16 flex items-center px-6 border-b border-[#1D2B64]">
        <h1 className="text-white font-bold text-lg tracking-wide flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-gradient-to-tr from-[#3B6CE7] to-[#8E54E9] flex items-center justify-center">
            <span className="text-white text-xs font-black">V</span>
          </div>
          Veytrix Control
        </h1>
      </div>

      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6 scrollbar-thin scrollbar-thumb-[#1D2B64] scrollbar-track-transparent">
        {navGroups.map((group) => (
          <div key={group.title}>
            <h3 className="px-3 text-[10px] font-bold uppercase tracking-wider text-[#4E6297] mb-2">
              {group.title}
            </h3>
            <ul className="space-y-0.5">
              {group.items.map((item) => (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    className={({ isActive }) => cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition-colors duration-200",
                      isActive 
                        ? "bg-[#1D2B64] text-white" 
                        : "hover:bg-[#1D2B64]/50 hover:text-white"
                    )}
                  >
                    <item.icon size={16} />
                    {item.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </aside>
  );
};
