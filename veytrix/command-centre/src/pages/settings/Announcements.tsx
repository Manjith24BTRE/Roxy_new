import React, { useState, useEffect } from 'react';
import { announcementsService } from '../../services/announcementsService';
import { Announcement, AnnouncementType, AnnouncementPriority, AnnouncementStatus, TargetAudience } from '../../types';
import { StatCard } from '../../components/ui/StatCard';
import { Bell, Plus, RefreshCw, Eye, MousePointer, XCircle, Edit3, Trash2, Copy, CheckCircle2, X, AlertCircle } from 'lucide-react';

export const Announcements = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [statusTab, setStatusTab] = useState<'All' | 'Active' | 'Scheduled' | 'Draft' | 'Archived'>('All');
  const [isLoading, setIsLoading] = useState(true);

  // Modal & Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form Fields
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [announcementType, setAnnouncementType] = useState<AnnouncementType>('General');
  const [priority, setPriority] = useState<AnnouncementPriority>('Medium');
  const [targetAudience, setTargetAudience] = useState<TargetAudience>('All Users');
  const [ctaText, setCtaText] = useState('');
  const [ctaUrl, setCtaUrl] = useState('');
  const [startsAt, setStartsAt] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [bannerColor, setBannerColor] = useState('blue');

  const loadAnnouncements = async () => {
    setIsLoading(true);
    const data = await announcementsService.getAnnouncements(statusTab);
    setAnnouncements(data);
    setIsLoading(false);
  };

  useEffect(() => {
    loadAnnouncements();

    const unsubscribe = announcementsService.subscribeToAnnouncements(() => {
      loadAnnouncements();
    });

    return () => {
      unsubscribe();
    };
  }, [statusTab]);

  const openCreateModal = () => {
    setEditingId(null);
    setTitle('');
    setMessage('');
    setAnnouncementType('General');
    setPriority('Medium');
    setTargetAudience('All Users');
    setCtaText('');
    setCtaUrl('');
    setStartsAt('');
    setExpiresAt('');
    setBannerColor('blue');
    setSubmitError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (item: Announcement) => {
    setEditingId(item.id);
    setTitle(item.title);
    setMessage(item.message);
    setAnnouncementType(item.announcementType);
    setPriority(item.priority);
    setTargetAudience(item.targetAudience);
    setCtaText(item.ctaText || '');
    setCtaUrl(item.ctaUrl || '');
    setStartsAt(item.startsAt ? item.startsAt.substring(0, 16) : '');
    setExpiresAt(item.expiresAt ? item.expiresAt.substring(0, 16) : '');
    setBannerColor(item.bannerColor || 'blue');
    setSubmitError(null);
    setIsModalOpen(true);
  };

  const handleSave = async (targetStatus: AnnouncementStatus) => {
    setSubmitError(null);

    if (!title.trim()) {
      setSubmitError('Announcement title is required.');
      return;
    }
    if (!message.trim()) {
      setSubmitError('Message content is required.');
      return;
    }

    setIsSubmitting(true);

    const payload: Partial<Announcement> = {
      title: title.trim(),
      message: message.trim(),
      announcementType,
      priority,
      status: targetStatus,
      targetAudience,
      ctaText: ctaText.trim() || undefined,
      ctaUrl: ctaUrl.trim() || undefined,
      startsAt: startsAt ? new Date(startsAt).toISOString() : undefined,
      expiresAt: expiresAt ? new Date(expiresAt).toISOString() : undefined,
      bannerColor,
    };

    try {
      if (editingId) {
        await announcementsService.updateAnnouncement(editingId, payload);
      } else {
        await announcementsService.createAnnouncement(payload);
      }

      setIsModalOpen(false);
      await loadAnnouncements();
    } catch (err: any) {
      console.error('[ANNOUNCEMENT] Modal submit error:', err);
      setSubmitError(err.message || 'Failed to save announcement to database.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this announcement?')) {
      try {
        await announcementsService.deleteAnnouncement(id);
        await loadAnnouncements();
      } catch (err: any) {
        alert(`Delete failed: ${err.message}`);
      }
    }
  };

  const handleDuplicate = async (item: Announcement) => {
    try {
      await announcementsService.createAnnouncement({
        ...item,
        title: `${item.title} (Copy)`,
        status: 'Draft',
      });
      await loadAnnouncements();
    } catch (err: any) {
      alert(`Duplicate failed: ${err.message}`);
    }
  };

  const totalViews = announcements.reduce((sum, a) => sum + (a.viewsCount || 0), 0);
  const totalClicks = announcements.reduce((sum, a) => sum + (a.clicksCount || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-[#1D2B64]">Platform Announcements</h1>
          <p className="text-sm text-[#64748B] mt-1">Create, schedule, and broadcast product offers, feature updates, and maintenance alerts.</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadAnnouncements}
            className="p-2 border border-[#E2E8F0] rounded-xl text-[#64748B] hover:bg-white hover:text-[#1D2B64] transition flex items-center gap-2 text-xs font-semibold cursor-pointer"
            title="Refresh"
          >
            <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
            Refresh
          </button>

          <button
            onClick={openCreateModal}
            className="bg-[#1D2B64] text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-opacity-90 transition flex items-center gap-2 shadow-md cursor-pointer"
          >
            <Plus size={16} />
            Create Announcement
          </button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard title="Total Broadcasts" value={announcements.length.toString()} icon={Bell} />
        <StatCard title="Active Now" value={announcements.filter((a) => a.status === 'Active').length.toString()} icon={CheckCircle2} />
        <StatCard title="Total Views" value={totalViews.toLocaleString()} icon={Eye} />
        <StatCard title="Total Clicks" value={totalClicks.toLocaleString()} icon={MousePointer} />
      </div>

      {/* Status Filter Tabs */}
      <div className="flex items-center bg-[#F1F5F9] p-1.5 rounded-2xl gap-1.5 text-xs font-semibold max-w-fit">
        {(['All', 'Active', 'Scheduled', 'Draft', 'Archived'] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setStatusTab(tab)}
            className={`px-4 py-1.5 rounded-xl transition cursor-pointer ${
              statusTab === tab
                ? 'bg-white text-[#1D2B64] shadow-sm font-bold'
                : 'text-[#64748B] hover:text-[#1D2B64]'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Announcement List */}
      {isLoading ? (
        <div className="flex justify-center items-center h-48 text-[#64748B] font-semibold text-xs gap-2">
          <RefreshCw className="animate-spin" size={16} />
          <span>Loading announcements...</span>
        </div>
      ) : announcements.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-[#E2E8F0] text-center max-w-md mx-auto my-8 space-y-3">
          <Bell className="mx-auto text-[#64748B]" size={40} />
          <h3 className="font-bold text-[#1D2B64] text-lg">No Announcements Found</h3>
          <p className="text-xs text-[#64748B]">
            Create promotional offers, system maintenance banners, or feature releases to notify users in real-time.
          </p>
          <button
            onClick={openCreateModal}
            className="mt-2 bg-[#1D2B64] text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-opacity-90 transition cursor-pointer"
          >
            + Create First Announcement
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {announcements.map((item) => (
            <div
              key={item.id}
              className="bg-white p-5 rounded-3xl border border-[#E2E8F0] shadow-sm hover:shadow-md transition flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
            >
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase ${
                    item.status === 'Active' ? 'bg-emerald-100 text-emerald-800' :
                    item.status === 'Scheduled' ? 'bg-amber-100 text-amber-800' :
                    item.status === 'Draft' ? 'bg-slate-100 text-slate-700' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {item.status}
                  </span>

                  <span className="px-2.5 py-0.5 rounded-md text-[10px] font-extrabold uppercase bg-blue-50 text-blue-700 border border-blue-100">
                    {item.announcementType}
                  </span>

                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold text-slate-500 bg-slate-50 border border-slate-200">
                    Audience: {item.targetAudience}
                  </span>
                </div>

                <h3 className="font-extrabold text-[#1D2B64] text-base">{item.title}</h3>
                <p className="text-xs text-[#64748B] font-medium max-w-2xl">{item.message}</p>

                {item.ctaText && (
                  <div className="flex items-center gap-2 pt-1 text-xs">
                    <span className="font-bold text-blue-600">Button CTA:</span>
                    <span className="font-semibold text-slate-800 px-2 py-0.5 bg-slate-100 rounded-md">
                      {item.ctaText}
                    </span>
                    {item.ctaUrl && <span className="text-slate-400 text-[11px] font-mono">({item.ctaUrl})</span>}
                  </div>
                )}
              </div>

              {/* Analytics & Actions */}
              <div className="flex flex-col md:items-end gap-3 border-t md:border-t-0 pt-3 md:pt-0 w-full md:w-auto border-[#E2E8F0]">
                <div className="flex items-center gap-4 text-xs font-semibold text-[#64748B]">
                  <span className="flex items-center gap-1" title="Views">
                    <Eye size={14} className="text-blue-500" /> {item.viewsCount || 0}
                  </span>
                  <span className="flex items-center gap-1" title="Clicks">
                    <MousePointer size={14} className="text-emerald-500" /> {item.clicksCount || 0}
                  </span>
                  <span className="flex items-center gap-1" title="Dismissals">
                    <XCircle size={14} className="text-slate-400" /> {item.dismissalsCount || 0}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openEditModal(item)}
                    className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition cursor-pointer"
                    title="Edit"
                  >
                    <Edit3 size={14} />
                  </button>
                  <button
                    onClick={() => handleDuplicate(item)}
                    className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition cursor-pointer"
                    title="Duplicate"
                  >
                    <Copy size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition cursor-pointer"
                    title="Delete"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-xl w-full border border-[#E2E8F0] shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
              <h3 className="text-lg font-black text-[#1D2B64]">
                {editingId ? 'Edit Announcement' : 'Create Platform Announcement'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                disabled={isSubmitting}
                className="p-2 text-[#64748B] hover:text-[#1D2B64] rounded-full hover:bg-slate-100 transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {submitError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-semibold flex items-center gap-2">
                <AlertCircle size={16} className="flex-shrink-0" />
                <span>{submitError}</span>
              </div>
            )}

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-[#1D2B64] mb-1">Announcement Title *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  disabled={isSubmitting}
                  placeholder="e.g. 50% OFF Pro Plan Upgrade or Scheduled Maintenance"
                  className="w-full border border-[#E2E8F0] p-2.5 rounded-xl font-semibold text-[#1D2B64] focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-[#1D2B64] mb-1">Message Content *</label>
                <textarea
                  rows={3}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  disabled={isSubmitting}
                  placeholder="Write clear, engaging broadcast copy for platform users..."
                  className="w-full border border-[#E2E8F0] p-2.5 rounded-xl font-semibold text-[#1D2B64] focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#1D2B64] mb-1">Type</label>
                  <select
                    value={announcementType}
                    onChange={(e) => setAnnouncementType(e.target.value as any)}
                    disabled={isSubmitting}
                    className="w-full border border-[#E2E8F0] p-2.5 rounded-xl font-semibold text-[#1D2B64] bg-white"
                  >
                    <option value="General">General</option>
                    <option value="System Update">System Update</option>
                    <option value="Offer">Offer</option>
                    <option value="Promotion">Promotion</option>
                    <option value="Maintenance">Maintenance</option>
                    <option value="Feature Release">Feature Release</option>
                    <option value="Security Alert">Security Alert</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[#1D2B64] mb-1">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    disabled={isSubmitting}
                    className="w-full border border-[#E2E8F0] p-2.5 rounded-xl font-semibold text-[#1D2B64] bg-white"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#1D2B64] mb-1">Target Audience</label>
                  <select
                    value={targetAudience}
                    onChange={(e) => setTargetAudience(e.target.value as any)}
                    disabled={isSubmitting}
                    className="w-full border border-[#E2E8F0] p-2.5 rounded-xl font-semibold text-[#1D2B64] bg-white"
                  >
                    <option value="All Users">All Users</option>
                    <option value="Free Users">Free Users</option>
                    <option value="Pro Users">Pro Users</option>
                    <option value="Premium Users">Premium Users</option>
                    <option value="Admins Only">Admins Only</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[#1D2B64] mb-1">Banner Style</label>
                  <select
                    value={bannerColor}
                    onChange={(e) => setBannerColor(e.target.value)}
                    disabled={isSubmitting}
                    className="w-full border border-[#E2E8F0] p-2.5 rounded-xl font-semibold text-[#1D2B64] bg-white"
                  >
                    <option value="blue">Blue Gradient (Offer/Standard)</option>
                    <option value="red">Red Alert (Critical/Security)</option>
                    <option value="emerald">Green Emerald (Feature Release)</option>
                    <option value="amber">Amber Yellow (Maintenance)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#1D2B64] mb-1">CTA Button Text (Optional)</label>
                  <input
                    type="text"
                    value={ctaText}
                    onChange={(e) => setCtaText(e.target.value)}
                    disabled={isSubmitting}
                    placeholder="e.g. Upgrade Now"
                    className="w-full border border-[#E2E8F0] p-2.5 rounded-xl font-semibold text-[#1D2B64]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#1D2B64] mb-1">CTA Link URL (Optional)</label>
                  <input
                    type="text"
                    value={ctaUrl}
                    onChange={(e) => setCtaUrl(e.target.value)}
                    disabled={isSubmitting}
                    placeholder="e.g. /pricing"
                    className="w-full border border-[#E2E8F0] p-2.5 rounded-xl font-semibold text-[#1D2B64]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#1D2B64] mb-1">Schedule Start Date</label>
                  <input
                    type="datetime-local"
                    value={startsAt}
                    onChange={(e) => setStartsAt(e.target.value)}
                    disabled={isSubmitting}
                    className="w-full border border-[#E2E8F0] p-2.5 rounded-xl font-semibold text-[#1D2B64]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#1D2B64] mb-1">Expiration End Date</label>
                  <input
                    type="datetime-local"
                    value={expiresAt}
                    onChange={(e) => setExpiresAt(e.target.value)}
                    disabled={isSubmitting}
                    className="w-full border border-[#E2E8F0] p-2.5 rounded-xl font-semibold text-[#1D2B64]"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E2E8F0]">
              <button
                onClick={() => handleSave('Draft')}
                disabled={isSubmitting}
                className="px-4 py-2 border border-[#E2E8F0] text-[#64748B] rounded-xl text-xs font-bold hover:bg-slate-50 transition cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? 'Saving Draft...' : 'Save as Draft'}
              </button>

              {startsAt && new Date(startsAt).getTime() > Date.now() ? (
                <button
                  onClick={() => handleSave('Scheduled')}
                  disabled={isSubmitting}
                  className="bg-amber-600 text-white px-5 py-2 rounded-xl text-xs font-bold hover:bg-amber-700 transition cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'Scheduling...' : 'Schedule Broadcast'}
                </button>
              ) : (
                <button
                  onClick={() => handleSave('Active')}
                  disabled={isSubmitting}
                  className="bg-[#1D2B64] text-white px-5 py-2 rounded-xl text-xs font-bold hover:bg-opacity-90 transition cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'Publishing...' : 'Publish Now'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Announcements;
