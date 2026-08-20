import React, { useRef, useState, useEffect } from 'react';
import { InteractiveTransitionPlayer } from './InteractiveTransitionPlayer';

export interface TransitionThumbnailProps {
  transition: {
    id: string;
    name: string;
    category: string;
    icon?: string;
    description?: string;
    direction?: string;
    easing?: string;
    motionBlur?: boolean;
    intensity?: number;
    keywords?: string[];
  };
  className?: string;
  showDetailsBelow?: boolean;
}

// REALISTIC SCENE A: Sunset Hot Air Balloon Landscape SVG Composition
export const VisualSceneA: React.FC<{ className?: string; style?: React.CSSProperties }> = ({ className, style }) => (
  <div className={`absolute inset-0 overflow-hidden ${className || ''}`} style={style}>
    <svg viewBox="0 0 320 180" className="w-full h-full object-cover">
      <defs>
        <linearGradient id="skyGradA" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fdba74" />
          <stop offset="40%" stopColor="#f97316" />
          <stop offset="70%" stopColor="#ea580c" />
          <stop offset="100%" stopColor="#7c2d12" />
        </linearGradient>
        <radialGradient id="sunGradA" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fef08a" stopOpacity="1" />
          <stop offset="100%" stopColor="#f97316" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="balloonGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#ef4444" />
          <stop offset="33%" stopColor="#f59e0b" />
          <stop offset="66%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#10b981" />
        </linearGradient>
      </defs>
      <rect width="320" height="180" fill="url(#skyGradA)" />
      <circle cx="240" cy="90" r="45" fill="url(#sunGradA)" />
      <circle cx="240" cy="90" r="20" fill="#fef08a" />
      <path d="M 0 180 L 0 130 L 60 90 L 130 140 L 200 80 L 270 130 L 320 100 L 320 180 Z" fill="#9a3412" opacity="0.7" />
      <path d="M 0 180 L 0 150 L 90 110 L 160 160 L 240 105 L 320 145 L 320 180 Z" fill="#451a03" />
      <g transform="translate(70, 35)">
        <path d="M 20 0 C 35 0, 40 15, 30 35 C 25 45, 15 45, 10 35 C 0 15, 5 0, 20 0 Z" fill="url(#balloonGrad)" />
        <rect x="17" y="40" width="6" height="5" fill="#78350f" rx="1" />
        <line x1="14" y1="35" x2="18" y2="40" stroke="#451a03" strokeWidth="0.8" />
        <line x1="26" y1="35" x2="22" y2="40" stroke="#451a03" strokeWidth="0.8" />
      </g>
    </svg>
  </div>
);

// REALISTIC SCENE B: Night City Skyline SVG Composition
export const VisualSceneB: React.FC<{ className?: string; style?: React.CSSProperties }> = ({ className, style }) => (
  <div className={`absolute inset-0 overflow-hidden ${className || ''}`} style={style}>
    <svg viewBox="0 0 320 180" className="w-full h-full object-cover">
      <defs>
        <linearGradient id="skyGradB" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0f172a" />
          <stop offset="60%" stopColor="#1e1b4b" />
          <stop offset="100%" stopColor="#311b92" />
        </linearGradient>
        <linearGradient id="glowB" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#06b6d4" stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect width="320" height="180" fill="url(#skyGradB)" />
      <circle cx="50" cy="30" r="1" fill="#ffffff" opacity="0.8" />
      <circle cx="120" cy="20" r="1" fill="#ffffff" opacity="0.9" />
      <circle cx="200" cy="40" r="1.2" fill="#ffffff" opacity="0.7" />
      <circle cx="280" cy="25" r="1" fill="#ffffff" opacity="0.9" />
      <circle cx="260" cy="45" r="14" fill="#38bdf8" opacity="0.9" />
      <circle cx="255" cy="40" r="12" fill="#0f172a" />
      <rect y="90" width="320" height="90" fill="url(#glowB)" />
      <rect x="20" y="80" width="25" height="100" fill="#090d16" />
      <rect x="30" y="90" width="4" height="6" fill="#38bdf8" opacity="0.8" />
      <rect x="30" y="105" width="4" height="6" fill="#38bdf8" opacity="0.8" />
      <rect x="50" y="60" width="35" height="120" fill="#0f172a" />
      <rect x="62" y="70" width="12" height="100" fill="#6366f1" opacity="0.3" />
      <rect x="90" y="95" width="20" height="85" fill="#090d16" />
      <rect x="115" y="50" width="40" height="130" fill="#1e1b4b" />
      <line x1="135" y1="20" x2="135" y2="50" stroke="#ec4899" strokeWidth="1.5" />
      <rect x="160" y="85" width="30" height="95" fill="#0f172a" />
      <rect x="195" y="70" width="28" height="110" fill="#090d16" />
      <rect x="230" y="90" width="35" height="90" fill="#1e1b4b" />
      <rect x="270" y="75" width="30" height="105" fill="#090d16" />
      <rect y="155" width="320" height="25" fill="#020617" opacity="0.9" />
      <line x1="0" y1="165" x2="320" y2="165" stroke="#38bdf8" strokeWidth="0.5" opacity="0.5" />
    </svg>
  </div>
);

export const TransitionThumbnail: React.FC<TransitionThumbnailProps> = ({
  transition,
  className = '',
  showDetailsBelow = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState<boolean>(false);
  const [reducedMotion, setReducedMotion] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      setReducedMotion(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    }

    const el = containerRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') {
      setIsInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        setIsInView(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} className={`flex flex-col gap-1.5 select-none w-full h-full ${className}`}>
      <InteractiveTransitionPlayer
        transitionInput={transition}
        showControls={false}
        autoplay={isInView && !reducedMotion}
        loop={true}
      />

      {showDetailsBelow && (
        <div className="px-0.5 pt-0.5">
          <div className="text-xs font-semibold text-slate-100 truncate leading-tight group-hover:text-sky-300 transition">
            {transition.name}
          </div>
          {transition.description && (
            <div className="text-[10px] text-slate-400 truncate mt-0.5 font-sans leading-tight">
              {transition.description}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TransitionThumbnail;
