import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Megaphone, ChevronLeft, ChevronRight, X, ExternalLink, Flame, ShieldAlert, Sparkles, AlertTriangle, Info } from 'lucide-react';
import { userAnnouncementsService, UserAnnouncement } from '../../services/userAnnouncementsService';

export function HomeAnnouncementWidget() {
  const [announcements, setAnnouncements] = useState<UserAnnouncement[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());

  const loadAnnouncements = useCallback(async () => {
    const list = await userAnnouncementsService.getActiveAnnouncements();
    // Cap at maximum 5 visible
    setAnnouncements(list.slice(0, 5));
  }, []);

  useEffect(() => {
    loadAnnouncements();

    // Subscribe to Supabase Realtime changes
    const unsubscribe = userAnnouncementsService.subscribeToAnnouncements((updated) => {
      setAnnouncements(updated.slice(0, 5));
    });

    // Check expiration every 10 seconds
    const interval = setInterval(() => {
      loadAnnouncements();
    }, 10000);

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, [loadAnnouncements]);

  // Filter out dismissed items
  const activeList = useMemo(() => {
    return announcements.filter((a) => !dismissedIds.has(a.id));
  }, [announcements, dismissedIds]);

  // Handle current index bounds
  useEffect(() => {
    if (currentIndex >= activeList.length && activeList.length > 0) {
      setCurrentIndex(activeList.length - 1);
    }
  }, [activeList.length, currentIndex]);

  // Track impression on render
  const currentAnnouncement = activeList[currentIndex];
  useEffect(() => {
    if (currentAnnouncement?.id) {
      userAnnouncementsService.trackAnalytics(currentAnnouncement.id, 'viewed');
    }
  }, [currentAnnouncement?.id]);

  if (!currentAnnouncement || activeList.length === 0) {
    return null; // Hide widget completely if no active announcements exist
  }

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % activeList.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + activeList.length) % activeList.length);
  };

  const handleDismiss = (id: string) => {
    setDismissedIds((prev) => new Set([...prev, id]));
    userAnnouncementsService.trackAnalytics(id, 'dismissed');
  };

  const handleCtaClick = (a: UserAnnouncement) => {
    userAnnouncementsService.trackAnalytics(a.id, 'clicked');
    if (a.cta_url) {
      window.open(a.cta_url, '_blank', 'noopener,noreferrer');
    }
  };

  // Badge styling helpers
  const getPriorityStyle = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'critical':
        return 'bg-red-500/15 text-red-600 border-red-200 animate-pulse';
      case 'high':
        return 'bg-amber-500/15 text-amber-700 border-amber-200';
      case 'medium':
        return 'bg-blue-500/15 text-blue-700 border-blue-200';
      default:
        return 'bg-slate-500/15 text-slate-700 border-slate-200';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'offer':
      case 'promotion':
        return <Flame className="w-3.5 h-3.5 text-orange-500 mr-1" />;
      case 'feature release':
        return <Sparkles className="w-3.5 h-3.5 text-indigo-500 mr-1" />;
      case 'security alert':
        return <ShieldAlert className="w-3.5 h-3.5 text-red-500 mr-1" />;
      case 'maintenance':
      case 'system update':
        return <AlertTriangle className="w-3.5 h-3.5 text-amber-500 mr-1" />;
      default:
        return <Megaphone className="w-3.5 h-3.5 text-blue-500 mr-1" />;
    }
  };

  return (
    <div className="w-full md:max-w-md bg-white/90 backdrop-blur-md border border-[#1D2B64]/10 shadow-sm rounded-xl p-3.5 relative transition-all duration-300 hover:shadow-md flex-shrink-0 my-2 md:my-0">
      {/* Top Banner Row */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="flex items-center text-xs font-semibold text-[#1D2B64] bg-[#3B6CE7]/10 px-2 py-0.5 rounded-full border border-[#3B6CE7]/20">
            {getTypeIcon(currentAnnouncement.announcement_type)}
            {currentAnnouncement.announcement_type}
          </span>
          <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${getPriorityStyle(currentAnnouncement.priority)}`}>
            {currentAnnouncement.priority} Priority
          </span>
        </div>

        {/* Carousel & Dismiss Controls */}
        <div className="flex items-center gap-1 text-slate-400">
          {activeList.length > 1 && (
            <div className="flex items-center gap-0.5 mr-1">
              <button
                onClick={handlePrev}
                className="p-1 hover:text-[#1D2B64] hover:bg-slate-100 rounded-md transition-colors"
                title="Previous Announcement"
              >
                <ChevronLeft size={14} />
              </button>
              <span className="text-[11px] font-medium text-slate-500 px-1">
                {currentIndex + 1}/{activeList.length}
              </span>
              <button
                onClick={handleNext}
                className="p-1 hover:text-[#1D2B64] hover:bg-slate-100 rounded-md transition-colors"
                title="Next Announcement"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          )}
          <button
            onClick={() => handleDismiss(currentAnnouncement.id)}
            className="p-1 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
            title="Dismiss Announcement"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Main Announcement Content */}
      <div className="space-y-1">
        <h4 className="text-sm font-bold text-[#1D2B64] leading-snug flex items-center gap-1.5">
          {currentAnnouncement.title}
        </h4>
        <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
          {currentAnnouncement.message}
        </p>
      </div>

      {/* Footer & Action CTA */}
      {currentAnnouncement.cta_text && (
        <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between">
          <span className="text-[10px] text-slate-400 font-medium">
            Broadcast Notification
          </span>
          <button
            onClick={() => handleCtaClick(currentAnnouncement)}
            className="inline-flex items-center gap-1 px-3 py-1 bg-[#3B6CE7] hover:bg-[#2b56c4] text-white text-xs font-semibold rounded-lg shadow-sm transition-all transform active:scale-95"
          >
            {currentAnnouncement.cta_text}
            <ExternalLink size={12} />
          </button>
        </div>
      )}
    </div>
  );
}
