// Filters.constants.ts
// Purpose: Category-specific base images, filter visual accent overlays, and thumbnail caching.

export const CATEGORY_PREVIEW_IMAGES: Record<string, string> = {
  Cinematic: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=240&q=75',
  Color: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=240&q=75',
  Portrait: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=240&q=75',
  'Vintage & Retro': 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=240&q=75',
  'Black & White': 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=240&q=75',
  Nature: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=240&q=75',
  'Neon & Cyber': 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=240&q=75',
  'Creative & Artistic': 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=240&q=75',
  DEFAULT: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=240&q=75',
};

export const FILTER_ACCENT_OVERLAYS: Record<string, string> = {
  'hollywood-gold': 'linear-gradient(to top right, rgba(234, 179, 8, 0.25), rgba(202, 138, 4, 0.1))',
  'teal-orange': 'linear-gradient(135deg, rgba(8, 145, 178, 0.25) 0%, rgba(180, 83, 9, 0.25) 100%)',
  'blockbuster': 'linear-gradient(135deg, rgba(6, 182, 212, 0.2) 0%, rgba(217, 119, 6, 0.2) 100%)',
  'imax-vision': 'linear-gradient(to bottom, rgba(2, 132, 199, 0.15), rgba(30, 58, 138, 0.2))',
  'cold-cinema': 'linear-gradient(to bottom right, rgba(14, 165, 233, 0.2), rgba(30, 41, 59, 0.1))',
  'warm-cinema': 'linear-gradient(to bottom right, rgba(245, 158, 11, 0.2), rgba(180, 83, 9, 0.1))',
  'dream-cinema': 'radial-gradient(circle, rgba(244, 114, 182, 0.15) 0%, rgba(168, 85, 247, 0.15) 100%)',
  cyberpunk: 'linear-gradient(135deg, rgba(236, 72, 153, 0.3) 0%, rgba(6, 182, 212, 0.3) 100%)',
  neon: 'linear-gradient(135deg, rgba(34, 197, 94, 0.25) 0%, rgba(168, 85, 247, 0.25) 100%)',
  'vhs-classic': 'repeating-linear-gradient(0deg, rgba(0,0,0,0.15), rgba(0,0,0,0.15) 1px, transparent 1px, transparent 3px)',
  'pure-mono': 'linear-gradient(to bottom, rgba(0,0,0,0.2), rgba(255,255,255,0.05))',
  'kodak-gold': 'linear-gradient(to top right, rgba(234, 179, 8, 0.2), rgba(239, 68, 68, 0.1))',
  'fuji-classic': 'linear-gradient(to top right, rgba(16, 185, 129, 0.15), rgba(59, 130, 246, 0.15))',
  'forest-green': 'linear-gradient(to bottom right, rgba(22, 101, 52, 0.3), rgba(6, 95, 70, 0.2))',
  golden: 'linear-gradient(to right, rgba(245, 158, 11, 0.25), rgba(217, 119, 6, 0.25))',
  sunset: 'linear-gradient(to bottom right, rgba(244, 63, 94, 0.25), rgba(249, 115, 22, 0.25))',
};

// In-memory cache for rendered thumbnails
export const thumbnailCache = new Map<string, string>();
