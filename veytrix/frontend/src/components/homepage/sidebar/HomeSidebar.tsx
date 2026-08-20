import React, { useState, useEffect } from 'react';
import { PanelLeftClose, PanelLeftOpen, X } from 'lucide-react';
import { VeytrixLogo } from '../../VeytrixLogo';
import { SidebarNavigation } from './SidebarNavigation';
import { SidebarSupport } from './SidebarSupport';
import { SidebarProfile } from './SidebarProfile';

interface HomeSidebarProps {
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export function HomeSidebar({ mobileOpen, onMobileClose }: HomeSidebarProps) {
  // Check local storage or default to false
  const [collapsed, setCollapsed] = useState(false);

  // Close mobile sidebar on escape key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && mobileOpen) onMobileClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [mobileOpen, onMobileClose]);

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 bg-[#1D2B64]/20 backdrop-blur-sm z-40 md:hidden" 
          onClick={onMobileClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Shell */}
      <aside 
        className={`
          fixed md:static inset-y-0 left-0 z-50 
          bg-white border-r border-[#1D2B64]/[0.08] 
          flex flex-col h-full overflow-hidden flex-shrink-0
          transition-all duration-200 ease-in-out
          ${collapsed ? 'md:w-[72px]' : 'md:w-[240px] xl:w-[260px]'}
          ${mobileOpen ? 'w-[260px] translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        {/* Top Branding & Controls */}
        <div className={`h-14 flex items-center flex-shrink-0 ${collapsed ? 'justify-center px-2' : 'justify-between px-4'}`}>
          <div className="flex items-center gap-2 overflow-hidden">
            <VeytrixLogo className="h-6 w-6 text-[#1D2B64] flex-shrink-0" />
            {!collapsed && <span className="font-display font-bold text-base tracking-tight text-[#1D2B64] truncate">VEYTRIX</span>}
          </div>
          
          <div className="flex items-center">
            {/* Desktop Collapse Toggle */}
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="hidden md:flex p-1.5 rounded-md text-[#1D2B64]/40 hover:bg-[#F8FBFD] hover:text-[#1D2B64] transition-colors focus:outline-none"
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {collapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
            </button>
            
            {/* Mobile Close Button */}
            <button
              onClick={onMobileClose}
              className="md:hidden p-1.5 rounded-md text-[#1D2B64]/60 hover:bg-[#F8FBFD] hover:text-[#1D2B64] transition-colors focus:outline-none"
              aria-label="Close sidebar"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Scrollable Middle Area */}
        <div className="flex-none">
          <SidebarNavigation collapsed={collapsed} onMobileItemClick={onMobileClose} />
        </div>

        {/* Flexible Spacer */}
        <div className="flex-1 min-h-[20px]" />

        {/* Bottom Support & Profile Area */}
        <div className="flex-shrink-0">
          <SidebarSupport collapsed={collapsed} onMobileItemClick={onMobileClose} />
          <SidebarProfile collapsed={collapsed} />
        </div>
        
      </aside>
    </>
  );
}
