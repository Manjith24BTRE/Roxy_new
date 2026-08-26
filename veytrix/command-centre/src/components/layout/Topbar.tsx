import React, { useState } from 'react';
import { Menu, Search, Bell, User } from 'lucide-react';
import { useAuth } from '../../../../frontend/src/context/AuthContext';

export const Topbar = ({ onMenuClick }: { onMenuClick: () => void }) => {
  const { signOut, user } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await signOut();
    // No need to set false — signOut redirects via window.location.href
  };

  return (
    <header className="h-16 bg-white border-b border-[#E2E8F0] flex items-center justify-between px-4 lg:px-8 shrink-0 relative z-20">
      <div className="flex items-center gap-4 flex-1">
        <button 
          onClick={onMenuClick}
          className="p-2 -ml-2 rounded-lg text-[#1D2B64]/70 hover:bg-[#F1F5F9] lg:hidden"
        >
          <Menu size={20} />
        </button>
        
        <div className="hidden md:flex items-center gap-2 px-3 py-2 bg-[#F1F5F9] rounded-lg max-w-md w-full border border-transparent focus-within:border-[#3B6CE7]/50 focus-within:bg-white transition-colors">
          <Search size={16} className="text-[#64748B]" />
          <input 
            type="text" 
            placeholder="Search users, jobs, logs, transactions..." 
            className="bg-transparent border-none outline-none text-xs w-full text-[#1D2B64] placeholder:text-[#64748B]"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        <button className="relative p-2 rounded-lg text-[#1D2B64]/70 hover:bg-[#F1F5F9] transition-colors">
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 border-2 border-white"></span>
        </button>
        
        <div className="h-8 w-px bg-[#E2E8F0] mx-1"></div>
        
        <div className="flex items-center gap-3">
          <div className="hidden sm:block text-right">
            <p className="text-xs font-bold text-[#1D2B64]">Controller</p>
            <p className="text-[10px] text-[#64748B]">{user?.email || 'official@mavrostech.in'}</p>
          </div>
          <div className="w-8 h-8 rounded-full bg-[#1D2B64] text-white flex items-center justify-center font-bold text-xs cursor-pointer">
            C
          </div>
          <button 
            onClick={handleLogout}
            disabled={isLoggingOut}
            className={`text-xs font-semibold px-2 ${isLoggingOut ? 'text-gray-400' : 'text-red-500 hover:text-red-700'}`}
          >
            {isLoggingOut ? 'Logging out...' : 'Logout'}
          </button>
        </div>
      </div>
    </header>
  );
};
