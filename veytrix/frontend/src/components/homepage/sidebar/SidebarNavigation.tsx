import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, FolderOpen, Star, TrendingUp, Plus } from 'lucide-react';

interface SidebarNavigationProps {
  collapsed: boolean;
  onMobileItemClick?: () => void;
}

export function SidebarNavigation({ collapsed, onMobileItemClick }: SidebarNavigationProps) {
  const location = useLocation();

  const navItems = [
    { to: '/home', icon: Home, label: 'Home' },
    { to: '/projects', icon: FolderOpen, label: 'Projects' },
    { to: '/templates', icon: Star, label: 'Templates' },
    { to: '/learning', icon: TrendingUp, label: 'Learning' },
  ];

  return (
    <div className="flex flex-col gap-1 px-3 mt-6 flex-shrink-0">

      {/* New Project CTA */}
      <Link
        to="/upload"
        onClick={onMobileItemClick}
        className={`mb-4 flex items-center justify-center gap-2 rounded-xl bg-white border border-[#3B6CE7]/20 shadow-sm text-[#3B6CE7] hover:bg-[#F8FBFD] hover:border-[#3B6CE7]/40 transition-colors ${collapsed ? 'py-3' : 'py-2.5 px-4'}`}
        title={collapsed ? "New Project" : undefined}
      >
        <Plus size={18} className="flex-shrink-0" />
        {!collapsed && <span className="font-semibold text-sm">New Project</span>}
      </Link>

      {/* Main Links */}
      {navItems.map((item, i) => {
        const active = location.pathname === item.to || (item.to !== '/home' && location.pathname.startsWith(item.to));

        return (
          <Link
            key={i}
            to={item.to}
            onClick={onMobileItemClick}
            title={collapsed ? item.label : undefined}
            className={`flex items-center gap-3 rounded-lg transition-colors group ${collapsed ? 'justify-center p-3' : 'px-3 py-2.5'} ${active
              ? 'bg-[#3B6CE7]/[0.08] text-[#1D2B64]'
              : 'text-[#1D2B64]/70 hover:bg-[#F8FBFD] hover:text-[#1D2B64]'
              }`}
          >
            <item.icon size={18} className={`flex-shrink-0 ${active ? 'text-[#3B6CE7]' : 'text-[#1D2B64]/50 group-hover:text-[#1D2B64]'}`} />
            {!collapsed && <span className="text-sm font-medium">{item.label}</span>}
          </Link>
        );
      })}
    </div>
  );
}
