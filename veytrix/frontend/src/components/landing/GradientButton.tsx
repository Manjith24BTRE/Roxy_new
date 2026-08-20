import React from 'react';
import { ArrowRight, Loader2 } from 'lucide-react';

interface GradientButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
}

export function GradientButton({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  className = '',
  ...props
}: GradientButtonProps) {
  const baseStyle = "inline-flex items-center justify-center font-medium rounded-full transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none focus:outline-none focus:ring-2 focus:ring-[#3B6CE7]/40";
  
  const variants = {
    primary: "bg-[#1D2B64] text-white hover:bg-[#3B6CE7] shadow-[0_4px_12px_rgba(29,43,100,0.15)] hover:shadow-[0_8px_20px_rgba(59,108,231,0.25)]",
    secondary: "bg-[#E6F2F8] text-[#1D2B64] hover:bg-[#8CC8E8]/30 border border-[#3B6CE7]/10",
    outline: "bg-transparent text-[#1D2B64] border border-[#1D2B64]/10 hover:border-[#3B6CE7]/40 hover:bg-[#E6F2F8]/30",
    ghost: "bg-transparent text-[#1D2B64]/80 hover:text-[#1D2B64] hover:bg-[#E6F2F8]/40"
  };

  const sizes = {
    sm: "px-4 py-2 text-xs",
    md: "px-6 py-3 text-sm",
    lg: "px-8 py-4 text-base"
  };

  return (
    <button
      className={`${baseStyle} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : icon ? (
        <span className="mr-2">{icon}</span>
      ) : null}
      {children}
    </button>
  );
}
