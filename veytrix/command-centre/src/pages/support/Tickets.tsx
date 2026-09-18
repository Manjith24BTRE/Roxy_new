import React, { useState, useEffect } from 'react';
import { ticketsService } from '../../services/ticketsService';
import { SupportTicket, TicketStatus } from '../../types';
import { StatusBadge } from '../../components/ui/StatusBadge';
import {
  LifeBuoy,
  RefreshCw,
  Eye,
  Download,
  ExternalLink,
  Trash2,
  CheckCircle,
  X,
  Paperclip,
  FileText,
  User,
  Mail,
  Calendar,
  AlertCircle,
  Clock,
} from 'lucide-react';

export const Tickets = () => {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadTickets = async (showLoadingState = true) => {
    if (showLoadingState) setIsLoading(true);
    const data = await ticketsService.getTickets();
    setTickets(data);
    if (showLoadingState) setIsLoading(false);
  };

  useEffect(() => {
    loadTickets();

    // Enable Supabase Realtime updates
    const unsubscribe = ticketsService.subscribeToTickets(() => {
      loadTickets(false);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const handleStatusChange = async (ticketId: string, newStatus: TicketStatus) => {
    setIsUpdatingStatus(true);
    const success = await ticketsService.updateTicketStatus(ticketId, newStatus);
    if (success) {
      await loadTickets(false);
      if (selectedTicket && selectedTicket.id === ticketId) {
        setSelectedTicket((prev) => (prev ? { ...prev, status: newStatus } : null));
      }
    }
    setIsUpdatingStatus(false);
  };

  const handleDeleteTicket = async (ticketId: string) => {
    if (!window.confirm('Are you sure you want to delete this support ticket?')) return;
    setIsDeleting(true);
    const success = await ticketsService.deleteTicket(ticketId);
    if (success) {
      setSelectedTicket(null);
      await loadTickets(false);
    }
    setIsDeleting(false);
  };

  const filteredTickets = tickets.filter((t) => {
    const matchesSearch =
      t.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.userId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.email && t.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (t.description && t.description.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus =
      statusFilter === 'all' || t.status.toLowerCase() === statusFilter.toLowerCase();
    const matchesPriority =
      priorityFilter === 'all' || t.priority.toLowerCase() === priorityFilter.toLowerCase();

    return matchesSearch && matchesStatus && matchesPriority;
  });

  const getPriorityBadgeClass = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'critical':
      case 'urgent':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'high':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'medium':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'low':
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const isImageAttachment = (url?: string | null, name?: string | null): boolean => {
    if (!url) return false;
    const cleanUrl = url.toLowerCase();
    const cleanName = (name || '').toLowerCase();
    return (
      cleanUrl.includes('.png') ||
      cleanUrl.includes('.jpg') ||
      cleanUrl.includes('.jpeg') ||
      cleanUrl.includes('.webp') ||
      cleanName.endsWith('.png') ||
      cleanName.endsWith('.jpg') ||
      cleanName.endsWith('.jpeg') ||
      cleanName.endsWith('.webp')
    );
  };

  return (
    <div className="space-y-6">
      {/* HEADER BAR */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-[#1D2B64]">Support Tickets Inbox</h1>
            <span className="bg-[#E6F2F8] text-[#3B6CE7] px-2.5 py-0.5 rounded-full text-xs font-bold">
              {tickets.length} {tickets.length === 1 ? 'ticket' : 'tickets'}
            </span>
          </div>
          <p className="text-sm text-[#64748B] mt-1">
            Real-time customer issue reports, attached files, and resolution management.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => loadTickets()}
            className="flex items-center gap-2 border border-[#E2E8F0] bg-white px-3.5 py-2 rounded-xl text-xs font-semibold text-[#64748B] hover:text-[#1D2B64] hover:bg-gray-50 shadow-sm transition cursor-pointer"
          >
            <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
            Refresh Inbox
          </button>
        </div>
      </div>

      {/* FILTERS & SEARCH */}
      <div className="bg-white p-4 rounded-2xl border border-[#E2E8F0] shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="w-full md:w-80">
          <input
            type="text"
            placeholder="Search by title, email, user ID, or content..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-3.5 py-2 text-xs text-[#1D2B64] focus:outline-none focus:border-[#3B6CE7]"
          />
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-1.5 text-xs text-[#64748B]">
            <span>Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg px-2.5 py-1.5 text-xs text-[#1D2B64] font-medium focus:outline-none"
            >
              <option value="all">All Statuses</option>
              <option value="open">Open</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-[#64748B]">
            <span>Priority:</span>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg px-2.5 py-1.5 text-xs text-[#1D2B64] font-medium focus:outline-none"
            >
              <option value="all">All Priorities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>
        </div>
      </div>

      {/* TICKETS TABLE / EMPTY STATE */}
      {isLoading ? (
        <div className="bg-white p-12 rounded-2xl border border-[#E2E8F0] text-center flex justify-center items-center h-48 text-[#64748B] font-semibold text-xs gap-2">
          <RefreshCw className="animate-spin text-[#3B6CE7]" size={18} />
          <span>Loading Support Tickets from database...</span>
        </div>
      ) : filteredTickets.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-[#E2E8F0] text-center max-w-lg mx-auto my-6 shadow-sm">
          <LifeBuoy className="mx-auto text-[#64748B] mb-3 opacity-60" size={40} />
          <h3 className="font-bold text-[#1D2B64] text-lg">No Support Tickets Found</h3>
          <p className="text-sm text-[#64748B] mt-1">
            {tickets.length === 0
              ? 'No tickets submitted yet. Newly reported issues will appear automatically via Realtime.'
              : 'No tickets match the selected filters.'}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#1D2B64]">
              <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[#64748B] font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3.5 px-4">Reporter / Email</th>
                  <th className="py-3.5 px-4">Subject & Category</th>
                  <th className="py-3.5 px-4">Priority</th>
                  <th className="py-3.5 px-4">Attachment</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Submitted</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]">
                {filteredTickets.map((t) => {
                  const hasAttachment = !!t.attachmentUrl;
                  const isImg = isImageAttachment(t.attachmentUrl, t.attachmentName);

                  return (
                    <tr
                      key={t.id}
                      onClick={() => setSelectedTicket(t)}
                      className="hover:bg-[#F8FAFC]/80 transition cursor-pointer group"
                    >
                      <td className="py-3.5 px-4 max-w-[180px]">
                        <div className="font-bold text-[#1D2B64] truncate" title={t.email || 'N/A'}>
                          {t.email || 'N/A'}
                        </div>
                        <div className="font-mono text-[10px] text-[#64748B] truncate" title={t.userId}>
                          ID: {t.userId}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 max-w-[260px]">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span className="bg-[#E6F2F8] text-[#3B6CE7] px-1.5 py-0.5 rounded text-[9px] font-bold uppercase">
                            {t.category || 'General'}
                          </span>
                        </div>
                        <div className="font-semibold text-[#1D2B64] truncate" title={t.subject}>
                          {t.subject}
                        </div>
                        {t.description && (
                          <div className="text-[11px] text-[#64748B] truncate max-w-full">
                            {t.description}
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getPriorityBadgeClass(
                            t.priority
                          )}`}
                        >
                          {t.priority}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        {hasAttachment ? (
                          <div className="flex items-center gap-2">
                            {isImg ? (
                              <img
                                src={t.attachmentUrl!}
                                alt="Attachment preview"
                                className="w-9 h-9 object-cover rounded-lg border border-border shadow-sm flex-shrink-0"
                              />
                            ) : (
                              <div className="w-9 h-9 rounded-lg bg-[#E6F2F8] flex items-center justify-center text-[#3B6CE7] flex-shrink-0">
                                <FileText size={16} />
                              </div>
                            )}
                            <a
                              href={t.attachmentUrl!}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="text-[#3B6CE7] hover:underline text-[11px] font-medium flex items-center gap-1 truncate max-w-[100px]"
                              title={t.attachmentName || 'Attachment'}
                            >
                              <Paperclip size={12} />
                              <span className="truncate">{t.attachmentName || 'View'}</span>
                            </a>
                          </div>
                        ) : (
                          <span className="text-[#94A3B8] text-[11px] italic">No file</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <StatusBadge status={t.status} />
                      </td>

                      <td className="py-3.5 px-4 text-[11px] text-[#64748B] whitespace-nowrap">
                        {new Date(t.createdAt).toLocaleString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>

                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => setSelectedTicket(t)}
                            className="p-1.5 rounded-lg bg-gray-100 hover:bg-[#E6F2F8] text-[#1D2B64] hover:text-[#3B6CE7] transition"
                            title="View full report"
                          >
                            <Eye size={14} />
                          </button>

                          <button
                            onClick={() =>
                              handleStatusChange(
                                t.id,
                                t.status.toLowerCase() === 'resolved' ? 'Open' : 'Resolved'
                              )
                            }
                            className={`p-1.5 rounded-lg border transition ${
                              t.status.toLowerCase() === 'resolved'
                                ? 'bg-amber-50 text-amber-600 border-amber-200 hover:bg-amber-100'
                                : 'bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100'
                            }`}
                            title={
                              t.status.toLowerCase() === 'resolved'
                                ? 'Re-open ticket'
                                : 'Mark as Resolved'
                            }
                          >
                            <CheckCircle size={14} />
                          </button>

                          <button
                            onClick={() => handleDeleteTicket(t.id)}
                            className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 transition"
                            title="Delete ticket"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* DETAIL DRAWER / MODAL */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-[#E2E8F0] shadow-2xl p-6 relative flex flex-col">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-[#E2E8F0] pb-4 mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="bg-[#E6F2F8] text-[#3B6CE7] px-2 py-0.5 rounded text-xs font-bold uppercase">
                    {selectedTicket.category || 'General Issue'}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-bold border ${getPriorityBadgeClass(
                      selectedTicket.priority
                    )}`}
                  >
                    Priority: {selectedTicket.priority}
                  </span>
                  <StatusBadge status={selectedTicket.status} />
                </div>
                <h2 className="text-xl font-bold text-[#1D2B64] mt-1">{selectedTicket.subject}</h2>
              </div>
              <button
                onClick={() => setSelectedTicket(null)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition"
              >
                <X size={20} />
              </button>
            </div>

            {/* Reporter Meta Metadata */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-[#F8FAFC] p-3.5 rounded-xl border border-[#E2E8F0] mb-5 text-xs text-[#64748B]">
              <div className="flex items-center gap-2">
                <Mail size={14} className="text-[#3B6CE7]" />
                <span>
                  <strong className="text-[#1D2B64]">Reporter Email:</strong>{' '}
                  {selectedTicket.email || 'N/A'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <User size={14} className="text-[#3B6CE7]" />
                <span className="truncate">
                  <strong className="text-[#1D2B64]">User ID:</strong> {selectedTicket.userId}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock size={14} className="text-[#3B6CE7]" />
                <span>
                  <strong className="text-[#1D2B64]">Submitted At:</strong>{' '}
                  {new Date(selectedTicket.createdAt).toLocaleString()}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <AlertCircle size={14} className="text-[#3B6CE7]" />
                <span>
                  <strong className="text-[#1D2B64]">Ticket ID:</strong>{' '}
                  <code className="bg-white px-1 py-0.5 rounded border border-gray-200 text-[10px]">
                    {selectedTicket.id}
                  </code>
                </span>
              </div>
            </div>

            {/* Ticket Description */}
            <div className="mb-6">
              <h4 className="text-xs font-bold text-[#64748B] uppercase tracking-wider mb-2">
                Issue Description
              </h4>
              <div className="bg-[#FAFAFC] border border-[#E2E8F0] rounded-xl p-4 text-sm text-[#1D2B64] whitespace-pre-wrap leading-relaxed">
                {selectedTicket.description || 'No description provided.'}
              </div>
            </div>

            {/* Attachment Section */}
            <div className="mb-6">
              <h4 className="text-xs font-bold text-[#64748B] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Paperclip size={14} /> Attached Evidence / Screenshot
              </h4>
              {selectedTicket.attachmentUrl ? (
                <div className="border border-[#E2E8F0] bg-white rounded-xl p-4 flex flex-col gap-3">
                  {isImageAttachment(selectedTicket.attachmentUrl, selectedTicket.attachmentName) ? (
                    <div className="relative group overflow-hidden rounded-lg border border-gray-200 bg-black/5 max-h-80 flex items-center justify-center">
                      <img
                        src={selectedTicket.attachmentUrl}
                        alt="Submitted evidence"
                        className="max-h-80 object-contain w-full"
                      />
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 p-3 bg-[#F8FAFC] rounded-lg border border-gray-200">
                      <FileText size={32} className="text-[#3B6CE7]" />
                      <div>
                        <p className="text-sm font-semibold text-[#1D2B64]">
                          {selectedTicket.attachmentName || 'Attachment File'}
                        </p>
                        <p className="text-xs text-[#64748B]">Document / File</p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2">
                    <span className="text-xs text-[#64748B]">
                      {selectedTicket.attachmentName || 'Attachment'}
                    </span>
                    <a
                      href={selectedTicket.attachmentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 bg-[#3B6CE7] text-white px-4 py-2 rounded-lg text-xs font-semibold hover:bg-[#2555CC] transition shadow-sm"
                    >
                      <Download size={14} /> Open Full Attachment
                    </a>
                  </div>
                </div>
              ) : (
                <div className="bg-[#F8FAFC] border border-dashed border-gray-300 rounded-xl p-4 text-center text-xs text-[#64748B]">
                  No file attached to this report.
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="pt-4 border-t border-[#E2E8F0] flex items-center justify-between gap-3 mt-auto">
              <button
                onClick={() => handleDeleteTicket(selectedTicket.id)}
                disabled={isDeleting}
                className="flex items-center gap-1.5 text-xs text-red-600 hover:text-red-700 font-semibold px-3 py-2 rounded-lg hover:bg-red-50 transition"
              >
                <Trash2 size={14} /> Delete Ticket
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    handleStatusChange(
                      selectedTicket.id,
                      selectedTicket.status.toLowerCase() === 'resolved' ? 'Open' : 'Resolved'
                    )
                  }
                  disabled={isUpdatingStatus}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition shadow-sm ${
                    selectedTicket.status.toLowerCase() === 'resolved'
                      ? 'bg-amber-500 text-white hover:bg-amber-600'
                      : 'bg-emerald-600 text-white hover:bg-emerald-700'
                  }`}
                >
                  <CheckCircle size={14} />
                  {selectedTicket.status.toLowerCase() === 'resolved'
                    ? 'Reopen Ticket'
                    : 'Mark as Resolved'}
                </button>
                <button
                  onClick={() => setSelectedTicket(null)}
                  className="px-4 py-2 border border-gray-200 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-50 transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
