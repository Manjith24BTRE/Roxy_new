import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { User, Settings, HelpCircle, LogOut } from 'lucide-react';
import { MockUser } from '../../../contexts/AuthContext';

interface ProfileMenuProps {
  user: MockUser;
  collapsed: boolean;
  onClose: () => void;
  onSignOut: () => void;
}

export function ProfileMenu({ user, collapsed, onClose, onSignOut }: ProfileMenuProps) {

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  return (
    <div className={`absolute bottom-[calc(100%+8px)] bg-white rounded-xl shadow-[0_4px_24px_rgba(0,0,0,0.08)] border border-[#1D2B64]/10 py-1.5 z-50 ${collapsed ? 'left-3 w-48' : 'left-3 right-3'}`}>
      <div className="px-3 py-2 mb-1 border-b border-[#1D2B64]/5">
        <div className="text-sm font-semibold text-[#1D2B64] truncate">{user.displayName || 'Creator'}</div>
        <div className="text-[10px] text-[#1D2B64]/60 truncate">{user.email}</div>
      </div>
      
      <Link
        to="/profile"
        onClick={onClose}
        className="flex items-center gap-2 px-3 py-2 text-sm text-[#1D2B64]/80 hover:bg-[#F8FBFD] hover:text-[#1D2B64] transition-colors"
      >
        <User size={14} /> View Profile
      </Link>
      <Link
        to="/settings"
        onClick={onClose}
        className="flex items-center gap-2 px-3 py-2 text-sm text-[#1D2B64]/80 hover:bg-[#F8FBFD] hover:text-[#1D2B64] transition-colors"
      >
        <Settings size={14} /> Settings
      </Link>
      <Link
        to="/help"
        onClick={onClose}
        className="flex items-center gap-2 px-3 py-2 text-sm text-[#1D2B64]/80 hover:bg-[#F8FBFD] hover:text-[#1D2B64] transition-colors"
      >
        <HelpCircle size={14} /> Help Center
      </Link>
      
      <div className="h-px bg-[#1D2B64]/5 my-1 mx-2" />
      
      <button
        onClick={onSignOut}
        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors text-left"
      >
        <LogOut size={14} /> Sign out
      </button>
    </div>
  );
}
