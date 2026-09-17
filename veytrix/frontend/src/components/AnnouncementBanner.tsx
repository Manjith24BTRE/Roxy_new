import React, { useState, useEffect } from 'react';
import { userAnnouncementsService, UserAnnouncement } from '../services/userAnnouncementsService';
import { Bell, Sparkles, Tag, AlertTriangle, Info, X, ExternalLink, Clock } from 'lucide-react';

export const AnnouncementBanner: React.FC = () => {
  const [announcements, setAnnouncements] = useState<UserAnnouncement[]>([]);
  const [dismissedIds, setDismissedIds] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('veytrix_dismissed_announcements') || '[]');
    } catch {
      return [];
    }
  });

  useEffect(() => {
    const fetchActive = async () => {
      const active = await userAnnouncementsService.getActiveAnnouncements();
      setAnnouncements(active);

      // Log view analytics for new visible announcements
      active.forEach((a) => {
        if (!dismissedIds.includes(a.id)) {
          userAnnouncementsService.trackAnalytics(a.id, 'viewed');
        }
      });
    };

    fetchActive();

    // Subscribe to Realtime broadcasts
    const unsubscribe = userAnnouncementsService.subscribeToAnnouncements((updated) => {
      setAnnouncements(updated);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const handleDismiss = (id: string) => {
    const updated = [...dismissedIds, id];
    setDismissedIds(updated);
    localStorage.setItem('veytrix_dismissed_announcements', JSON.stringify(updated));
    userAnnouncementsService.trackAnalytics(id, 'dismissed');
  };

  const handleClick = (id: string, url?: string) => {
    userAnnouncementsService.trackAnalytics(id, 'clicked');
    if (url) {
      window.open(url, '_blank');
    }
  };

  const visibleAnnouncements = announcements.filter((a) => !dismissedIds.includes(a.id));

  if (visibleAnnouncements.length === 0) return null;

  return (
    <div className="w-full space-y-2 mb-4 z-40 relative">
      {visibleAnnouncements.map((a) => {
        const isCritical = a.priority === 'Critical' || a.announcement_type === 'Security Alert';
        const isOffer = a.announcement_type === 'Offer' || a.announcement_type === 'Promotion';
        const isMaintenance = a.announcement_type === 'Maintenance';

        let bgClasses = 'bg-[#1D2B64] text-white border-blue-900';
        let IconComp = Bell;

        if (isCritical) {
          bgClasses = 'bg-gradient-to-r from-red-600 to-rose-700 text-white border-red-800';
          IconComp = AlertTriangle;
        } else if (isOffer) {
          bgClasses = 'bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 text-white border-purple-800';
          IconComp = Tag;
        } else if (isMaintenance) {
          bgClasses = 'bg-amber-500 text-slate-950 border-amber-600';
          IconComp = Info;
        } else if (a.announcement_type === 'Feature Release') {
          bgClasses = 'bg-emerald-600 text-white border-emerald-700';
          IconComp = Sparkles;
        }

        return (
          <div
            key={a.id}
            className={`p-3.5 px-5 rounded-2xl border shadow-lg flex items-center justify-between transition-all animate-fadeIn ${bgClasses}`}
          >
            <div className="flex items-center gap-3.5">
              <div className="p-2 rounded-xl bg-white/10 backdrop-blur-sm flex-shrink-0">
                <IconComp size={18} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-extrabold text-sm tracking-tight">{a.title}</h4>
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-white/20">
                    {a.announcement_type}
                  </span>
                </div>
                <p className="text-xs opacity-90 mt-0.5 font-medium">{a.message}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 flex-shrink-0">
              {a.cta_text && (
                <button
                  onClick={() => handleClick(a.id, a.cta_url)}
                  className="px-4 py-1.5 rounded-xl bg-white text-[#1D2B64] font-extrabold text-xs hover:bg-opacity-90 transition flex items-center gap-1.5 shadow-md cursor-pointer"
                >
                  <span>{a.cta_text}</span>
                  {a.cta_url && <ExternalLink size={12} />}
                </button>
              )}

              {a.expires_at && (
                <div className="hidden md:flex items-center gap-1 text-[11px] font-mono opacity-80 bg-black/10 px-2.5 py-1 rounded-lg">
                  <Clock size={12} />
                  <span>Expires {new Date(a.expires_at).toLocaleDateString()}</span>
                </div>
              )}

              <button
                onClick={() => handleDismiss(a.id)}
                className="p-1.5 rounded-full hover:bg-white/20 transition opacity-80 hover:opacity-100 cursor-pointer"
                title="Dismiss"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default AnnouncementBanner;
