import { FilterSample } from './samples';

export const CINEMATIC_FILTERS: FilterSample[] = [
  {
    id: 'hollywood-gold',
    name: 'Hollywood Gold',
    description: 'Golden movie styling with warm midtones and soft rich highlights.',
    cssFilter: 'contrast(1.1) brightness(1.05) sepia(0.2) saturate(1.2) hue-rotate(-5deg)',
    defaultIntensity: 80,
    thumbnailColor: 'from-[#eab308] to-[#ca8a04]',
    category: 'Cinematic'
  },
  {
    id: 'cinematic-lut',
    name: 'Cinematic LUT',
    description: 'Universal cinematic color look inspired by traditional film stocks.',
    cssFilter: 'contrast(1.15) brightness(1.02) saturate(0.9) sepia(0.05)',
    defaultIntensity: 85,
    thumbnailColor: 'from-[#475569] to-[#334155]',
    category: 'Cinematic'
  },
  {
    id: 'blockbuster',
    name: 'Blockbuster',
    description: 'High contrast movie styling with rich teals and hot highlights.',
    cssFilter: 'contrast(1.2) brightness(0.95) saturate(1.1) hue-rotate(-10deg) sepia(0.08)',
    defaultIntensity: 90,
    thumbnailColor: 'from-[#0891b2] to-[#b45309]',
    category: 'Cinematic'
  },
  {
    id: 'imax-vision',
    name: 'IMAX Vision',
    description: 'Ultra high-definition IMAX film look with vibrant highlights.',
    cssFilter: 'contrast(1.25) brightness(1.05) saturate(1.05) hue-rotate(5deg)',
    defaultIntensity: 75,
    thumbnailColor: 'from-[#0284c7] to-[#1e3a8a]',
    category: 'Cinematic'
  },
  {
    id: 'teal-orange-lut',
    name: 'Teal & Orange',
    description: 'Popular cinema color scheme pushing skin tones to orange and shadows to teal.',
    cssFilter: 'contrast(1.15) saturate(1.2) hue-rotate(-15deg)',
    defaultIntensity: 80,
    thumbnailColor: 'from-[#0f766e] to-[#ea580c]',
    category: 'Cinematic'
  },
  {
    id: 'movie-night',
    name: 'Movie Night',
    description: 'Deep nocturnal movie styling with rich blues and low-key lighting look.',
    cssFilter: 'contrast(1.1) brightness(0.9) saturate(0.85) sepia(0.12)',
    defaultIntensity: 80,
    thumbnailColor: 'from-[#1e1b4b] to-[#312e81]',
    category: 'Cinematic'
  },
  {
    id: 'epic-drama',
    name: 'Epic Drama',
    description: 'High dynamic range grading with moody contrasts and desaturated hues.',
    cssFilter: 'contrast(1.3) brightness(0.95) saturate(0.75) sepia(0.05)',
    defaultIntensity: 85,
    thumbnailColor: 'from-[#44403c] to-[#292524]',
    category: 'Cinematic'
  },
  {
    id: 'dark-cinema',
    name: 'Dark Cinema',
    description: 'Intense shadows and rich dramatic contrasts for thrillers.',
    cssFilter: 'contrast(1.25) brightness(0.8) saturate(0.8) hue-rotate(-8deg)',
    defaultIntensity: 90,
    thumbnailColor: 'from-[#0f172a] to-[#1e293b]',
    category: 'Cinematic'
  },
  {
    id: 'warm-cinema',
    name: 'Warm Cinema',
    description: 'Cozy and inviting warm grade with soft brown and orange cast.',
    cssFilter: 'contrast(1.1) brightness(1.02) sepia(0.25) saturate(1.1)',
    defaultIntensity: 85,
    thumbnailColor: 'from-[#d97706] to-[#b45309]',
    category: 'Cinematic'
  },
  {
    id: 'cold-cinema',
    name: 'Cold Cinema',
    description: 'Chilly blue and cyan grading for sci-fi and winter movies.',
    cssFilter: 'contrast(1.1) brightness(0.96) hue-rotate(15deg) sepia(0.12) saturate(0.85)',
    defaultIntensity: 85,
    thumbnailColor: 'from-[#0369a1] to-[#075985]',
    category: 'Cinematic'
  },
  {
    id: 'film-look',
    name: 'Film Look',
    description: 'Analog film look with organic color responses and soft roll-offs.',
    cssFilter: 'contrast(1.05) brightness(1.02) sepia(0.15) saturate(0.95)',
    defaultIntensity: 80,
    thumbnailColor: 'from-[#78716c] to-[#57534e]',
    category: 'Cinematic'
  },
  {
    id: 'oscar-style',
    name: 'Oscar Style',
    description: 'Elegant award-winning color styling with deep greens and golden lights.',
    cssFilter: 'contrast(1.2) brightness(1.04) saturate(1.1) hue-rotate(-5deg)',
    defaultIntensity: 80,
    thumbnailColor: 'from-[#854d0e] to-[#713f12]',
    category: 'Cinematic'
  },
  {
    id: 'cinema-hdr',
    name: 'Cinema HDR',
    description: 'Hyper-real contrasts and vibrant saturation mimicking high dynamic range.',
    cssFilter: 'contrast(1.3) brightness(1.1) saturate(1.2)',
    defaultIntensity: 70,
    thumbnailColor: 'from-[#2563eb] to-[#d97706]',
    category: 'Cinematic'
  },
  {
    id: 'soft-film',
    name: 'Soft Film',
    description: 'Gentle pastel colors and low contrast for a nostalgic indie feel.',
    cssFilter: 'contrast(0.9) brightness(1.05) saturate(0.9) sepia(0.05)',
    defaultIntensity: 80,
    thumbnailColor: 'from-[#cbd5e1] to-[#94a3b8]',
    category: 'Cinematic'
  },
  {
    id: 'moody-film',
    name: 'Moody Film',
    description: 'Desaturated midtones and heavy vignettes for introspective scenes.',
    cssFilter: 'contrast(1.2) brightness(0.9) saturate(0.8) sepia(0.1)',
    defaultIntensity: 85,
    thumbnailColor: 'from-[#1c1917] to-[#2b2b2b]',
    category: 'Cinematic'
  },
  {
    id: 'classic-cinema',
    name: 'Classic Cinema',
    description: 'Inspired by traditional celluloid look with moderate warm sepia tone.',
    cssFilter: 'contrast(1.1) brightness(0.98) sepia(0.18) saturate(0.9)',
    defaultIntensity: 75,
    thumbnailColor: 'from-[#451a03] to-[#7c2d12]',
    category: 'Cinematic'
  },
  {
    id: 'modern-cinema',
    name: 'Modern Cinema',
    description: 'Clean, crisp and saturated grading matching contemporary features.',
    cssFilter: 'contrast(1.15) brightness(1.02) saturate(1.05) hue-rotate(3deg)',
    defaultIntensity: 80,
    thumbnailColor: 'from-[#0f766e] to-[#0d9488]',
    category: 'Cinematic'
  },
  {
    id: 'golden-hour-cin',
    name: 'Golden Hour',
    description: 'Warm glowing sunlight effect that enhances all yellows and reds.',
    cssFilter: 'sepia(0.35) saturate(1.25) hue-rotate(-12deg) contrast(1.08)',
    defaultIntensity: 90,
    thumbnailColor: 'from-[#ea580c] to-[#eab308]',
    category: 'Cinematic'
  },
  {
    id: 'blue-hour',
    name: 'Blue Hour',
    description: 'Peaceful twilight color tone enhancing cold magentas and deep blues.',
    cssFilter: 'hue-rotate(190deg) saturate(1.1) contrast(1.05) brightness(0.95)',
    defaultIntensity: 80,
    thumbnailColor: 'from-[#1e40af] to-[#3b82f6]',
    category: 'Cinematic'
  },
  {
    id: 'sunset-film',
    name: 'Sunset Film',
    description: 'Fiery warm highlights and crimson shadows reminiscent of dusk.',
    cssFilter: 'sepia(0.4) saturate(1.3) hue-rotate(-20deg) contrast(1.1)',
    defaultIntensity: 85,
    thumbnailColor: 'from-[#dc2626] to-[#ea580c]',
    category: 'Cinematic'
  },
  {
    id: 'night-vision-cinema',
    name: 'Night Vision',
    description: 'Green monochrome phosphor night vision camera simulation.',
    cssFilter: 'hue-rotate(90deg) saturate(1.6) contrast(1.3) brightness(0.9)',
    defaultIntensity: 100,
    thumbnailColor: 'from-[#166534] to-[#22c55e]',
    category: 'Cinematic'
  },
  {
    id: 'director-look',
    name: 'Director Look',
    description: 'Balanced artistic grading with slightly muted colors and filmic tones.',
    cssFilter: 'contrast(1.18) brightness(1.0) saturate(0.9) sepia(0.1)',
    defaultIntensity: 80,
    thumbnailColor: 'from-[#374151] to-[#1f2937]',
    category: 'Cinematic'
  },
  {
    id: 'action-movie',
    name: 'Action Movie',
    description: 'High speed visual impact with punchy contrasts and cool metallics.',
    cssFilter: 'contrast(1.22) brightness(1.02) saturate(1.15) hue-rotate(-8deg)',
    defaultIntensity: 85,
    thumbnailColor: 'from-[#0284c7] to-[#f97316]',
    category: 'Cinematic'
  },
  {
    id: 'adventure-film',
    name: 'Adventure Film',
    description: 'Vivid color separations, perfect for outdoor exploration films.',
    cssFilter: 'contrast(1.12) brightness(1.05) saturate(1.2) hue-rotate(5deg)',
    defaultIntensity: 80,
    thumbnailColor: 'from-[#15803d] to-[#eab308]',
    category: 'Cinematic'
  },
  {
    id: 'master-cinema',
    name: 'Master Cinema',
    description: 'Balanced highlight detail and deep clean blacks with film look.',
    cssFilter: 'contrast(1.25) brightness(1.02) saturate(1.1) sepia(0.03)',
    defaultIntensity: 80,
    thumbnailColor: 'from-[#172554] to-[#1e1b4b]',
    category: 'Cinematic'
  }
];
