import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { MoreHorizontal } from 'lucide-react';
import { ProfileMenu } from './ProfileMenu';

interface SidebarProfileProps {
  collapsed: boolean;
}

export function SidebarProfile({ collapsed }: SidebarProfileProps) {
  const { user, userProfile, signOut } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const getInitials = (name?: string, email?: string) => {
    if (name && name.trim()) return name.substring(0, 2).toUpperCase();
    if (email && email.trim()) return email.substring(0, 2).toUpperCase();
    return 'VX';
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);

  const handleSignOut = () => {
    setMenuOpen(false);
    signOut();
    navigate('/');
  };

  const currentUser = {
    displayName: userProfile?.display_name || user?.user_metadata?.full_name || user?.user_metadata?.name || 'Creator',
    email: user?.email || 'No email',
    avatarUrl: userProfile?.avatar_url || user?.user_metadata?.avatar_url || user?.user_metadata?.picture || '',
  };

  return (
    <div className="relative p-3 flex-shrink-0 mt-auto border-t border-[#1D2B64]/5" ref={menuRef}>
      
      {menuOpen && (
        <ProfileMenu 
          user={currentUser} 
          collapsed={collapsed} 
          onClose={() => setMenuOpen(false)} 
          onSignOut={handleSignOut} 
        />
      )}

      {/* Profile Button */}
      <button
        onClick={() => setMenuOpen(!menuOpen)}
        className={`w-full flex items-center gap-3 rounded-xl p-2 hover:bg-[#F8FBFD] transition-colors focus:outline-none focus:ring-2 focus:ring-[#3B6CE7]/20 ${collapsed ? 'justify-center' : ''}`}
        aria-label="User profile menu"
        aria-expanded={menuOpen}
      >
        <div className="relative flex-shrink-0">
          {currentUser.avatarUrl ? (
            <img src={currentUser.avatarUrl} alt={currentUser.displayName} className="w-9 h-9 rounded-lg object-cover border border-[#1D2B64]/10 bg-white" />
          ) : (
            <div className="w-9 h-9 rounded-lg bg-[#E6F2F8] border border-[#3B6CE7]/20 text-[#3B6CE7] flex items-center justify-center text-xs font-bold font-mono">
              {getInitials(currentUser.displayName, currentUser.email)}
            </div>
          )}
        </div>
        
        {!collapsed && (
          <>
            <div className="flex-1 min-w-0 text-left">
              <div className="text-sm font-semibold text-[#1D2B64] truncate">{currentUser.displayName}</div>
              <div className="text-[10px] text-[#1D2B64]/60 truncate">{currentUser.email}</div>
            </div>
            <MoreHorizontal size={16} className="text-[#1D2B64]/40 flex-shrink-0" />
          </>
        )}
      </button>

    </div>
  );
}
