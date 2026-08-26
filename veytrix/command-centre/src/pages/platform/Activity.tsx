import React from 'react';
import { Activity as ActivityIcon, UserPlus, LogIn, FolderPlus, CreditCard, ShieldAlert } from 'lucide-react';
import { StatCard } from '../../components/ui/StatCard';

const activityTimeline = [
  { id: 1, type: 'registration', user: 'alice@example.com', time: '10 mins ago', desc: 'New user registration', icon: UserPlus, color: 'text-green-600 bg-green-100' },
  { id: 2, type: 'login', user: 'bob@example.com', time: '15 mins ago', desc: 'Successful login', icon: LogIn, color: 'text-blue-600 bg-blue-100' },
  { id: 3, type: 'project', user: 'charlie@example.com', time: '1 hour ago', desc: 'Created new project "AI Dashboard"', icon: FolderPlus, color: 'text-purple-600 bg-purple-100' },
  { id: 4, type: 'billing', user: 'diana@example.com', time: '2 hours ago', desc: 'Upgraded to Premium plan', icon: CreditCard, color: 'text-orange-600 bg-orange-100' },
  { id: 5, type: 'security', user: 'eve@example.com', time: '5 hours ago', desc: 'Failed login attempt (IP: 192.168.1.5)', icon: ShieldAlert, color: 'text-red-600 bg-red-100' },
];

export const Activity = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-[#1D2B64]">Platform Activity</h1>
        <p className="text-sm text-[#64748B] mt-1">Real-time feed of user interactions across the platform.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <StatCard title="Events (24h)" value="15.2k" icon={ActivityIcon} trend={{ value: 12, isPositive: true }} />
        <StatCard title="Signups (24h)" value="142" icon={UserPlus} trend={{ value: 5, isPositive: true }} />
        <StatCard title="Logins (24h)" value="8.5k" icon={LogIn} trend={{ value: 2, isPositive: true }} />
        <StatCard title="Security Events" value="23" icon={ShieldAlert} trend={{ value: 15, isPositive: false }} />
      </div>

      <div className="bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-sm">
        <h3 className="font-bold text-[#1D2B64] mb-6">Activity Timeline</h3>
        <div className="space-y-8">
          {activityTimeline.map((item, idx) => (
            <div key={item.id} className="relative flex items-start gap-4">
              {idx !== activityTimeline.length - 1 && (
                <div className="absolute top-10 left-6 bottom-[-2rem] w-px bg-[#E2E8F0]"></div>
              )}
              <div className={`p-3 rounded-full flex-shrink-0 z-10 ${item.color}`}>
                <item.icon size={20} />
              </div>
              <div className="flex-1 pt-2">
                <p className="text-sm font-bold text-[#1D2B64]">{item.desc}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs font-semibold text-[#3B6CE7]">{item.user}</span>
                  <span className="text-[10px] text-[#94A3B8]">• {item.time}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
