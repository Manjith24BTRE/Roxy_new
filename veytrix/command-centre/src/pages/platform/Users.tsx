import React from 'react';
import { useUsers } from '../../hooks/useUsers';
import { DataTable } from '../../components/ui/DataTable';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { StatCard } from '../../components/ui/StatCard';
import { Users as UsersIcon, UserCheck, UserPlus, CreditCard, ShieldAlert, RefreshCw } from 'lucide-react';

export const Users = () => {
  const { 
    users, 
    totalCount, 
    metrics,
    isLoading, 
    error, 
    searchTerm, 
    setSearchTerm, 
    page,
    setPage,
    limit,
    refresh 
  } = useUsers();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-[#1D2B64]">Platform Users</h1>
          <p className="text-sm text-[#64748B] mt-1">Manage user accounts, subscriptions, and platform access.</p>
        </div>
        <button 
          onClick={refresh}
          className="p-2 border border-[#E2E8F0] rounded-xl text-[#64748B] hover:bg-white hover:text-[#1D2B64] transition-colors flex items-center gap-2 text-xs font-semibold"
          title="Refresh Data"
        >
          <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex justify-between items-center">
          <span>Failed to load users: {error}</span>
          <button onClick={refresh} className="font-bold underline">Retry</button>
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

      <DataTable 
        data={users}
        onSearch={setSearchTerm}
        searchPlaceholder="Search users by name, email, or user ID..."
        columns={[
          { 
            header: 'User', 
            key: 'name',
            render: (user) => (
              <div>
                <p className="font-bold text-[#1D2B64]">{user.name}</p>
                <p className="text-[10px] text-[#64748B]">{user.email}</p>
              </div>
            )
          },
          { header: 'Plan', key: 'plan', render: (user) => <span className="font-semibold">{user.plan}</span> },
          { header: 'Status', key: 'status', render: (user) => <StatusBadge status={user.status} /> },
          { header: 'Credits', key: 'credits', render: (user) => <span className="font-semibold text-blue-600">{user.credits.toLocaleString()}</span> },
          { header: 'Usage', key: 'usage', render: (user) => user.usage.toLocaleString() },
          { header: 'Joined', key: 'joinedAt', render: (user) => new Date(user.joinedAt).toLocaleDateString() },
          { header: 'Last Login', key: 'lastLoginAt', render: (user) => new Date(user.lastLoginAt).toLocaleString() },
        ]}
      />
    </div>
  );
};


