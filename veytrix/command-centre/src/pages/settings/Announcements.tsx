import React, { useState, useEffect } from 'react';
import { announcementsService } from '../../services/announcementsService';
import { Announcement } from '../../types';
import { Bell, RefreshCw } from 'lucide-react';

export const Announcements = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadAnnouncements = async () => {
    setIsLoading(true);
    const data = await announcementsService.getAnnouncements();
    setAnnouncements(data);
    setIsLoading(false);
  };

  useEffect(() => {
    loadAnnouncements();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-[#1D2B64]">Platform Announcements</h1>
          <p className="text-sm text-[#64748B] mt-1">Broadcast system maintenance and feature update notifications.</p>
        </div>
        <button
          onClick={loadAnnouncements}
          className="flex items-center gap-2 border border-[#E2E8F0] px-3 py-1.5 rounded-lg text-xs font-semibold text-[#64748B] hover:bg-white transition cursor-pointer"
        >
          <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
          Refresh Announcements
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-48 text-[#64748B] font-semibold text-xs gap-2">
          <RefreshCw className="animate-spin" size={16} />
          <span>Loading Announcements...</span>
        </div>
      ) : announcements.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-[#E2E8F0] text-center max-w-lg mx-auto my-12">
          <Bell className="mx-auto text-[#64748B] mb-3" size={36} />
          <h3 className="font-bold text-[#1D2B64] text-lg">No Active Broadcast Announcements</h3>
          <p className="text-sm text-[#64748B] mt-1">No system broadcasts or scheduled user notifications exist.</p>
        </div>
      ) : (
        <div className="bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-sm">
          <div className="space-y-4">
            {announcements.map((a) => (
              <div key={a.id} className="p-4 border border-[#E2E8F0] rounded-xl flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-[#1D2B64]">{a.title}</h4>
                  <p className="text-xs text-[#64748B]">{a.message}</p>
                </div>
                <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-bold uppercase">
                  {a.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
