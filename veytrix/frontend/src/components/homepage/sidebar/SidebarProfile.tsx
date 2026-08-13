import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { MoreHorizontal } from 'lucide-react';
import { ProfileMenu } from './ProfileMenu';
import { Avatar } from '../../../features/profile/components/Avatar';

interface SidebarProfileProps {
  collapsed: boolean;
}

export function SidebarProfile({ collapsed }: SidebarProfileProps) {
  const { user, userProfile, signOut } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);



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
          <Avatar 
            src={currentUser.avatarUrl} 
            name={currentUser.displayName} 
            className="w-9 h-9 rounded-lg text-xs" 
          />
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
