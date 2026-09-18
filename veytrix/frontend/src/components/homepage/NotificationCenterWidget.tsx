import React, { useState, useEffect, useRef } from 'react';
import {
  Bell,
  CheckCircle,
  CheckCheck,
  RefreshCw,
  X,
  Megaphone,
  CreditCard,
  ShieldAlert,
  Wrench,
  ExternalLink,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import {
  unifiedNotificationService,
  UnifiedNotification,
} from '../../services/unifiedNotificationService';

export function NotificationCenterWidget() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<UnifiedNotification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  const loadNotifications = async (showLoading = false) => {
    if (showLoading) setIsLoading(true);
    const data = await unifiedNotificationService.getNotifications(user?.id);
    setNotifications(data);
    if (showLoading) setIsLoading(false);
  };

  useEffect(() => {
    loadNotifications(true);

    // Subscribe to Supabase Realtime across notifications, support_notifications, platform_announcements
    const unsubscribe = unifiedNotificationService.subscribeToNotifications(
      user?.id,
      () => {
        loadNotifications(false);
      }
    );

    // Close popover when clicking outside
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      unsubscribe();
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [user?.id]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleNotificationClick = async (n: UnifiedNotification, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!n.isRead) {
      await unifiedNotificationService.markAsRead(n.id, user?.id);
      setNotifications((prev) =>
        prev.map((item) => (item.id === n.id ? { ...item, isRead: true } : item))
      );
    }
    if (n.actionUrl) {
      if (n.actionUrl.startsWith('http')) {
        window.open(n.actionUrl, '_blank', 'noopener,noreferrer');
      } else {
        window.location.href = n.actionUrl;
      }
    }
  };

  const handleMarkAllRead = async () => {
    await unifiedNotificationService.markAllAsRead(notifications, user?.id);
    setNotifications((prev) => prev.map((item) => ({ ...item, isRead: true })));
  };

  const getTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'announcement':
        return <Megaphone className="w-4 h-4 text-[#3B6CE7]" />;
      case 'support_resolved':
        return <CheckCircle className="w-4 h-4 text-emerald-500" />;
      case 'credit_added':
      case 'credit_deducted':
        return <CreditCard className="w-4 h-4 text-purple-500" />;
      case 'security_alert':
        return <ShieldAlert className="w-4 h-4 text-red-500" />;
      case 'system_maintenance':
        return <Wrench className="w-4 h-4 text-amber-500" />;
      default:
        return <Sparkles className="w-4 h-4 text-blue-500" />;
    }
  };

  const formatRelativeTime = (isoString: string): string => {
    try {
      const now = new Date();
      const past = new Date(isoString);
      const diffSec = Math.floor((now.getTime() - past.getTime()) / 1000);

      if (diffSec < 60) return 'Just now';
      if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
      if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
      return `${Math.floor(diffSec / 86400)}d ago`;
    } catch {
      return '';
    }
  };

  return (
    <div className="relative inline-block" ref={containerRef}>
      {/* Bell Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="relative p-2 rounded-full text-[#1D2B64]/70 hover:text-[#1D2B64] hover:bg-[#1D2B64]/5 transition-colors focus:outline-none cursor-pointer"
        title="Notification Center"
        aria-label="Notification Center"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4.5 min-w-4.5 px-1 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-sm animate-pulse">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Popover Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 md:w-96 rounded-2xl bg-white border border-[#1D2B64]/10 shadow-2xl z-50 overflow-hidden flex flex-col max-h-[500px]">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-[#F8FAFC] border-b border-[#1D2B64]/5">
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-[#1D2B64]">Notifications</span>
              {unreadCount > 0 && (
                <span className="bg-[#E6F2F8] text-[#3B6CE7] px-2 py-0.5 rounded-full text-[10px] font-bold">
                  {unreadCount} new
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="text-xs text-[#3B6CE7] hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <CheckCheck size={14} /> Mark all read
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* List Content */}
          <div className="overflow-y-auto custom-scrollbar flex-1 divide-y divide-[#1D2B64]/5">
            {isLoading && notifications.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#64748B] flex items-center justify-center gap-2">
                <RefreshCw size={14} className="animate-spin text-[#3B6CE7]" /> Loading notifications...
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center flex flex-col items-center">
                <Bell size={32} className="text-[#3B6CE7]/30 mb-2" />
                <p className="text-xs font-semibold text-[#1D2B64]">All caught up!</p>
                <p className="text-[11px] text-[#64748B] mt-0.5">
                  Announcements, support updates, and alerts will appear here.
                </p>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={(e) => handleNotificationClick(n, e)}
                  className={`p-3.5 flex items-start gap-3 transition cursor-pointer ${
                    !n.isRead ? 'bg-[#E6F2F8]/30 hover:bg-[#E6F2F8]/60' : 'hover:bg-gray-50'
                  }`}
                >
                  {/* Category Icon */}
                  <div className="mt-0.5 p-2 rounded-xl bg-white border border-gray-100 shadow-sm flex-shrink-0">
                    {getTypeIcon(n.type)}
                  </div>

                  {/* Body Content */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-1 mb-0.5">
                      <span className="text-xs font-bold text-[#1D2B64] truncate leading-snug">
                        {n.title}
                      </span>
                      {!n.isRead && (
                        <span className="w-2 h-2 rounded-full bg-[#3B6CE7] flex-shrink-0 mt-1" />
                      )}
                    </div>

                    <p className="text-xs text-[#1D2B64]/80 leading-relaxed line-clamp-2">
                      {n.message}
                    </p>

                    <div className="mt-2 flex items-center justify-between text-[10px] text-[#64748B]">
                      <span>{formatRelativeTime(n.createdAt)}</span>

                      {n.actionUrl && (
                        <span className="text-[#3B6CE7] font-semibold flex items-center gap-0.5 hover:underline">
                          View details <ExternalLink size={10} />
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
