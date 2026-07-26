import { FilterSample } from './samples';

export const NATURE_FILTERS: FilterSample[] = [
  {
    id: 'forest-green',
    name: 'Forest Green',
    description: 'Deepens foliage green tones and desaturates hot background elements.',
    cssFilter: 'hue-rotate(25deg) saturate(1.25) contrast(1.1) brightness(0.96)',
    defaultIntensity: 85,
    thumbnailColor: 'from-[#065f46] to-[#047857]',
    category: 'Nature'
  },
  {
    id: 'ocean-blue-nat',
    name: 'Ocean Blue',
    description: 'Brings out rich cobalt and deep teal color channels in water bodies.',
    cssFilter: 'hue-rotate(185deg) saturate(1.3) contrast(1.1) brightness(0.95)',
    defaultIntensity: 80,
    thumbnailColor: 'from-[#1e3a8a] to-[#0891b2]',
    category: 'Nature'
  },
  {
    id: 'mountain-air',
    name: 'Mountain Air',
    description: 'Clear cool contrast with cold highlights, ideal for snow and peak shots.',
    cssFilter: 'hue-rotate(175deg) brightness(1.04) contrast(1.05) saturate(0.95)',
    defaultIntensity: 80,
    thumbnailColor: 'from-[#e0f2fe] to-[#38bdf8]',
    category: 'Nature'
  },
  {
    id: 'tropical-paradise',
    name: 'Tropical Paradise',
    description: 'Super-saturated turquoise oceans and lush green landscape grading.',
    cssFilter: 'hue-rotate(165deg) saturate(1.45) contrast(1.08) brightness(1.03)',
    defaultIntensity: 75,
    thumbnailColor: 'from-[#0d9488] to-[#10b981]',
    category: 'Nature'
  },
  {
    id: 'desert-sun',
    name: 'Desert Sun',
    description: 'Washes out blue values and enhances hot reds, yellows and sand hues.',
    cssFilter: 'sepia(0.35) saturate(1.15) brightness(1.04) contrast(1.05) hue-rotate(-10deg)',
    defaultIntensity: 85,
    thumbnailColor: 'from-[#d97706] to-[#b45309]',
    category: 'Nature'
  },
  {
    id: 'autumn-leaves-nat',
    name: 'Autumn Leaves',
    description: 'Warm golden and brown grading, accentuating fallen leaves and forest floors.',
    cssFilter: 'sepia(0.2) saturate(1.25) hue-rotate(-15deg) contrast(1.08)',
    defaultIntensity: 85,
    thumbnailColor: 'from-[#ea580c] to-[#7c2d12]',
    category: 'Nature'
  },
  {
    id: 'spring-bloom',
    name: 'Spring Bloom',
    description: 'Fresh light greens and bright pastel blossom tones.',
    cssFilter: 'brightness(1.08) saturate(1.22) contrast(0.98) hue-rotate(5deg)',
    defaultIntensity: 80,
    thumbnailColor: 'from-[#4ade80] to-[#f472b6]',
    category: 'Nature'
  },
  {
    id: 'winter-frost',
    name: 'Winter Frost',
    description: 'Chilly desaturated styling with cool blue cast and bright snow highlights.',
    cssFilter: 'hue-rotate(190deg) saturate(0.7) contrast(1.1) brightness(1.05)',
    defaultIntensity: 80,
    thumbnailColor: 'from-[#cbd5e1] to-[#60a5fa]',
    category: 'Nature'
  },
  {
    id: 'rainy-mood',
    name: 'Rainy Mood',
    description: 'Deep moody contrast with dark cold tones for wet cloudy scenes.',
    cssFilter: 'contrast(1.15) saturate(0.7) brightness(0.85) hue-rotate(180deg)',
    defaultIntensity: 90,
    thumbnailColor: 'from-[#1e293b] to-[#475569]',
    category: 'Nature'
  },
  {
    id: 'golden-field',
    name: 'Golden Field',
    description: 'Amplifies golden dry grass and grain field glows.',
    cssFilter: 'sepia(0.3) saturate(1.3) contrast(1.04) brightness(1.02) hue-rotate(-8deg)',
    defaultIntensity: 85,
    thumbnailColor: 'from-[#ca8a04] to-[#fbbf24]',
    category: 'Nature'
  },
  {
    id: 'sunset-sky-nat',
    name: 'Sunset Sky',
    description: 'Deep fiery orange and magenta sky enhancement.',
    cssFilter: 'sepia(0.35) saturate(1.4) contrast(1.1) hue-rotate(-22deg)',
    defaultIntensity: 80,
    thumbnailColor: 'from-[#c026d3] to-[#ea580c]',
    category: 'Nature'
  },
  {
    id: 'sunrise-glow',
    name: 'Sunrise Glow',
    description: 'Gentle morning gold and peach highlights with clean shadows.',
    cssFilter: 'sepia(0.2) saturate(1.15) brightness(1.05) contrast(0.98) hue-rotate(-5deg)',
    defaultIntensity: 85,
    thumbnailColor: 'from-[#fb7185] to-[#fef08a]',
    category: 'Nature'
  },
  {
    id: 'deep-ocean',
    name: 'Deep Ocean',
    description: 'Intense underwater grade, filters out reds and boosts deep blues.',
    cssFilter: 'hue-rotate(200deg) saturate(1.2) contrast(1.15) brightness(0.88)',
    defaultIntensity: 85,
    thumbnailColor: 'from-[#172554] to-[#1d4ed8]',
    category: 'Nature'
  },
  {
    id: 'fresh-nature',
    name: 'Fresh Nature',
    description: 'Clean organic color grade, perfect for gardens and meadows.',
    cssFilter: 'saturate(1.18) contrast(1.02) brightness(1.02) hue-rotate(10deg)',
    defaultIntensity: 90,
    thumbnailColor: 'from-[#16a34a] to-[#86efac]',
    category: 'Nature'
  },
  {
    id: 'wild-forest',
    name: 'Wild Forest',
    description: 'Desaturated greens and moody shadows for deep wilderness vibes.',
    cssFilter: 'contrast(1.22) saturate(0.8) hue-rotate(18deg) brightness(0.92)',
    defaultIntensity: 85,
    thumbnailColor: 'from-[#14532d] to-[#0f172a]',
    category: 'Nature'
  },
  {
    id: 'blue-lagoon',
    name: 'Blue Lagoon',
    description: 'Splendid turquoise and mint green color mapping for crystal waters.',
    cssFilter: 'hue-rotate(160deg) saturate(1.35) contrast(1.06) brightness(1.02)',
    defaultIntensity: 80,
    thumbnailColor: 'from-[#0ea5e9] to-[#2dd4bf]',
    category: 'Nature'
  },
  {
    id: 'green-valley',
    name: 'Green Valley',
    description: 'Warm sunshine overlay combined with lush pasture green tones.',
    cssFilter: 'sepia(0.12) saturate(1.2) contrast(1.04) hue-rotate(15deg)',
    defaultIntensity: 85,
    thumbnailColor: 'from-[#15803d] to-[#eab308]',
    category: 'Nature'
  },
  {
    id: 'crystal-lake',
    name: 'Crystal Lake',
    description: 'Crisp cold highlights and deep emerald water tones.',
    cssFilter: 'hue-rotate(178deg) saturate(1.1) contrast(1.1) brightness(1.02)',
    defaultIntensity: 80,
    thumbnailColor: 'from-[#0f766e] to-[#67e8f9]',
    category: 'Nature'
  },
  {
    id: 'aurora-sky',
    name: 'Aurora Sky',
    description: 'Magical neon green and deep violet night sky enhancement.',
    cssFilter: 'hue-rotate(85deg) saturate(1.4) contrast(1.2) brightness(0.95)',
    defaultIntensity: 75,
    thumbnailColor: 'from-[#10b981] to-[#4c1d95]',
    category: 'Nature'
  },
  {
    id: 'cloudy-day',
    name: 'Cloudy Day',
    description: 'Subtle gray tones and soft contrast, ideal for overcast outdoor footage.',
    cssFilter: 'saturate(0.85) contrast(0.95) brightness(1.02)',
    defaultIntensity: 95,
    thumbnailColor: 'from-[#4b5563] to-[#cbd5e1]',
    category: 'Nature'
  },
  {
    id: 'bright-garden',
    name: 'Bright Garden',
    description: 'Glowy highlights and high saturation for flowers and spring parks.',
    cssFilter: 'brightness(1.1) saturate(1.3) contrast(1.05)',
    defaultIntensity: 80,
    thumbnailColor: 'from-[#f43f5e] to-[#10b981]',
    category: 'Nature'
  },
  {
    id: 'nature-hdr',
    name: 'Nature HDR',
    description: 'Extreme details in foliage and clouds with sharp outline structures.',
    cssFilter: 'contrast(1.3) brightness(1.06) saturate(1.22)',
    defaultIntensity: 70,
    thumbnailColor: 'from-[#0ea5e9] to-[#84cc16]',
    category: 'Nature'
  },
  {
    id: 'earth-tone',
    name: 'Earth Tone',
    description: 'Warm clay and soil colors with soft neutral foliage levels.',
    cssFilter: 'sepia(0.28) saturate(0.95) contrast(1.02) brightness(0.98)',
    defaultIntensity: 85,
    thumbnailColor: 'from-[#b45309] to-[#78350f]',
    category: 'Nature'
  },
  {
    id: 'landscape-pro',
    name: 'Landscape Pro',
    description: 'Balanced outdoor grading with rich sky details and deep greens.',
    cssFilter: 'contrast(1.15) saturate(1.15) brightness(1.02) hue-rotate(5deg)',
    defaultIntensity: 80,
    thumbnailColor: 'from-[#1d4ed8] to-[#166534]',
    category: 'Nature'
  },
  {
    id: 'adventure-nat',
    name: 'Adventure',
    description: 'Vibrant explorer look, perfect for travel storytelling and vlogs.',
    cssFilter: 'contrast(1.1) brightness(1.04) saturate(1.25) hue-rotate(-5deg)',
    defaultIntensity: 80,
    thumbnailColor: 'from-[#ca8a04] to-[#047857]',
    category: 'Nature'
  }
];
