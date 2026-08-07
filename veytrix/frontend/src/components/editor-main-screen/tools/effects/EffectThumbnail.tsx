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

// Deterministic string hasher for unique variation parameters per effect
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export const EffectThumbnail: React.FC<EffectThumbnailProps> = ({ preset, className = '' }) => {
  const { id, name, category } = preset;

  const catLower = (category || '').toLowerCase();
  const idLower = (id || '').toLowerCase();
  const nameLower = (name || '').toLowerCase();
  const effectHash = hashString(id + name);

  // Categorize into one of 9 category themes
  let catType:
    | 'basic'
    | 'camera'
    | 'blur'
    | 'glitch'
    | 'cinematic'
    | 'light'
    | 'distortion'
    | 'color'
    | 'retro' = 'basic';

  if (catLower.includes('camera') || idLower.startsWith('camera-') || idLower.includes('dolly') || idLower.includes('pan') || idLower.includes('tilt')) {
    catType = 'camera';
  } else if (catLower.includes('blur') || idLower.startsWith('blur-') || idLower.includes('defocus')) {
    catType = 'blur';
  } else if (catLower.includes('glitch') || idLower.startsWith('glitch-') || catLower.includes('vhs') || catLower.includes('crt')) {
    catType = 'glitch';
  } else if (catLower.includes('cine') || idLower.startsWith('cine-') || catLower.includes('movie') || catLower.includes('film')) {
    catType = 'cinematic';
  } else if (catLower.includes('light') || idLower.startsWith('light-') || catLower.includes('flare') || catLower.includes('neon') || catLower.includes('sun')) {
    catType = 'light';
  } else if (catLower.includes('distort') || idLower.startsWith('dist-') || catLower.includes('warp') || catLower.includes('fisheye')) {
    catType = 'distortion';
  } else if (catLower.includes('color') || idLower.startsWith('color-') || catLower.includes('lut') || catLower.includes('artistic') || catLower.includes('grade')) {
    catType = 'color';
  } else if (catLower.includes('retro') || idLower.startsWith('retro-') || idLower.includes('1990') || idLower.includes('vintage')) {
    catType = 'retro';
  } else {
    catType = 'basic';
  }

  // Derive unique parameters per effect
  const uniqueAngle = (effectHash % 60) - 30; // -30deg to +30deg
  const uniqueScale = 0.85 + ((effectHash % 30) / 100); // 0.85 to 1.15
  const uniqueShiftX = ((effectHash % 20) - 10); // -10px to +10px
  const uniqueShiftY = (((effectHash >> 3) % 20) - 10);
  const hueVariation = effectHash % 360;

  // Render unique visual preview content per effect category
  const renderCategoryContent = () => {
    switch (catType) {
      // 1. BASIC EFFECTS (Blue / Clean / Motion Graphics)
      case 'basic': {
        const isZoom = idLower.includes('zoom') || nameLower.includes('zoom') || idLower.includes('pop') || idLower.includes('scale');
        const isSpin = idLower.includes('spin') || nameLower.includes('rotate') || idLower.includes('roll');
        const isMove = idLower.includes('move') || nameLower.includes('slide') || idLower.includes('drift');
        const isBounce = idLower.includes('bounce') || nameLower.includes('pulse') || idLower.includes('shake');

        return (
          <div className="absolute inset-0 bg-gradient-to-br from-[#061327] via-[#0a2040] to-[#020b18] overflow-hidden flex items-center justify-center">
            {/* Dynamic Blue Motion Grid */}
            <svg className="absolute inset-0 w-full h-full opacity-20" width="100%" height="100%">
              <defs>
                <pattern id={`grid-b-${id}`} width="14" height="14" patternUnits="userSpaceOnUse">
                  <path d="M 14 0 L 0 0 0 14" fill="none" stroke="#38bdf8" strokeWidth="0.5" strokeDasharray="2,2" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill={`url(#grid-b-${id})`} />
            </svg>

            {/* Glowing Accent Core */}
            <div
              className="absolute w-20 h-20 rounded-full bg-sky-500/20 blur-xl pointer-events-none"
              style={{ transform: `translate(${uniqueShiftX}px, ${uniqueShiftY}px)` }}
            />

            {/* Unique Effect Motion Vector Graphic */}
            <div
              className="relative z-10 flex flex-col items-center justify-center transition-transform"
              style={{ transform: `scale(${uniqueScale}) rotate(${uniqueAngle / 2}deg)` }}
            >
              {isZoom ? (
                <div className="relative flex items-center justify-center">
                  <div className="w-11 h-11 border-2 border-sky-400 rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(56,189,248,0.6)] bg-sky-500/25">
                    <span className="text-[9px] font-black text-white tracking-wider truncate max-w-[36px]">
                      {name.substring(0, 4)}
                    </span>
                  </div>
                  {/* Expanding Corner Vectors */}
                  <svg className="absolute -inset-2.5 w-16 h-16 text-sky-400" viewBox="0 0 64 64" fill="none">
                    <path d="M6 6 L18 6 M6 6 L6 18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                    <path d="M58 6 L46 6 M58 6 L58 18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                    <path d="M6 58 L18 58 M6 58 L6 46" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                    <path d="M58 58 L46 58 M58 58 L58 46" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                  </svg>
                </div>
              ) : isSpin ? (
                <div className="relative flex items-center justify-center">
                  <div className="w-10 h-10 border-2 border-sky-300 rounded-full flex items-center justify-center bg-sky-500/30 shadow-[0_0_12px_rgba(56,189,248,0.5)]">
                    <span className="text-[8px] font-black text-white">SPIN</span>
                  </div>
                  <svg
                    className="absolute -inset-2 w-14 h-14 text-sky-400"
                    viewBox="0 0 56 56"
                    fill="none"
                    style={{ transform: `rotate(${uniqueAngle * 6}deg)` }}
                  >
                    <circle cx="28" cy="28" r="24" stroke="currentColor" strokeWidth="1.5" strokeDasharray="10 5" strokeLinecap="round" />
                  </svg>
                </div>
              ) : isMove ? (
                <div className="relative flex items-center justify-center gap-2">
                  <div className="w-8 h-8 border border-sky-400/40 rounded bg-sky-950/40 flex items-center justify-center">
                    <span className="text-[7px] font-mono text-sky-400/60">OLD</span>
                  </div>
                  <svg className="w-4 h-4 text-sky-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <div className="w-9 h-9 border-2 border-sky-400 rounded-md flex items-center justify-center bg-sky-500/35 shadow-[0_0_12px_rgba(56,189,248,0.6)]">
                    <span className="text-[8px] font-black text-white">NEW</span>
                  </div>
                </div>
              ) : isBounce ? (
                <div className="relative flex items-center justify-center">
                  <div className="w-11 h-11 border-2 border-sky-300 rounded-xl flex items-center justify-center bg-sky-400/30 shadow-[0_0_16px_rgba(56,189,248,0.7)]">
                    <span className="text-[9px] font-black text-white tracking-wider">BOUNCE</span>
                  </div>
                  <div className="absolute -bottom-2 w-10 h-1 bg-sky-400 rounded-full blur-[1px]" />
                </div>
              ) : (
                <div className="relative flex items-center justify-center">
                  <div className="w-10 h-10 border-2 border-sky-400 rounded-lg flex items-center justify-center bg-sky-500/25 shadow-[0_0_12px_rgba(56,189,248,0.5)]">
                    <span className="text-[9px] font-black text-white truncate max-w-[32px]">{name.substring(0, 4)}</span>
                  </div>
                  <div className="absolute -bottom-1.5 w-8 h-0.5 bg-sky-400/80 rounded-full" />
                </div>
              )}
            </div>
          </div>
        );
      }

      // 2. CAMERA EFFECTS (Orange / Viewfinder / Motion Path)
      case 'camera': {
        const timecodeMs = (effectHash % 99).toString().padStart(2, '0');
        const isoValue = 100 + ((effectHash % 8) * 100);

        return (
          <div className="absolute inset-0 bg-[#0c0906] overflow-hidden flex items-center justify-center">
            {/* Dark Orange Lens Flare Background */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-600/20 via-orange-950/20 to-black" />

            {/* Viewfinder HUD Framing Lines */}
            <div className="absolute inset-1.5 border border-amber-500/30 rounded-sm pointer-events-none flex flex-col justify-between p-1">
              <div className="flex justify-between items-center text-[6px] font-mono text-amber-400/90">
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                  <span className="font-bold text-red-400">REC</span>
                </div>
                <span>00:01:{timecodeMs}</span>
              </div>
              <div className="flex justify-between items-center text-[5.5px] font-mono text-amber-500/60">
                <span>ISO {isoValue}</span>
                <span>F/1.8</span>
                <span>RAW</span>
              </div>
            </div>

            {/* Dynamic Curved Motion Vector Line */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 60">
              <path
                d={`M 15 ${30 + uniqueShiftY} Q ${50 + uniqueShiftX} ${15 + uniqueShiftY} 85 ${45 - uniqueShiftY}`}
                fill="none"
                stroke="#f97316"
                strokeWidth="1.5"
                strokeDasharray="3,3"
                opacity="0.8"
              />
              <circle cx={50 + uniqueShiftX} cy={30 + uniqueShiftY} r="3" fill="#f97316" />
            </svg>

            {/* Center Target Reticle */}
            <div
              className="relative w-7 h-7 border border-amber-400/80 rounded-full flex items-center justify-center"
              style={{ transform: `translate(${uniqueShiftX / 2}px, ${uniqueShiftY / 2}px)` }}
            >
              <div className="w-1.5 h-1.5 bg-amber-400 rounded-full" />
              <div className="absolute -top-1 w-0.5 h-1.5 bg-amber-400" />
              <div className="absolute -bottom-1 w-0.5 h-1.5 bg-amber-400" />
              <div className="absolute -left-1 w-1.5 h-0.5 bg-amber-400" />
              <div className="absolute -right-1 w-1.5 h-0.5 bg-amber-400" />
            </div>
          </div>
        );
      }

      // 3. BLUR EFFECTS (Purple / Glass / Soft Focus)
      case 'blur': {
        const blurRadius = 4 + (effectHash % 12);
        const isBokeh = idLower.includes('bokeh') || nameLower.includes('bokeh');

        return (
          <div className="absolute inset-0 bg-[#090510] overflow-hidden flex items-center justify-center">
            {/* Soft Purple Gaussian Background */}
            <div className="absolute inset-0 bg-gradient-to-tr from-purple-950 via-indigo-950 to-slate-950" />

            {/* Bokeh Orbs or Radial Blur Graphics */}
            {isBokeh ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <div
                  className="w-12 h-12 rounded-full bg-purple-400/40 blur-sm border border-purple-300/40"
                  style={{ transform: `translate(${uniqueShiftX * 2}px, ${uniqueShiftY * 2}px)` }}
                />
                <div className="w-8 h-8 rounded-full bg-indigo-400/40 blur-xs border border-indigo-300/30 absolute top-2 left-4" />
                <div className="w-10 h-10 rounded-full bg-fuchsia-400/35 blur-sm border border-fuchsia-300/30 absolute bottom-2 right-4" />
              </div>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <div
                  className="w-16 h-16 rounded-full border-4 border-purple-400/40 blur-md bg-purple-500/20"
                  style={{ filter: `blur(${blurRadius / 3}px)` }}
                />
                <div className="w-8 h-8 rounded-full border-2 border-white/80 bg-purple-400/30" />
              </div>
            )}

            {/* Center Glassmorphism Badge */}
            <div className="relative z-10 border border-purple-300/30 rounded-full px-2.5 py-0.5 bg-black/40 backdrop-blur-md">
              <span className="text-[7.5px] font-mono font-bold text-purple-200 tracking-wider uppercase">
                {name.substring(0, 8)}
              </span>
            </div>
          </div>
        );
      }

      // 4. GLITCH EFFECTS (RGB / Neon / Cyberpunk)
      case 'glitch': {
        const offsetShift = 2 + (effectHash % 4);

        return (
          <div className="absolute inset-0 bg-[#06030b] overflow-hidden flex items-center justify-center select-none">
            {/* Cyberpunk Neon Glow Background */}
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-950/40 via-pink-950/40 to-purple-950/40" />

            {/* RGB Split Layers */}
            <div className="absolute inset-0 flex items-center justify-center opacity-85">
              {/* Cyan Shift Layer */}
              <div
                className="absolute text-cyan-400 font-black text-base tracking-widest opacity-80"
                style={{ transform: `translate(-${offsetShift}px, ${offsetShift / 2}px)` }}
              >
                {name.substring(0, 6).toUpperCase()}
              </div>
              {/* Magenta Shift Layer */}
              <div
                className="absolute text-pink-500 font-black text-base tracking-widest opacity-80"
                style={{ transform: `translate(${offsetShift}px, -${offsetShift / 2}px)` }}
              >
                {name.substring(0, 6).toUpperCase()}
              </div>
            </div>

            {/* Center Main White Text */}
            <div className="relative z-10 font-black text-base text-white tracking-widest drop-shadow-[0_0_8px_rgba(255,255,255,0.9)]">
              {name.substring(0, 6).toUpperCase()}
            </div>

            {/* Digital CRT Scanlines */}
            <div
              className="absolute inset-0 pointer-events-none opacity-30"
              style={{
                backgroundImage: 'repeating-linear-gradient(0deg, #000, #000 1px, transparent 1px, transparent 3px)'
              }}
            />

            {/* Digital Sliced Artifact Blocks */}
            <div
              className="absolute h-1 bg-cyan-400 opacity-90"
              style={{ top: `${20 + (effectHash % 50)}%`, left: `${10 + (effectHash % 30)}%`, width: `${20 + (effectHash % 40)}px` }}
            />
            <div
              className="absolute h-1.5 bg-pink-500 opacity-90"
              style={{ bottom: `${15 + (effectHash % 40)}%`, right: `${15 + (effectHash % 40)}%`, width: `${25 + (effectHash % 30)}px` }}
            />
          </div>
        );
      }

      // 5. CINEMATIC EFFECTS (Black / Gold / Hollywood 2.39:1)
      case 'cinematic': {
        return (
          <div className="absolute inset-0 bg-[#05070c] overflow-hidden flex flex-col justify-between p-0">
            {/* Top Widescreen Letterbox Bar */}
            <div className="h-3 bg-black w-full z-20 border-b border-white/10 flex items-center justify-between px-2">
              <span className="text-[5.5px] font-mono text-amber-400">35MM CINE</span>
              <span className="text-[5.5px] font-mono text-slate-400">2.39:1</span>
            </div>

            {/* Movie Preview Frame with Teal/Orange Color Grade */}
            <div className="relative flex-1 bg-gradient-to-tr from-cyan-950 via-slate-900 to-amber-950 flex items-center justify-center overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-500/15 via-transparent to-black/70" />
              <div className="relative z-10 border border-amber-400/40 rounded px-2 py-0.5 bg-black/60 backdrop-blur-xs">
                <span className="text-[7.5px] font-mono font-bold tracking-widest text-amber-200 uppercase">
                  {name.substring(0, 9)}
                </span>
              </div>
            </div>

            {/* Bottom Widescreen Letterbox Bar */}
            <div className="h-3 bg-black w-full z-20 border-t border-white/10 flex items-center justify-between px-2">
              <span className="text-[5.5px] font-mono text-slate-400">KODAK 5219</span>
              <span className="text-[5.5px] font-mono text-emerald-400">RAW 12-BIT</span>
            </div>
          </div>
        );
      }

      // 6. LIGHT EFFECTS (Gold / Glow / Volumetric Beams)
      case 'light': {
        const flareAngle = (effectHash % 180) - 90;

        return (
          <div className="absolute inset-0 bg-[#030408] overflow-hidden flex items-center justify-center">
            {/* Dark Ambient Glow */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-amber-500/30 via-orange-950/20 to-black" />

            {/* Anamorphic Volumetric Flare Beam */}
            <div
              className="absolute w-full h-2.5 bg-gradient-to-r from-transparent via-cyan-300 to-transparent blur-xs shadow-[0_0_18px_#06b6d4]"
              style={{ transform: `rotate(${flareAngle / 3}deg)` }}
            />

            {/* Center Flare Core Star */}
            <div className="relative z-10 w-4 h-4 bg-white rounded-full shadow-[0_0_20px_#fff,_0_0_35px_#f59e0b]" />
            <div className="absolute w-12 h-12 bg-amber-400/20 rounded-full blur-md" />
          </div>
        );
      }

      // 7. DISTORTION EFFECTS (Grid Mesh / Spatial Warp)
      case 'distortion': {
        return (
          <div className="absolute inset-0 bg-[#030712] overflow-hidden flex items-center justify-center">
            {/* Spatial Grid Lines */}
            <svg className="absolute inset-0 w-full h-full opacity-45" viewBox="0 0 100 60">
              <path
                d={`M 10 10 Q 50 ${20 + uniqueShiftY} 90 10 M 10 30 Q 50 ${40 + uniqueShiftY} 90 30 M 10 50 Q 50 ${60 + uniqueShiftY} 90 50`}
                fill="none"
                stroke="#38bdf8"
                strokeWidth="1"
              />
              <path
                d={`M 20 5 Q ${35 + uniqueShiftX} 30 20 55 M 50 5 Q ${50 + uniqueShiftX} 30 50 55 M 80 5 Q ${65 + uniqueShiftX} 30 80 55`}
                fill="none"
                stroke="#38bdf8"
                strokeWidth="1"
              />
            </svg>

            {/* Center Distortion Mesh Target */}
            <div className="relative z-10 w-11 h-11 rounded-full border-2 border-sky-400 bg-sky-500/20 shadow-[0_0_15px_rgba(56,189,248,0.6)] flex items-center justify-center">
              <div className="w-5 h-5 rounded-full border border-white/80 bg-white/20" />
            </div>
          </div>
        );
      }

      // 8. COLOR EFFECTS (Split Screen RAW vs GRADED Comparison)
      case 'color': {
        return (
          <div className="absolute inset-0 bg-[#080c16] overflow-hidden flex items-center justify-center">
            {/* Split Screen Before / After Comparison */}
            <div className="absolute inset-0 flex">
              {/* Left RAW Neutral Tone */}
              <div className="w-1/2 h-full bg-slate-800 flex items-center justify-center border-r border-white/30">
                <span className="text-[6.5px] font-mono text-slate-400 font-bold">RAW</span>
              </div>
              {/* Right Rich Graded Tone */}
              <div
                className="w-1/2 h-full flex items-center justify-center"
                style={{
                  background: `linear-gradient(135deg, hsl(${hueVariation}, 70%, 45%), hsl(${(hueVariation + 60) % 360}, 80%, 40%))`
                }}
              >
                <span className="text-[6.5px] font-mono text-white font-bold tracking-wider">GRADED</span>
              </div>
            </div>

            {/* Split Slider Line Indicator */}
            <div className="absolute inset-y-0 left-1/2 w-0.5 bg-white shadow-[0_0_8px_#fff] z-10 flex items-center justify-center">
              <div className="w-3 h-3 rounded-full bg-white border border-slate-900 shadow" />
            </div>
          </div>
        );
      }

      // 9. RETRO EFFECTS (Vintage 16mm Film / VHS Timestamp)
      case 'retro': {
        const year = 1980 + (effectHash % 20);

        return (
          <div className="absolute inset-0 bg-[#120b05] overflow-hidden flex flex-col justify-between p-1 border border-amber-900/60 rounded">
            {/* Vintage Sepia Overlay */}
            <div className="absolute inset-0 bg-gradient-to-tr from-amber-950/80 via-yellow-950/40 to-amber-900/50 mix-blend-overlay" />

            {/* Top Film Sprocket Holes Bar */}
            <div className="flex justify-between items-center z-10 px-1">
              <div className="flex gap-1">
                <div className="w-1.5 h-1.5 rounded-xs bg-black border border-amber-700/60" />
                <div className="w-1.5 h-1.5 rounded-xs bg-black border border-amber-700/60" />
              </div>
              <span className="text-[5.5px] font-mono text-amber-500 font-bold">16MM FILM</span>
            </div>

            {/* VHS Yellow Timestamp */}
            <div className="z-10 px-1">
              <span className="text-[6.5px] font-mono font-bold text-yellow-400 drop-shadow-[1px_1px_0px_#000]">
                OCT 14 {year}
              </span>
            </div>

            {/* Bottom Film Sprocket Holes Bar */}
            <div className="flex justify-between items-center z-10 px-1">
              <span className="text-[5.5px] font-mono text-amber-600">PLAY ▶</span>
              <div className="flex gap-1">
                <div className="w-1.5 h-1.5 rounded-xs bg-black border border-amber-700/60" />
                <div className="w-1.5 h-1.5 rounded-xs bg-black border border-amber-700/60" />
              </div>
            </div>
          </div>
        );
      }
    }
  };

  return (
    <div className={`relative w-full aspect-video rounded-lg overflow-hidden border border-white/10 bg-[#060910] group select-none ${className}`}>
      {/* Category Visual Content */}
      {renderCategoryContent()}

      {/* Effect Name Label Overlay */}
      <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/95 via-black/70 to-transparent p-1.5 z-20 flex items-end justify-between">
        <span className="text-[9.5px] font-bold text-white truncate max-w-[90%] leading-tight drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
          {name}
        </span>
      </div>
    </div>
  );
};
