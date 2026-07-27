import { FilterSample } from './samples';

export const ARTISTIC_FILTERS: FilterSample[] = [
  {
    id: 'oil-painting',
    name: 'Oil Painting',
    description: 'Painterly look with posterized color blocks and soft thick borders.',
    cssFilter: 'contrast(1.15) saturate(1.4) brightness(1.02) sepia(0.05)',
    defaultIntensity: 75,
    thumbnailColor: 'from-[#d97706] to-[#ec4899]',
    category: 'Creative & Artistic'
  },
  {
    id: 'watercolor-filter',
    name: 'Watercolor',
    description: 'Soft pastel bleeding borders and low contrast watercolor feel.',
    cssFilter: 'brightness(1.12) contrast(0.85) saturate(1.3) hue-rotate(-5deg)',
    defaultIntensity: 80,
    thumbnailColor: 'from-[#38bdf8] to-[#f472b6]',
    category: 'Creative & Artistic'
  },
  {
    id: 'sketch-art',
    name: 'Sketch Art',
    description: 'High contrast pencil outline simulation with gray shades.',
    cssFilter: 'grayscale(1.0) contrast(1.7) brightness(1.1)',
    defaultIntensity: 90,
    thumbnailColor: 'from-[#1f2937] to-[#e5e7eb]',
    category: 'Creative & Artistic'
  },
  {
    id: 'pencil-drawing',
    name: 'Pencil Drawing',
    description: 'Fine graphite drawing look with soft gray ranges.',
    cssFilter: 'grayscale(1.0) contrast(1.25) brightness(1.05)',
    defaultIntensity: 90,
    thumbnailColor: 'from-[#4b5563] to-[#cbd5e1]',
    category: 'Creative & Artistic'
  },
  {
    id: 'comic-book',
    name: 'Comic Book',
    description: 'Bold graphical ink outlines and highly saturated flat color dots.',
    cssFilter: 'contrast(1.4) saturate(1.6) brightness(0.95)',
    defaultIntensity: 80,
    thumbnailColor: 'from-[#eab308] to-[#dc2626]',
    category: 'Creative & Artistic'
  },
  {
    id: 'cartoon-look',
    name: 'Cartoon',
    description: 'Cell-shaded color styling with flat gradients and bold structures.',
    cssFilter: 'saturate(1.5) contrast(1.22) brightness(1.04)',
    defaultIntensity: 80,
    thumbnailColor: 'from-[#fb923c] to-[#22c55e]',
    category: 'Creative & Artistic'
  },
  {
    id: 'pop-art',
    name: 'Pop Art',
    description: '60s screen-print style with fluorescent colors and extreme contrasts.',
    cssFilter: 'hue-rotate(60deg) saturate(2.0) contrast(1.3)',
    defaultIntensity: 70,
    thumbnailColor: 'from-[#db2777] to-[#eab308]',
    category: 'Creative & Artistic'
  },
  {
    id: 'canvas-paint',
    name: 'Canvas Paint',
    description: 'Adds woven canvas textures to overall color grading.',
    cssFilter: 'contrast(1.1) saturate(1.12) sepia(0.12) brightness(0.98)',
    defaultIntensity: 85,
    thumbnailColor: 'from-[#7c2d12] to-[#fed7aa]',
    category: 'Creative & Artistic'
  },
  {
    id: 'ink-drawing',
    name: 'Ink Drawing',
    description: 'High contrast black calligraphy pen rendering.',
    cssFilter: 'grayscale(1.0) contrast(2.0) brightness(1.0)',
    defaultIntensity: 100,
    thumbnailColor: 'from-[#000000] to-[#f9fafb]',
    category: 'Creative & Artistic'
  },
  {
    id: 'mosaic-art',
    name: 'Mosaic',
    description: 'Tesselated micro pixel blocks and structured contrast boundaries.',
    cssFilter: 'contrast(1.2) saturate(1.3) brightness(1.0)',
    defaultIntensity: 80,
    thumbnailColor: 'from-[#3b82f6] to-[#10b981]',
    category: 'Creative & Artistic'
  },
  {
    id: 'low-poly-art',
    name: 'Low Poly',
    description: 'Aggressive color separations creating faceted polygon shapes.',
    cssFilter: 'contrast(1.15) saturate(1.25) hue-rotate(15deg)',
    defaultIntensity: 80,
    thumbnailColor: 'from-[#6366f1] to-[#f43f5e]',
    category: 'Creative & Artistic'
  },
  {
    id: 'pixel-art-filter',
    name: 'Pixel Art',
    description: '8-bit retro gaming color palette and contrast simulation.',
    cssFilter: 'contrast(1.3) saturate(1.5) brightness(1.02)',
    defaultIntensity: 80,
    thumbnailColor: 'from-[#84cc16] to-[#a855f7]',
    category: 'Creative & Artistic'
  },
  {
    id: 'dream-glow-art',
    name: 'Dream Glow',
    description: 'Soft glowing focus with sweet pastel highlights.',
    cssFilter: 'brightness(1.15) contrast(0.88) saturate(1.25) sepia(0.08)',
    defaultIntensity: 85,
    thumbnailColor: 'from-[#fbcfe8] to-[#fca5a5]',
    category: 'Creative & Artistic'
  },
  {
    id: 'fantasy-world',
    name: 'Fantasy World',
    description: 'Surreal color maps converting landscapes into mythical palettes.',
    cssFilter: 'hue-rotate(140deg) saturate(1.4) contrast(1.15) brightness(1.02)',
    defaultIntensity: 80,
    thumbnailColor: 'from-[#a855f7] to-[#14b8a6]',
    category: 'Creative & Artistic'
  },
  {
    id: 'magic-light',
    name: 'Magic Light',
    description: 'Glowy ethereal lights and golden sparkles simulation.',
    cssFilter: 'brightness(1.15) saturate(1.22) contrast(1.05) sepia(0.12)',
    defaultIntensity: 80,
    thumbnailColor: 'from-[#ca8a04] to-[#fef08a]',
    category: 'Creative & Artistic'
  },
  {
    id: 'prism-glass',
    name: 'Prism Glass',
    description: 'Simulates chromatic refraction and glassy light dispersions.',
    cssFilter: 'saturate(1.2) contrast(1.1) hue-rotate(5deg)',
    defaultIntensity: 80,
    thumbnailColor: 'from-[#60a5fa] to-[#34d399]',
    category: 'Creative & Artistic'
  },
  {
    id: 'kaleidoscope-art',
    name: 'Kaleidoscope',
    description: 'Trippy reflective color symmetry and multiple reflections look.',
    cssFilter: 'hue-rotate(240deg) saturate(1.5) contrast(1.25)',
    defaultIntensity: 75,
    thumbnailColor: 'from-[#8b5cf6] to-[#ec4899]',
    category: 'Creative & Artistic'
  },
  {
    id: 'mirror-art',
    name: 'Mirror Art',
    description: 'High contrast reflective symmetry color tones.',
    cssFilter: 'contrast(1.25) saturate(1.15) brightness(1.0)',
    defaultIntensity: 80,
    thumbnailColor: 'from-[#374151] to-[#ffffff]',
    category: 'Creative & Artistic'
  },
  {
    id: 'crystal-vision',
    name: 'Crystal Vision',
    description: 'Sharp cut highlights and icy diamond colors.',
    cssFilter: 'hue-rotate(185deg) saturate(1.1) contrast(1.18) brightness(1.05)',
    defaultIntensity: 80,
    thumbnailColor: 'from-[#e0f2fe] to-[#38bdf8]',
    category: 'Creative & Artistic'
  },
  {
    id: 'abstract-color',
    name: 'Abstract Color',
    description: 'Surreal and abstract saturated spectrum mapping.',
    cssFilter: 'hue-rotate(80deg) saturate(1.7) contrast(1.2)',
    defaultIntensity: 70,
    thumbnailColor: 'from-[#10b981] to-[#f97316]',
    category: 'Creative & Artistic'
  },
  {
    id: 'double-exposure-art',
    name: 'Double Exposure',
    description: 'Dreamy low-contrast overlay shading for double exposure feel.',
    cssFilter: 'brightness(1.1) contrast(0.8) saturate(0.9) sepia(0.1)',
    defaultIntensity: 85,
    thumbnailColor: 'from-[#a1a1aa] to-[#fbcfe8]',
    category: 'Creative & Artistic'
  },
  {
    id: 'soft-bloom-art',
    name: 'Soft Bloom',
    description: 'Warm glowing light halo effect over screen highlights.',
    cssFilter: 'brightness(1.08) contrast(0.92) saturate(1.15) sepia(0.05)',
    defaultIntensity: 90,
    thumbnailColor: 'from-[#fef08a] to-[#fda4af]',
    category: 'Creative & Artistic'
  },
  {
    id: 'artistic-hdr',
    name: 'Artistic HDR',
    description: 'Heavy micro-contrasts and saturated tones, creating a painting style.',
    cssFilter: 'contrast(1.4) brightness(1.06) saturate(1.3)',
    defaultIntensity: 65,
    thumbnailColor: 'from-[#ef4444] to-[#3b82f6]',
    category: 'Creative & Artistic'
  },
  {
    id: 'creative-studio',
    name: 'Creative Studio',
    description: 'Clean creative grading with deep navy shadows and rose gold highlights.',
    cssFilter: 'hue-rotate(250deg) saturate(1.22) contrast(1.18) sepia(0.04)',
    defaultIntensity: 80,
    thumbnailColor: 'from-[#1e1b4b] to-[#fecaca]',
    category: 'Creative & Artistic'
  },
  {
    id: 'masterpiece-art',
    name: 'Masterpiece',
    description: 'Highest quality creative styling combining film tones and perfect illumination.',
    cssFilter: 'contrast(1.2) brightness(1.02) saturate(1.18) sepia(0.02)',
    defaultIntensity: 80,
    thumbnailColor: 'from-[#7c3aed] to-[#1e293b]',
    category: 'Creative & Artistic'
  }
];
