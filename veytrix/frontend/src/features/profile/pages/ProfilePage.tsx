import React from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { User, Mail } from 'lucide-react';

export function ProfilePage() {
  const { user } = useAuth();
  
  const getInitials = (name?: string, email?: string) => {
    if (name) return name.substring(0, 2).toUpperCase();
    if (email) return email.substring(0, 2).toUpperCase();
    return 'CR';
  };

  return (
    <div className="px-4 md:px-6 xl:px-8 py-8 w-full max-w-3xl mx-auto flex flex-col h-full">
      <h1 className="text-2xl md:text-[32px] font-display font-bold text-[#1D2B64] mb-8">Profile</h1>
      
      <div className="bg-white border border-[#1D2B64]/10 rounded-2xl p-6 md:p-10 shadow-sm flex flex-col md:flex-row items-start gap-8">
        <div className="flex-shrink-0">
          {user?.avatarUrl ? (
            <img src={user.avatarUrl} alt="Avatar" className="w-24 h-24 rounded-2xl object-cover border border-[#1D2B64]/10" />
          ) : (
            <div className="w-24 h-24 rounded-2xl bg-[#E6F2F8] border border-[#3B6CE7]/20 text-[#3B6CE7] flex items-center justify-center text-2xl font-bold font-mono">
              {getInitials(user?.displayName, user?.email)}
            </div>
          )}
        </div>
        
        <div className="flex-1 w-full space-y-6">
          <div>
            <label className="flex items-center gap-2 text-xs font-semibold text-[#1D2B64]/50 uppercase tracking-wider mb-2">
              <User size={14} /> Display Name
            </label>
            <div className="text-lg font-medium text-[#1D2B64] bg-[#F8FBFD] px-4 py-3 rounded-xl border border-[#1D2B64]/5">
              {user?.displayName || 'Creator'}
            </div>
          </div>
          
          <div>
            <label className="flex items-center gap-2 text-xs font-semibold text-[#1D2B64]/50 uppercase tracking-wider mb-2">
              <Mail size={14} /> Email Address
            </label>
            <div className="text-lg font-medium text-[#1D2B64] bg-[#F8FBFD] px-4 py-3 rounded-xl border border-[#1D2B64]/5">
              {user?.email || 'No email provided'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
