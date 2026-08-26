import React from 'react';
import { cn } from '../layout/Sidebar';
import { Status, JobStatus, TicketStatus } from '../../types';

type BadgeType = Status | JobStatus | TicketStatus | 'Active' | 'Suspended' | 'Banned' | 'Revoked' | 'Suspicious' | 'Successful' | 'Pending' | 'Failed' | 'Refunded' | 'Deprecated' | 'Beta' | 'Draft' | 'Scheduled' | 'Published' | 'Expired';

const badgeColors: Record<string, string> = {
  'Operational': 'bg-green-100 text-green-700 border-green-200',
  'Completed': 'bg-green-100 text-green-700 border-green-200',
  'Successful': 'bg-green-100 text-green-700 border-green-200',
  'Active': 'bg-green-100 text-green-700 border-green-200',
  'Resolved': 'bg-green-100 text-green-700 border-green-200',
  'Published': 'bg-green-100 text-green-700 border-green-200',

  'Degraded': 'bg-orange-100 text-orange-700 border-orange-200',
  'Warning': 'bg-orange-100 text-orange-700 border-orange-200',
  'Suspicious': 'bg-orange-100 text-orange-700 border-orange-200',
  
  'Down': 'bg-red-100 text-red-700 border-red-200',
  'Failed': 'bg-red-100 text-red-700 border-red-200',
  'Error': 'bg-red-100 text-red-700 border-red-200',
  'Critical': 'bg-red-100 text-red-700 border-red-200',
  'Banned': 'bg-red-100 text-red-700 border-red-200',
  'Suspended': 'bg-red-100 text-red-700 border-red-200',
  'Revoked': 'bg-red-100 text-red-700 border-red-200',

  'Processing': 'bg-blue-100 text-blue-700 border-blue-200',
  'Pending': 'bg-blue-100 text-blue-700 border-blue-200',
  'Open': 'bg-blue-100 text-blue-700 border-blue-200',
  'Info': 'bg-blue-100 text-blue-700 border-blue-200',

  'Checking': 'bg-gray-100 text-gray-700 border-gray-200',
  'Queued': 'bg-gray-100 text-gray-700 border-gray-200',
  'Cancelled': 'bg-gray-100 text-gray-700 border-gray-200',
  'Closed': 'bg-gray-100 text-gray-700 border-gray-200',
  'Deprecated': 'bg-gray-100 text-gray-700 border-gray-200',
  'Draft': 'bg-gray-100 text-gray-700 border-gray-200',
  'Expired': 'bg-gray-100 text-gray-700 border-gray-200',
  'Refunded': 'bg-gray-100 text-gray-700 border-gray-200',
};

export const StatusBadge = ({ status, className }: { status: string; className?: string }) => {
  const colorClass = badgeColors[status] || 'bg-gray-100 text-gray-700 border-gray-200';
  
  return (
    <span className={cn(
      "inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider",
      colorClass,
      className
    )}>
      {status}
    </span>
  );
};
