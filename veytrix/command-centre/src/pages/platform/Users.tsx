import React, { useState } from 'react';
import { useUsers } from '../../hooks/useUsers';
import { DataTable } from '../../components/ui/DataTable';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { StatCard } from '../../components/ui/StatCard';
import { User } from '../../types';
import { Users as UsersIcon, UserCheck, UserPlus, CreditCard, ShieldAlert, RefreshCw, Activity, X, Mail, Calendar, Folder, Video, Award } from 'lucide-react';

export const Users = () => {
  const {
    users,
    totalCount,
    metrics,
    isLoading,
    error,
    searchTerm,
    setSearchTerm,
    planFilter,
    setPlanFilter,
    statusFilter,
    setStatusFilter,
    refresh,
  } = useUsers();

  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-[#1D2B64]">Platform Users</h1>
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 animate-pulse">
              <Activity size={12} /> REALTIME SYNC
            </span>
          </div>
          <p className="text-sm text-[#64748B] mt-1">Manage user accounts, subscriptions, and platform access in real-time from the database.</p>
        </div>

        <div className="flex items-center gap-3">
          {/* Plan Filter */}
          <select
            value={planFilter}
            onChange={(e) => setPlanFilter(e.target.value)}
            className="border border-[#E2E8F0] px-3 py-1.5 rounded-xl text-xs font-semibold text-[#1D2B64] bg-white cursor-pointer"
          >
            <option value="All">All Plans</option>
            <option value="FREE">Free Tier</option>
            <option value="PRO">Pro Tier</option>
            <option value="ENTERPRISE">Enterprise</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-[#E2E8F0] px-3 py-1.5 rounded-xl text-xs font-semibold text-[#1D2B64] bg-white cursor-pointer"
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Suspended">Suspended</option>
            <option value="Banned">Banned</option>
          </select>

          <button
            onClick={refresh}
            className="p-2 border border-[#E2E8F0] rounded-xl text-[#64748B] hover:bg-white hover:text-[#1D2B64] transition-colors flex items-center gap-2 text-xs font-semibold cursor-pointer"
            title="Refresh Data"
          >
            <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex justify-between items-center">
          <span>Failed to load database users: {error}</span>
          <button onClick={refresh} className="font-bold underline cursor-pointer">Retry</button>
        </div>
      )}

      {/* User Dashboard Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard
          title="Total Users"
          value={(metrics?.totalUsers ?? totalCount).toLocaleString()}
          icon={UsersIcon}
        />
        <StatCard
          title="Active 24h"
          value={(metrics?.activeUsers24h ?? 0).toLocaleString()}
          icon={UserCheck}
        />
        <StatCard
          title="New Today"
          value={(metrics?.newUsersToday ?? 0).toLocaleString()}
          icon={UserPlus}
        />
        <StatCard
          title="Paid Users"
          value={(metrics?.paidUsers ?? 0).toLocaleString()}
          icon={CreditCard}
        />
        <StatCard
          title="Free Users"
          value={(metrics?.freeUsers ?? 0).toLocaleString()}
          icon={UsersIcon}
        />
        <StatCard
          title="Suspended"
          value={(metrics?.suspendedUsers ?? 0).toLocaleString()}
          icon={ShieldAlert}
        />
      </div>

      {/* Users Data Table */}
      <DataTable
        data={users}
        onSearch={setSearchTerm}
        searchPlaceholder="Search users by name, email, or user ID..."
        columns={[
          {
            header: 'User',
            key: 'name',
            render: (user) => (
              <div
                onClick={() => setSelectedUser(user)}
                className="cursor-pointer hover:opacity-80 transition"
              >
                <p className="font-bold text-[#1D2B64]">{user.name}</p>
                <p className="text-xs text-[#64748B] font-mono">{user.email}</p>
              </div>
            ),
          },
          {
            header: 'Plan',
            key: 'plan',
            render: (user) => <span className="font-bold text-xs uppercase px-2 py-0.5 bg-blue-50 text-blue-700 rounded-md">{user.plan}</span>,
          },
          { header: 'Status', key: 'status', render: (user) => <StatusBadge status={user.status} /> },
          {
            header: 'Credits',
            key: 'credits',
            render: (user) => <span className="font-bold text-blue-600">{user.credits.toLocaleString()}</span>,
          },
          {
            header: 'Projects',
            key: 'projectsCount',
            render: (user) => <span className="font-semibold text-xs text-[#1D2B64]">{user.projectsCount ?? 0}</span>,
          },
          {
            header: 'Joined',
            key: 'joinedAt',
            render: (user) => new Date(user.joinedAt).toLocaleDateString(),
          },
          {
            header: 'Last Login',
            key: 'lastLoginAt',
            render: (user) => new Date(user.lastLoginAt).toLocaleString(),
          },
        ]}
      />

      {/* Selected User Detail Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full border border-[#E2E8F0] shadow-2xl space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-[#E2E8F0]">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-[#1D2B64] text-white flex items-center justify-center font-black text-lg">
                  {selectedUser.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-lg font-black text-[#1D2B64]">{selectedUser.name}</h3>
                  <p className="text-xs text-[#64748B] font-mono">{selectedUser.id}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedUser(null)}
                className="p-2 text-[#64748B] hover:text-[#1D2B64] rounded-full hover:bg-slate-100 transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="bg-slate-50 p-3 rounded-xl space-y-1">
                <span className="text-[#64748B] font-semibold flex items-center gap-1">
                  <Mail size={12} /> Email Address
                </span>
                <p className="font-bold text-[#1D2B64] font-mono truncate">{selectedUser.email}</p>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl space-y-1">
                <span className="text-[#64748B] font-semibold flex items-center gap-1">
                  <Award size={12} /> Plan & Status
                </span>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-blue-700">{selectedUser.plan}</span>
                  <StatusBadge status={selectedUser.status} />
                </div>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl space-y-1">
                <span className="text-[#64748B] font-semibold flex items-center gap-1">
                  <CreditCard size={12} /> AI Credits
                </span>
                <p className="font-bold text-blue-600 text-sm">{selectedUser.credits.toLocaleString()} credits</p>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl space-y-1">
                <span className="text-[#64748B] font-semibold flex items-center gap-1">
                  <Folder size={12} /> Projects Saved
                </span>
                <p className="font-bold text-[#1D2B64] text-sm">{selectedUser.projectsCount ?? 0} projects</p>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl space-y-1 col-span-2">
                <span className="text-[#64748B] font-semibold flex items-center gap-1">
                  <Calendar size={12} /> Joined & Activity
                </span>
                <p className="font-medium text-[#1D2B64]">
                  Registered on <strong>{new Date(selectedUser.joinedAt).toLocaleDateString()}</strong> • Last login: <strong>{new Date(selectedUser.lastLoginAt).toLocaleString()}</strong>
                </p>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedUser(null)}
                className="bg-[#1D2B64] text-white px-5 py-2 rounded-xl text-xs font-bold hover:bg-opacity-90 transition cursor-pointer"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
