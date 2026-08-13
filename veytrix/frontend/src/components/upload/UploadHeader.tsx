import React from 'react';
import { VeytrixLogo } from '../VeytrixLogo';
import { BackButton } from './BackButton';
import { useAuth } from '../../context/AuthContext';
import { Avatar } from '../../features/profile/components/Avatar';

export function UploadHeader() {
  const { user, userProfile } = useAuth();
  
  const rawName = userProfile?.display_name || user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email || 'Creator';
  const avatarUrl = userProfile?.avatar_url || user?.user_metadata?.avatar_url || user?.user_metadata?.picture || null;

  return (
    <div className="flex items-center justify-between py-4 border-b border-[#1D2B64]/5 w-full shrink-0 select-none">
      <BackButton />

      {/* Veytrix Logo */}
      <div className="flex items-center gap-2">
        <VeytrixLogo className="h-6 w-6 text-[#1D2B64]" />
        <span className="font-display text-base font-bold tracking-tight text-[#1D2B64]">VEYTRIX</span>
      </div>

      {/* User profile avatar info */}
      <div className="flex items-center">
        <Avatar
          src={avatarUrl}
          name={rawName}
          size="sm"
          className="rounded-full border border-[#3B6CE7]/10"
        />
      </div>
    </div>
  );
}
export default UploadHeader;
