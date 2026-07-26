export interface FilterSample {
  id: string;
  name: string;
  description: string;
  cssFilter: string; // CSS standard filter rule string
  defaultIntensity: number; // 0 to 100
  thumbnailColor: string; // Tailored color representation
}

export const SAMPLE_FILTERS: FilterSample[] = [
  {
    id: 'acid-trip',
    name: 'Acid Hue Trip',
    description: 'Extreme saturation with continuous shifting color spectrums.',
    cssFilter: 'saturate(2) hue-rotate(90deg) contrast(1.2)',
    defaultIntensity: 50,
    thumbnailColor: 'from-[#84cc16] to-[#ec4899]'
  },
  {
    id: 'cold-nordic',
    name: 'Cold Nordic Blue',
    description: 'Desaturated warm tones and elevated cyan/blue hues.',
    cssFilter: 'hue-rotate(180deg) saturate(0.8) contrast(1.05) brightness(0.95)',
    defaultIntensity: 75,
    thumbnailColor: 'from-[#1e3a8a] to-[#38bdf8]'
  },
  {
    id: 'cyberpunk',
    name: 'Cyberpunk Neon',
    description: 'Vibrant neon purple and blue shadows with punchy highlights.',
    cssFilter: 'hue-rotate(280deg) saturate(1.4) contrast(1.1)',
    defaultIntensity: 75,
    thumbnailColor: 'from-[#a21caf] to-[#06b6d4]'
  },
  {
    id: 'moody-forest',
    name: 'Moody Forest',
    description: 'Desaturated greens and deep cold shadows for a dramatic atmosphere.',
    cssFilter: 'contrast(1.2) saturate(0.7) hue-rotate(20deg) brightness(0.9)',
    defaultIntensity: 85,
    thumbnailColor: 'from-[#14532d] to-[#042f1a]'
  },
  {
    id: 'noir-monochrome',
    name: 'Noir Monochrome',
    description: 'High contrast black and white cinematic photography style.',
    cssFilter: 'grayscale(1) contrast(1.4) brightness(0.95)',
    defaultIntensity: 100,
    thumbnailColor: 'from-[#1e293b] to-[#f1f5f9]'
  },
  {
    id: 'pastel-dream',
    name: 'Pastel Dream',
    description: 'Low-contrast soft colors with elevated brightness and dreamlike feel.',
    cssFilter: 'brightness(1.15) contrast(0.8) saturate(1.3) hue-rotate(10deg)',
    defaultIntensity: 65,
    thumbnailColor: 'from-[#ec4899] to-[#a855f7]'
  },
  {
    id: 'sepia-memory',
    name: 'Sepia Memory',
    description: 'Classic warm sepia tint recalling historical film stock.',
    cssFilter: 'sepia(1) saturate(0.8) contrast(0.95)',
    defaultIntensity: 80,
    thumbnailColor: 'from-[#78350f] to-[#fef3c7]'
  },
  {
    id: 'orange-teal',
    name: 'Teal & Orange',
    description: 'Cinematic color grade pushing teals in shadows and warm orange in skin tones.',
    cssFilter: 'contrast(1.15) saturate(1.1) hue-rotate(-10deg)',
    defaultIntensity: 80,
    thumbnailColor: 'from-[#0d9488] to-[#ea580c]'
  },
  {
    id: 'vintage-1970',
    name: 'Vintage 1970',
    description: 'Faded retro look with warm colors, low contrast, and slight grain.',
    cssFilter: 'sepia(0.3) saturate(0.9) brightness(1.05) contrast(0.85)',
    defaultIntensity: 70,
    thumbnailColor: 'from-[#b45309] to-[#d97706]'
  },
  {
    id: 'warm-sunset',
    name: 'Warm Sunset Glow',
    description: 'Golden hour grade enhancing reds, oranges, and overall warmth.',
    cssFilter: 'sepia(0.4) saturate(1.2) hue-rotate(-15deg) contrast(1.05)',
    defaultIntensity: 90,
    thumbnailColor: 'from-[#f97316] to-[#b91c1c]'
  }
];
