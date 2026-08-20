import { FilterSample } from './samples';

export const VINTAGE_FILTERS: FilterSample[] = [
  {
    id: 'vhs-classic',
    name: 'VHS Classic',
    description: 'Analog video cassette aesthetic with color bleeding and soft tracking look.',
    cssFilter: 'sepia(0.15) saturate(1.25) contrast(0.95) brightness(1.05) hue-rotate(5deg)',
    defaultIntensity: 85,
    thumbnailColor: 'from-[#3b82f6] to-[#ec4899]',
    category: 'Vintage & Retro'
  },
  {
    id: 'super-8',
    name: 'Super 8',
    description: '8mm vintage home camera simulation with warm tint and high contrast.',
    cssFilter: 'sepia(0.4) saturate(1.1) brightness(0.95) contrast(1.22) hue-rotate(-10deg)',
    defaultIntensity: 90,
    thumbnailColor: 'from-[#7c2d12] to-[#b45309]',
    category: 'Vintage & Retro'
  },
  {
    id: 'film-grain-preset',
    name: 'Film Grain',
    description: 'Emulates silver halide grain contrasts with elevated grey levels.',
    cssFilter: 'contrast(1.15) brightness(1.02) saturate(0.85) sepia(0.08)',
    defaultIntensity: 80,
    thumbnailColor: 'from-[#6b7280] to-[#4b5563]',
    category: 'Vintage & Retro'
  },
  {
    id: 'kodak-gold',
    name: 'Kodak Gold',
    description: 'Legendary warm golden film stock replication with beautiful skin tones.',
    cssFilter: 'sepia(0.28) saturate(1.2) contrast(1.05) brightness(1.02) hue-rotate(-8deg)',
    defaultIntensity: 80,
    thumbnailColor: 'from-[#eab308] to-[#ea580c]',
    category: 'Vintage & Retro'
  },
  {
    id: 'fuji-classic',
    name: 'Fuji Classic',
    description: 'Replicates classic Fujichrome green shadows and fresh clean whites.',
    cssFilter: 'hue-rotate(20deg) saturate(1.15) contrast(1.08) sepia(0.05)',
    defaultIntensity: 85,
    thumbnailColor: 'from-[#047857] to-[#15803d]',
    category: 'Vintage & Retro'
  },
  {
    id: 'polaroid-filter',
    name: 'Polaroid',
    description: 'Instant film print aesthetics with pale greens and faded black levels.',
    cssFilter: 'sepia(0.22) contrast(0.85) brightness(1.08) saturate(1.05)',
    defaultIntensity: 80,
    thumbnailColor: 'from-[#a1a1aa] to-[#d4d4d8]',
    category: 'Vintage & Retro'
  },
  {
    id: 'sepia-classic',
    name: 'Sepia',
    description: 'Traditional monochrome sepia tint from historic photographic prints.',
    cssFilter: 'sepia(1.0) saturate(0.8) contrast(0.95)',
    defaultIntensity: 100,
    thumbnailColor: 'from-[#78350f] to-[#fef3c7]',
    category: 'Vintage & Retro'
  },
  {
    id: 'retro-film-lut',
    name: 'Retro Film',
    description: 'Aesthetic vintage cinematic grade with soft organic contrast curves.',
    cssFilter: 'sepia(0.3) saturate(0.9) brightness(1.02) contrast(0.88)',
    defaultIntensity: 85,
    thumbnailColor: 'from-[#854d0e] to-[#78350f]',
    category: 'Vintage & Retro'
  },
  {
    id: 'old-camera',
    name: 'Old Camera',
    description: 'Early 20th century look with vignette styling and low saturation.',
    cssFilter: 'sepia(0.45) saturate(0.7) contrast(1.15) brightness(0.92)',
    defaultIntensity: 90,
    thumbnailColor: 'from-[#451a03] to-[#27272a]',
    category: 'Vintage & Retro'
  },
  {
    id: 'analog-life',
    name: 'Analog Life',
    description: 'Nostalgic color tones and natural film roll-off for home videos.',
    cssFilter: 'sepia(0.2) saturate(1.05) contrast(0.98) brightness(1.04)',
    defaultIntensity: 80,
    thumbnailColor: 'from-[#d97706] to-[#92400e]',
    category: 'Vintage & Retro'
  },
  {
    id: 'ninety-tape',
    name: '90s Tape',
    description: 'Replicates magnetic tape recordings with vintage warmth.',
    cssFilter: 'sepia(0.12) saturate(1.15) contrast(0.94) brightness(1.03)',
    defaultIntensity: 85,
    thumbnailColor: 'from-[#2563eb] to-[#ec4899]',
    category: 'Vintage & Retro'
  },
  {
    id: 'crt-tv',
    name: 'CRT TV',
    description: 'Simulates scanline brightness patterns and vintage TV phosphors.',
    cssFilter: 'contrast(1.15) saturate(1.2) brightness(1.05) sepia(0.05)',
    defaultIntensity: 80,
    thumbnailColor: 'from-[#059669] to-[#4338ca]',
    category: 'Vintage & Retro'
  },
  {
    id: 'vintage-matte',
    name: 'Vintage Matte',
    description: 'Soft faded matte tone coupled with warm retro organic colors.',
    cssFilter: 'sepia(0.25) contrast(0.82) brightness(1.04) saturate(0.9)',
    defaultIntensity: 85,
    thumbnailColor: 'from-[#57534e] to-[#a8a29e]',
    category: 'Vintage & Retro'
  },
  {
    id: 'dust-grain',
    name: 'Dust & Grain',
    description: 'Damaged film stock simulation, perfect for grunge sequences.',
    cssFilter: 'contrast(1.2) brightness(0.95) saturate(0.78) sepia(0.35)',
    defaultIntensity: 90,
    thumbnailColor: 'from-[#3f3f46] to-[#d4d4d8]',
    category: 'Vintage & Retro'
  },
  {
    id: 'old-memory',
    name: 'Old Memory',
    description: 'Faded, warm, and highly nostalgic retro grading for childhood memories.',
    cssFilter: 'sepia(0.38) saturate(0.8) contrast(0.85) brightness(1.06)',
    defaultIntensity: 90,
    thumbnailColor: 'from-[#b45309] to-[#fbcfe8]',
    category: 'Vintage & Retro'
  },
  {
    id: 'retro-colors',
    name: 'Retro Colors',
    description: 'Bright nostalgic colors reminiscent of 80s print materials.',
    cssFilter: 'saturate(1.3) contrast(1.1) brightness(1.04) sepia(0.1)',
    defaultIntensity: 80,
    thumbnailColor: 'from-[#ea580c] to-[#0284c7]',
    category: 'Vintage & Retro'
  },
  {
    id: 'film-burn-look',
    name: 'Film Burn',
    description: 'Infuses warm orange and red leaks along the frame borders.',
    cssFilter: 'sepia(0.2) saturate(1.4) hue-rotate(-15deg) contrast(1.1)',
    defaultIntensity: 80,
    thumbnailColor: 'from-[#dc2626] to-[#fb923c]',
    category: 'Vintage & Retro'
  },
  {
    id: 'warm-vintage',
    name: 'Warm Vintage',
    description: 'Classic warm sepia highlights and amber film midtones.',
    cssFilter: 'sepia(0.4) saturate(1.05) contrast(0.95) brightness(1.02)',
    defaultIntensity: 85,
    thumbnailColor: 'from-[#d97706] to-[#78350f]',
    category: 'Vintage & Retro'
  },
  {
    id: 'cool-vintage',
    name: 'Cool Vintage',
    description: 'Faded cold blue shadows combined with warm organic highlights.',
    cssFilter: 'hue-rotate(185deg) sepia(0.2) saturate(0.9) contrast(0.92)',
    defaultIntensity: 80,
    thumbnailColor: 'from-[#1e3a8a] to-[#cbd5e1]',
    category: 'Vintage & Retro'
  },
  {
    id: 'classic-brown',
    name: 'Classic Brown',
    description: 'Vintage brown dye photographic simulation with low blues.',
    cssFilter: 'sepia(0.65) saturate(0.75) contrast(1.05) brightness(0.96)',
    defaultIntensity: 90,
    thumbnailColor: 'from-[#451a03] to-[#d97706]',
    category: 'Vintage & Retro'
  },
  {
    id: 'nostalgia',
    name: 'Nostalgia',
    description: 'Sweet pastel memories styling with soft glow and warm tint.',
    cssFilter: 'sepia(0.22) saturate(1.1) contrast(0.9) brightness(1.08) hue-rotate(-5deg)',
    defaultIntensity: 85,
    thumbnailColor: 'from-[#fbcfe8] to-[#fef08a]',
    category: 'Vintage & Retro'
  },
  {
    id: 'cinema-retro',
    name: 'Cinema Retro',
    description: 'Retro cinema print look with highly organic contrast profiles.',
    cssFilter: 'sepia(0.25) saturate(0.95) contrast(1.15) brightness(0.98)',
    defaultIntensity: 80,
    thumbnailColor: 'from-[#27272a] to-[#7c2d12]',
    category: 'Vintage & Retro'
  },
  {
    id: 'antique-film',
    name: 'Antique Film',
    description: 'Severely weathered antique photograph print styling.',
    cssFilter: 'sepia(0.75) saturate(0.6) contrast(1.2) brightness(0.9)',
    defaultIntensity: 95,
    thumbnailColor: 'from-[#78350f] to-[#451a03]',
    category: 'Vintage & Retro'
  },
  {
    id: 'vintage-fade',
    name: 'Vintage Fade',
    description: 'Extremely faded color dye look, resembling old postcards.',
    cssFilter: 'sepia(0.2) saturate(0.65) contrast(0.75) brightness(1.05)',
    defaultIntensity: 80,
    thumbnailColor: 'from-[#78716c] to-[#cbd5e1]',
    category: 'Vintage & Retro'
  },
  {
    id: 'retro-master',
    name: 'Retro Master',
    description: 'Pro retro styling preserving contrast integrity while adding warm age.',
    cssFilter: 'sepia(0.3) saturate(1.15) contrast(1.08) brightness(1.02) hue-rotate(-3deg)',
    defaultIntensity: 80,
    thumbnailColor: 'from-[#b45309] to-[#1e293b]',
    category: 'Vintage & Retro'
  }
];
