import React from 'react';
import logoUrl from '../../assets/branding/veytrix-logo-new.png';

interface VeytrixLogoProps {
  className?: string;
}

export function VeytrixLogo({ className }: VeytrixLogoProps) {
  return (
    <img
      src={logoUrl}
      alt="VEYTRIX"
      className={`${className || ''} object-contain`}
      style={{ display: 'inline-block' }}
    />
  );
}

export default VeytrixLogo;
