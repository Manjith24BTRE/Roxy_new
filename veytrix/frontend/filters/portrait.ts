import { FilterSample } from './samples';

export const PORTRAIT_FILTERS: FilterSample[] = [
  {
    id: 'natural-skin',
    name: 'Natural Skin',
    description: 'Brings out healthy peach and warm tones in human skin ranges.',
    cssFilter: 'sepia(0.08) saturate(1.1) brightness(1.02) contrast(0.98)',
    defaultIntensity: 90,
    thumbnailColor: 'from-[#fca5a5] to-[#fecaca]',
    category: 'Portrait'
  },
  {
    id: 'beauty-soft',
    name: 'Beauty Soft',
    description: 'Soft lighting filter with subtle glows and reduced midtone textures.',
    cssFilter: 'brightness(1.08) contrast(0.92) saturate(1.05) sepia(0.05)',
    defaultIntensity: 85,
    thumbnailColor: 'from-[#fda4af] to-[#ffe4e6]',
    category: 'Portrait'
  },
  {
    id: 'smooth-face',
    name: 'Smooth Face',
    description: 'Reduces skin imperfections by flattening micro-contrasts.',
    cssFilter: 'contrast(0.88) brightness(1.04) saturate(1.02)',
    defaultIntensity: 90,
    thumbnailColor: 'from-[#f0abfc] to-[#fae8ff]',
    category: 'Portrait'
  },
  {
    id: 'bright-skin',
    name: 'Bright Skin',
    description: 'Illuminates skin tones, adding high-key studio glamour lighting.',
    cssFilter: 'brightness(1.12) contrast(0.95) saturate(1.08)',
    defaultIntensity: 80,
    thumbnailColor: 'from-[#fed7aa] to-[#ffedd5]',
    category: 'Portrait'
  },
  {
    id: 'golden-skin',
    name: 'Golden Skin',
    description: 'Rich warm tan look, enhances golden melanin and skin radiance.',
    cssFilter: 'sepia(0.18) saturate(1.2) brightness(1.03) contrast(1.02) hue-rotate(-5deg)',
    defaultIntensity: 80,
    thumbnailColor: 'from-[#fbbf24] to-[#fef3c7]',
    category: 'Portrait'
  },
  {
    id: 'matte-portrait',
    name: 'Matte Portrait',
    description: 'Elegant portrait lighting with soft dark zones and high-end matte print look.',
    cssFilter: 'contrast(0.92) brightness(1.01) saturate(0.95) sepia(0.03)',
    defaultIntensity: 85,
    thumbnailColor: 'from-[#78716c] to-[#a8a29e]',
    category: 'Portrait'
  },
  {
    id: 'studio-portrait',
    name: 'Studio Portrait',
    description: 'Balanced contrast curves simulating professional multi-point studio lights.',
    cssFilter: 'contrast(1.12) brightness(1.04) saturate(1.08)',
    defaultIntensity: 80,
    thumbnailColor: 'from-[#475569] to-[#cbd5e1]',
    category: 'Portrait'
  },
  {
    id: 'fashion-look',
    name: 'Fashion Look',
    description: 'High contrast and bold saturation, perfect for modeling and runway footage.',
    cssFilter: 'contrast(1.2) brightness(1.05) saturate(1.22) hue-rotate(2deg)',
    defaultIntensity: 75,
    thumbnailColor: 'from-[#ec4899] to-[#db2777]',
    category: 'Portrait'
  },
  {
    id: 'glamour-glow',
    name: 'Glamour Glow',
    description: 'Romantic diffuse highlight glow with warm peach overlays.',
    cssFilter: 'brightness(1.1) contrast(0.9) saturate(1.15) sepia(0.1)',
    defaultIntensity: 80,
    thumbnailColor: 'from-[#fca5a5] to-[#f472b6]',
    category: 'Portrait'
  },
  {
    id: 'clean-portrait',
    name: 'Clean Portrait',
    description: 'Pure whites and natural flesh tones, removes magenta casts.',
    cssFilter: 'saturate(1.02) contrast(1.02) brightness(1.02)',
    defaultIntensity: 100,
    thumbnailColor: 'from-[#e2e8f0] to-[#f8fafc]',
    category: 'Portrait'
  },
  {
    id: 'wedding-portrait',
    name: 'Wedding Portrait',
    description: 'Romantic bright grade with low contrast and dreamlike warm highlights.',
    cssFilter: 'brightness(1.08) contrast(0.85) saturate(1.1) sepia(0.06)',
    defaultIntensity: 85,
    thumbnailColor: 'from-[#fed7aa] to-[#fecaca]',
    category: 'Portrait'
  },
  {
    id: 'bridal-soft',
    name: 'Bridal Soft',
    description: 'High brightness, low contrast pastel grade for soft focus wedding looks.',
    cssFilter: 'brightness(1.12) contrast(0.8) saturate(1.05) sepia(0.04)',
    defaultIntensity: 80,
    thumbnailColor: 'from-[#fff1f2] to-[#ffe4e6]',
    category: 'Portrait'
  },
  {
    id: 'lifestyle-portrait',
    name: 'Lifestyle Portrait',
    description: 'Warm natural light look with soft film contrasts for daily vlogs.',
    cssFilter: 'contrast(1.05) brightness(1.03) saturate(1.1) sepia(0.1)',
    defaultIntensity: 85,
    thumbnailColor: 'from-[#ea580c] to-[#fed7aa]',
    category: 'Portrait'
  },
  {
    id: 'fresh-face',
    name: 'Fresh Face',
    description: 'Clean cooling look, minimizes facial red blemishes and yellow casts.',
    cssFilter: 'hue-rotate(5deg) brightness(1.04) saturate(1.02) contrast(0.98)',
    defaultIntensity: 90,
    thumbnailColor: 'from-[#a5f3fc] to-[#e0f2fe]',
    category: 'Portrait'
  },
  {
    id: 'beauty-pro',
    name: 'Beauty Pro',
    description: 'Advanced commercial grade rendering beautiful radiant skin surfaces.',
    cssFilter: 'brightness(1.06) contrast(0.96) saturate(1.1)',
    defaultIntensity: 95,
    thumbnailColor: 'from-[#db2777] to-[#ffe4e6]',
    category: 'Portrait'
  },
  {
    id: 'soft-makeup',
    name: 'Soft Makeup',
    description: 'Enhances cosmetic palettes, lip reds and cheek highlights.',
    cssFilter: 'hue-rotate(-5deg) saturate(1.2) brightness(1.02) contrast(0.96)',
    defaultIntensity: 85,
    thumbnailColor: 'from-[#f472b6] to-[#fbcfe8]',
    category: 'Portrait'
  },
  {
    id: 'natural-glow',
    name: 'Natural Glow',
    description: 'Subtle highlight illumination with soft skin contours.',
    cssFilter: 'brightness(1.05) contrast(1.0) saturate(1.05) sepia(0.04)',
    defaultIntensity: 90,
    thumbnailColor: 'from-[#fbbf24] to-[#fef08a]',
    category: 'Portrait'
  },
  {
    id: 'cool-portrait',
    name: 'Cool Portrait',
    description: 'Refined pale skin tone rendering with slate blue background grading.',
    cssFilter: 'hue-rotate(180deg) saturate(0.88) brightness(1.03) contrast(1.02)',
    defaultIntensity: 80,
    thumbnailColor: 'from-[#1e40af] to-[#93c5fd]',
    category: 'Portrait'
  },
  {
    id: 'warm-portrait',
    name: 'Warm Portrait',
    description: 'Welcoming golden bronze portrait look for outdoor sunset shots.',
    cssFilter: 'sepia(0.2) saturate(1.15) brightness(1.02) contrast(1.02) hue-rotate(-5deg)',
    defaultIntensity: 85,
    thumbnailColor: 'from-[#ea580c] to-[#fef08a]',
    category: 'Portrait'
  },
  {
    id: 'luxury-portrait',
    name: 'Luxury Portrait',
    description: 'Deep royal colors and rich shadows with warm polished skin tone.',
    cssFilter: 'contrast(1.15) saturate(1.18) brightness(0.98) sepia(0.05)',
    defaultIntensity: 80,
    thumbnailColor: 'from-[#701a75] to-[#fdf4ff]',
    category: 'Portrait'
  },
  {
    id: 'premium-skin',
    name: 'Premium Skin',
    description: 'Flawless color-accurate skin curves with professional studio luminance.',
    cssFilter: 'brightness(1.05) contrast(1.05) saturate(1.08)',
    defaultIntensity: 90,
    thumbnailColor: 'from-[#be185d] to-[#fce7f3]',
    category: 'Portrait'
  },
  {
    id: 'magazine-look',
    name: 'Magazine Look',
    description: 'High contrast fashion editorial styling, matches commercial printing.',
    cssFilter: 'contrast(1.22) brightness(1.03) saturate(1.1)',
    defaultIntensity: 75,
    thumbnailColor: 'from-[#111827] to-[#f9fafb]',
    category: 'Portrait'
  },
  {
    id: 'elegant-face',
    name: 'Elegant Face',
    description: 'Soft lighting and rich skin gradients, perfect for classical portraiture.',
    cssFilter: 'contrast(0.95) brightness(1.03) saturate(1.05) sepia(0.08)',
    defaultIntensity: 85,
    thumbnailColor: 'from-[#ca8a04] to-[#fef9c3]',
    category: 'Portrait'
  },
  {
    id: 'portrait-hdr',
    name: 'Portrait HDR',
    description: 'Strong contour structures and local dynamic skin enhancements.',
    cssFilter: 'contrast(1.24) brightness(1.08) saturate(1.15)',
    defaultIntensity: 70,
    thumbnailColor: 'from-[#2563eb] to-[#fca5a5]',
    category: 'Portrait'
  },
  {
    id: 'studio-light',
    name: 'Studio Light',
    description: 'Mimics powerful portrait softbox setups with clean luminance highlights.',
    cssFilter: 'brightness(1.15) contrast(0.98) saturate(1.05)',
    defaultIntensity: 80,
    thumbnailColor: 'from-[#ca8a04] to-[#ffffff]',
    category: 'Portrait'
  }
];
