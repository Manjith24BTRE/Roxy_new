import React, { useRef, useState, useEffect, useMemo } from 'react';

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

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
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
  const {
    id,
    name,
    category,
    description = '',
    direction = 'none',
    motionBlur = false,
  } = transition;

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

  const idLower = (id || '').toLowerCase();
  const nameLower = (name || '').toLowerCase();
  const catLower = (category || '').toLowerCase();
  const descLower = (description || '').toLowerCase();
  const dirLower = (direction || '').toLowerCase();
  const transHash = hashString(id + name);

  const animKeyframeName = `vp_anim_${transHash}`;
  const animDuration = idLower.includes('handheld') ? 3.0 : 1.8;

  const keyframesCSS = useMemo(() => {
    const isLeft = dirLower === 'left' || idLower.includes('left') || nameLower.includes('left');
    const isRight = dirLower === 'right' || idLower.includes('right') || nameLower.includes('right');
    const isUp = dirLower === 'up' || idLower.includes('up') || nameLower.includes('up');
    const isDown = dirLower === 'down' || idLower.includes('down') || nameLower.includes('down');
    const isCCW = dirLower === 'ccw' || idLower.includes('ccw');
    const hasMotionBlur = motionBlur || idLower.includes('whip') || nameLower.includes('whip');

    // 1. HANDHELD TRANSITION (Subtle organic camera sway/drift)
    if (idLower.includes('handheld') || nameLower.includes('handheld')) {
      return `
        @keyframes ${animKeyframeName}_A {
          0% { opacity: 1; transform: translate(0, 0) rotate(0deg) scale(1.03); }
          25% { opacity: 1; transform: translate(-3px, 2px) rotate(-0.8deg) scale(1.03); }
          50% { opacity: 1; transform: translate(2px, -3px) rotate(0.9deg) scale(1.03); }
          75% { opacity: 1; transform: translate(-2px, -1px) rotate(-0.5deg) scale(1.03); }
          100% { opacity: 1; transform: translate(0, 0) rotate(0deg) scale(1.03); }
        }
        @keyframes ${animKeyframeName}_B {
          0%, 100% { opacity: 0; }
        }
      `;
    }

    // 2. CAMERA SHAKE (Aggressive rapid camera vibration)
    if (idLower.includes('shake') || nameLower.includes('shake')) {
      return `
        @keyframes ${animKeyframeName}_A {
          0%, 20% { opacity: 1; transform: translate(0, 0) rotate(0deg); }
          30% { opacity: 1; transform: translate(-7px, 5px) rotate(-2.5deg); }
          40% { opacity: 1; transform: translate(6px, -6px) rotate(3deg); }
          50% { opacity: 1; transform: translate(-8px, 4px) rotate(-2deg); }
          60% { opacity: 1; transform: translate(7px, -4px) rotate(2.5deg); }
          70%, 100% { opacity: 0; transform: translate(0, 0) rotate(0deg); }
        }
        @keyframes ${animKeyframeName}_B {
          0%, 50% { opacity: 0; transform: scale(1.1); }
          70%, 100% { opacity: 1; transform: scale(1); }
        }
      `;
    }

    // 3. BLACK FADE
    if (idLower.includes('black') || nameLower.includes('black')) {
      return `
        @keyframes ${animKeyframeName}_A {
          0%, 30% { opacity: 1; filter: brightness(1); }
          45%, 55% { opacity: 0; filter: brightness(0); }
          70%, 100% { opacity: 1; filter: brightness(1); }
        }
        @keyframes ${animKeyframeName}_B {
          0%, 30% { opacity: 0; filter: brightness(0); }
          45%, 55% { opacity: 0; filter: brightness(0); }
          70%, 100% { opacity: 1; filter: brightness(1); }
        }
        @keyframes ${animKeyframeName}_over {
          0%, 30% { opacity: 0; }
          45%, 55% { opacity: 1; background: #000000; }
          70%, 100% { opacity: 0; }
        }
      `;
    }

    // 4. WHITE FADE / BRIGHT FLASH
    if (idLower.includes('white') || nameLower.includes('white') || idLower.includes('flash') || nameLower.includes('flash')) {
      return `
        @keyframes ${animKeyframeName}_A {
          0%, 30% { opacity: 1; filter: brightness(1); }
          45%, 55% { opacity: 0.3; filter: brightness(3.5); }
          70%, 100% { opacity: 1; filter: brightness(1); }
        }
        @keyframes ${animKeyframeName}_B {
          0%, 30% { opacity: 0; filter: brightness(1); }
          45%, 55% { opacity: 0.3; filter: brightness(3.5); }
          70%, 100% { opacity: 1; filter: brightness(1); }
        }
        @keyframes ${animKeyframeName}_over {
          0%, 30% { opacity: 0; }
          45%, 55% { opacity: 1; background: #ffffff; }
          70%, 100% { opacity: 0; }
        }
      `;
    }

    // 5. DIRECTIONAL SLIDE & WHIP PAN & PUSH & DROP & MOVE
    if (catLower.includes('slide') || catLower.includes('push') || idLower.includes('whip') || idLower.includes('slide') || idLower.includes('push') || idLower.includes('pan') || idLower.includes('move') || idLower.includes('drop')) {
      let xA = -100, yA = 0, xB = 100, yB = 0;
      if (isRight) { xA = 100; xB = -100; }
      else if (isUp) { xA = 0; yA = -100; xB = 0; yB = 100; }
      else if (isDown || idLower.includes('drop')) { xA = 0; yA = 100; xB = 0; yB = -100; }
      else if (idLower.includes('diagonal')) { xA = -100; yA = -100; xB = 100; yB = 100; }

      const blurVal = hasMotionBlur ? 'blur(8px)' : 'none';

      return `
        @keyframes ${animKeyframeName}_A {
          0%, 30% { opacity: 1; transform: translate(0, 0); filter: none; }
          50%, 70% { opacity: 0; transform: translate(${xA}%, ${yA}%); filter: ${blurVal}; }
          100% { opacity: 1; transform: translate(0, 0); filter: none; }
        }
        @keyframes ${animKeyframeName}_B {
          0%, 30% { opacity: 0; transform: translate(${xB}%, ${yB}%); filter: ${blurVal}; }
          50%, 70% { opacity: 1; transform: translate(0, 0); filter: none; }
          100% { opacity: 0; transform: translate(${xB}%, ${yB}%); filter: ${blurVal}; }
        }
      `;
    }

    // 6. ZOOM TRANSITIONS (Zoom In, Zoom Out, Crash Zoom)
    if (catLower.includes('zoom') || idLower.includes('zoom') || nameLower.includes('zoom')) {
      const isOut = idLower.includes('out') || nameLower.includes('out');
      if (isOut) {
        return `
          @keyframes ${animKeyframeName}_A {
            0%, 30% { opacity: 1; transform: scale(1); }
            50%, 70% { opacity: 0; transform: scale(0.15); }
            100% { opacity: 1; transform: scale(1); }
          }
          @keyframes ${animKeyframeName}_B {
            0%, 30% { opacity: 0; transform: scale(2.5); }
            50%, 70% { opacity: 1; transform: scale(1); }
            100% { opacity: 0; transform: scale(2.5); }
          }
        `;
      } else {
        return `
          @keyframes ${animKeyframeName}_A {
            0%, 30% { opacity: 1; transform: scale(1); filter: none; }
            50%, 70% { opacity: 0; transform: scale(3.5); filter: blur(4px); }
            100% { opacity: 1; transform: scale(1); filter: none; }
          }
          @keyframes ${animKeyframeName}_B {
            0%, 30% { opacity: 0; transform: scale(0.2); filter: blur(4px); }
            50%, 70% { opacity: 1; transform: scale(1); filter: none; }
            100% { opacity: 0; transform: scale(0.2); filter: blur(4px); }
          }
        `;
      }
    }

    // 7. ROTATE & SPIN & FLIP & CUBE
    if (catLower.includes('spin') || idLower.includes('spin') || idLower.includes('rotate') || idLower.includes('flip') || idLower.includes('cube')) {
      const rotAngle = isCCW ? -180 : 180;
      if (idLower.includes('flip') || idLower.includes('card')) {
        return `
          @keyframes ${animKeyframeName}_A {
            0%, 30% { opacity: 1; transform: perspective(400px) rotateY(0deg); }
            50%, 70% { opacity: 0; transform: perspective(400px) rotateY(${rotAngle}deg); }
            100% { opacity: 1; transform: perspective(400px) rotateY(0deg); }
          }
          @keyframes ${animKeyframeName}_B {
            0%, 30% { opacity: 0; transform: perspective(400px) rotateY(${-rotAngle}deg); }
            50%, 70% { opacity: 1; transform: perspective(400px) rotateY(0deg); }
            100% { opacity: 0; transform: perspective(400px) rotateY(${-rotAngle}deg); }
          }
        `;
      }

      return `
        @keyframes ${animKeyframeName}_A {
          0%, 30% { opacity: 1; transform: rotate(0deg) scale(1); }
          50%, 70% { opacity: 0; transform: rotate(${rotAngle}deg) scale(0.2); }
          100% { opacity: 1; transform: rotate(0deg) scale(1); }
        }
        @keyframes ${animKeyframeName}_B {
          0%, 30% { opacity: 0; transform: rotate(${-rotAngle}deg) scale(0.2); }
          50%, 70% { opacity: 1; transform: rotate(0deg) scale(1); }
          100% { opacity: 0; transform: rotate(${-rotAngle}deg) scale(0.2); }
        }
      `;
    }

    // 8. GLITCH & DIGITAL / RGB SPLIT / VHS
    if (catLower.includes('glitch') || idLower.includes('glitch') || idLower.includes('rgb') || idLower.includes('vhs')) {
      return `
        @keyframes ${animKeyframeName}_A {
          0%, 30% { opacity: 1; transform: translate(0, 0); filter: none; }
          40% { opacity: 0.8; transform: translate(-6px, 3px); filter: hue-rotate(90deg) contrast(1.5); }
          50%, 70% { opacity: 0; transform: translate(0, 0); filter: none; }
          100% { opacity: 1; transform: translate(0, 0); filter: none; }
        }
        @keyframes ${animKeyframeName}_B {
          0%, 30% { opacity: 0; transform: translate(0, 0); filter: none; }
          40% { opacity: 0.5; transform: translate(6px, -3px); filter: hue-rotate(-90deg); }
          50%, 70% { opacity: 1; transform: translate(0, 0); filter: none; }
          100% { opacity: 0; transform: translate(0, 0); filter: none; }
        }
      `;
    }

    // 9. RACK FOCUS / BLUR
    if (catLower.includes('blur') || idLower.includes('blur') || idLower.includes('focus')) {
      return `
        @keyframes ${animKeyframeName}_A {
          0%, 30% { opacity: 1; filter: blur(0px); }
          50%, 70% { opacity: 0; filter: blur(12px); }
          100% { opacity: 1; filter: blur(0px); }
        }
        @keyframes ${animKeyframeName}_B {
          0%, 30% { opacity: 0; filter: blur(12px); }
          50%, 70% { opacity: 1; filter: blur(0px); }
          100% { opacity: 0; filter: blur(12px); }
        }
      `;
    }

    // 10. CINEMATIC LIGHT LEAKS / BURN / FLARE
    if (catLower.includes('light') || catLower.includes('cine') || idLower.includes('burn') || idLower.includes('leak') || idLower.includes('flare')) {
      return `
        @keyframes ${animKeyframeName}_A {
          0%, 30% { opacity: 1; filter: brightness(1); }
          45%, 55% { opacity: 0.4; filter: brightness(2.2); }
          70%, 100% { opacity: 1; filter: brightness(1); }
        }
        @keyframes ${animKeyframeName}_B {
          0%, 30% { opacity: 0; filter: brightness(1); }
          45%, 55% { opacity: 0.4; filter: brightness(2.2); }
          70%, 100% { opacity: 1; filter: brightness(1); }
        }
        @keyframes ${animKeyframeName}_over {
          0%, 25% { opacity: 0; transform: translateX(-100%); }
          45%, 55% { opacity: 0.95; transform: translateX(0%); background: radial-gradient(circle, rgba(245,158,11,0.95) 0%, rgba(239,68,68,0.7) 60%, transparent 90%); }
          75%, 100% { opacity: 0; transform: translateX(100%); }
        }
      `;
    }

    // DEFAULT CROSS DISSOLVE
    return `
      @keyframes ${animKeyframeName}_A {
        0%, 30% { opacity: 1; }
        50%, 70% { opacity: 0; }
        100% { opacity: 1; }
      }
      @keyframes ${animKeyframeName}_B {
        0%, 30% { opacity: 0; }
        50%, 70% { opacity: 1; }
        100% { opacity: 0; }
      }
    `;
  }, [idLower, nameLower, catLower, descLower, dirLower, motionBlur, animKeyframeName]);

  const playState = (isInView && !reducedMotion) ? 'running' : 'paused';

  return (
    <div className={`flex flex-col gap-1.5 select-none w-full h-full ${className}`}>
      {/* 16:9 REALISTIC MINI VIDEO PREVIEW FRAME (ZERO TEXT, ZERO EMOJIS, ZERO OVERLAYS) */}
      <div
        ref={containerRef}
        className="relative w-full aspect-video rounded-lg overflow-hidden bg-slate-950 border border-slate-800/80 shadow-md group transition-all duration-300 hover:border-sky-500/50 hover:shadow-[0_0_15px_rgba(56,189,248,0.25)]"
      >
        <style>{keyframesCSS}</style>

        {/* REALISTIC SCENE A: HOT-AIR BALLOON LANDSCAPE */}
        <VisualSceneA
          style={{
            animationName: `${animKeyframeName}_A`,
            animationDuration: `${animDuration}s`,
            animationIterationCount: 'infinite',
            animationTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
            animationPlayState: playState,
          }}
        />

        {/* REALISTIC SCENE B: FUTURISTIC NIGHT CITY SKYLINE */}
        <VisualSceneB
          style={{
            animationName: `${animKeyframeName}_B`,
            animationDuration: `${animDuration}s`,
            animationIterationCount: 'infinite',
            animationTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
            animationPlayState: playState,
          }}
        />

        {/* LIGHT OVERLAY SHIMMER LAYER */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            animationName: `${animKeyframeName}_over`,
            animationDuration: `${animDuration}s`,
            animationIterationCount: 'infinite',
            animationTimingFunction: 'ease-in-out',
            animationPlayState: playState,
          }}
        />
      </div>

      {/* TRANSITION NAME & DESCRIPTION OUTSIDE BELOW PREVIEW ONLY */}
      {showDetailsBelow && (
        <div className="px-0.5 pt-0.5">
          <div className="text-xs font-semibold text-slate-100 truncate leading-tight group-hover:text-sky-300 transition">
            {name}
          </div>
          {description && (
            <div className="text-[10px] text-slate-400 truncate mt-0.5 font-sans leading-tight">
              {description}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TransitionThumbnail;
