import React, { useState, useEffect } from 'react';
import { feedbackService } from '../../services/feedbackService';
import { Feedback as FeedbackType } from '../../types';
import { DataTable } from '../../components/ui/DataTable';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { MessageSquare, Star, RefreshCw } from 'lucide-react';

export const Feedback = () => {
  const [feedback, setFeedback] = useState<FeedbackType[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const loadFeedback = async () => {
    setIsLoading(true);
    const data = await feedbackService.getFeedback();
    setFeedback(data);
    setIsLoading(false);
  };

  useEffect(() => {
    loadFeedback();
  }, []);

  const filteredFeedback = feedback.filter(
    (f) =>
      f.feedbackText.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.userId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-[#1D2B64]">User Feedback</h1>
          <p className="text-sm text-[#64748B] mt-1">Direct feedback and satisfaction ratings submitted by platform users.</p>
        </div>
        <button
          onClick={loadFeedback}
          className="flex items-center gap-2 border border-[#E2E8F0] px-3 py-1.5 rounded-lg text-xs font-semibold text-[#64748B] hover:bg-white transition cursor-pointer"
        >
          <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-48 text-[#64748B] font-semibold text-xs gap-2">
          <RefreshCw className="animate-spin" size={16} />
          <span>Loading User Feedback...</span>
        </div>
      ) : feedback.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-[#E2E8F0] text-center max-w-lg mx-auto my-12">
          <MessageSquare className="mx-auto text-[#64748B] mb-3" size={36} />
          <h3 className="font-bold text-[#1D2B64] text-lg">No User Feedback Submitted</h3>
          <p className="text-sm text-[#64748B] mt-1">No feedback entries have been recorded yet.</p>
        </div>
      ) : (
        <DataTable
          data={filteredFeedback}
          onSearch={setSearchTerm}
          searchPlaceholder="Search feedback text or User ID..."
          columns={[
            {
              header: 'Rating',
              key: 'rating',
              render: (f) => (
                <div className="flex items-center gap-1 text-amber-500 font-bold">
                  <span>{f.rating}</span>
                  <Star size={14} className="fill-amber-500" />
                </div>
              ),
            },
            { header: 'Category', key: 'category', className: 'font-semibold text-xs' },
            { header: 'Feedback Message', key: 'feedbackText', className: 'text-xs text-[#1D2B64]' },
            { header: 'User ID', key: 'userId', className: 'font-mono text-xs' },
            { header: 'Date', key: 'date', render: (f) => new Date(f.date).toLocaleString() },
            { header: 'Status', key: 'status', render: (f) => <StatusBadge status={f.status} /> },
          ]}
        />
      )}
    </div>
  );
};
