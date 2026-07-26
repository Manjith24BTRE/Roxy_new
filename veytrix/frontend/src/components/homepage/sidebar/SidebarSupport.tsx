import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { HelpCircle, Flag } from 'lucide-react';

interface SidebarSupportProps {
  collapsed: boolean;
  onMobileItemClick?: () => void;
}

export function SidebarSupport({ collapsed, onMobileItemClick }: SidebarSupportProps) {
  const location = useLocation();

  const items = [
    { to: '/help', icon: HelpCircle, label: 'Help Center' },
    { to: '/report-problem', icon: Flag, label: 'Report a Problem' },
  ];

  return (
    <div className="flex flex-col gap-1 px-3 mb-2 flex-shrink-0">
      
      {items.map((item, i) => {
        const active = location.pathname.startsWith(item.to);
        
        return (
          <Link
            key={i}
            to={item.to}
            onClick={onMobileItemClick}
            title={collapsed ? item.label : undefined}
            className={`flex items-center gap-3 rounded-lg transition-colors group ${collapsed ? 'justify-center p-3' : 'px-3 py-2.5'} ${
              active 
                ? 'bg-[#3B6CE7]/[0.08] text-[#1D2B64]' 
                : 'text-[#1D2B64]/60 hover:bg-[#F8FBFD] hover:text-[#1D2B64]'
            }`}
          >
            <item.icon size={16} className={`flex-shrink-0 ${active ? 'text-[#3B6CE7]' : 'text-[#1D2B64]/40 group-hover:text-[#1D2B64]'}`} />
            {!collapsed && <span className="text-sm font-medium">{item.label}</span>}
          </Link>
        );
      })}
    </div>
  );
}
