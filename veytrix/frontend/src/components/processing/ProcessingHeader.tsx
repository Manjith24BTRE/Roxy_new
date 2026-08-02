import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { VeytrixLogo } from '../VeytrixLogo';
import { useAuth } from '../../context/AuthContext';

export function ProcessingHeader() {
  const navigate = useNavigate();
  const { user, userProfile } = useAuth();
  
  const rawName = userProfile?.display_name || user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email || 'Creator';
  const avatarUrl = userProfile?.avatar_url || user?.user_metadata?.avatar_url || user?.user_metadata?.picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(rawName)}&background=0ea5e9&color=fff`;

  const handleBack = (e: React.MouseEvent) => {
    e.preventDefault();
    navigate('/upload');
  };

  return (
    <div className="flex items-center justify-between py-4 border-b border-[#1D2B64]/5 w-full shrink-0 select-none">
      <button
        onClick={handleBack}
        className="inline-flex items-center gap-1.5 rounded-full border border-[#1D2B64]/5 bg-white/80 hover:bg-[#3B6CE7] hover:text-white hover:border-[#3B6CE7]/20 hover:shadow-[0_2px_12px_rgba(59,108,231,0.15)] px-4 py-2 text-xs font-semibold transition-all duration-200 focus:outline-none"
      >
        <ChevronLeft size={14} />
        <span>Back</span>
      </button>

      {/* Veytrix Logo */}
      <div className="flex items-center gap-2">
        <VeytrixLogo className="h-6 w-6 text-[#1D2B64]" />
        <span className="font-display text-base font-bold tracking-tight text-[#1D2B64]">VEYTRIX</span>
      </div>

      {/* User profile avatar info */}
      <div className="flex items-center">
        <img
          src={avatarUrl}
          alt={rawName}
          className="h-8 w-8 rounded-full border border-[#3B6CE7]/10 object-cover shadow-sm"
        />
      </div>
    </div>
  );
}
export default ProcessingHeader;
