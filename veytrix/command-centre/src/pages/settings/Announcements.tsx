import React, { useState } from 'react';
import { DataTable } from '../../components/ui/DataTable';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Plus } from 'lucide-react';

const mockAnnouncements = [
  { id: 'ann_1', title: 'Scheduled Maintenance', message: 'Veytrix API will undergo maintenance on Sunday.', audience: 'All Users', status: 'Scheduled', publishedDate: '2025-08-30' },
  { id: 'ann_2', title: 'New GPT-4o Integration', message: 'We have updated our default models to GPT-4o.', audience: 'Pro Users', status: 'Published', publishedDate: '2025-08-15' },
  { id: 'ann_3', title: 'Welcome to Veytrix 2.0', message: 'Explore the new features in the latest update.', audience: 'All Users', status: 'Expired', publishedDate: '2025-01-10' },
];

export const Announcements = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredAnnouncements = mockAnnouncements.filter(a => 
    a.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-[#1D2B64]">Announcements</h1>
          <p className="text-sm text-[#64748B] mt-1">Manage platform-wide banners and user notifications.</p>
        </div>
        <button className="flex items-center gap-2 bg-[#3B6CE7] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#2b52b3] transition-colors">
          <Plus size={16} />
          Create Announcement
        </button>
      </div>

      <DataTable 
        data={filteredAnnouncements}
        onSearch={setSearchTerm}
        searchPlaceholder="Search announcements by title..."
        columns={[
          { header: 'Title', key: 'title', className: 'font-bold text-[#1D2B64]' },
          { header: 'Message', key: 'message', className: 'truncate max-w-sm' },
          { header: 'Audience', key: 'audience' },
          { header: 'Status', key: 'status', render: (a) => <StatusBadge status={a.status} /> },
          { header: 'Date', key: 'publishedDate' },
        ]}
      />
    </div>
  );
};
