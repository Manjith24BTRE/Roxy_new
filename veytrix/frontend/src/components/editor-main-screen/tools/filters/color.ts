import { FilterSample } from './samples';

export const COLOR_FILTERS: FilterSample[] = [
  {
    id: 'warm-tone',
    name: 'Warm Tone',
    description: 'Increases red and yellow tones for a welcoming, cozy feel.',
    cssFilter: 'sepia(0.2) saturate(1.1) brightness(1.02) hue-rotate(-3deg)',
    defaultIntensity: 80,
    thumbnailColor: 'from-[#ea580c] to-[#ca8a04]',
    category: 'Color'
  },
  {
    id: 'cool-tone',
    name: 'Cool Tone',
    description: 'Elevates blue and cyan color layers for clean, fresh lighting.',
    cssFilter: 'hue-rotate(180deg) saturate(0.85) brightness(1.02) contrast(1.02)',
    defaultIntensity: 80,
    thumbnailColor: 'from-[#2563eb] to-[#0284c7]',
    category: 'Color'
  },
  {
    id: 'vibrance-boost',
    name: 'Vibrance Boost',
    description: 'Selectively boosts muted colors without over-saturating skin tones.',
    cssFilter: 'saturate(1.35) contrast(1.05)',
    defaultIntensity: 70,
    thumbnailColor: 'from-[#ec4899] to-[#3b82f6]',
    category: 'Color'
  },
  {
    id: 'saturation-plus',
    name: 'Saturation Plus',
    description: 'Overall color saturation multiplier for bold and vivid hues.',
    cssFilter: 'saturate(1.6)',
    defaultIntensity: 60,
    thumbnailColor: 'from-[#ef4444] to-[#f97316]',
    category: 'Color'
  },
  {
    id: 'pastel-colors',
    name: 'Pastel Colors',
    description: 'Soft pastel rendering with reduced contrasts and higher brightness.',
    cssFilter: 'brightness(1.1) contrast(0.85) saturate(1.2) sepia(0.05)',
    defaultIntensity: 75,
    thumbnailColor: 'from-[#f472b6] to-[#c084fc]',
    category: 'Color'
  },
  {
    id: 'rich-colors',
    name: 'Rich Colors',
    description: 'Deep color depth with elevated shadows and healthy saturation.',
    cssFilter: 'contrast(1.18) saturate(1.25) brightness(0.98)',
    defaultIntensity: 80,
    thumbnailColor: 'from-[#b91c1c] to-[#1e3a8a]',
    category: 'Color'
  },
  {
    id: 'deep-contrast',
    name: 'Deep Contrast',
    description: 'Punches black points down and white points up for intense dynamics.',
    cssFilter: 'contrast(1.35) saturate(1.05)',
    defaultIntensity: 70,
    thumbnailColor: 'from-[#0f172a] to-[#f8fafc]',
    category: 'Color'
  },
  {
    id: 'soft-contrast',
    name: 'Soft Contrast',
    description: 'Flattens overall dynamic range for gentler gradients.',
    cssFilter: 'contrast(0.78) brightness(1.04) saturate(0.95)',
    defaultIntensity: 80,
    thumbnailColor: 'from-[#94a3b8] to-[#cbd5e1]',
    category: 'Color'
  },
  {
    id: 'matte-finish',
    name: 'Matte Finish',
    description: 'Fades deep blacks to dark gray for an elegant magazine-style matte look.',
    cssFilter: 'contrast(0.9) brightness(1.02) saturate(0.9) sepia(0.04)',
    defaultIntensity: 85,
    thumbnailColor: 'from-[#3f3f46] to-[#71717a]',
    category: 'Color'
  },
  {
    id: 'fade-colors',
    name: 'Fade Colors',
    description: 'Indie aesthetic look with faded saturation and elevated black points.',
    cssFilter: 'saturate(0.7) brightness(1.05) contrast(0.85)',
    defaultIntensity: 80,
    thumbnailColor: 'from-[#52525b] to-[#a1a1aa]',
    category: 'Color'
  },
  {
    id: 'bright-pop',
    name: 'Bright Pop',
    description: 'Clean brightness and color pop, ideal for social media content.',
    cssFilter: 'brightness(1.12) saturate(1.2) contrast(1.05)',
    defaultIntensity: 75,
    thumbnailColor: 'from-[#22c55e] to-[#ec4899]',
    category: 'Color'
  },
  {
    id: 'natural-tone',
    name: 'Natural Tone',
    description: 'Calibrated color responses for lifelike natural lighting reproduction.',
    cssFilter: 'saturate(1.05) contrast(1.02) brightness(1.0)',
    defaultIntensity: 100,
    thumbnailColor: 'from-[#65a30d] to-[#84cc16]',
    category: 'Color'
  },
  {
    id: 'golden-glow-col',
    name: 'Golden Glow',
    description: 'Infuses warm golden lighting tones across the scene.',
    cssFilter: 'sepia(0.3) saturate(1.15) brightness(1.05) hue-rotate(-8deg)',
    defaultIntensity: 85,
    thumbnailColor: 'from-[#ca8a04] to-[#f59e0b]',
    category: 'Color'
  },
  {
    id: 'orange-pop',
    name: 'Orange Pop',
    description: 'Selectively boosts orange, red and gold color segments.',
    cssFilter: 'saturate(1.25) hue-rotate(-5deg) contrast(1.05)',
    defaultIntensity: 80,
    thumbnailColor: 'from-[#f97316] to-[#ea580c]',
    category: 'Color'
  },
  {
    id: 'blue-ocean-col',
    name: 'Blue Ocean',
    description: 'Deep maritime blue shadows with crystal turquoise accents.',
    cssFilter: 'hue-rotate(185deg) saturate(1.2) contrast(1.1) brightness(0.95)',
    defaultIntensity: 80,
    thumbnailColor: 'from-[#1d4ed8] to-[#06b6d4]',
    category: 'Color'
  },
  {
    id: 'emerald-green',
    name: 'Emerald Green',
    description: 'Rich organic green boost, excellent for forests and lawns.',
    cssFilter: 'hue-rotate(25deg) saturate(1.3) contrast(1.08) brightness(0.96)',
    defaultIntensity: 80,
    thumbnailColor: 'from-[#047857] to-[#10b981]',
    category: 'Color'
  },
  {
    id: 'purple-dream',
    name: 'Purple Dream',
    description: 'Artistic magenta and violet shading, creating a fantasy dream look.',
    cssFilter: 'hue-rotate(275deg) saturate(1.25) contrast(1.05)',
    defaultIntensity: 75,
    thumbnailColor: 'from-[#7c3aed] to-[#d946ef]',
    category: 'Color'
  },
  {
    id: 'pink-bloom',
    name: 'Pink Bloom',
    description: 'Soft rose tints and cherry blossom hue grading.',
    cssFilter: 'hue-rotate(320deg) saturate(1.2) contrast(1.02) brightness(1.05)',
    defaultIntensity: 75,
    thumbnailColor: 'from-[#db2777] to-[#f472b6]',
    category: 'Color'
  },
  {
    id: 'aqua-fresh',
    name: 'Aqua Fresh',
    description: 'Bright tropical teal and clean white tone grading.',
    cssFilter: 'hue-rotate(170deg) saturate(1.15) brightness(1.06) contrast(1.05)',
    defaultIntensity: 80,
    thumbnailColor: 'from-[#0891b2] to-[#22d3ee]',
    category: 'Color'
  },
  {
    id: 'coral-sunset',
    name: 'Coral Sunset',
    description: 'Gorgeous pastel peach and deep red color grading.',
    cssFilter: 'sepia(0.2) saturate(1.3) hue-rotate(-25deg) contrast(1.08)',
    defaultIntensity: 85,
    thumbnailColor: 'from-[#f43f5e] to-[#fb923c]',
    category: 'Color'
  },
  {
    id: 'autumn-leaves-col',
    name: 'Autumn Leaves',
    description: 'Warm russet tones, turns green hues into gold and orange.',
    cssFilter: 'sepia(0.25) saturate(1.2) hue-rotate(-18deg) contrast(1.1)',
    defaultIntensity: 85,
    thumbnailColor: 'from-[#c2410c] to-[#ea580c]',
    category: 'Color'
  },
  {
    id: 'tropical-color',
    name: 'Tropical Color',
    description: 'Punchy saturation with highly vibrant blues and jungle greens.',
    cssFilter: 'saturate(1.4) contrast(1.1) brightness(1.02) hue-rotate(5deg)',
    defaultIntensity: 75,
    thumbnailColor: 'from-[#059669] to-[#0284c7]',
    category: 'Color'
  },
  {
    id: 'neutral-gray',
    name: 'Neutral Gray',
    description: 'Subdued color scheme, reduces saturations for modern realism.',
    cssFilter: 'saturate(0.6) contrast(1.02) brightness(0.98)',
    defaultIntensity: 90,
    thumbnailColor: 'from-[#6b7280] to-[#9ca3af]',
    category: 'Color'
  },
  {
    id: 'vintage-color',
    name: 'Vintage Color',
    description: 'Warm retro shades of yellow and brown with faded greens.',
    cssFilter: 'sepia(0.35) saturate(0.85) brightness(1.03) contrast(0.9)',
    defaultIntensity: 80,
    thumbnailColor: 'from-[#854d0e] to-[#a16207]',
    category: 'Color'
  },
  {
    id: 'dynamic-tone',
    name: 'Dynamic Tone',
    description: 'Enhanced highlight retention and dark shadow separation.',
    cssFilter: 'contrast(1.25) saturate(1.1) brightness(1.02)',
    defaultIntensity: 80,
    thumbnailColor: 'from-[#1e40af] to-[#b45309]',
    category: 'Color'
  }
];
