import React, { useState } from 'react';
import { DataTable } from '../../components/ui/DataTable';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Star } from 'lucide-react';

const mockFeedback = [
  { id: 'fb_1', userId: 'usr_1', rating: 5, category: 'Feature', feedbackText: 'The new AI dashboard is amazing!', date: '2025-08-25T10:00:00Z', status: 'Reviewed' },
  { id: 'fb_2', userId: 'usr_3', rating: 2, category: 'Performance', feedbackText: 'Image generation is taking too long during peak hours.', date: '2025-08-24T15:30:00Z', status: 'New' },
  { id: 'fb_3', userId: 'usr_2', rating: 4, category: 'UX', feedbackText: 'Love the dark mode, but the billing page is hard to read.', date: '2025-08-22T09:15:00Z', status: 'Actioned' },
];

export const Feedback = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredFeedback = mockFeedback.filter(fb => 
    fb.feedbackText.toLowerCase().includes(searchTerm.toLowerCase()) ||
    fb.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-[#1D2B64]">User Feedback</h1>
        <p className="text-sm text-[#64748B] mt-1">Review and action feedback submitted by platform users.</p>
      </div>

      <DataTable 
        data={filteredFeedback}
        onSearch={setSearchTerm}
        searchPlaceholder="Search feedback..."
        columns={[
          { 
            header: 'Rating', 
            key: 'rating', 
            render: (fb) => (
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={14} className={i < fb.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"} />
                ))}
              </div>
            )
          },
          { header: 'Category', key: 'category', className: 'font-semibold' },
          { header: 'Feedback', key: 'feedbackText', className: 'truncate max-w-xs' },
          { header: 'User ID', key: 'userId', className: 'text-[10px]' },
          { header: 'Date', key: 'date', render: (fb) => new Date(fb.date).toLocaleDateString() },
          { 
            header: 'Status', 
            key: 'status', 
            render: (fb) => (
              <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase ${
                fb.status === 'New' ? 'bg-blue-100 text-blue-700' :
                fb.status === 'Reviewed' ? 'bg-gray-100 text-gray-700' :
                'bg-green-100 text-green-700'
              }`}>{fb.status}</span>
            )
          },
        ]}
      />
    </div>
  );
};
