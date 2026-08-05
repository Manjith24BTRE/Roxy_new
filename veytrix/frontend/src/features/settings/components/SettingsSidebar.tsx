import React from 'react';
import { 
  User, 
  FileText, 
  FolderKanban, 
  Eye, 
  Bell, 
  Shield, 
  Lock, 
  Database, 
  Keyboard, 
  Accessibility, 
  Link, 
  CreditCard, 
  Download, 
  Info, 
  Sliders 
} from 'lucide-react';

export interface CategoryItem {
  id: string;
  name: string;
  icon: React.ReactNode;
}

interface SettingsSidebarProps {
  activeCategory: string;
  onSelectCategory: (id: string) => void;
}

export function SettingsSidebar({ activeCategory, onSelectCategory }: SettingsSidebarProps) {
  const categories: CategoryItem[] = [
    { id: 'account', name: 'Account', icon: <User size={16} /> },
    { id: 'profile', name: 'Profile', icon: <FileText size={16} /> },
    { id: 'workspace', name: 'Workspace', icon: <FolderKanban size={16} /> },
    { id: 'appearance', name: 'Appearance', icon: <Eye size={16} /> },
    { id: 'notifications', name: 'Notifications', icon: <Bell size={16} /> },
    { id: 'privacy', name: 'Privacy', icon: <Shield size={16} /> },
    { id: 'security', name: 'Security', icon: <Lock size={16} /> },
    { id: 'storage', name: 'Storage', icon: <Database size={16} /> },
    { id: 'shortcuts', name: 'Keyboard Shortcuts', icon: <Keyboard size={16} /> },
    { id: 'accessibility', name: 'Accessibility', icon: <Accessibility size={16} /> },
    { id: 'connected', name: 'Connected Apps', icon: <Link size={16} /> },
    { id: 'billing', name: 'Billing & Credits', icon: <CreditCard size={16} /> },
    { id: 'export', name: 'Export Preferences', icon: <Download size={16} /> },
    { id: 'about', name: 'About VEYTRIX', icon: <Info size={16} /> },
    { id: 'advanced', name: 'Advanced', icon: <Sliders size={16} /> }
  ];

  return (
    <div className="flex flex-col gap-1 w-full max-h-[calc(100vh-200px)] overflow-y-auto pr-2 select-none scrollbar-thin">
      {categories.map((cat) => {
        const isActive = activeCategory === cat.id;
        return (
          <button
            key={cat.id}
            onClick={() => onSelectCategory(cat.id)}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-xs text-left transition-all duration-200 cursor-pointer border relative select-none ${
              isActive
                ? 'bg-[#E6F2F8]/30 border-[#1D2B64]/5 text-[#3B6CE7] font-bold shadow-sm'
                : 'border-transparent text-[#1D2B64]/70 hover:bg-[#FAFAFC] hover:text-[#1D2B64]'
            }`}
          >
            {/* Active Indicator Bar on the left edge */}
            {isActive && (
              <span className="absolute left-0 top-3 bottom-3 w-1 bg-[#3B6CE7] rounded-r" />
            )}
            <span className={`${isActive ? 'text-[#3B6CE7]' : 'text-[#3B6CE7]/70'}`}>{cat.icon}</span>
            <span>{cat.name}</span>
          </button>
        );
      })}
    </div>
  );
}
