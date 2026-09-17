import React, { useState, useEffect, useMemo } from 'react';
import { activityService, ActivityEvent, ActivityMetrics } from '../../services/activityService';
import { StatCard } from '../../components/ui/StatCard';
import { Activity as ActivityIcon, UserPlus, LogIn, FolderPlus, CreditCard, ShieldAlert, RefreshCw, Terminal, Monitor, Server } from 'lucide-react';

export const Activity = () => {
  const [events, setEvents] = useState<ActivityEvent[]>([]);
  const [metrics, setMetrics] = useState<ActivityMetrics>({
    events24h: 0,
    signups24h: 0,
    logins24h: 0,
    securityEvents: 0,
  });
  const [categoryFilter, setCategoryFilter] = useState<'All' | 'Users' | 'Projects' | 'Billing' | 'Security' | 'System'>('All');
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    setIsLoading(true);
    const [m, timeline] = await Promise.all([
      activityService.getActivityMetrics(),
      activityService.getActivityTimeline(),
    ]);
    setMetrics(m);
    setEvents(timeline);
    setIsLoading(false);
  };

  useEffect(() => {
    loadData();

    // Subscribe to real-time activity stream
    const unsubscribe = activityService.subscribeToActivityStream((newEvent) => {
      setEvents((prev) => [newEvent, ...prev]);
      setMetrics((prev) => ({
        ...prev,
        events24h: prev.events24h + 1,
        signups24h: newEvent.event_type === 'signup' ? prev.signups24h + 1 : prev.signups24h,
        logins24h: newEvent.event_type === 'login' ? prev.logins24h + 1 : prev.logins24h,
        securityEvents: ['failed_login', 'permission_denied', 'account_locked'].includes(newEvent.event_type)
          ? prev.securityEvents + 1
          : prev.securityEvents,
      }));
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const filteredEvents = useMemo(() => {
    if (categoryFilter === 'All') return events;
    return events.filter((e) => e.event_category === categoryFilter);
  }, [events, categoryFilter]);

  const getEventIcon = (category: string, type: string) => {
    if (category === 'Users') return UserPlus;
    if (category === 'Projects') return FolderPlus;
    if (category === 'Billing') return CreditCard;
    if (category === 'Security') return ShieldAlert;
    if (type === 'login') return LogIn;
    return ActivityIcon;
  };

  const getEventColor = (category: string) => {
    if (category === 'Users') return 'text-emerald-600 bg-emerald-50 border-emerald-200';
    if (category === 'Projects') return 'text-blue-600 bg-blue-50 border-blue-200';
    if (category === 'Billing') return 'text-purple-600 bg-purple-50 border-purple-200';
    if (category === 'Security') return 'text-red-600 bg-red-50 border-red-200';
    return 'text-slate-600 bg-slate-50 border-slate-200';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-[#1D2B64]">Platform Activity</h1>
            <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 animate-pulse">
              <ActivityIcon size={12} /> REALTIME STREAM ACTIVE
            </span>
          </div>
          <p className="text-sm text-[#64748B] mt-1">Real-time database feed of user actions, project events, and security telemetry.</p>
        </div>

        <button
          onClick={loadData}
          className="flex items-center gap-2 border border-[#E2E8F0] px-3.5 py-2 rounded-xl text-xs font-semibold text-[#64748B] hover:bg-white transition cursor-pointer"
        >
          <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Real Database Metric Cards (No Mock Values) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-4">
        <StatCard title="Events (24h)" value={metrics.events24h.toLocaleString()} icon={ActivityIcon} />
        <StatCard title="Signups (24h)" value={metrics.signups24h.toLocaleString()} icon={UserPlus} />
        <StatCard title="Logins (24h)" value={metrics.logins24h.toLocaleString()} icon={LogIn} />
        <StatCard title="Security Events" value={metrics.securityEvents.toLocaleString()} icon={ShieldAlert} />
      </div>

      {/* Category Filter Tabs */}
      <div className="flex items-center bg-[#F1F5F9] p-1.5 rounded-2xl gap-1.5 text-xs font-semibold max-w-fit">
        {(['All', 'Users', 'Projects', 'Billing', 'Security', 'System'] as const).map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setCategoryFilter(cat)}
            className={`px-4 py-1.5 rounded-xl transition cursor-pointer ${
              categoryFilter === cat
                ? 'bg-white text-[#1D2B64] shadow-sm font-bold'
                : 'text-[#64748B] hover:text-[#1D2B64]'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Real Activity Timeline */}
      <div className="bg-white p-6 rounded-3xl border border-[#E2E8F0] shadow-sm">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#E2E8F0]">
          <h3 className="font-extrabold text-[#1D2B64] text-base">Live Activity Timeline</h3>
          <span className="text-xs text-[#64748B] font-mono font-semibold">{filteredEvents.length} events recorded</span>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-48 text-[#64748B] font-semibold text-xs gap-2">
            <RefreshCw className="animate-spin" size={16} />
            <span>Fetching real-time activity from database...</span>
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="p-12 text-center max-w-md mx-auto my-6 space-y-3">
            <Terminal className="mx-auto text-[#64748B]" size={40} />
            <h4 className="font-bold text-[#1D2B64] text-lg">No platform activity found</h4>
            <p className="text-xs text-[#64748B]">
              Real user interactions, project updates, and system events will stream here automatically.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredEvents.map((item, idx) => {
              const IconComp = getEventIcon(item.event_category, item.event_type);
              const colorClasses = getEventColor(item.event_category);

              return (
                <div key={item.id} className="relative flex items-start gap-4 group">
                  {idx !== filteredEvents.length - 1 && (
                    <div className="absolute top-10 left-5 bottom-[-1.5rem] w-px bg-[#E2E8F0]"></div>
                  )}

                  <div className={`p-2.5 rounded-2xl border flex-shrink-0 z-10 ${colorClasses}`}>
                    <IconComp size={18} />
                  </div>

                  <div className="flex-1 pt-1 bg-slate-50/50 p-3.5 rounded-2xl border border-slate-100 group-hover:border-slate-200 transition">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-bold text-[#1D2B64]">{item.event_title}</p>
                      <span className="text-[11px] font-mono text-[#94A3B8]">
                        {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    {item.event_description && (
                      <p className="text-xs text-[#64748B] mt-1 font-medium">{item.event_description}</p>
                    )}

                    <div className="flex items-center gap-3 mt-2.5 pt-2 border-t border-slate-200/60 text-[11px]">
                      <span className="font-bold text-[#3B6CE7]">{item.user_name}</span>
                      <span className="text-[#94A3B8]">
                        {new Date(item.created_at).toLocaleDateString()}
                      </span>
                      <span className="px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider bg-white border border-[#E2E8F0] rounded-md text-[#1D2B64]">
                        {item.event_category}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Activity;
