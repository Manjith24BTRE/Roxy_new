import React, { useState } from 'react';

export interface AvatarProps {
  src?: string | null;
  name?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export function Avatar({ src, name = 'Creator', className = '', size = 'md' }: AvatarProps) {
  const [imageError, setImageError] = useState(false);

  const getInitials = (fullName: string) => {
    if (!fullName) return 'VX';
    const cleanName = fullName.replace(/[@_.]/g, ' ').trim();
    const parts = cleanName.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    if (parts.length === 1) {
      return parts[0].substring(0, 2).toUpperCase();
    }
    return 'VX';
  };

  const sizeClasses = {
    sm: 'w-8 h-8 text-[10px] rounded-lg',
    md: 'w-10 h-10 text-xs rounded-xl',
    lg: 'w-16 h-16 text-lg rounded-2xl',
    xl: 'w-24 h-24 text-2xl rounded-[24px]',
  };

  const currentSizeClass = sizeClasses[size] || sizeClasses.md;

  if (src && !imageError) {
    return (
      <img
        src={src}
        alt={name}
        onError={() => setImageError(true)}
        className={`${currentSizeClass} object-cover border border-border/40 shadow-sm flex-shrink-0 ${className}`}
      />
    );
  }

  return (
    <div
      className={`${currentSizeClass} bg-gradient-to-br from-[#1D2B64] to-[#3B6CE7] text-white flex items-center justify-center font-bold font-mono border border-primary/20 shadow-sm uppercase flex-shrink-0 select-none ${className}`}
    >
      {getInitials(name)}
    </div>
  );
}

export default Avatar;
