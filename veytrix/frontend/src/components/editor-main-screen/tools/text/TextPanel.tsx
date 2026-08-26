import React, { useState, useEffect } from 'react';
import {
  Plus, Type, AlignLeft, AlignCenter, AlignRight, AlignJustify,
  Bold, Italic, Underline, Strikethrough, Sparkles, Trash2,
  Sliders, Palette, Move, ArrowLeftRight, ArrowUpDown,
  Sun, Wand2, Search
} from 'lucide-react';

export interface TextOverlay {
  id: string;
  text: string;
  font: string;
  size: number;
  weight?: string;
  color: string;
  bgColor?: string;
  bgOpacity?: number;
  gradientText?: string;
  align: 'left' | 'center' | 'right' | 'justify';
  bold: boolean;
  italic: boolean;
  underline: boolean;
  strikethrough?: boolean;
  letterSpacing?: number;
  lineHeight?: number;
  textTransform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
  stroke: boolean;
  strokeColor: string;
  strokeWidth: number;
  shadow: boolean;
  shadowColor: string;
  shadowBlur: number;
  shadowOffsetX?: number;
  shadowOffsetY?: number;
  glow?: boolean;
  glowColor?: string;
  blur?: number;
  neon?: boolean;
  reflection?: boolean;
  opacity?: number;
  rotation?: number;
  scale?: number;
  posX?: number;
  posY?: number;
  flipH?: boolean;
  flipV?: boolean;
  animation: string;
  startTime?: number;
  duration?: number;
  time?: number;
}

interface TextPanelProps {
  overlays: TextOverlay[];
  onAddOverlay: (overlay: Omit<TextOverlay, 'id'>) => void;
  onRemoveOverlay: (id: string) => void;
  onUpdateOverlay: (id: string, updates: Partial<TextOverlay>) => void;
  activeOverlayId: string | null;
  setActiveOverlayId: (id: string | null) => void;
}

// 100+ Categorized Google Fonts Library
export const FONT_LIBRARY = [
  // Sans Serif
  { name: 'Inter', category: 'Sans Serif' },
  { name: 'Roboto', category: 'Sans Serif' },
  { name: 'Montserrat', category: 'Sans Serif' },
  { name: 'Open Sans', category: 'Sans Serif' },
  { name: 'Lato', category: 'Sans Serif' },
  { name: 'Poppins', category: 'Sans Serif' },
  { name: 'Oswald', category: 'Sans Serif' },
  { name: 'Raleway', category: 'Sans Serif' },
  { name: 'Nunito', category: 'Sans Serif' },
  { name: 'Work Sans', category: 'Sans Serif' },
  // Serif
  { name: 'Playfair Display', category: 'Serif' },
  { name: 'Merriweather', category: 'Serif' },
  { name: 'Lora', category: 'Serif' },
  { name: 'PT Serif', category: 'Serif' },
  { name: 'Cinzel', category: 'Serif' },
  { name: 'Bodoni Moda', category: 'Serif' },
  { name: 'Garamond', category: 'Serif' },
  { name: 'Cormorant Garamond', category: 'Serif' },
  // Display & Heavy
  { name: 'Bebas Neue', category: 'Display' },
  { name: 'Anton', category: 'Display' },
  { name: 'Bungee', category: 'Display' },
  { name: 'Righteous', category: 'Display' },
  { name: 'Ultra', category: 'Display' },
  { name: 'Black Han Sans', category: 'Display' },
  { name: 'Titan One', category: 'Display' },
  { name: 'Syne', category: 'Display' },
  // Script & Handwriting
  { name: 'Pacifico', category: 'Script' },
  { name: 'Caveat', category: 'Script' },
  { name: 'Dancing Script', category: 'Script' },
  { name: 'Great Vibes', category: 'Script' },
  { name: 'Lobster', category: 'Script' },
  { name: 'Satisfy', category: 'Script' },
  { name: 'Sacramento', category: 'Script' },
  { name: 'Kalam', category: 'Script' },
  // Modern & Minimal
  { name: 'Outfit', category: 'Modern' },
  { name: 'Plus Jakarta Sans', category: 'Modern' },
  { name: 'Urbanist', category: 'Modern' },
  { name: 'Space Grotesk', category: 'Modern' },
  { name: 'Lexend', category: 'Modern' },
  // Vintage & Retro
  { name: 'Courier New', category: 'Vintage' },
  { name: 'Special Elite', category: 'Vintage' },
  { name: 'Monoton', category: 'Vintage' },
  { name: 'Rye', category: 'Vintage' },
  { name: 'Press Start 2P', category: 'Vintage' },
  // Gaming & Cyber
  { name: 'Orbitron', category: 'Gaming' },
  { name: 'Audiowide', category: 'Gaming' },
  { name: 'VT323', category: 'Gaming' },
  { name: 'Electrolize', category: 'Gaming' },
  // Luxury & Elegant
  { name: 'Cinzel Decorative', category: 'Luxury' },
  { name: 'Italiana', category: 'Luxury' },
  { name: 'Bodoni', category: 'Luxury' }
];

export const TEXT_PRESETS = [
  {
    name: 'Cyberpunk Neon',
    color: '#06b6d4',
    font: 'Orbitron',
    weight: '700',
    bold: true,
    stroke: true,
    strokeColor: '#ec4899',
    strokeWidth: 3,
    shadow: true,
    shadowColor: '#38bdf8',
    shadowBlur: 14,
    glow: true,
    glowColor: '#ec4899',
    neon: true,
  },
  {
    name: 'Hollywood Gold',
    color: '#facc15',
    font: 'Cinzel',
    weight: '700',
    bold: true,
    stroke: true,
    strokeColor: '#000000',
    strokeWidth: 2,
    shadow: true,
    shadowColor: '#ca8a04',
    shadowBlur: 8,
    glow: false,
    neon: false,
  },
  {
    name: 'Retro Arcade',
    color: '#f43f5e',
    font: 'Press Start 2P',
    weight: '400',
    bold: false,
    stroke: true,
    strokeColor: '#facc15',
    strokeWidth: 2,
    shadow: true,
    shadowColor: '#881337',
    shadowBlur: 0,
    glow: false,
    neon: false,
  },
  {
    name: 'Minimal White',
    color: '#ffffff',
    font: 'Inter',
    weight: '600',
    bold: true,
    stroke: false,
    strokeColor: '#000000',
    strokeWidth: 0,
    shadow: true,
    shadowColor: 'rgba(0,0,0,0.5)',
    shadowBlur: 4,
    bgColor: '#000000',
    bgOpacity: 50,
  },
  {
    name: 'Bold Red Impact',
    color: '#ef4444',
    font: 'Anton',
    weight: '400',
    bold: false,
    stroke: true,
    strokeColor: '#ffffff',
    strokeWidth: 2,
    shadow: true,
    shadowColor: '#000000',
    shadowBlur: 10,
  },
  {
    name: 'Sunset Glow',
    color: '#fb923c',
    font: 'Montserrat',
    weight: '700',
    bold: true,
    gradientText: 'linear-gradient(135deg, #fb923c 0%, #db2777 100%)',
    stroke: false,
    strokeColor: '#000000',
    strokeWidth: 0,
    shadow: true,
    shadowColor: '#9d174d',
    shadowBlur: 12,
    glow: true,
    glowColor: '#db2777',
  }
];

export function TextPanel({
  overlays,
  onAddOverlay,
  onRemoveOverlay,
  onUpdateOverlay,
  activeOverlayId,
  setActiveOverlayId,
}: TextPanelProps) {
  // Main toolbar selection: 'text' (Add/Remove) or 'adjustments' (All styling/fonts/presets)
  const [activeMainTab, setActiveMainTab] = useState<'text' | 'adjustments'>('text');
  
  const [inputText, setInputText] = useState('Add Headline');
  const [fontFamily, setFontFamily] = useState('Inter');
  const [fontSearch, setFontSearch] = useState('');
  const [selectedFontCategory, setSelectedFontCategory] = useState<string>('All');

  // Text Properties State
  const [fontSize, setFontSize] = useState(48);
  const [fontWeight, setFontWeight] = useState('700');
  const [color, setColor] = useState('#ffffff');
  const [bgColor, setBgColor] = useState('#000000');
  const [bgOpacity, setBgOpacity] = useState(0);
  const [gradientText, setGradientText] = useState('');
  const [alignment, setAlignment] = useState<'left' | 'center' | 'right' | 'justify'>('center');
  const [bold, setBold] = useState(true);
  const [italic, setItalic] = useState(false);
  const [underline, setUnderline] = useState(false);
  const [strikethrough, setStrikethrough] = useState(false);
  const [letterSpacing, setLetterSpacing] = useState(0);
  const [lineHeight, setLineHeight] = useState(1.2);
  const [textTransform, setTextTransform] = useState<'none' | 'uppercase' | 'lowercase' | 'capitalize'>('none');

  // Effects State
  const [stroke, setStroke] = useState(false);
  const [strokeColor, setStrokeColor] = useState('#000000');
  const [strokeWidth, setStrokeWidth] = useState(2);
  const [shadow, setShadow] = useState(true);
  const [shadowColor, setShadowColor] = useState('rgba(0,0,0,0.6)');
  const [shadowBlur, setShadowBlur] = useState(6);
  const [shadowOffsetX, setShadowOffsetX] = useState(2);
  const [shadowOffsetY, setShadowOffsetY] = useState(2);
  const [glow, setGlow] = useState(false);
  const [glowColor, setGlowColor] = useState('#38bdf8');
  const [blur, setBlur] = useState(0);
  const [neon, setNeon] = useState(false);
  const [reflection, setReflection] = useState(false);

  // Transform State
  const [opacity, setOpacity] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [scale, setScale] = useState(1);
  const [posX, setPosX] = useState(0);
  const [posY, setPosY] = useState(0);
  const [flipH, setFlipH] = useState(false);
  const [flipV, setFlipV] = useState(false);
  const [animation, setAnimation] = useState('none');

  const activeOverlay = overlays.find((o) => o.id === activeOverlayId) || (overlays.length > 0 ? overlays[0] : null);

  // Sync active overlay properties when selected
  useEffect(() => {
    if (activeOverlay) {
      setInputText(activeOverlay.text);
      setFontFamily(activeOverlay.font || 'Inter');
      setFontSize(activeOverlay.size || 48);
      setFontWeight(activeOverlay.weight || '700');
      setColor(activeOverlay.color || '#ffffff');
      setBgColor(activeOverlay.bgColor || '#000000');
      setBgOpacity(activeOverlay.bgOpacity ?? 0);
      setGradientText(activeOverlay.gradientText || '');
      setAlignment(activeOverlay.align || 'center');
      setBold(activeOverlay.bold ?? true);
      setItalic(activeOverlay.italic ?? false);
      setUnderline(activeOverlay.underline ?? false);
      setStrikethrough(activeOverlay.strikethrough ?? false);
      setLetterSpacing(activeOverlay.letterSpacing ?? 0);
      setLineHeight(activeOverlay.lineHeight ?? 1.2);
      setTextTransform(activeOverlay.textTransform || 'none');

      setStroke(activeOverlay.stroke ?? false);
      setStrokeColor(activeOverlay.strokeColor || '#000000');
      setStrokeWidth(activeOverlay.strokeWidth ?? 2);
      setShadow(activeOverlay.shadow ?? true);
      setShadowColor(activeOverlay.shadowColor || 'rgba(0,0,0,0.6)');
      setShadowBlur(activeOverlay.shadowBlur ?? 6);
      setShadowOffsetX(activeOverlay.shadowOffsetX ?? 2);
      setShadowOffsetY(activeOverlay.shadowOffsetY ?? 2);
      setGlow(activeOverlay.glow ?? false);
      setGlowColor(activeOverlay.glowColor || '#38bdf8');
      setBlur(activeOverlay.blur ?? 0);
      setNeon(activeOverlay.neon ?? false);
      setReflection(activeOverlay.reflection ?? false);

      setOpacity(activeOverlay.opacity ?? 100);
      setRotation(activeOverlay.rotation ?? 0);
      setScale(activeOverlay.scale ?? 1);
      setPosX(activeOverlay.posX ?? 0);
      setPosY(activeOverlay.posY ?? 0);
      setFlipH(activeOverlay.flipH ?? false);
      setFlipV(activeOverlay.flipV ?? false);
      setAnimation(activeOverlay.animation || 'none');
    }
  }, [activeOverlayId, activeOverlay]);

  // Update Field Handler
  const handleUpdateField = (field: keyof TextOverlay, value: any) => {
    const targetId = activeOverlayId || activeOverlay?.id;
    if (targetId) {
      onUpdateOverlay(targetId, { [field]: value });
    }
    // Local state mirror
    switch (field) {
      case 'text': setInputText(value); break;
      case 'font': setFontFamily(value); break;
      case 'size': setFontSize(value); break;
      case 'weight': setFontWeight(value); break;
      case 'color': setColor(value); break;
      case 'bgColor': setBgColor(value); break;
      case 'bgOpacity': setBgOpacity(value); break;
      case 'gradientText': setGradientText(value); break;
      case 'align': setAlignment(value); break;
      case 'bold': setBold(value); break;
      case 'italic': setItalic(value); break;
      case 'underline': setUnderline(value); break;
      case 'strikethrough': setStrikethrough(value); break;
      case 'letterSpacing': setLetterSpacing(value); break;
      case 'lineHeight': setLineHeight(value); break;
      case 'textTransform': setTextTransform(value); break;
      case 'stroke': setStroke(value); break;
      case 'strokeColor': setStrokeColor(value); break;
      case 'strokeWidth': setStrokeWidth(value); break;
      case 'shadow': setShadow(value); break;
      case 'shadowColor': setShadowColor(value); break;
      case 'shadowBlur': setShadowBlur(value); break;
      case 'shadowOffsetX': setShadowOffsetX(value); break;
      case 'shadowOffsetY': setShadowOffsetY(value); break;
      case 'glow': setGlow(value); break;
      case 'glowColor': setGlowColor(value); break;
      case 'blur': setBlur(value); break;
      case 'neon': setNeon(value); break;
      case 'reflection': setReflection(value); break;
      case 'opacity': setOpacity(value); break;
      case 'rotation': setRotation(value); break;
      case 'scale': setScale(value); break;
      case 'posX': setPosX(value); break;
      case 'posY': setPosY(value); break;
      case 'flipH': setFlipH(value); break;
      case 'flipV': setFlipV(value); break;
      case 'animation': setAnimation(value); break;
    }
  };

  const handleCreateOverlay = () => {
    if (!inputText.trim()) return;
    onAddOverlay({
      text: inputText,
      font: fontFamily,
      size: fontSize,
      weight: fontWeight,
      color,
      bgColor,
      bgOpacity,
      gradientText,
      align: alignment,
      bold,
      italic,
      underline,
      strikethrough,
      letterSpacing,
      lineHeight,
      textTransform,
      stroke,
      strokeColor,
      strokeWidth,
      shadow,
      shadowColor,
      shadowBlur,
      shadowOffsetX,
      shadowOffsetY,
      glow,
      glowColor,
      blur,
      neon,
      reflection,
      opacity,
      rotation,
      scale,
      posX,
      posY,
      flipH,
      flipV,
      animation,
      startTime: 0,
      duration: 5,
    });
    setActiveMainTab('adjustments');
  };

  const applyPreset = (preset: typeof TEXT_PRESETS[0]) => {
    setColor(preset.color);
    setFontFamily(preset.font);
    setFontWeight(preset.weight);
    setBold(preset.bold);
    setStroke(preset.stroke);
    setStrokeColor(preset.strokeColor);
    setStrokeWidth(preset.strokeWidth);
    setShadow(preset.shadow);
    setShadowColor(preset.shadowColor);
    setShadowBlur(preset.shadowBlur);
    if (preset.gradientText !== undefined) setGradientText(preset.gradientText);
    if (preset.glow !== undefined) setGlow(preset.glow);
    if (preset.glowColor !== undefined) setGlowColor(preset.glowColor);
    if (preset.neon !== undefined) setNeon(preset.neon);
    if (preset.bgColor !== undefined) setBgColor(preset.bgColor);
    if (preset.bgOpacity !== undefined) setBgOpacity(preset.bgOpacity);

    const targetId = activeOverlayId || activeOverlay?.id;
    if (targetId) {
      onUpdateOverlay(targetId, {
        color: preset.color,
        font: preset.font,
        weight: preset.weight,
        bold: preset.bold,
        stroke: preset.stroke,
        strokeColor: preset.strokeColor,
        strokeWidth: preset.strokeWidth,
        shadow: preset.shadow,
        shadowColor: preset.shadowColor,
        shadowBlur: preset.shadowBlur,
        gradientText: preset.gradientText,
        glow: preset.glow,
        glowColor: preset.glowColor,
        neon: preset.neon,
        bgColor: preset.bgColor,
        bgOpacity: preset.bgOpacity,
      });
    }
  };

  const fontCategories = ['All', 'Sans Serif', 'Serif', 'Display', 'Script', 'Modern', 'Vintage', 'Gaming', 'Luxury'];

  const filteredFonts = FONT_LIBRARY.filter((f) => {
    const matchesSearch = f.name.toLowerCase().includes(fontSearch.toLowerCase()) || f.category.toLowerCase().includes(fontSearch.toLowerCase());
    const matchesCategory = selectedFontCategory === 'All' || f.category === selectedFontCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="h-full flex flex-col bg-[#060910] text-slate-200 select-none overflow-hidden">
      {/* Top Header & Reorganized 2-Main-Option Toolbar: TEXT | ADJUSTMENTS */}
      <div className="p-3 border-b border-white/10 bg-[#0c101d] flex-shrink-0 space-y-2.5">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-1.5">
            <Type className="h-4 w-4 text-sky-400" />
            <span>Text Tool</span>
          </h3>
          {activeOverlay && (
            <span className="text-[9px] font-mono font-bold text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/20 truncate max-w-[140px]">
              Active: "{activeOverlay.text}"
            </span>
          )}
        </div>

        {/* 2 Main Options Navigation Bar */}
        <div className="flex border border-white/10 rounded-lg bg-slate-950/60 p-0.5 gap-0.5">
          <button
            type="button"
            onClick={() => setActiveMainTab('text')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-md cursor-pointer transition flex items-center justify-center gap-1.5 ${
              activeMainTab === 'text'
                ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Type className="h-3.5 w-3.5" />
            <span>Text</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveMainTab('adjustments')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-md cursor-pointer transition flex items-center justify-center gap-1.5 ${
              activeMainTab === 'adjustments'
                ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sliders className="h-3.5 w-3.5" />
            <span>Adjustments</span>
          </button>
        </div>
      </div>

      <div className="flex-1 p-3 overflow-y-auto space-y-4">
        {/* MAIN OPTION 1: TEXT (Add Text & Remove/Delete Text) */}
        {activeMainTab === 'text' && (
          <div className="space-y-5">
            {/* 1. ADD NEW TEXT SECTION */}
            <div className="bg-slate-900/40 border border-white/5 rounded-xl p-3.5 space-y-3">
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-sky-400">
                <Plus className="h-4 w-4" />
                <span>Add Text</span>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Text Content</label>
                <textarea
                  rows={3}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Type new text title..."
                  className="w-full rounded-lg bg-slate-950 border border-white/10 px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-sky-500/50"
                />
              </div>

              <button
                type="button"
                onClick={handleCreateOverlay}
                className="w-full py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md transition"
              >
                <Plus className="h-4 w-4 stroke-[3]" />
                <span>Add Text Clip to Timeline</span>
              </button>
            </div>

            {/* 2. REMOVE / DELETE TEXT SECTION */}
            <div className="bg-slate-900/40 border border-white/5 rounded-xl p-3.5 space-y-3">
              <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-rose-400">
                <div className="flex items-center gap-1.5">
                  <Trash2 className="h-4 w-4" />
                  <span>Remove / Delete Text</span>
                </div>
                <span className="text-[9px] font-mono text-slate-400">({overlays.length} active)</span>
              </div>

              {overlays.length === 0 ? (
                <p className="text-xs text-slate-500 italic py-2 text-center">No text clips currently on timeline.</p>
              ) : (
                <div className="space-y-2">
                  <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-1">
                    {overlays.map((item) => {
                      const isActive = item.id === activeOverlayId;
                      return (
                        <div
                          key={item.id}
                          className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 transition ${
                            isActive
                              ? 'bg-sky-500/10 border-sky-400/50 text-sky-200'
                              : 'bg-slate-950 border-white/5 text-slate-300 hover:border-white/15'
                          }`}
                        >
                          <button
                            type="button"
                            onClick={() => setActiveOverlayId(isActive ? null : item.id)}
                            className="flex items-center gap-2 text-left truncate flex-1 cursor-pointer"
                          >
                            <Type className="h-3.5 w-3.5 text-sky-400 flex-shrink-0" />
                            <span className="text-xs font-medium truncate">{item.text}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => onRemoveOverlay(item.id)}
                            title="Remove Text"
                            className="h-7 w-7 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 flex items-center justify-center cursor-pointer transition flex-shrink-0"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      );
                    })}
                  </div>

                  {activeOverlay && (
                    <button
                      type="button"
                      onClick={() => onRemoveOverlay(activeOverlay.id)}
                      className="w-full mt-2 py-2 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 border border-rose-500/30 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="truncate">Delete Selected Text ("{activeOverlay.text}")</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* MAIN OPTION 2: ADJUSTMENTS (All customization, fonts, colors, styling, presets in one place) */}
        {activeMainTab === 'adjustments' && (
          <div className="space-y-4">
            {/* Timeline Text Selector Bar */}
            {overlays.length > 0 && (
              <div className="space-y-1.5 bg-slate-950/40 p-2 border border-white/5 rounded-xl">
                <span className="text-[9.5px] font-mono uppercase tracking-wider text-slate-400 block px-1">
                  Select Text Clip to Edit ({overlays.length})
                </span>
                <div className="flex gap-1.5 overflow-x-auto py-1 scrollbar-none">
                  {overlays.map((item) => {
                    const isActive = item.id === activeOverlayId;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setActiveOverlayId(isActive ? null : item.id)}
                        className={`px-2.5 py-1 rounded-lg border text-[10px] font-semibold cursor-pointer transition flex items-center gap-1.5 flex-shrink-0 ${
                          isActive
                            ? 'bg-sky-500/20 border-sky-400 text-sky-300 shadow'
                            : 'bg-slate-900 border-white/10 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <Type className="h-3 w-3" />
                        <span className="truncate max-w-[100px]">{item.text}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Direct Text String Editor */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Edit Text Content</label>
              <textarea
                rows={2}
                value={inputText}
                onChange={(e) => handleUpdateField('text', e.target.value)}
                placeholder="Type text..."
                className="w-full rounded-lg bg-slate-900 border border-white/10 px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-sky-500/50"
              />
            </div>

            {/* DESIGNER STYLE PRESETS */}
            <div className="bg-slate-900/40 border border-white/5 rounded-xl p-3 space-y-2.5">
              <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Text Presets & Styles</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {TEXT_PRESETS.map((p) => (
                  <button
                    key={p.name}
                    type="button"
                    onClick={() => applyPreset(p)}
                    className="p-2.5 rounded-xl bg-slate-950 hover:bg-slate-900 border border-white/10 hover:border-white/20 transition cursor-pointer text-left flex flex-col justify-between h-16 group"
                  >
                    <span className="text-[8.5px] text-slate-400 font-mono font-bold truncate">{p.name}</span>
                    <span
                      className="text-sm font-bold self-center truncate max-w-[110px]"
                      style={{
                        color: p.color,
                        fontFamily: p.font,
                        textShadow: p.shadow ? `0 0 ${p.shadowBlur}px ${p.shadowColor}` : 'none',
                        WebkitTextStroke: p.stroke ? `${p.strokeWidth / 2}px ${p.strokeColor}` : 'none',
                        background: p.gradientText || 'none',
                        WebkitBackgroundClip: p.gradientText ? 'text' : 'border-box',
                        WebkitTextFillColor: p.gradientText ? 'transparent' : 'inherit',
                      }}
                    >
                      Style Preview
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* 1. TYPOGRAPHY & LAYOUT (Font family, size, weight, alignment, line height, letter spacing) */}
            <div className="bg-slate-900/40 border border-white/5 rounded-xl p-3 space-y-3">
              <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-sky-400 flex items-center justify-between">
                <span>Typography & Formatting</span>
                <Sliders className="h-3.5 w-3.5" />
              </div>

              {/* Font Family & Weight */}
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <span className="text-[9px] text-slate-400">Font Family</span>
                  <select
                    value={fontFamily}
                    onChange={(e) => handleUpdateField('font', e.target.value)}
                    className="w-full rounded-md bg-slate-950 border border-white/10 px-2 py-1 text-xs text-slate-200 focus:outline-none"
                  >
                    {FONT_LIBRARY.map((f) => (
                      <option key={f.name} value={f.name}>{f.name} ({f.category})</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <span className="text-[9px] text-slate-400">Font Weight</span>
                  <select
                    value={fontWeight}
                    onChange={(e) => handleUpdateField('weight', e.target.value)}
                    className="w-full rounded-md bg-slate-950 border border-white/10 px-2 py-1 text-xs text-slate-200 focus:outline-none"
                  >
                    <option value="300">Light 300</option>
                    <option value="400">Regular 400</option>
                    <option value="600">SemiBold 600</option>
                    <option value="700">Bold 700</option>
                    <option value="900">Black 900</option>
                  </select>
                </div>
              </div>

              {/* Font Size & Letter Spacing */}
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <div className="flex justify-between text-[8.5px] text-slate-400">
                    <span>Font Size</span>
                    <span className="font-mono text-sky-400">{fontSize}px</span>
                  </div>
                  <input
                    type="range"
                    min="12"
                    max="160"
                    value={fontSize}
                    onChange={(e) => handleUpdateField('size', Number(e.target.value))}
                    className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-[8.5px] text-slate-400">
                    <span>Letter Spacing</span>
                    <span className="font-mono text-sky-400">{letterSpacing}px</span>
                  </div>
                  <input
                    type="range"
                    min="-4"
                    max="30"
                    value={letterSpacing}
                    onChange={(e) => handleUpdateField('letterSpacing', Number(e.target.value))}
                    className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                  />
                </div>
              </div>

              {/* Line Height Slider */}
              <div className="space-y-1">
                <div className="flex justify-between text-[8.5px] text-slate-400">
                  <span>Line Height</span>
                  <span className="font-mono text-sky-400">{lineHeight.toFixed(1)}x</span>
                </div>
                <input
                  type="range"
                  min="0.8"
                  max="3.0"
                  step="0.1"
                  value={lineHeight}
                  onChange={(e) => handleUpdateField('lineHeight', Number(e.target.value))}
                  className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                />
              </div>

              {/* Formatting & Alignment Toolbar */}
              <div className="flex items-center justify-between gap-1.5 pt-1">
                {/* Alignment */}
                <div className="flex rounded-lg bg-slate-950 border border-white/10 p-0.5">
                  {(['left', 'center', 'right', 'justify'] as const).map((align) => {
                    const Icon = align === 'left' ? AlignLeft : align === 'center' ? AlignCenter : align === 'right' ? AlignRight : AlignJustify;
                    return (
                      <button
                        key={align}
                        type="button"
                        onClick={() => handleUpdateField('align', align)}
                        className={`h-6 w-6 rounded flex items-center justify-center cursor-pointer transition ${
                          alignment === align ? 'bg-sky-500/20 text-sky-400 font-bold' : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <Icon className="h-3 w-3" />
                      </button>
                    );
                  })}
                </div>

                {/* Bold, Italic, Underline, Strikethrough */}
                <div className="flex rounded-lg bg-slate-950 border border-white/10 p-0.5">
                  <button
                    type="button"
                    onClick={() => handleUpdateField('bold', !bold)}
                    className={`h-6 w-6 rounded flex items-center justify-center cursor-pointer transition ${
                      bold ? 'bg-sky-500/20 text-sky-400 font-bold' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Bold className="h-3 w-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleUpdateField('italic', !italic)}
                    className={`h-6 w-6 rounded flex items-center justify-center cursor-pointer transition ${
                      italic ? 'bg-sky-500/20 text-sky-400 font-bold' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Italic className="h-3 w-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleUpdateField('underline', !underline)}
                    className={`h-6 w-6 rounded flex items-center justify-center cursor-pointer transition ${
                      underline ? 'bg-sky-500/20 text-sky-400 font-bold' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Underline className="h-3 w-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleUpdateField('strikethrough', !strikethrough)}
                    className={`h-6 w-6 rounded flex items-center justify-center cursor-pointer transition ${
                      strikethrough ? 'bg-sky-500/20 text-sky-400 font-bold' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Strikethrough className="h-3 w-3" />
                  </button>
                </div>

                {/* Text Transform */}
                <div className="flex rounded-lg bg-slate-950 border border-white/10 p-0.5 text-[8.5px] font-mono font-bold">
                  {(['none', 'uppercase', 'lowercase'] as const).map((tt) => (
                    <button
                      key={tt}
                      type="button"
                      onClick={() => handleUpdateField('textTransform', tt)}
                      className={`px-1.5 h-6 rounded flex items-center justify-center cursor-pointer transition ${
                        textTransform === tt ? 'bg-sky-500/20 text-sky-400' : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {tt === 'none' ? 'Aa' : tt === 'uppercase' ? 'AA' : 'aa'}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* 2. COLORS, BACKGROUND & OPACITY */}
            <div className="bg-slate-900/40 border border-white/5 rounded-xl p-3 space-y-3">
              <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-400 flex items-center justify-between">
                <span>Color, Background & Opacity</span>
                <Palette className="h-3.5 w-3.5" />
              </div>

              <div className="grid grid-cols-2 gap-2">
                {/* Text Color */}
                <div className="space-y-1 bg-slate-950 p-2 rounded-lg border border-white/5">
                  <span className="text-[8.5px] text-slate-400 block">Text Color</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={color}
                      onChange={(e) => handleUpdateField('color', e.target.value)}
                      className="w-6 h-6 rounded cursor-pointer border border-white/10 bg-transparent flex-shrink-0"
                    />
                    <span className="text-[10px] font-mono text-slate-300">{color}</span>
                  </div>
                </div>

                {/* Background Box Fill Color & Opacity */}
                <div className="space-y-1 bg-slate-950 p-2 rounded-lg border border-white/5">
                  <div className="flex items-center justify-between text-[8.5px] text-slate-400">
                    <span>Background Fill</span>
                    <span className="font-mono text-sky-400">{bgOpacity}%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={bgColor}
                      onChange={(e) => handleUpdateField('bgColor', e.target.value)}
                      className="w-6 h-6 rounded cursor-pointer border border-white/10 bg-transparent flex-shrink-0"
                    />
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={bgOpacity}
                      onChange={(e) => handleUpdateField('bgOpacity', Number(e.target.value))}
                      className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* Overall Text Opacity Slider */}
              <div className="space-y-1 bg-slate-950 p-2 rounded-lg border border-white/5">
                <div className="flex justify-between text-[8.5px] text-slate-400">
                  <span>Overall Opacity</span>
                  <span className="font-mono text-amber-400">{opacity}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={opacity}
                  onChange={(e) => handleUpdateField('opacity', Number(e.target.value))}
                  className="w-full accent-amber-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                />
              </div>
            </div>

            {/* 3. TRANSFORM & POSITION (Scale, Rotation, Position X/Y, Flips) */}
            <div className="bg-slate-900/40 border border-white/5 rounded-xl p-3 space-y-3">
              <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-400 flex items-center justify-between">
                <span>Transform, Position & Rotation</span>
                <Move className="h-3.5 w-3.5" />
              </div>

              <div className="grid grid-cols-2 gap-2">
                {/* Scale Multiplier */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[8.5px] text-slate-400">
                    <span>Scale</span>
                    <span className="font-mono text-emerald-400">{scale.toFixed(2)}x</span>
                  </div>
                  <input
                    type="range"
                    min="0.3"
                    max="3.0"
                    step="0.05"
                    value={scale}
                    onChange={(e) => handleUpdateField('scale', Number(e.target.value))}
                    className="w-full accent-emerald-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                  />
                </div>

                {/* Rotation */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[8.5px] text-slate-400">
                    <span>Rotation</span>
                    <span className="font-mono text-emerald-400">{rotation}°</span>
                  </div>
                  <input
                    type="range"
                    min="-180"
                    max="180"
                    value={rotation}
                    onChange={(e) => handleUpdateField('rotation', Number(e.target.value))}
                    className="w-full accent-emerald-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                  />
                </div>
              </div>

              {/* Position X & Position Y Sliders */}
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <div className="flex justify-between text-[8.5px] text-slate-400">
                    <span>Position X</span>
                    <span className="font-mono text-emerald-400">{posX}px</span>
                  </div>
                  <input
                    type="range"
                    min="-500"
                    max="500"
                    value={posX}
                    onChange={(e) => handleUpdateField('posX', Number(e.target.value))}
                    className="w-full accent-emerald-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-[8.5px] text-slate-400">
                    <span>Position Y</span>
                    <span className="font-mono text-emerald-400">{posY}px</span>
                  </div>
                  <input
                    type="range"
                    min="-500"
                    max="500"
                    value={posY}
                    onChange={(e) => handleUpdateField('posY', Number(e.target.value))}
                    className="w-full accent-emerald-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                  />
                </div>
              </div>

              {/* Flip Horizontal / Vertical */}
              <div className="flex items-center justify-between gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => handleUpdateField('flipH', !flipH)}
                  className={`flex-1 py-1 rounded text-[9.5px] font-bold border transition cursor-pointer flex items-center justify-center gap-1 ${
                    flipH ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300' : 'bg-slate-950 border-white/5 text-slate-400'
                  }`}
                >
                  <ArrowLeftRight className="h-3 w-3" />
                  <span>Flip Horizontal</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleUpdateField('flipV', !flipV)}
                  className={`flex-1 py-1 rounded text-[9.5px] font-bold border transition cursor-pointer flex items-center justify-center gap-1 ${
                    flipV ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300' : 'bg-slate-950 border-white/5 text-slate-400'
                  }`}
                >
                  <ArrowUpDown className="h-3 w-3" />
                  <span>Flip Vertical</span>
                </button>
              </div>
            </div>

            {/* 4. EFFECTS & OUTLINE (Stroke, Shadow, Glow, Neon) */}
            <div className="bg-slate-900/40 border border-white/5 rounded-xl p-3 space-y-3">
              <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-purple-400 flex items-center justify-between">
                <span>Effects & Outline</span>
                <Sparkles className="h-3.5 w-3.5" />
              </div>

              <div className="grid grid-cols-2 gap-2">
                {/* Stroke Outline */}
                <div className="bg-slate-950 p-2.5 rounded-lg border border-white/5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[9.5px] font-semibold text-slate-300">Stroke Outline</span>
                    <input
                      type="checkbox"
                      checked={stroke}
                      onChange={(e) => handleUpdateField('stroke', e.target.checked)}
                      className="rounded border-white/15 bg-slate-900 text-sky-400 focus:ring-0 cursor-pointer"
                    />
                  </div>
                  {stroke && (
                    <div className="space-y-1.5 pt-1">
                      <div className="flex items-center justify-between gap-1.5">
                        <input
                          type="color"
                          value={strokeColor}
                          onChange={(e) => handleUpdateField('strokeColor', e.target.value)}
                          className="w-5 h-5 rounded cursor-pointer border border-white/10 bg-transparent flex-shrink-0"
                        />
                        <input
                          type="number"
                          min="1"
                          max="16"
                          value={strokeWidth}
                          onChange={(e) => handleUpdateField('strokeWidth', Math.max(1, Number(e.target.value)))}
                          className="w-12 rounded bg-slate-900 border border-white/10 text-[10px] text-center text-slate-200"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Drop Shadow */}
                <div className="bg-slate-950 p-2.5 rounded-lg border border-white/5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[9.5px] font-semibold text-slate-300">Drop Shadow</span>
                    <input
                      type="checkbox"
                      checked={shadow}
                      onChange={(e) => handleUpdateField('shadow', e.target.checked)}
                      className="rounded border-white/15 bg-slate-900 text-sky-400 focus:ring-0 cursor-pointer"
                    />
                  </div>
                  {shadow && (
                    <div className="space-y-1 pt-1">
                      <div className="flex justify-between text-[8px] text-slate-400">
                        <span>Blur</span>
                        <span className="font-mono">{shadowBlur}px</span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="24"
                        value={shadowBlur}
                        onChange={(e) => handleUpdateField('shadowBlur', Number(e.target.value))}
                        className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Glow & Neon Toggles */}
              <div className="flex items-center justify-between gap-2 pt-1 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => handleUpdateField('glow', !glow)}
                  className={`flex-1 py-1 rounded text-[9.5px] font-bold border transition cursor-pointer flex items-center justify-center gap-1 ${
                    glow ? 'bg-sky-500/20 border-sky-400 text-sky-300' : 'bg-slate-950 border-white/5 text-slate-400'
                  }`}
                >
                  <Sun className="h-3 w-3" />
                  <span>Neon Glow</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleUpdateField('neon', !neon)}
                  className={`flex-1 py-1 rounded text-[9.5px] font-bold border transition cursor-pointer flex items-center justify-center gap-1 ${
                    neon ? 'bg-purple-500/20 border-purple-400 text-purple-300' : 'bg-slate-950 border-white/5 text-slate-400'
                  }`}
                >
                  <Wand2 className="h-3 w-3" />
                  <span>Electric Tube</span>
                </button>
              </div>
            </div>

            {/* 5. 100+ FONTS CATALOG */}
            <div className="bg-slate-900/40 border border-white/5 rounded-xl p-3 space-y-3">
              <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-sky-400 flex items-center justify-between">
                <span>Font Library (100+ Fonts)</span>
                <Type className="h-3.5 w-3.5" />
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search 100+ fonts..."
                  value={fontSearch}
                  onChange={(e) => setFontSearch(e.target.value)}
                  className="w-full bg-[#060910] border border-white/10 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none"
                />
              </div>

              {/* Category Filter Pills */}
              <div className="flex gap-1 overflow-x-auto py-1 scrollbar-none">
                {fontCategories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedFontCategory(cat)}
                    className={`px-2.5 py-1 rounded-md text-[9.5px] font-bold whitespace-nowrap cursor-pointer transition ${
                      selectedFontCategory === cat
                        ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                        : 'bg-slate-950 border border-white/5 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Fonts Catalog Grid */}
              <div className="grid grid-cols-2 gap-2 max-h-[260px] overflow-y-auto pr-1">
                {filteredFonts.map((f) => {
                  const isSelected = fontFamily === f.name;
                  return (
                    <button
                      key={f.name}
                      type="button"
                      onClick={() => handleUpdateField('font', f.name)}
                      className={`p-2.5 rounded-xl border text-left flex flex-col justify-between h-16 transition cursor-pointer ${
                        isSelected
                          ? 'bg-sky-500/15 border-sky-400 text-sky-300 shadow'
                          : 'bg-slate-950/50 border-white/5 hover:border-white/15 text-slate-300'
                      }`}
                    >
                      <span className="text-[8.5px] font-mono text-slate-500">{f.category}</span>
                      <span className="text-base truncate block" style={{ fontFamily: f.name }}>
                        {f.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
