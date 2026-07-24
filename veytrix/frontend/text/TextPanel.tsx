import React, { useState } from 'react';
import { Plus, Type, AlignLeft, AlignCenter, AlignRight, Bold, Italic, Underline, Sparkles, Trash2, Edit } from 'lucide-react';

export interface TextOverlay {
  id: string;
  text: string;
  font: string;
  size: number;
  color: string;
  align: 'left' | 'center' | 'right';
  bold: boolean;
  italic: boolean;
  underline: boolean;
  stroke: boolean;
  strokeColor: string;
  strokeWidth: number;
  shadow: boolean;
  shadowColor: string;
  shadowBlur: number;
  animation: string;
  bgOpacity?: number;
  bgColor?: string;
  opacity?: number;
  rotation?: number;
  startTime?: number;
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

export function TextPanel({
  overlays,
  onAddOverlay,
  onRemoveOverlay,
  onUpdateOverlay,
  activeOverlayId,
  setActiveOverlayId
}: TextPanelProps) {
  const [inputText, setInputText] = useState('Add Title Text');
  const [fontFamily, setFontFamily] = useState('Inter');
  const [fontSize, setFontSize] = useState(48);
  const [color, setColor] = useState('#ffffff');
  const [alignment, setAlignment] = useState<'left' | 'center' | 'right'>('center');
  const [bold, setBold] = useState(false);
  const [italic, setItalic] = useState(false);
  const [underline, setUnderline] = useState(false);
  const [stroke, setStroke] = useState(false);
  const [strokeColor, setStrokeColor] = useState('#000000');
  const [strokeWidth, setStrokeWidth] = useState(2);
  const [shadow, setShadow] = useState(true);
  const [shadowColor, setShadowColor] = useState('rgba(0,0,0,0.5)');
  const [shadowBlur, setShadowBlur] = useState(4);
  const [animation, setAnimation] = useState('none');

  const fonts = ['Inter', 'Roboto', 'Playfair Display', 'Outfit', 'Montserrat', 'Courier New', 'Bebas Neue'];
  
  const animations = [
    { id: 'none', name: 'No Animation' },
    { id: 'fade', name: 'Fade In / Out' },
    { id: 'typewriter', name: 'Typewriter Style' },
    { id: 'slide', name: 'Slide Push' },
    { id: 'zoom', name: 'Zoom Burst' }
  ];

  const presets = [
    {
      name: 'Cyber Glow',
      color: '#f43f5e',
      font: 'Outfit',
      bold: true,
      stroke: true,
      strokeColor: '#000000',
      strokeWidth: 4,
      shadow: true,
      shadowColor: '#ec4899',
      shadowBlur: 10
    },
    {
      name: 'Subtitle Clean',
      color: '#ffffff',
      font: 'Inter',
      bold: false,
      stroke: true,
      strokeColor: '#000000',
      strokeWidth: 2,
      shadow: true,
      shadowColor: 'rgba(0,0,0,0.7)',
      shadowBlur: 3
    },
    {
      name: 'Retro VHS',
      color: '#06b6d4',
      font: 'Courier New',
      bold: true,
      stroke: true,
      strokeColor: '#ff007f',
      strokeWidth: 3,
      shadow: true,
      shadowColor: 'rgba(0,0,0,0.4)',
      shadowBlur: 5
    },
    {
      name: 'Bebas Bold',
      color: '#facc15',
      font: 'Bebas Neue',
      bold: true,
      stroke: false,
      strokeColor: '#000000',
      strokeWidth: 0,
      shadow: true,
      shadowColor: 'rgba(0,0,0,0.6)',
      shadowBlur: 4
    }
  ];

  const handleCreateOverlay = () => {
    if (!inputText.trim()) return;
    onAddOverlay({
      text: inputText,
      font: fontFamily,
      size: fontSize,
      color,
      align: alignment,
      bold,
      italic,
      underline,
      stroke,
      strokeColor,
      strokeWidth,
      shadow,
      shadowColor,
      shadowBlur,
      animation
    });
  };

  const applyPreset = (preset: typeof presets[0]) => {
    setColor(preset.color);
    setFontFamily(preset.font);
    setBold(preset.bold);
    setStroke(preset.stroke);
    setStrokeColor(preset.strokeColor);
    setStrokeWidth(preset.strokeWidth);
    setShadow(preset.shadow);
    setShadowColor(preset.shadowColor);
    setShadowBlur(preset.shadowBlur);

    // If there is an active overlay selected, apply it immediately
    if (activeOverlayId) {
      onUpdateOverlay(activeOverlayId, {
        color: preset.color,
        font: preset.font,
        bold: preset.bold,
        stroke: preset.stroke,
        strokeColor: preset.strokeColor,
        strokeWidth: preset.strokeWidth,
        shadow: preset.shadow,
        shadowColor: preset.shadowColor,
        shadowBlur: preset.shadowBlur
      });
    }
  };

  const activeOverlay = overlays.find((o) => o.id === activeOverlayId);

  // Sync state if active overlay changes
  React.useEffect(() => {
    if (activeOverlay) {
      setInputText(activeOverlay.text);
      setFontFamily(activeOverlay.font);
      setFontSize(activeOverlay.size);
      setColor(activeOverlay.color);
      setAlignment(activeOverlay.align);
      setBold(activeOverlay.bold);
      setItalic(activeOverlay.italic);
      setUnderline(activeOverlay.underline);
      setStroke(activeOverlay.stroke);
      setStrokeColor(activeOverlay.strokeColor);
      setStrokeWidth(activeOverlay.strokeWidth);
      setShadow(activeOverlay.shadow);
      setShadowColor(activeOverlay.shadowColor);
      setShadowBlur(activeOverlay.shadowBlur);
      setAnimation(activeOverlay.animation);
    }
  }, [activeOverlayId, activeOverlay]);

  const handleUpdateField = (field: keyof TextOverlay, value: any) => {
    if (activeOverlayId) {
      onUpdateOverlay(activeOverlayId, { [field]: value });
    }
    // Update local state too
    switch (field) {
      case 'text': setInputText(value); break;
      case 'font': setFontFamily(value); break;
      case 'size': setFontSize(value); break;
      case 'color': setColor(value); break;
      case 'align': setAlignment(value); break;
      case 'bold': setBold(value); break;
      case 'italic': setItalic(value); break;
      case 'underline': setUnderline(value); break;
      case 'stroke': setStroke(value); break;
      case 'strokeColor': setStrokeColor(value); break;
      case 'strokeWidth': setStrokeWidth(value); break;
      case 'shadow': setShadow(value); break;
      case 'shadowColor': setShadowColor(value); break;
      case 'shadowBlur': setShadowBlur(value); break;
      case 'animation': setAnimation(value); break;
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#090d16] text-slate-100 select-none">
      <div className="p-4 border-b border-white/10 bg-[#0c101d] flex-shrink-0">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300">Text Tools</h3>
        <p className="text-[10px] text-slate-500 mt-1">Add stylized text titles and animated headers to the project.</p>
      </div>

      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {/* Input box */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Add Text</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => handleUpdateField('text', e.target.value)}
              placeholder="Type your overlay text..."
              className="flex-1 rounded-lg bg-slate-900 border border-white/10 px-3 py-1.5 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-sky-500/50"
            />
            {!activeOverlayId && (
              <button
                type="button"
                onClick={handleCreateOverlay}
                className="bg-sky-500 hover:bg-sky-600 text-slate-950 font-semibold p-2 rounded-lg cursor-pointer transition flex items-center justify-center"
                title="Insert Text Overlay"
              >
                <Plus className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Existing Overlays List */}
        {overlays.length > 0 && (
          <div className="space-y-1.5">
            <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Text Overlays ({overlays.length})</label>
            <div className="space-y-1 max-h-[120px] overflow-y-auto">
              {overlays.map((item) => {
                const isActive = item.id === activeOverlayId;
                return (
                  <div
                    key={item.id}
                    onClick={() => setActiveOverlayId(isActive ? null : item.id)}
                    className={`flex items-center justify-between p-2 rounded-lg border text-xs cursor-pointer transition ${
                      isActive
                        ? 'bg-sky-500/10 border-sky-400/50 text-white'
                        : 'bg-slate-900/30 border-white/5 hover:bg-slate-900/60 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <Type className={`h-3.5 w-3.5 flex-shrink-0 ${isActive ? 'text-sky-400' : 'text-slate-500'}`} />
                      <span className="font-mono text-[10px] truncate max-w-[150px]">{item.text}</span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveOverlayId(item.id);
                        }}
                        className={`h-5 w-5 rounded flex items-center justify-center transition cursor-pointer hover:bg-slate-800 ${isActive ? 'text-sky-400' : 'text-slate-400'}`}
                      >
                        <Edit className="h-3 w-3" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onRemoveOverlay(item.id);
                          if (activeOverlayId === item.id) {
                            setActiveOverlayId(null);
                          }
                        }}
                        className="h-5 w-5 rounded flex items-center justify-center hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition cursor-pointer"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Customizer settings */}
        <div className="border-t border-white/5 pt-4 space-y-3.5">
          <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Typography</div>

          {/* Font & Size */}
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <span className="text-[9px] text-slate-500">Font Family</span>
              <select
                value={fontFamily}
                onChange={(e) => handleUpdateField('font', e.target.value)}
                className="w-full rounded-md bg-slate-900 border border-white/10 px-2 py-1 text-xs text-slate-200 focus:outline-none"
              >
                {fonts.map((f) => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <span className="text-[9px] text-slate-500">Size ({fontSize}px)</span>
              <input
                type="number"
                min="10"
                max="120"
                value={fontSize}
                onChange={(e) => handleUpdateField('size', Math.max(10, Number(e.target.value)))}
                className="w-full rounded-md bg-slate-900 border border-white/10 px-2 py-1 text-xs text-slate-200 focus:outline-none text-center"
              />
            </div>
          </div>

          {/* Color Pick & Alignment & Formatting */}
          <div className="flex items-center justify-between gap-2 bg-slate-950/20 p-2 border border-white/5 rounded-xl">
            {/* Color */}
            <div className="flex items-center gap-1.5">
              <input
                type="color"
                value={color}
                onChange={(e) => handleUpdateField('color', e.target.value)}
                className="w-6 h-6 rounded cursor-pointer border border-white/10 bg-transparent flex-shrink-0"
              />
              <span className="text-[10px] font-mono text-slate-400">{color}</span>
            </div>

            {/* Alignments */}
            <div className="flex rounded-lg bg-slate-900 border border-white/10 p-0.5">
              {(['left', 'center', 'right'] as const).map((align) => {
                const Icon = align === 'left' ? AlignLeft : align === 'center' ? AlignCenter : AlignRight;
                return (
                  <button
                    key={align}
                    type="button"
                    onClick={() => handleUpdateField('align', align)}
                    className={`h-6 w-6 rounded flex items-center justify-center cursor-pointer transition ${
                      alignment === align ? 'bg-sky-500/20 text-sky-400' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                  </button>
                );
              })}
            </div>

            {/* Format styles */}
            <div className="flex rounded-lg bg-slate-900 border border-white/10 p-0.5">
              <button
                type="button"
                onClick={() => handleUpdateField('bold', !bold)}
                className={`h-6 w-6 rounded flex items-center justify-center cursor-pointer transition ${
                  bold ? 'bg-sky-500/20 text-sky-400 font-bold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Bold className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => handleUpdateField('italic', !italic)}
                className={`h-6 w-6 rounded flex items-center justify-center cursor-pointer transition ${
                  italic ? 'bg-sky-500/20 text-sky-400 font-bold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Italic className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => handleUpdateField('underline', !underline)}
                className={`h-6 w-6 rounded flex items-center justify-center cursor-pointer transition ${
                  underline ? 'bg-sky-500/20 text-sky-400 font-bold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Underline className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Stroke & Shadow */}
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-slate-900/30 border border-white/5 rounded-xl p-2.5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold text-slate-300">Stroke</span>
                <input
                  type="checkbox"
                  checked={stroke}
                  onChange={(e) => handleUpdateField('stroke', e.target.checked)}
                  className="rounded border-white/15 bg-slate-950 text-sky-400 focus:ring-0"
                />
              </div>
              {stroke && (
                <div className="space-y-1.5">
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
                      max="10"
                      value={strokeWidth}
                      onChange={(e) => handleUpdateField('strokeWidth', Math.max(1, Number(e.target.value)))}
                      className="w-10 rounded bg-slate-900 border border-white/5 text-[10px] text-center"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="bg-slate-900/30 border border-white/5 rounded-xl p-2.5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold text-slate-300">Drop Shadow</span>
                <input
                  type="checkbox"
                  checked={shadow}
                  onChange={(e) => handleUpdateField('shadow', e.target.checked)}
                  className="rounded border-white/15 bg-slate-950 text-sky-400 focus:ring-0"
                />
              </div>
              {shadow && (
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[8px] text-slate-400">
                    <span>Blur Radius</span>
                    <span>{shadowBlur}px</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="20"
                    value={shadowBlur}
                    onChange={(e) => handleUpdateField('shadowBlur', Number(e.target.value))}
                    className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Text Animation */}
          <div className="space-y-1">
            <span className="text-[9px] text-slate-500">Entrance Animation</span>
            <select
              value={animation}
              onChange={(e) => handleUpdateField('animation', e.target.value)}
              className="w-full rounded-md bg-slate-900 border border-white/10 px-2 py-1.5 text-xs text-slate-200 focus:outline-none"
            >
              {animations.map((a) => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
          </div>

          {/* Preset templates */}
          <div className="space-y-2 pt-2 border-t border-white/5">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1">
              <Sparkles className="h-3 w-3 text-amber-400" /> Designer Style Presets
            </span>
            <div className="grid grid-cols-2 gap-1.5">
              {presets.map((p) => (
                <button
                  key={p.name}
                  type="button"
                  onClick={() => applyPreset(p)}
                  className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-white/5 hover:border-white/10 transition cursor-pointer text-left flex flex-col justify-between h-14"
                >
                  <span className="text-[9px] text-slate-500 font-mono">{p.name}</span>
                  <span
                    className="text-xs font-semibold self-center"
                    style={{
                      color: p.color,
                      fontFamily: p.font,
                      textShadow: p.shadow ? `0 0 ${p.shadowBlur}px ${p.shadowColor}` : 'none',
                      WebkitTextStroke: p.stroke ? `${p.strokeWidth / 2}px ${p.strokeColor}` : 'none'
                    }}
                  >
                    Aaa
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
