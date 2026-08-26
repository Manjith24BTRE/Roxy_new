import React from 'react';

export interface ThumbnailPresetProps {
  id: string;
  name: string;
  category: string;
  description?: string;
  cssFilter?: string;
  overlayStyle?: Record<string, string>;
}

export interface EffectThumbnailProps {
  preset: ThumbnailPresetProps;
  className?: string;
}

// Consistent base sample image for all thumbnail previews
const BASE_SAMPLE_IMAGE = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80';

// Deterministic string hasher for unique variation parameters per effect
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export const EffectThumbnail: React.FC<EffectThumbnailProps> = React.memo(({ preset, className = '' }) => {
  const { id, name, category } = preset;

  const idLower = (id || '').toLowerCase();
  const nameLower = (name || '').toLowerCase();
  const catLower = (category || '').toLowerCase();
  const hash = hashString(id + name);

  // Hash-based parameter modulators for sub-variations inside the same category
  const hashAngle = ((hash % 40) - 20); // -20deg to +20deg
  const hashScale = 0.86 + ((hash % 35) / 100); // 0.86 to 1.21
  const hashShiftX = ((hash % 24) - 12); // -12px to +12px
  const hashShiftY = (((hash >> 2) % 20) - 10);
  const hashHue = hash % 360;

  // ---------------------------------------------------------------------------
  // STEP 1: Map Category string to explicit Category Visual Archetype
  // ---------------------------------------------------------------------------
  type CategoryArchetype =
    | 'basic'
    | 'camera'
    | 'blur'
    | 'glitch'
    | 'cinematic'
    | 'light'
    | 'distortion'
    | 'retro'
    | 'threed'
    | 'comic'
    | 'nature'
    | 'ai';

  let archetype: CategoryArchetype = 'basic';

  if (catLower.includes('glitch') || catLower.includes('cyber') || catLower.includes('signal') || idLower.includes('glitch')) {
    archetype = 'glitch';
  } else if (catLower.includes('cine') || catLower.includes('film') || catLower.includes('movie') || catLower.includes('grade')) {
    archetype = 'cinematic';
  } else if (catLower.includes('camera') || catLower.includes('cam') || idLower.includes('dolly') || idLower.includes('pan')) {
    archetype = 'camera';
  } else if (catLower.includes('blur') || catLower.includes('focus') || catLower.includes('bokeh')) {
    archetype = 'blur';
  } else if (catLower.includes('light') || catLower.includes('flare') || catLower.includes('leak') || catLower.includes('glow') || catLower.includes('neon')) {
    archetype = 'light';
  } else if (catLower.includes('distort') || catLower.includes('warp') || catLower.includes('lens') || catLower.includes('fisheye')) {
    archetype = 'distortion';
  } else if (catLower.includes('retro') || catLower.includes('vhs') || catLower.includes('crt') || catLower.includes('vintage') || catLower.includes('analog')) {
    archetype = 'retro';
  } else if (catLower.includes('3d') || idLower.includes('3d') || catLower.includes('stereo') || catLower.includes('depth')) {
    archetype = 'threed';
  } else if (catLower.includes('comic') || catLower.includes('art') || catLower.includes('sketch') || catLower.includes('poster')) {
    archetype = 'comic';
  } else if (catLower.includes('nature') || catLower.includes('weather') || catLower.includes('fire') || catLower.includes('smoke') || catLower.includes('particles')) {
    archetype = 'nature';
  } else if (catLower.includes('ai') || catLower.includes('sci-fi') || catLower.includes('gaming') || catLower.includes('holo')) {
    archetype = 'ai';
  } else {
    archetype = 'basic';
  }

  // ---------------------------------------------------------------------------
  // STEP 2: Category-Specific Visual Language & Base Compositions
  // ---------------------------------------------------------------------------

  // A. GLITCH CATEGORY: Cyberpunk Signal Corruption & RGB Channel Separation
  if (archetype === 'glitch') {
    const isSplit = idLower.includes('rgb') || idLower.includes('split') || nameLower.includes('split');
    const isNoise = idLower.includes('static') || idLower.includes('noise') || nameLower.includes('static');
    const isScan = idLower.includes('scan') || idLower.includes('tear');

    const shiftAmount = (6 + (hash % 10));
    const isVerticalSlice = hash % 2 === 0;

    return (
      <div className={`relative w-full h-full bg-[#05070d] overflow-hidden select-none ${className}`}>
        {/* Background RGB Displacement Layer 1 (Red Channel) */}
        <img
          src={BASE_SAMPLE_IMAGE}
          alt=""
          className="absolute inset-0 w-full h-full object-cover mix-blend-screen opacity-70"
          style={{
            transform: `translate(${shiftAmount}px, ${-shiftAmount * 0.5}px) scale(1.05)`,
            filter: 'hue-rotate(-90deg) saturate(3) contrast(1.5)',
          }}
        />

        {/* Background RGB Displacement Layer 2 (Cyan Channel) */}
        <img
          src={BASE_SAMPLE_IMAGE}
          alt=""
          className="absolute inset-0 w-full h-full object-cover mix-blend-screen opacity-70"
          style={{
            transform: `translate(${-shiftAmount}px, ${shiftAmount * 0.5}px) scale(1.05)`,
            filter: 'hue-rotate(90deg) saturate(3) contrast(1.5)',
          }}
        />

        {/* Main Base Corrupted Image */}
        <img
          src={BASE_SAMPLE_IMAGE}
          alt={name}
          className="absolute inset-0 w-full h-full object-cover opacity-85"
          style={{
            filter: `hue-rotate(${(hashHue % 120) - 60}deg) contrast(1.4) saturate(1.3)`,
            transform: `scale(${(0.95 + (hash % 15) / 100).toFixed(2)})`,
          }}
          loading="lazy"
        />

        {/* Horizontal Glitch Slice Bar Displacement */}
        <div
          className="absolute inset-x-0 h-3 bg-cyan-400/30 backdrop-invert pointer-events-none"
          style={{
            top: `${(20 + (hash % 60))}%`,
            transform: `translateX(${((hash % 30) - 15)}px)`,
          }}
        />

        {/* Cyberpunk Signal Interference Grid Lines */}
        <div
          className="absolute inset-0 pointer-events-none opacity-40 mix-blend-overlay"
          style={{
            background: 'repeating-linear-gradient(0deg, rgba(56,189,248,0.3), rgba(56,189,248,0.3) 1px, transparent 1px, transparent 4px)',
          }}
        />

        {/* Category Badge Indicator */}
        <div className="absolute bottom-1 left-1 px-1 py-0.5 rounded bg-cyan-950/80 border border-cyan-500/40 text-[7px] font-mono text-cyan-300 font-bold uppercase tracking-wider">
          ⚡ GLITCH
        </div>
      </div>
    );
  }

  // B. CINEMATIC CATEGORY: Anamorphic Hollywood 2.39:1 Frame & Film Grain
  if (archetype === 'cinematic') {
    const isWarm = idLower.includes('gold') || idLower.includes('warm') || idLower.includes('sunset') || idLower.includes('amber');
    const isTeal = idLower.includes('teal') || idLower.includes('blockbuster') || idLower.includes('cool');
    const isBw = idLower.includes('noir') || idLower.includes('classic') || idLower.includes('vintage');

    let cineFilter = 'contrast(1.25) saturate(1.15)';
    if (isWarm) cineFilter = 'sepia(0.35) contrast(1.2) saturate(1.3) hue-rotate(-10deg)';
    else if (isTeal) cineFilter = 'hue-rotate(160deg) contrast(1.3) saturate(1.2)';
    else if (isBw) cineFilter = 'grayscale(100%) contrast(1.4) brightness(0.9)';

    return (
      <div className={`relative w-full h-full bg-[#020408] overflow-hidden select-none ${className}`}>
        {/* Cinematic Widescreen Letterbox Container */}
        <div className="absolute inset-x-0 inset-y-2 overflow-hidden border-y border-amber-500/20">
          <img
            src={BASE_SAMPLE_IMAGE}
            alt={name}
            className="w-full h-full object-cover"
            style={{
              filter: cineFilter,
              transform: `scale(${(1.02 + (hash % 10) / 100).toFixed(2)})`,
            }}
            loading="lazy"
          />

          {/* Anamorphic Lens Flare Streak Overlay */}
          <div
            className="absolute inset-y-0 inset-x-0 pointer-events-none opacity-40 mix-blend-screen"
            style={{
              background: `radial-gradient(ellipse at ${30 + (hash % 40)}% 50%, rgba(56, 189, 248, 0.6) 0%, rgba(245, 158, 11, 0.2) 50%, transparent 80%)`,
            }}
          />

          {/* Vignette Dark Edges */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'radial-gradient(circle at center, transparent 40%, rgba(0, 0, 0, 0.8) 100%)',
            }}
          />
        </div>

        {/* Top & Bottom 2.39:1 Letterbox Matte Bars */}
        <div className="absolute top-0 inset-x-0 h-2 bg-black z-10" />
        <div className="absolute bottom-0 inset-x-0 h-2 bg-black z-10" />

        {/* Category Badge Indicator */}
        <div className="absolute bottom-2.5 left-1 z-20 px-1 py-0.5 rounded bg-black/80 border border-amber-500/30 text-[7px] font-mono text-amber-300 font-bold uppercase tracking-wider">
          🎬 CINE
        </div>
      </div>
    );
  }

  // C. CAMERA CATEGORY: Viewfinder Monitor HUD & Crosshair Overlay
  if (archetype === 'camera') {
    const isPan = idLower.includes('pan') || nameLower.includes('pan');
    const isTilt = idLower.includes('tilt') || nameLower.includes('tilt');
    const isDolly = idLower.includes('dolly') || idLower.includes('zoom');

    const shiftX = isPan ? (idLower.includes('left') ? -12 : 12) : 0;
    const shiftY = isTilt ? (idLower.includes('up') ? -10 : 10) : 0;
    const scaleVal = isDolly ? 1.25 : 1.0;

    return (
      <div className={`relative w-full h-full bg-[#070b14] overflow-hidden select-none ${className}`}>
        <img
          src={BASE_SAMPLE_IMAGE}
          alt={name}
          className="w-full h-full object-cover"
          style={{
            transform: `translate(${shiftX}px, ${shiftY}px) scale(${scaleVal})`,
            filter: 'contrast(1.15) brightness(1.05)',
          }}
          loading="lazy"
        />

        {/* Professional Camera Viewfinder HUD Overlay */}
        <svg className="absolute inset-0 w-full h-full text-white/80 pointer-events-none" viewBox="0 0 100 100">
          {/* Rule of Thirds Grid */}
          <line x1="33.3" y1="0" x2="33.3" y2="100" stroke="rgba(255,255,255,0.15)" strokeDasharray="2,2" />
          <line x1="66.6" y1="0" x2="66.6" y2="100" stroke="rgba(255,255,255,0.15)" strokeDasharray="2,2" />
          <line x1="0" y1="33.3" x2="100" y2="33.3" stroke="rgba(255,255,255,0.15)" strokeDasharray="2,2" />
          <line x1="0" y1="66.6" x2="100" y2="66.6" stroke="rgba(255,255,255,0.15)" strokeDasharray="2,2" />

          {/* Center Crosshair Target */}
          <circle cx="50" cy="50" r="4" stroke="rgba(56,189,248,0.8)" strokeWidth="1" fill="none" />
          <line x1="45" y1="50" x2="55" y2="50" stroke="rgba(56,189,248,0.8)" strokeWidth="1" />
          <line x1="50" y1="45" x2="50" y2="55" stroke="rgba(56,189,248,0.8)" strokeWidth="1" />

          {/* Viewfinder 4 Corners Brackets */}
          <path d="M 8 16 L 8 8 L 16 8" stroke="currentColor" strokeWidth="1.5" fill="none" />
          <path d="M 92 16 L 92 8 L 84 8" stroke="currentColor" strokeWidth="1.5" fill="none" />
          <path d="M 8 84 L 8 92 L 16 92" stroke="currentColor" strokeWidth="1.5" fill="none" />
          <path d="M 92 84 L 92 92 L 84 92" stroke="currentColor" strokeWidth="1.5" fill="none" />
        </svg>

        {/* Live Recording Dot Indicator */}
        <div className="absolute top-1.5 left-2 flex items-center gap-1 bg-black/70 px-1.5 py-0.5 rounded text-[7px] font-mono text-white">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
          <span>REC</span>
        </div>
      </div>
    );
  }

  // D. BLUR CATEGORY: Optical Depth-of-Field & Focus Bokeh Rings
  if (archetype === 'blur') {
    const isRadial = idLower.includes('radial') || idLower.includes('spin');
    const isZoom = idLower.includes('zoom') || idLower.includes('motion');

    const blurPx = (3 + (hash % 6)).toFixed(1);

    return (
      <div className={`relative w-full h-full bg-[#050b14] overflow-hidden select-none ${className}`}>
        <img
          src={BASE_SAMPLE_IMAGE}
          alt={name}
          className="w-full h-full object-cover"
          style={{
            filter: `blur(${blurPx}px) contrast(1.1) brightness(1.05)`,
            transform: isZoom ? 'scale(1.15)' : 'none',
          }}
          loading="lazy"
        />

        {/* Focus Bokeh Circles & Ring Graphics */}
        <svg className="absolute inset-0 w-full h-full text-sky-400/50 pointer-events-none" viewBox="0 0 100 100">
          <circle cx="30" cy="40" r="14" fill="rgba(56,189,248,0.2)" stroke="rgba(56,189,248,0.5)" strokeWidth="0.8" />
          <circle cx="70" cy="65" r="20" fill="rgba(245,158,11,0.15)" stroke="rgba(245,158,11,0.4)" strokeWidth="0.8" />
          <circle cx="50" cy="50" r="30" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1" strokeDasharray="4 4" />
        </svg>

        <div className="absolute bottom-1 left-1 px-1 py-0.5 rounded bg-blue-950/80 border border-blue-400/30 text-[7px] font-mono text-blue-300 font-bold uppercase">
          💧 BLUR
        </div>
      </div>
    );
  }

  // E. LIGHT CATEGORY: Ambient Flares, Neon Bloom & Light Leaks
  if (archetype === 'light') {
    const isNeon = idLower.includes('neon') || nameLower.includes('neon');
    const isLeak = idLower.includes('leak') || nameLower.includes('leak');

    return (
      <div className={`relative w-full h-full bg-[#090614] overflow-hidden select-none ${className}`}>
        <img
          src={BASE_SAMPLE_IMAGE}
          alt={name}
          className="w-full h-full object-cover"
          style={{
            filter: isNeon
              ? 'drop-shadow(0 0 10px #ec4899) drop-shadow(0 0 20px #38bdf8) brightness(1.25)'
              : 'brightness(1.2) saturate(1.3)',
          }}
          loading="lazy"
        />

        {/* Ambient Light Flare Gradient Wash */}
        <div
          className="absolute inset-0 pointer-events-none mix-blend-screen"
          style={{
            background: isLeak
              ? `linear-gradient(${45 + (hash % 60)}deg, rgba(239,68,68,0.4), rgba(245,158,11,0.3), transparent)`
              : `radial-gradient(circle at ${30 + (hash % 40)}% 30%, rgba(236,72,153,0.5) 0%, rgba(56,189,248,0.3) 50%, transparent 80%)`,
          }}
        />

        <div className="absolute bottom-1 left-1 px-1 py-0.5 rounded bg-pink-950/80 border border-pink-400/30 text-[7px] font-mono text-pink-300 font-bold uppercase">
          💡 LIGHT
        </div>
      </div>
    );
  }

  // F. DISTORTION CATEGORY: Spherical Fisheye Grid Mesh & Wave Warping
  if (archetype === 'distortion') {
    const skewX = (12 + (hash % 10)).toFixed(1);
    const skewY = (8 + ((hash >> 2) % 8)).toFixed(1);

    return (
      <div className={`relative w-full h-full bg-[#0e0617] overflow-hidden select-none ${className}`}>
        <img
          src={BASE_SAMPLE_IMAGE}
          alt={name}
          className="w-full h-full object-cover"
          style={{
            transform: `skewX(${skewX}deg) skewY(${skewY}deg) scale(1.1)`,
            filter: 'contrast(1.2) saturate(1.2)',
          }}
          loading="lazy"
        />

        {/* Spherical Curved Warp Grid Lines */}
        <svg className="absolute inset-0 w-full h-full text-purple-400/50 pointer-events-none" viewBox="0 0 100 100">
          <path d="M 0 20 Q 50 40, 100 20" stroke="currentColor" strokeWidth="1.5" fill="none" />
          <path d="M 0 50 Q 50 75, 100 50" stroke="currentColor" strokeWidth="1.5" fill="none" />
          <path d="M 0 80 Q 50 100, 100 80" stroke="currentColor" strokeWidth="1.5" fill="none" />
          <circle cx="50" cy="50" r="38" stroke="currentColor" strokeWidth="1" fill="none" strokeDasharray="3 3" />
        </svg>

        <div className="absolute bottom-1 left-1 px-1 py-0.5 rounded bg-purple-950/80 border border-purple-400/30 text-[7px] font-mono text-purple-300 font-bold uppercase">
          🌀 WARP
        </div>
      </div>
    );
  }

  // G. RETRO / VHS / CRT CATEGORY: Analog Scanlines, Magnetic Tape Noise & PLAY Timestamp
  if (archetype === 'retro') {
    return (
      <div className={`relative w-full h-full bg-[#120a06] overflow-hidden select-none ${className}`}>
        <img
          src={BASE_SAMPLE_IMAGE}
          alt={name}
          className="w-full h-full object-cover"
          style={{
            filter: 'sepia(0.45) contrast(1.25) saturate(0.9)',
            transform: `translateX(${((hash % 10) - 5)}px)`,
          }}
          loading="lazy"
        />

        {/* CRT Scanline Stripes */}
        <div
          className="absolute inset-0 pointer-events-none opacity-70"
          style={{
            background: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.3), rgba(0,0,0,0.3) 1.5px, transparent 1.5px, transparent 4px)',
          }}
        />

        {/* Top VHS OSD Stamp */}
        <div className="absolute top-1 left-1.5 text-[7px] font-mono text-emerald-400 font-bold tracking-widest pointer-events-none shadow-sm">
          PLAY 0:00:14
        </div>

        <div className="absolute bottom-1 right-1 px-1 py-0.5 rounded bg-amber-950/80 border border-amber-500/30 text-[7px] font-mono text-amber-400 font-bold uppercase">
          📼 RETRO
        </div>
      </div>
    );
  }

  // H. 3D CATEGORY: Stereoscopic Anaglyph Red/Cyan Split & Perspective Wireframe
  if (archetype === 'threed') {
    const shift3D = 8 + (hash % 6);

    return (
      <div className={`relative w-full h-full bg-[#030812] overflow-hidden select-none ${className}`}>
        {/* Red Anaglyph Layer */}
        <img
          src={BASE_SAMPLE_IMAGE}
          alt=""
          className="absolute inset-0 w-full h-full object-cover mix-blend-screen opacity-80"
          style={{
            transform: `translateX(${shift3D}px) rotate(2deg)`,
            filter: 'hue-rotate(-90deg) saturate(3)',
          }}
        />

        {/* Cyan Anaglyph Layer */}
        <img
          src={BASE_SAMPLE_IMAGE}
          alt=""
          className="absolute inset-0 w-full h-full object-cover mix-blend-screen opacity-80"
          style={{
            transform: `translateX(${-shift3D}px) rotate(-2deg)`,
            filter: 'hue-rotate(90deg) saturate(3)',
          }}
        />

        {/* 3D Perspective Box Wireframe Overlay */}
        <svg className="absolute inset-0 w-full h-full text-cyan-400/60 pointer-events-none" viewBox="0 0 100 100">
          <rect x="25" y="25" width="50" height="50" stroke="currentColor" strokeWidth="1" fill="none" />
          <line x1="25" y1="25" x2="15" y2="15" stroke="currentColor" strokeWidth="1" />
          <line x1="75" y1="25" x2="85" y2="15" stroke="currentColor" strokeWidth="1" />
          <line x1="25" y1="75" x2="15" y2="85" stroke="currentColor" strokeWidth="1" />
          <line x1="75" y1="75" x2="85" y2="85" stroke="currentColor" strokeWidth="1" />
        </svg>

        <div className="absolute bottom-1 left-1 px-1 py-0.5 rounded bg-cyan-950/80 border border-cyan-400/30 text-[7px] font-mono text-cyan-300 font-bold uppercase">
          👓 3D
        </div>
      </div>
    );
  }

  // I. COMIC CATEGORY: Pop-Art Halftone Pattern & High-Contrast Outlines
  if (archetype === 'comic') {
    return (
      <div className={`relative w-full h-full bg-[#180a04] overflow-hidden select-none ${className}`}>
        <img
          src={BASE_SAMPLE_IMAGE}
          alt={name}
          className="w-full h-full object-cover"
          style={{
            filter: 'contrast(1.9) saturate(1.8) brightness(1.05)',
          }}
          loading="lazy"
        />

        {/* Comic Book Halftone Print Pattern Overlay */}
        <div
          className="absolute inset-0 pointer-events-none opacity-35 mix-blend-multiply"
          style={{
            background: 'radial-gradient(rgba(0,0,0,0.8) 20%, transparent 20%) 0 0/6px 6px',
          }}
        />

        <div className="absolute bottom-1 left-1 px-1 py-0.5 rounded bg-yellow-950/80 border border-yellow-400/30 text-[7px] font-mono text-yellow-300 font-bold uppercase">
          🎨 ART
        </div>
      </div>
    );
  }

  // J. NATURE / WEATHER / ATMOSPHERE CATEGORY: Environmental Overlays
  if (archetype === 'nature') {
    return (
      <div className={`relative w-full h-full bg-[#05120a] overflow-hidden select-none ${className}`}>
        <img
          src={BASE_SAMPLE_IMAGE}
          alt={name}
          className="w-full h-full object-cover"
          style={{
            filter: 'saturate(1.35) contrast(1.15) hue-rotate(-15deg)',
          }}
          loading="lazy"
        />

        {/* Weather Rain / Ember Particles Overlay */}
        <svg className="absolute inset-0 w-full h-full text-emerald-400/50 pointer-events-none" viewBox="0 0 100 100">
          <circle cx="20" cy="30" r="1.5" fill="currentColor" />
          <circle cx="65" cy="20" r="2" fill="currentColor" />
          <circle cx="45" cy="70" r="1" fill="currentColor" />
          <circle cx="80" cy="75" r="1.8" fill="currentColor" />
          <line x1="10" y1="0" x2="5" y2="25" stroke="rgba(255,255,255,0.4)" strokeWidth="1" />
          <line x1="50" y1="10" x2="45" y2="40" stroke="rgba(255,255,255,0.4)" strokeWidth="1" />
          <line x1="85" y1="5" x2="80" y2="35" stroke="rgba(255,255,255,0.4)" strokeWidth="1" />
        </svg>

        <div className="absolute bottom-1 left-1 px-1 py-0.5 rounded bg-emerald-950/80 border border-emerald-400/30 text-[7px] font-mono text-emerald-300 font-bold uppercase">
          🌿 NATURE
        </div>
      </div>
    );
  }

  // K. AI / SCI-FI / GAMING CATEGORY: Generative Neural Circuit HUD
  if (archetype === 'ai') {
    return (
      <div className={`relative w-full h-full bg-[#040c14] overflow-hidden select-none ${className}`}>
        <img
          src={BASE_SAMPLE_IMAGE}
          alt={name}
          className="w-full h-full object-cover"
          style={{
            filter: 'hue-rotate(170deg) contrast(1.3) saturate(1.4)',
          }}
          loading="lazy"
        />

        {/* Neural Network Circuit Lines HUD */}
        <svg className="absolute inset-0 w-full h-full text-sky-400/60 pointer-events-none" viewBox="0 0 100 100">
          <path d="M 10 30 L 40 30 L 55 50 L 90 50" stroke="currentColor" strokeWidth="1" fill="none" />
          <circle cx="40" cy="30" r="2.5" fill="currentColor" />
          <circle cx="55" cy="50" r="2.5" fill="currentColor" />
          <circle cx="90" cy="50" r="2.5" fill="currentColor" />
        </svg>

        <div className="absolute bottom-1 left-1 px-1 py-0.5 rounded bg-sky-950/80 border border-sky-400/30 text-[7px] font-mono text-sky-300 font-bold uppercase">
          🧠 AI
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // L. BASIC CATEGORY: Clean Motion & Animation Vectors
  // ---------------------------------------------------------------------------
  const isZoom = idLower.includes('zoom') || nameLower.includes('zoom') || idLower.includes('pop');
  const isSpin = idLower.includes('spin') || nameLower.includes('spin') || idLower.includes('rotate');
  const isShake = idLower.includes('shake') || nameLower.includes('shake');
  const isMove = idLower.includes('move') || idLower.includes('slide') || idLower.includes('pan');

  let basicTransform = `scale(${(0.9 + (hash % 20) / 100).toFixed(2)})`;
  let ghostTrails: React.CSSProperties[] = [];

  if (isZoom) basicTransform = 'scale(1.25)';
  else if (isSpin) basicTransform = `rotate(${(20 + (hash % 40))}deg) scale(0.92)`;
  else if (isShake) {
    basicTransform = `translate(${((hash % 10) - 5)}px, ${(((hash >> 2) % 10) - 5)}px)`;
    ghostTrails = [{ transform: `translate(${(-((hash % 10) - 5))}px, ${(-(((hash >> 2) % 10) - 5))}px)`, opacity: 0.45 }];
  } else if (isMove) {
    basicTransform = 'translateX(-12px)';
    ghostTrails = [{ transform: 'translateX(10px)', opacity: 0.35 }];
  }

  return (
    <div className={`relative w-full h-full bg-[#060c18] overflow-hidden select-none ${className}`}>
      {/* Motion Ghost Trail */}
      {ghostTrails.map((gt, idx) => (
        <img
          key={idx}
          src={BASE_SAMPLE_IMAGE}
          alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-35 pointer-events-none"
          style={gt}
        />
      ))}

      {/* Main Base Image */}
      <img
        src={BASE_SAMPLE_IMAGE}
        alt={name}
        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        style={{
          transform: basicTransform,
          filter: 'contrast(1.1) saturate(1.1)',
        }}
        loading="lazy"
      />

      {/* Motion Direction Vectors Indicator */}
      {isZoom && (
        <svg className="absolute inset-0 w-full h-full text-sky-400/80 pointer-events-none" viewBox="0 0 100 100">
          <path d="M 20 20 L 30 20 M 20 20 L 20 30" stroke="currentColor" strokeWidth="2" fill="none" />
          <path d="M 80 20 L 70 20 M 80 20 L 80 30" stroke="currentColor" strokeWidth="2" fill="none" />
          <path d="M 20 80 L 30 80 M 20 80 L 20 70" stroke="currentColor" strokeWidth="2" fill="none" />
          <path d="M 80 80 L 70 80 M 80 80 L 80 70" stroke="currentColor" strokeWidth="2" fill="none" />
        </svg>
      )}

      {isSpin && (
        <svg className="absolute inset-0 w-full h-full text-sky-400/80 pointer-events-none" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="34" stroke="currentColor" strokeWidth="1.5" strokeDasharray="6 6" fill="none" />
        </svg>
      )}

      {isMove && (
        <div className="absolute inset-y-0 left-2 flex items-center pointer-events-none text-sky-400">
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M 19 12 L 5 12 M 11 18 L 5 12 L 11 6" />
          </svg>
        </div>
      )}

      <div className="absolute bottom-1 left-1 px-1 py-0.5 rounded bg-slate-950/80 border border-slate-700/40 text-[7px] font-mono text-slate-300 font-bold uppercase">
        ⚙️ BASIC
      </div>
    </div>
  );
});

EffectThumbnail.displayName = 'EffectThumbnail';
