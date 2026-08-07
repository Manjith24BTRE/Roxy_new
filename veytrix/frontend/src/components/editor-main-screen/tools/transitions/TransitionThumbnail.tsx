import React, { useRef, useState, useEffect } from 'react';

export interface TransitionThumbnailProps {
  transition: {
    id: string;
    name: string;
    category: string;
    icon?: string;
    description?: string;
  };
  className?: string;
}

// Deterministic string hasher for unique variation parameters per transition
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export const TransitionThumbnail: React.FC<TransitionThumbnailProps> = ({ transition, className = '' }) => {
  const { id, name, category, icon = '⚡' } = transition;
  const containerRef = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState<boolean>(false);

  const catLower = (category || '').toLowerCase();
  const idLower = (id || '').toLowerCase();
  const nameLower = (name || '').toLowerCase();
  const transHash = hashString(id + name);

  // Lazy play viewport observer for high performance (60 FPS, 0 CPU waste offscreen)
  useEffect(() => {
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

  // Categorize into one of 8 category themes
  let catType:
    | 'basic'
    | 'camera'
    | 'zoom'
    | 'slide'
    | 'spin'
    | 'blur'
    | 'glitch'
    | 'cinematic' = 'basic';

  if (catLower.includes('camera') || idLower.startsWith('cam-') || idLower.includes('dolly') || idLower.includes('pan') || idLower.includes('tilt')) {
    catType = 'camera';
  } else if (catLower.includes('zoom') || idLower.includes('zoom') || nameLower.includes('zoom')) {
    catType = 'zoom';
  } else if (catLower.includes('slide') || catLower.includes('push') || idLower.includes('slide') || idLower.includes('push') || idLower.includes('wipe')) {
    catType = 'slide';
  } else if (catLower.includes('spin') || catLower.includes('rotate') || idLower.includes('spin') || idLower.includes('flip') || idLower.includes('cube')) {
    catType = 'spin';
  } else if (catLower.includes('blur') || catLower.includes('motion') || idLower.includes('blur') || idLower.includes('whip')) {
    catType = 'blur';
  } else if (catLower.includes('glitch') || catLower.includes('digital') || idLower.includes('glitch') || idLower.includes('crt') || idLower.includes('tv')) {
    catType = 'glitch';
  } else if (catLower.includes('cine') || catLower.includes('light') || idLower.includes('flare') || idLower.includes('burn') || idLower.includes('flash') || idLower.includes('sun')) {
    catType = 'cinematic';
  } else {
    catType = 'basic';
  }

  // Unique variation properties derived deterministically per transition
  const animDuration = 1.3 + ((transHash % 5) * 0.12); // 1.3s to 1.9s loop
  const hueA = (transHash * 17) % 360;
  const hueB = (hueA + 140 + (transHash % 80)) % 360;
  const uniqueAngle = (transHash % 50) - 25; // -25deg to +25deg
  const scaleMax = 1.4 + ((transHash % 25) / 10); // 1.4x to 3.9x
  const animKeyframeName = `anim_trans_${transHash}`;

  // Generate unique animated keyframes for this specific transition
  const generateKeyframesCSS = () => {
    const isLeft = idLower.includes('left') || nameLower.includes('left');
    const isRight = idLower.includes('right') || nameLower.includes('right');
    const isUp = idLower.includes('up') || nameLower.includes('up');
    const isDown = idLower.includes('down') || nameLower.includes('down');
    const isFade = idLower.includes('fade') || nameLower.includes('fade');
    const isBlack = idLower.includes('black') || nameLower.includes('black');
    const isWhite = idLower.includes('white') || nameLower.includes('white');
    const isDissolve = idLower.includes('dissolve') || nameLower.includes('dissolve');

    if (catType === 'zoom' || idLower.includes('zoom')) {
      return `
        @keyframes ${animKeyframeName}_clipA {
          0%, 25% { opacity: 1; transform: scale(1); }
          50%, 75% { opacity: 0; transform: scale(${scaleMax}); }
          100% { opacity: 1; transform: scale(1); }
        }
        @keyframes ${animKeyframeName}_clipB {
          0%, 25% { opacity: 0; transform: scale(0.3); }
          50%, 75% { opacity: 1; transform: scale(1); }
          100% { opacity: 0; transform: scale(0.3); }
        }
      `;
    }

    if (catType === 'slide' || catType === 'blur' || idLower.includes('slide') || idLower.includes('push') || idLower.includes('whip')) {
      const xDir = isRight ? 100 : isUp || isDown ? 0 : -100;
      const yDir = isDown ? 100 : isUp ? -100 : 0;
      return `
        @keyframes ${animKeyframeName}_clipA {
          0%, 25% { opacity: 1; transform: translate(0, 0); }
          50%, 75% { opacity: 0; transform: translate(${xDir}%, ${yDir}%); }
          100% { opacity: 1; transform: translate(0, 0); }
        }
        @keyframes ${animKeyframeName}_clipB {
          0%, 25% { opacity: 0; transform: translate(${-xDir}%, ${-yDir}%); }
          50%, 75% { opacity: 1; transform: translate(0, 0); }
          100% { opacity: 0; transform: translate(${-xDir}%, ${-yDir}%); }
        }
      `;
    }

    if (catType === 'spin' || idLower.includes('spin') || idLower.includes('rotate') || idLower.includes('flip')) {
      return `
        @keyframes ${animKeyframeName}_clipA {
          0%, 25% { opacity: 1; transform: rotate(0deg) scale(1); }
          50%, 75% { opacity: 0; transform: rotate(${uniqueAngle * 4}deg) scale(0.4); }
          100% { opacity: 1; transform: rotate(0deg) scale(1); }
        }
        @keyframes ${animKeyframeName}_clipB {
          0%, 25% { opacity: 0; transform: rotate(${-uniqueAngle * 4}deg) scale(0.4); }
          50%, 75% { opacity: 1; transform: rotate(0deg) scale(1); }
          100% { opacity: 0; transform: rotate(${-uniqueAngle * 4}deg) scale(0.4); }
        }
      `;
    }

    if (catType === 'glitch' || idLower.includes('glitch') || idLower.includes('crt')) {
      const shiftX = (transHash % 8) + 4;
      return `
        @keyframes ${animKeyframeName}_clipA {
          0%, 25% { opacity: 1; transform: translate(0, 0); filter: none; }
          40% { opacity: 0.8; transform: translate(-${shiftX}px, ${shiftX / 2}px); filter: hue-rotate(90deg); }
          50%, 75% { opacity: 0; transform: translate(${shiftX}px, -${shiftX}px); }
          100% { opacity: 1; transform: translate(0, 0); filter: none; }
        }
        @keyframes ${animKeyframeName}_clipB {
          0%, 25% { opacity: 0; transform: translate(${shiftX}px, -${shiftX / 2}px); }
          40% { opacity: 0.6; transform: translate(-${shiftX}px, ${shiftX}px); filter: hue-rotate(-90deg); }
          50%, 75% { opacity: 1; transform: translate(0, 0); filter: none; }
          100% { opacity: 0; transform: translate(${shiftX}px, -${shiftX / 2}px); }
        }
      `;
    }

    if (catType === 'cinematic' || isBlack || isWhite || idLower.includes('flare') || idLower.includes('burn')) {
      const flashColor = isWhite ? '255, 255, 255' : isBlack ? '0, 0, 0' : '245, 158, 11';
      return `
        @keyframes ${animKeyframeName}_clipA {
          0%, 25% { opacity: 1; filter: brightness(1); }
          45%, 55% { opacity: 0.5; filter: brightness(2.5); }
          70%, 75% { opacity: 0; filter: brightness(1); }
          100% { opacity: 1; filter: brightness(1); }
        }
        @keyframes ${animKeyframeName}_clipB {
          0%, 25% { opacity: 0; filter: brightness(1); }
          45%, 55% { opacity: 0.5; filter: brightness(2.5); }
          70%, 75% { opacity: 1; filter: brightness(1); }
          100% { opacity: 0; filter: brightness(1); }
        }
        @keyframes ${animKeyframeName}_overlay {
          0%, 30% { opacity: 0; transform: scale(0.8); }
          45%, 55% { opacity: 1; transform: scale(1.5); }
          70%, 100% { opacity: 0; transform: scale(0.8); }
        }
      `;
    }

    // Default Cross Dissolve & Basic Blend Keyframes
    return `
      @keyframes ${animKeyframeName}_clipA {
        0%, 25% { opacity: 1; }
        50%, 75% { opacity: 0; }
        100% { opacity: 1; }
      }
      @keyframes ${animKeyframeName}_clipB {
        0%, 25% { opacity: 0; }
        50%, 75% { opacity: 1; }
        100% { opacity: 0; }
      }
    `;
  };

  const playState = isInView ? 'running' : 'paused';

  return (
    <div
      ref={containerRef}
      className={`relative w-full aspect-video rounded-lg overflow-hidden border border-white/10 bg-[#060910] group select-none shadow-md ${className}`}
    >
      <style>{generateKeyframesCSS()}</style>

      {/* BEFORE CLIP (Clip A Scene) */}
      <div
        className="absolute inset-0 flex flex-col justify-between p-1.5 transition-transform"
        style={{
          background: `linear-gradient(135deg, hsl(${hueA}, 75%, 25%), hsl(${(hueA + 40) % 360}, 85%, 15%))`,
          animationName: `${animKeyframeName}_clipA`,
          animationDuration: `${animDuration}s`,
          animationIterationCount: 'infinite',
          animationTimingFunction: 'ease-in-out',
          animationPlayState: playState,
        }}
      >
        <div className="flex items-center justify-between text-[6px] font-mono font-bold text-amber-200/90 tracking-wider">
          <span>CLIP A</span>
          <span className="bg-amber-500/20 px-1 py-0.5 rounded border border-amber-400/30">SCENE 01</span>
        </div>
        <div className="w-full flex items-center justify-center">
          <div className="w-6 h-6 rounded-full border border-amber-300/40 bg-amber-400/10 flex items-center justify-center text-[10px]">
            🎬
          </div>
        </div>
      </div>

      {/* AFTER CLIP (Clip B Scene) */}
      <div
        className="absolute inset-0 flex flex-col justify-between p-1.5 transition-transform"
        style={{
          background: `linear-gradient(135deg, hsl(${hueB}, 80%, 22%), hsl(${(hueB + 50) % 360}, 90%, 14%))`,
          animationName: `${animKeyframeName}_clipB`,
          animationDuration: `${animDuration}s`,
          animationIterationCount: 'infinite',
          animationTimingFunction: 'ease-in-out',
          animationPlayState: playState,
        }}
      >
        <div className="flex items-center justify-between text-[6px] font-mono font-bold text-sky-200/90 tracking-wider">
          <span>CLIP B</span>
          <span className="bg-sky-500/20 px-1 py-0.5 rounded border border-sky-400/30">SCENE 02</span>
        </div>
        <div className="w-full flex items-center justify-center">
          <div className="w-6 h-6 rounded-full border border-sky-300/40 bg-sky-400/10 flex items-center justify-center text-[10px]">
            🎥
          </div>
        </div>
      </div>

      {/* OVERLAY GRAPHIC / HUD / MOTION ICON */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
        {catType === 'camera' && (
          <div className="absolute inset-1 border border-amber-400/30 rounded flex flex-col justify-between p-0.5 text-[5px] font-mono text-amber-300 font-bold">
            <div className="flex justify-between">
              <span className="text-red-400 animate-pulse">REC ●</span>
              <span>4K HUD</span>
            </div>
            <div className="text-center opacity-60">SHUTTER</div>
          </div>
        )}

        {catType === 'glitch' && (
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: 'repeating-linear-gradient(0deg, #000, #000 1px, transparent 1px, transparent 3px)'
            }}
          />
        )}

        {/* Center Transition Badge Icon */}
        <div className="relative z-20 w-6 h-6 rounded-full bg-slate-950/80 border border-white/20 backdrop-blur-md flex items-center justify-center text-[10px] text-white shadow-lg group-hover:scale-110 transition-transform">
          {icon}
        </div>
      </div>

      {/* TRANSITION NAME FOOTER BADGE */}
      <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/95 via-black/75 to-transparent p-1 z-30 flex items-end justify-between">
        <span className="text-[8.5px] font-bold text-white truncate max-w-[88%] leading-tight drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
          {name}
        </span>
        <span className="text-[6.5px] font-mono text-sky-300/80 uppercase font-semibold">
          {catType.substring(0, 4)}
        </span>
      </div>
    </div>
  );
};

export default TransitionThumbnail;
