import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  Star,
  X,
  Copy,
  Download,
  Eye,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Check
} from 'lucide-react';
import { renderProgrammaticThumbnail } from './TransitionTemplates';
import { InteractiveTransitionPlayer } from './InteractiveTransitionPlayer';
import { SAMPLE_TRANSITIONS_NEW } from './Transitions.data';

interface TransitionGalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTransition?: (id: string) => void;
}

const CATEGORY_COLORS: Record<string, string> = {
  'Basic Transitions': '#38bdf8',
  'Camera Transitions': '#14b8a6',
  'Zoom Transitions': '#a855f7',
  'Slide & Push Transitions': '#22c55e',
  'Spin & Rotate Transitions': '#f97316',
  'Blur & Motion Transitions': '#6366f1',
  'Glitch & Digital Transitions': '#ec4899',
  'Cinematic & Light Transitions': '#eab308',
};

// Map SAMPLE_TRANSITIONS_NEW to 1-200 format
const GALLERY_ITEMS = SAMPLE_TRANSITIONS_NEW.map((item, idx) => {
  const num = idx + 1;
  let categoryName = 'Basic Transitions';
  let catColor = '#38bdf8';

  if (num >= 1 && num <= 25) { categoryName = 'Basic Transitions'; catColor = '#38bdf8'; }
  else if (num >= 26 && num <= 50) { categoryName = 'Camera Transitions'; catColor = '#14b8a6'; }
  else if (num >= 51 && num <= 75) { categoryName = 'Zoom Transitions'; catColor = '#a855f7'; }
  else if (num >= 76 && num <= 100) { categoryName = 'Slide & Push Transitions'; catColor = '#22c55e'; }
  else if (num >= 101 && num <= 125) { categoryName = 'Spin & Rotate Transitions'; catColor = '#f97316'; }
  else if (num >= 126 && num <= 150) { categoryName = 'Blur & Motion Transitions'; catColor = '#6366f1'; }
  else if (num >= 151 && num <= 175) { categoryName = 'Glitch & Digital Transitions'; catColor = '#ec4899'; }
  else if (num >= 176 && num <= 200) { categoryName = 'Cinematic & Light Transitions'; catColor = '#eab308'; }

  const visualEffectKey = item.keywords[0] || 'visual transition effect';
  const prompt = `Create a 16:9 cinematic video-editing transition thumbnail for ${item.name.toUpperCase()}. Show an abstract dark background with ${visualEffectKey} visual effect. Use ${categoryName} lighting, high contrast, subtle motion blur, premium professional post-production style, no watermark, no extra text.`;

  return {
    id: num,
    originalId: item.id,
    name: item.name,
    category: categoryName,
    description: item.description,
    color: catColor,
    prompt,
  };
});

export const TransitionGalleryModal: React.FC<TransitionGalleryModalProps> = ({
  isOpen,
  onClose,
  onSelectTransition,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'number' | 'name' | 'category' | 'favorites'>('number');
  const [favorites, setFavorites] = useState<number[]>([]);
  const [activeItem, setActiveItem] = useState<typeof GALLERY_ITEMS[0] | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 24;

  useEffect(() => {
    try {
      const savedFavs = localStorage.getItem('veytrix_gallery_favorites');
      if (savedFavs) setFavorites(JSON.parse(savedFavs));
    } catch {}
  }, []);

  const toggleFavorite = (id: number, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setFavorites((prev) => {
      const updated = prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id];
      localStorage.setItem('veytrix_gallery_favorites', JSON.stringify(updated));
      return updated;
    });
  };

  const copyPrompt = (promptText: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    navigator.clipboard.writeText(promptText);
    showToast('Thumbnail prompt copied');
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const downloadThumbnailMock = (name: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    showToast(`Downloading thumbnail asset for ${name}`);
  };

  const categoriesList = [
    'All',
    'Favorites',
    'Basic Transitions',
    'Camera Transitions',
    'Zoom Transitions',
    'Slide & Push Transitions',
    'Spin & Rotate Transitions',
    'Blur & Motion Transitions',
    'Glitch & Digital Transitions',
    'Cinematic & Light Transitions',
  ];

  const filteredItems = useMemo(() => {
    return GALLERY_ITEMS.filter((item) => {
      if (selectedCategory === 'Favorites') {
        if (!favorites.includes(item.id)) return false;
      } else if (selectedCategory !== 'All') {
        if (item.category !== selectedCategory) return false;
      }

      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        return (
          item.name.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q) ||
          item.category.toLowerCase().includes(q) ||
          item.id.toString() === q
        );
      }
      return true;
    }).sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'category') return a.category.localeCompare(b.category);
      if (sortBy === 'favorites') return (favorites.includes(b.id) ? 1 : 0) - (favorites.includes(a.id) ? 1 : 0);
      return a.id - b.id;
    });
  }, [searchQuery, selectedCategory, sortBy, favorites]);

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage) || 1;
  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredItems.slice(start, start + itemsPerPage);
  }, [filteredItems, currentPage]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-xl flex flex-col overflow-hidden text-slate-100 select-none animate-in fade-in duration-200">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-sky-500 text-slate-950 px-4 py-2 rounded-lg font-semibold shadow-xl flex items-center gap-2 animate-in slide-in-from-top-4">
          <Check className="h-4 w-4 stroke-[3]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <header className="h-16 border-b border-slate-800 bg-slate-950/80 px-6 flex items-center justify-between flex-shrink-0">
        <div>
          <h1 className="text-lg font-bold text-white flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-sky-400" />
            <span>200 Video Transitions</span>
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-400/30">
              {filteredItems.length} Presets
            </span>
          </h1>
          <p className="text-xs text-slate-400">
            Explore cinematic, camera, zoom, glitch, blur, and light transitions
          </p>
        </div>

        <button
          onClick={onClose}
          className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition"
        >
          <X className="h-5 w-5" />
        </button>
      </header>

      {/* Controls Toolbar */}
      <div className="border-b border-slate-800 bg-slate-900/50 px-6 py-3 flex flex-wrap items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search transitions, names, descriptions..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500 transition"
          />
        </div>

        {/* Categories Horizontal Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-none max-w-full">
          {categoriesList.map((cat) => {
            const isSelected = selectedCategory === cat;
            const catColor = CATEGORY_COLORS[cat] || '#38bdf8';

            return (
              <button
                key={cat}
                onClick={() => {
                  setSelectedCategory(cat);
                  setCurrentPage(1);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                  isSelected
                    ? 'bg-sky-500 text-slate-950 font-bold shadow-md'
                    : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
                }`}
              >
                {cat === 'Favorites' ? <Star className="h-3 w-3 fill-amber-400 text-amber-400" /> : null}
                <span>{cat}</span>
              </button>
            );
          })}
        </div>

        {/* Sort By Dropdown */}
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-slate-400" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-sky-500 cursor-pointer"
          >
            <option value="number">Sort by Number</option>
            <option value="name">Sort by Name</option>
            <option value="category">Sort by Category</option>
            <option value="favorites">Sort by Favorites</option>
          </select>
        </div>
      </div>

      {/* Main Grid View */}
      <div className="flex-1 overflow-y-auto p-6">
        {paginatedItems.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-center text-slate-500">
            <Sparkles className="h-10 w-10 text-slate-600 mb-2 animate-bounce" />
            <p className="text-sm font-semibold text-slate-400">No matching transitions found</p>
            <p className="text-xs text-slate-600 mt-1">Try adjusting your search query or category filter</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {paginatedItems.map((item) => {
              const isFav = favorites.includes(item.id);

              return (
                <div
                  key={item.id}
                  onClick={() => setActiveItem(item)}
                  className="group bg-slate-900/60 border border-slate-800/80 rounded-xl overflow-hidden hover:border-sky-500/50 transition duration-300 flex flex-col cursor-pointer hover:shadow-[0_0_20px_rgba(56,189,248,0.15)]"
                >
                  {/* Programmatic 16:9 Thumbnail */}
                  <div className="relative">
                    {renderProgrammaticThumbnail(item)}

                    {/* Action Bar Overlay on Hover */}
                    <div className="absolute top-2 right-2 z-30 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                      <button
                        onClick={(e) => toggleFavorite(item.id, e)}
                        className={`p-1.5 rounded-md backdrop-blur-md transition ${
                          isFav ? 'bg-amber-500 text-slate-950' : 'bg-slate-950/80 text-slate-300 hover:text-white'
                        }`}
                        title="Favorite"
                      >
                        <Star className={`h-3.5 w-3.5 ${isFav ? 'fill-current' : ''}`} />
                      </button>
                    </div>
                  </div>

                  {/* Details Footer */}
                  <div className="p-3 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-white group-hover:text-sky-300 transition">
                          {item.name}
                        </span>
                        <span className="text-[10px] font-mono text-slate-500">#{item.id}</span>
                      </div>
                      <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                        {item.description}
                      </p>
                    </div>

                    <div className="mt-3 pt-2 border-t border-slate-800/60 flex items-center justify-between">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onSelectTransition) onSelectTransition(item.originalId);
                          onClose();
                        }}
                        className="text-[11px] font-bold text-sky-400 hover:text-sky-300 flex items-center gap-1"
                      >
                        <span>Apply</span>
                      </button>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => copyPrompt(item.prompt, e)}
                          className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition"
                          title="Copy Prompt"
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={(e) => downloadThumbnailMock(item.name, e)}
                          className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition"
                          title="Download Asset"
                        >
                          <Download className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Pagination Footer */}
      <footer className="h-14 border-t border-slate-800 bg-slate-950/90 px-6 flex items-center justify-between flex-shrink-0">
        <span className="text-xs font-mono text-slate-400">
          Showing {paginatedItems.length} of {filteredItems.length} transitions (Page {currentPage} of {totalPages})
        </span>

        <div className="flex items-center gap-2">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="text-xs font-mono text-slate-300">
            {currentPage} / {totalPages}
          </span>
          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </footer>

      {/* Transition Preview Details Modal */}
      {activeItem && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl">
            {/* Modal Thumbnail Header */}
            <div className="relative">
              <InteractiveTransitionPlayer
                transitionInput={activeItem.originalId || activeItem.name || activeItem.id}
                showControls={true}
                autoplay={true}
              />
              <button
                onClick={() => setActiveItem(null)}
                className="absolute top-3 right-3 z-40 p-1.5 rounded-full bg-slate-950/80 text-slate-300 hover:text-white border border-white/10 backdrop-blur-md cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-white">{activeItem.name}</h2>
                    <span
                      className="text-xs font-mono font-bold px-2 py-0.5 rounded text-slate-950"
                      style={{ backgroundColor: activeItem.color }}
                    >
                      #{activeItem.id}
                    </span>
                  </div>
                  <span className="text-xs font-mono text-sky-400 mt-1 block">{activeItem.category}</span>
                </div>

                <button
                  onClick={() => toggleFavorite(activeItem.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
                    favorites.includes(activeItem.id)
                      ? 'bg-amber-500 text-slate-950 border-amber-400'
                      : 'bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-800'
                  }`}
                >
                  <Star className={`h-3.5 w-3.5 ${favorites.includes(activeItem.id) ? 'fill-current' : ''}`} />
                  <span>{favorites.includes(activeItem.id) ? 'Favorited' : 'Add Favorite'}</span>
                </button>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed bg-slate-950 p-3 rounded-lg border border-slate-800">
                {activeItem.description}
              </p>

              {/* Prompt Block */}
              <div>
                <label className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                  Generated Image Prompt
                </label>
                <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs font-mono text-slate-300 leading-relaxed relative group">
                  {activeItem.prompt}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-800">
                <button
                  onClick={() => copyPrompt(activeItem.prompt)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs transition cursor-pointer"
                >
                  <Copy className="h-4 w-4" />
                  <span>Copy Prompt</span>
                </button>

                <button
                  onClick={() => downloadThumbnailMock(activeItem.name)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition cursor-pointer"
                >
                  <Download className="h-4 w-4" />
                  <span>Download</span>
                </button>

                {onSelectTransition && (
                  <button
                    onClick={() => {
                      onSelectTransition(activeItem.originalId);
                      setActiveItem(null);
                      onClose();
                    }}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition cursor-pointer"
                  >
                    <Check className="h-4 w-4 stroke-[3]" />
                    <span>Apply Transition</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
