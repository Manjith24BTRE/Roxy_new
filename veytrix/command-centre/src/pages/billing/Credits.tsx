import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { StatCard } from '../../components/ui/StatCard';
import { Coins, ArrowUpRight, ArrowDownRight, RefreshCw, UserCheck, Plus, Minus, RotateCcw, Search, ShieldCheck, History, X, User } from 'lucide-react';
import { DataTable } from '../../components/ui/DataTable';
import { creditsService, CreditEconomyMetrics, CreditTransactionRecord, CreditAuditLogRecord } from '../../services/creditsService';
import { useControlCentreAuth } from '../../context/ControlCentreAuthContext';

export const Credits = () => {
  const { user } = useControlCentreAuth();
  const [data, setData] = useState<CreditEconomyMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'transactions' | 'audit'>('transactions');

  // Modal State for Admin Action
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [actionType, setActionType] = useState<'add' | 'deduct' | 'reset'>('add');
  const [targetUserId, setTargetUserId] = useState('');
  const [targetUserLabel, setTargetUserLabel] = useState('');
  const [userSearchResults, setUserSearchResults] = useState<Array<{ user_id: string; display_name: string; email: string; balance: number }>>([]);
  const [amountInput, setAmountInput] = useState('');
  const [reasonInput, setReasonInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<{ text: string; error?: boolean } | null>(null);

  const loadCredits = useCallback(async () => {
    setIsLoading(true);
    const res = await creditsService.getCreditMetrics();
    setData(res);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadCredits();

    // Realtime subscription
    const unsubscribe = creditsService.subscribeToCreditChanges(() => {
      console.log('[CREDIT ECONOMY] Realtime update event received!');
      loadCredits();
    });

    return () => {
      unsubscribe();
    };
  }, [loadCredits]);

  // Live user search inside modal
  useEffect(() => {
    if (!targetUserId || targetUserId.length < 2) {
      setUserSearchResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      const results = await creditsService.searchUsers(targetUserId);
      setUserSearchResults(results);
    }, 250);

    return () => clearTimeout(timer);
  }, [targetUserId]);

  const handleAdminActionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetUserId.trim()) {
      setFeedbackMessage({ text: 'Please enter or select a valid User ID / Email.', error: true });
      return;
    }
    const val = Number(amountInput);
    if (isNaN(val) || (actionType !== 'reset' && val <= 0)) {
      setFeedbackMessage({ text: 'Please enter a valid positive number.', error: true });
      return;
    }

    setIsSubmitting(true);
    setFeedbackMessage(null);

    try {
      if (actionType === 'add') {
        await creditsService.assignCredits(targetUserId.trim(), val, reasonInput || 'Admin Manual Addition', user?.id || 'Admin');
        setFeedbackMessage({ text: `Successfully added +${val} credits!` });
      } else if (actionType === 'deduct') {
        await creditsService.deductCredits(targetUserId.trim(), val, reasonInput || 'Admin Manual Deduction', user?.id || 'Admin');
        setFeedbackMessage({ text: `Successfully deducted -${val} credits!` });
      } else {
        await creditsService.resetCredits(targetUserId.trim(), val, reasonInput || 'Admin Manual Balance Reset', user?.id || 'Admin');
        setFeedbackMessage({ text: `Successfully reset balance to ${val} credits!` });
      }

      setAmountInput('');
      setReasonInput('');
      setTargetUserId('');
      setTargetUserLabel('');
      setTimeout(() => {
        setIsModalOpen(false);
        setFeedbackMessage(null);
      }, 1500);

      await loadCredits();
    } catch (err: any) {
      setFeedbackMessage({ text: err.message || 'Operation failed', error: true });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filtered transactions by search term
  const filteredTransactions = useMemo(() => {
    if (!data?.recentTransactions) return [];
    if (!searchTerm.trim()) return data.recentTransactions;
    const term = searchTerm.toLowerCase();
    return data.recentTransactions.filter(
      (t) =>
        t.user_id.toLowerCase().includes(term) ||
        (t.user_email && t.user_email.toLowerCase().includes(term)) ||
        t.reason.toLowerCase().includes(term)
    );
  }, [data?.recentTransactions, searchTerm]);

  // Filtered audit logs
  const filteredAuditLogs = useMemo(() => {
    if (!data?.auditLogs) return [];
    if (!searchTerm.trim()) return data.auditLogs;
    const term = searchTerm.toLowerCase();
    return data.auditLogs.filter(
      (a) =>
        a.user_id.toLowerCase().includes(term) ||
        (a.user_email && a.user_email.toLowerCase().includes(term)) ||
        a.reason.toLowerCase().includes(term)
    );
  }, [data?.auditLogs, searchTerm]);

  return (
    <div className="space-y-6">
      {/* Header Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#1D2B64]">Credit Economy Engine</h1>
          <p className="text-sm text-[#64748B] mt-1">
            Realtime database ledger, credit allocation, consumption metrics, and audit logs.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-[#3B6CE7] hover:bg-[#2b56c4] text-white px-4 py-2 rounded-xl text-xs font-bold shadow-sm transition active:scale-95 cursor-pointer"
          >
            <Coins size={15} />
            Manage User Credits
          </button>
          <button
            onClick={loadCredits}
            className="flex items-center gap-2 border border-[#E2E8F0] px-3.5 py-2 rounded-xl text-xs font-semibold text-[#64748B] hover:bg-white transition cursor-pointer"
          >
            <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>
      </div>

      {/* Real Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Total Credits Issued" value={data?.totalCreditsIssued.toLocaleString() || '0'} icon={Coins} />
        <StatCard title="Credits Consumed" value={data?.totalCreditsConsumed.toLocaleString() || '0'} icon={ArrowDownRight} />
        <StatCard title="Outstanding Balance" value={data?.outstandingBalance.toLocaleString() || '0'} icon={ArrowUpRight} />
      </div>

      {/* Main Grid: Transactions Ledger + Top Consumers */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-4">
          {/* Table Control Bar */}
          <div className="bg-white p-4 rounded-2xl border border-[#E2E8F0] shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2 bg-[#F8FAFC] p-1 rounded-xl border border-[#E2E8F0] w-full md:w-auto">
              <button
                onClick={() => setActiveTab('transactions')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  activeTab === 'transactions' ? 'bg-white text-[#3B6CE7] shadow-sm' : 'text-[#64748B] hover:text-[#1D2B64]'
                }`}
              >
                <Coins size={14} />
                Transaction Ledger
              </button>
              <button
                onClick={() => setActiveTab('audit')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  activeTab === 'audit' ? 'bg-white text-[#3B6CE7] shadow-sm' : 'text-[#64748B] hover:text-[#1D2B64]'
                }`}
              >
                <History size={14} />
                Admin Audit Logs
              </button>
            </div>

            <div className="relative w-full md:w-64">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search user ID, email, reason..."
                className="w-full pl-9 pr-3 py-1.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs text-[#1D2B64] focus:outline-none focus:border-[#3B6CE7]"
              />
            </div>
          </div>

          {/* Render Active Table */}
          {activeTab === 'transactions' ? (
            <DataTable<CreditTransactionRecord>
              title="Realtime Credit Ledger"
              data={filteredTransactions}
              columns={[
                { header: 'ID', key: 'id', render: (ctx) => <span className="font-mono text-[10px] text-slate-500">{ctx.id.slice(0, 8)}...</span> },
                {
                  header: 'User',
                  key: 'user_email',
                  render: (ctx) => (
                    <div>
                      <p className="font-bold text-xs text-[#1D2B64]">{ctx.user_email}</p>
                      <p className="font-mono text-[10px] text-slate-400">{ctx.user_id.slice(0, 14)}...</p>
                    </div>
                  ),
                },
                {
                  header: 'Amount',
                  key: 'amount',
                  render: (ctx) => (
                    <span className={`font-black text-xs ${ctx.transaction_type === 'credit' ? 'text-emerald-600' : 'text-amber-600'}`}>
                      {ctx.amount > 0 ? `+${ctx.amount}` : ctx.amount}
                    </span>
                  ),
                },
                {
                  header: 'Type',
                  key: 'transaction_type',
                  render: (ctx) => (
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                      ctx.transaction_type === 'credit' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}>
                      {ctx.transaction_type}
                    </span>
                  ),
                },
                { header: 'Reason', key: 'reason', className: 'text-[#64748B] text-xs' },
                { header: 'Date', key: 'created_at', render: (ctx) => <span className="text-xs text-slate-500">{new Date(ctx.created_at).toLocaleString()}</span> },
              ]}
            />
          ) : (
            <DataTable<CreditAuditLogRecord>
              title="Admin Action Audit Logs"
              data={filteredAuditLogs}
              columns={[
                { header: 'ID', key: 'id', render: (ctx) => <span className="font-mono text-[10px] text-slate-500">{ctx.id.slice(0, 8)}...</span> },
                {
                  header: 'User',
                  key: 'user_email',
                  render: (ctx) => (
                    <div>
                      <p className="font-bold text-xs text-[#1D2B64]">{ctx.user_email}</p>
                      <p className="font-mono text-[10px] text-slate-400">{ctx.user_id.slice(0, 14)}...</p>
                    </div>
                  ),
                },
                {
                  header: 'Action',
                  key: 'action_type',
                  render: (ctx) => (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase bg-indigo-50 text-indigo-700 border border-indigo-200">
                      {ctx.action_type}
                    </span>
                  ),
                },
                {
                  header: 'Balance Change',
                  key: 'change_amount',
                  render: (ctx) => (
                    <span className="text-xs font-mono">
                      {ctx.old_balance} → <strong className="text-[#1D2B64]">{ctx.new_balance}</strong>
                    </span>
                  ),
                },
                { header: 'Reason', key: 'reason', className: 'text-[#64748B] text-xs' },
                { header: 'Timestamp', key: 'created_at', render: (ctx) => <span className="text-xs text-slate-500">{new Date(ctx.created_at).toLocaleString()}</span> },
              ]}
            />
          )}
        </div>

        {/* Sidebar: Top Credit Users */}
        <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-[#1D2B64] mb-4 flex items-center gap-2">
              <UserCheck size={18} className="text-[#3B6CE7]" />
              Top Credit Consumers
            </h3>

            {data?.topConsumers && data.topConsumers.length > 0 ? (
              <div className="space-y-3">
                {data.topConsumers.map((c, i) => (
                  <div key={i} className="p-3 border border-[#F1F5F9] rounded-xl flex items-center justify-between text-xs hover:border-[#3B6CE7]/30 transition">
                    <div>
                      <p className="font-bold text-[#1D2B64]">{c.display_name}</p>
                      <p className="font-mono text-[10px] text-[#64748B]">{c.user_email}</p>
                    </div>
                    <div className="text-right">
                      <span className="font-black text-[#1D2B64] block">{c.creditsUsed} Used</span>
                      <span className="text-[10px] text-emerald-600 font-semibold">{c.current_balance} Left</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-xs text-[#94A3B8] font-semibold">
                No credit consumption recorded in database.
              </div>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-[#F1F5F9]">
            <div className="flex items-center gap-2 text-xs text-[#64748B]">
              <ShieldCheck size={16} className="text-emerald-500" />
              <span>All balance modifications create audited database ledger rows.</span>
            </div>
          </div>
        </div>
      </div>

      {/* Admin Credit Action Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-xl max-w-md w-full p-6 space-y-4 relative">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-[#1D2B64] flex items-center gap-2">
                <Coins size={18} className="text-[#3B6CE7]" />
                Admin Credit Action
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition"
              >
                <X size={18} />
              </button>
            </div>

            {feedbackMessage && (
              <div className={`p-3 rounded-xl text-xs font-semibold ${
                feedbackMessage.error ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              }`}>
                {feedbackMessage.text}
              </div>
            )}

            <form onSubmit={handleAdminActionSubmit} className="space-y-4">
              {/* Action Type Toggle */}
              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">Select Action</label>
                <div className="grid grid-cols-3 gap-2 bg-slate-50 p-1 rounded-xl border border-slate-200">
                  <button
                    type="button"
                    onClick={() => setActionType('add')}
                    className={`flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs font-bold transition ${
                      actionType === 'add' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Plus size={13} /> Add
                  </button>
                  <button
                    type="button"
                    onClick={() => setActionType('deduct')}
                    className={`flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs font-bold transition ${
                      actionType === 'deduct' ? 'bg-amber-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Minus size={13} /> Deduct
                  </button>
                  <button
                    type="button"
                    onClick={() => setActionType('reset')}
                    className={`flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs font-bold transition ${
                      actionType === 'reset' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <RotateCcw size={13} /> Reset
                  </button>
                </div>
              </div>

              {/* Target User Search & Selection */}
              <div className="relative">
                <label className="text-xs font-bold text-slate-600 block mb-1">Target User (Search Email / Name / UUID)</label>
                <div className="relative">
                  <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={targetUserLabel || targetUserId}
                    onChange={(e) => {
                      setTargetUserId(e.target.value);
                      setTargetUserLabel(e.target.value);
                    }}
                    placeholder="Search email, display name, or UUID..."
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-[#1D2B64] font-medium focus:outline-none focus:border-[#3B6CE7]"
                  />
                </div>

                {/* Search Dropdown */}
                {userSearchResults.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-20 max-h-40 overflow-y-auto">
                    {userSearchResults.map((u) => (
                      <button
                        key={u.user_id}
                        type="button"
                        onClick={() => {
                          setTargetUserId(u.user_id);
                          setTargetUserLabel(`${u.display_name} (${u.email})`);
                          setUserSearchResults([]);
                        }}
                        className="w-full text-left p-2.5 hover:bg-slate-50 border-b border-slate-100 last:border-0 flex items-center justify-between text-xs"
                      >
                        <div>
                          <p className="font-bold text-[#1D2B64]">{u.display_name}</p>
                          <p className="text-[10px] text-slate-400 font-mono">{u.email}</p>
                        </div>
                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">{u.balance} Credits</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Amount Input */}
              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">
                  {actionType === 'reset' ? 'New Target Balance' : 'Credit Amount'}
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  value={amountInput}
                  onChange={(e) => setAmountInput(e.target.value)}
                  placeholder="e.g. 100"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-[#1D2B64] font-bold focus:outline-none focus:border-[#3B6CE7]"
                />
              </div>

              {/* Reason Input */}
              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">Reason / Note</label>
                <input
                  type="text"
                  required
                  value={reasonInput}
                  onChange={(e) => setReasonInput(e.target.value)}
                  placeholder="e.g. Enterprise Manual Top-up"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-[#1D2B64] focus:outline-none focus:border-[#3B6CE7]"
                />
              </div>

              {/* Submit Buttons */}
              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-[#3B6CE7] hover:bg-[#2b56c4] text-white text-xs font-bold rounded-xl shadow-sm transition active:scale-95 disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? 'Processing...' : 'Execute Action'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
