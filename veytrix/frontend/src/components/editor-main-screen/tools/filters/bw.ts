import { FilterSample } from './samples';

export const BW_FILTERS: FilterSample[] = [
  {
    id: 'pure-mono',
    name: 'Pure Mono',
    description: 'Clean and neutral monochrome conversion preserving original luminosity.',
    cssFilter: 'grayscale(1.0) contrast(1.0)',
    defaultIntensity: 100,
    thumbnailColor: 'from-[#6b7280] to-[#374151]',
    category: 'Black & White'
  },
  {
    id: 'high-contrast-bw',
    name: 'High Contrast BW',
    description: 'Aggressive monochrome curves with deep blacks and blinding whites.',
    cssFilter: 'grayscale(1.0) contrast(1.5) brightness(0.95)',
    defaultIntensity: 100,
    thumbnailColor: 'from-[#000000] to-[#ffffff]',
    category: 'Black & White'
  },
  {
    id: 'matte-bw',
    name: 'Matte BW',
    description: 'Low-contrast monochrome styling with elegant faded black levels.',
    cssFilter: 'grayscale(1.0) contrast(0.85) brightness(1.04)',
    defaultIntensity: 100,
    thumbnailColor: 'from-[#4b5563] to-[#9ca3af]',
    category: 'Black & White'
  },
  {
    id: 'noir-bw',
    name: 'Noir BW',
    description: 'Dramatic retro movie style with deep shadows and harsh highlights.',
    cssFilter: 'grayscale(1.0) contrast(1.4) brightness(0.88)',
    defaultIntensity: 100,
    thumbnailColor: 'from-[#090d16] to-[#4b5563]',
    category: 'Black & White'
  },
  {
    id: 'soft-bw',
    name: 'Soft BW',
    description: 'Gentle monochrome transitions with low contrast, ideal for portraits.',
    cssFilter: 'grayscale(1.0) contrast(0.8) brightness(1.02)',
    defaultIntensity: 100,
    thumbnailColor: 'from-[#9ca3af] to-[#cbd5e1]',
    category: 'Black & White'
  },
  {
    id: 'silver-bw',
    name: 'Silver BW',
    description: 'Emulates silver gelatin print chemistry with glowing highlights.',
    cssFilter: 'grayscale(1.0) contrast(1.18) brightness(1.05)',
    defaultIntensity: 100,
    thumbnailColor: 'from-[#cbd5e1] to-[#6b7280]',
    category: 'Black & White'
  },
  {
    id: 'vintage-bw',
    name: 'Vintage BW',
    description: 'Slightly sepia-warmed monochrome look from old archival prints.',
    cssFilter: 'grayscale(1.0) sepia(0.15) contrast(0.95) brightness(0.98)',
    defaultIntensity: 100,
    thumbnailColor: 'from-[#78350f] to-[#374151]',
    category: 'Black & White'
  },
  {
    id: 'sharp-bw',
    name: 'Sharp BW',
    description: 'High micro-contrast black and white, bringing out fine surface textures.',
    cssFilter: 'grayscale(1.0) contrast(1.3) brightness(1.0)',
    defaultIntensity: 100,
    thumbnailColor: 'from-[#1f2937] to-[#f3f4f6]',
    category: 'Black & White'
  },
  {
    id: 'deep-shadow-bw',
    name: 'Deep Shadow BW',
    description: 'Heavily suppresses low-range shadows for low-key artistic look.',
    cssFilter: 'grayscale(1.0) contrast(1.25) brightness(0.8)',
    defaultIntensity: 100,
    thumbnailColor: 'from-[#030712] to-[#1f2937]',
    category: 'Black & White'
  },
  {
    id: 'bright-bw',
    name: 'Bright BW',
    description: 'High-key black and white, boosts lighting levels and bright segments.',
    cssFilter: 'grayscale(1.0) brightness(1.15) contrast(0.95)',
    defaultIntensity: 100,
    thumbnailColor: 'from-[#9ca3af] to-[#ffffff]',
    category: 'Black & White'
  },
  {
    id: 'artistic-bw',
    name: 'Artistic BW',
    description: 'Stylized monochrome curves for highly dramatic graphical look.',
    cssFilter: 'grayscale(1.0) contrast(1.45) brightness(1.05)',
    defaultIntensity: 90,
    thumbnailColor: 'from-[#111827] to-[#e5e7eb]',
    category: 'Black & White'
  },
  {
    id: 'film-bw',
    name: 'Film BW',
    description: 'Simulates 35mm panchromatic film response with dynamic textures.',
    cssFilter: 'grayscale(1.0) contrast(1.1) brightness(0.98)',
    defaultIntensity: 100,
    thumbnailColor: 'from-[#374151] to-[#d1d5db]',
    category: 'Black & White'
  },
  {
    id: 'documentary-bw',
    name: 'Documentary BW',
    description: 'Honest and realistic photojournalist-style gray levels.',
    cssFilter: 'grayscale(1.0) contrast(1.05) brightness(1.0)',
    defaultIntensity: 100,
    thumbnailColor: 'from-[#4b5563] to-[#e5e7eb]',
    category: 'Black & White'
  },
  {
    id: 'studio-bw',
    name: 'Studio BW',
    description: 'Polished studio black and white look, optimal for fashion headshots.',
    cssFilter: 'grayscale(1.0) contrast(1.2) brightness(1.03)',
    defaultIntensity: 90,
    thumbnailColor: 'from-[#111827] to-[#ffffff]',
    category: 'Black & White'
  },
  {
    id: 'classic-bw',
    name: 'Classic BW',
    description: 'Standard black and white photo look with gentle contrast profile.',
    cssFilter: 'grayscale(1.0) contrast(0.95) brightness(1.0)',
    defaultIntensity: 100,
    thumbnailColor: 'from-[#4b5563] to-[#f3f4f6]',
    category: 'Black & White'
  },
  {
    id: 'elegant-bw',
    name: 'Elegant BW',
    description: 'Luxury monochrome conversion with smooth grey scaling.',
    cssFilter: 'grayscale(1.0) contrast(1.08) brightness(1.02) sepia(0.04)',
    defaultIntensity: 95,
    thumbnailColor: 'from-[#1f2937] to-[#cbd5e1]',
    category: 'Black & White'
  },
  {
    id: 'clean-bw',
    name: 'Clean BW',
    description: 'Highly clinical monochrome layout, removes warmth entirely.',
    cssFilter: 'grayscale(1.0) brightness(1.05) contrast(1.02)',
    defaultIntensity: 100,
    thumbnailColor: 'from-[#6b7280] to-[#f8fafc]',
    category: 'Black & White'
  },
  {
    id: 'moody-bw',
    name: 'Moody BW',
    description: 'Dark slate grey monochrome with heavy low-end values.',
    cssFilter: 'grayscale(1.0) contrast(1.15) brightness(0.85)',
    defaultIntensity: 100,
    thumbnailColor: 'from-[#0c0a09] to-[#57534e]',
    category: 'Black & White'
  },
  {
    id: 'dramatic-bw',
    name: 'Dramatic BW',
    description: 'Aggressive local contrast monochrome for intense scenes.',
    cssFilter: 'grayscale(1.0) contrast(1.38) brightness(0.9)',
    defaultIntensity: 100,
    thumbnailColor: 'from-[#020617] to-[#f1f5f9]',
    category: 'Black & White'
  },
  {
    id: 'soft-gray',
    name: 'Soft Gray',
    description: 'Very low contrast monochrome look, resembling warm grey skies.',
    cssFilter: 'grayscale(1.0) contrast(0.7) brightness(1.08)',
    defaultIntensity: 100,
    thumbnailColor: 'from-[#d1d5db] to-[#e5e7eb]',
    category: 'Black & White'
  },
  {
    id: 'charcoal-bw',
    name: 'Charcoal',
    description: 'Rich dark coal and soot textures with soft gray gradients.',
    cssFilter: 'grayscale(1.0) contrast(1.15) brightness(0.9) sepia(0.05)',
    defaultIntensity: 100,
    thumbnailColor: 'from-[#1c1917] to-[#44403c]',
    category: 'Black & White'
  },
  {
    id: 'ink-wash-bw',
    name: 'Ink Wash',
    description: 'Simulates traditional East Asian sumi-e ink wash paintings.',
    cssFilter: 'grayscale(1.0) contrast(1.3) brightness(1.15)',
    defaultIntensity: 90,
    thumbnailColor: 'from-[#030712] to-[#ffffff]',
    category: 'Black & White'
  },
  {
    id: 'mono-hdr',
    name: 'Mono HDR',
    description: 'Extreme details in shadows and skies converted to monochrome.',
    cssFilter: 'grayscale(1.0) contrast(1.35) brightness(1.1)',
    defaultIntensity: 80,
    thumbnailColor: 'from-[#1e293b] to-[#ffffff]',
    category: 'Black & White'
  },
  {
    id: 'timeless-bw',
    name: 'Timeless BW',
    description: 'Replicates legendary Hollywood portrait photography of the 1940s.',
    cssFilter: 'grayscale(1.0) contrast(1.22) brightness(1.0) sepia(0.08)',
    defaultIntensity: 100,
    thumbnailColor: 'from-[#1e1b4b] to-[#f8fafc]',
    category: 'Black & White'
  },
  {
    id: 'platinum-bw',
    name: 'Platinum BW',
    description: 'Extremely rich range of midtones with glowing highlight details.',
    cssFilter: 'grayscale(1.0) contrast(1.12) brightness(1.05)',
    defaultIntensity: 95,
    thumbnailColor: 'from-[#d4d4d8] to-[#27272a]',
    category: 'Black & White'
  }
];
