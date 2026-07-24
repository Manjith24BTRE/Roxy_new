import React, { useState } from 'react';
import { Sliders, RefreshCw, Key, Plus, Trash2, Lock, Unlock } from 'lucide-react';

export interface Keyframe {
  id: string;
  time: number;
  properties: {
    scale?: number;
    rotation?: number;
    opacity?: number;
  };
}

interface PropertiesPanelProps {
  posX: number;
  onPosXChange: (x: number) => void;
  posY: number;
  onPosYChange: (y: number) => void;
  scale: number;
  onScaleChange: (s: number) => void;
  rotation: number;
  onRotationChange: (r: number) => void;
  opacity: number;
  onOpacityChange: (o: number) => void;
  blendMode: string;
  onBlendModeChange: (mode: string) => void;
  crop: { top: number; bottom: number; left: number; right: number };
  onCropChange: (updates: Partial<{ top: number; bottom: number; left: number; right: number }>) => void;
  speed: number;
  onSpeedChange: (speed: number) => void;
  reverse: boolean;
  onReverseChange: (rev: boolean) => void;
  borderRadius: number;
  onBorderRadiusChange: (radius: number) => void;
  shadowBlur: number;
  onShadowBlurChange: (blur: number) => void;
  shadowColor: string;
  onShadowColorChange: (color: string) => void;
  mask: string;
  onMaskChange: (mask: string) => void;
  keyframes: Keyframe[];
  onAddKeyframe: (time: number, props: any) => void;
  onRemoveKeyframe: (id: string) => void;
  currentTime: number;
}

export function PropertiesPanel({
  posX, onPosXChange, posY, onPosYChange,
  scale, onScaleChange, rotation, onRotationChange,
  opacity, onOpacityChange, blendMode, onBlendModeChange,
  crop, onCropChange, speed, onSpeedChange, reverse, onReverseChange,
  borderRadius, onBorderRadiusChange, shadowBlur, onShadowBlurChange,
  shadowColor, onShadowColorChange, mask, onMaskChange,
  keyframes, onAddKeyframe, onRemoveKeyframe, currentTime
}: PropertiesPanelProps) {
  const [activeTab, setActiveTab] = useState<'transform' | 'video' | 'keyframes'>('transform');

  const blendModes = [
    { id: 'normal', name: 'Normal / Default' },
    { id: 'multiply', name: 'Multiply (Darken)' },
    { id: 'screen', name: 'Screen (Lighten)' },
    { id: 'overlay', name: 'Overlay Blend' },
    { id: 'dodge', name: 'Color Dodge' }
  ];

  const masks = [
    { id: 'none', name: 'No Mask' },
    { id: 'circle', name: 'Circle Vignette' },
    { id: 'rect', name: 'Rectangle Frame' },
    { id: 'linear', name: 'Linear Split' }
  ];

  const handleCreateKeyframe = () => {
    onAddKeyframe(currentTime, {
      scale,
      rotation,
      opacity
    });
  };

  const handleResetTransform = () => {
    onPosXChange(0);
    onPosYChange(0);
    onScaleChange(1);
    onRotationChange(0);
    onOpacityChange(100);
  };

  return (
    <div className="flex flex-col h-full bg-[#090d16] text-slate-100 select-none border-l border-white/10 w-[300px] flex-shrink-0">
      <div className="p-2 border-b border-white/10 bg-[#0c101d] flex-shrink-0">
        <div className="flex border border-white/10 rounded-lg bg-slate-950/60 p-0.5">
          {(['transform', 'video', 'keyframes'] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-1.5 text-[9px] font-bold rounded capitalize cursor-pointer transition ${
                activeTab === tab
                  ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 p-4 overflow-y-auto space-y-5">
        
        {/* TRANSFORM TAB */}
        {activeTab === 'transform' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-slate-400">
              <span>Basic Transforms</span>
              <button
                type="button"
                onClick={handleResetTransform}
                className="text-[9px] text-sky-400 hover:underline cursor-pointer font-bold flex items-center gap-0.5"
              >
                <RefreshCw className="h-2.5 w-2.5" /> Reset
              </button>
            </div>

            <div className="space-y-3 bg-slate-950/20 p-3.5 border border-white/5 rounded-xl">
              <div className="grid grid-cols-2 gap-2.5">
                <div className="space-y-1">
                  <div className="flex justify-between text-[9px] text-slate-500 font-mono">
                    <span>Position X</span>
                    <span>{posX}px</span>
                  </div>
                  <input
                    type="range"
                    min="-200"
                    max="200"
                    value={posX}
                    onChange={(e) => onPosXChange(Number(e.target.value))}
                    className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                  />
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-[9px] text-slate-500 font-mono">
                    <span>Position Y</span>
                    <span>{posY}px</span>
                  </div>
                  <input
                    type="range"
                    min="-200"
                    max="200"
                    value={posY}
                    onChange={(e) => onPosYChange(Number(e.target.value))}
                    className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-[10px] text-slate-300">
                  <span>Scale Bounds</span>
                  <span className="font-mono text-sky-400">{scale.toFixed(2)}x</span>
                </div>
                <input
                  type="range"
                  min="0.2"
                  max="2.5"
                  step="0.05"
                  value={scale}
                  onChange={(e) => onScaleChange(Number(e.target.value))}
                  className="w-full accent-sky-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-[10px] text-slate-300">
                  <span>Angle Rotation</span>
                  <span className="font-mono text-sky-400">{rotation}°</span>
                </div>
                <input
                  type="range"
                  min="-180"
                  max="180"
                  value={rotation}
                  onChange={(e) => onRotationChange(Number(e.target.value))}
                  className="w-full accent-sky-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-[10px] text-slate-300">
                  <span>Opacity</span>
                  <span className="font-mono text-sky-400">{opacity}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={opacity}
                  onChange={(e) => onOpacityChange(Number(e.target.value))}
                  className="w-full accent-sky-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                />
              </div>
            </div>

            <div className="space-y-1.5 pt-2 border-t border-white/5">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Blending Mode</span>
              <select
                value={blendMode}
                onChange={(e) => onBlendModeChange(e.target.value)}
                className="w-full rounded-md bg-slate-900 border border-white/10 px-2 py-1.5 text-xs text-slate-200 focus:outline-none cursor-pointer font-medium"
              >
                {blendModes.map((m) => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* VIDEO TAB */}
        {activeTab === 'video' && (
          <div className="space-y-4">
            <div className="space-y-3">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Time & Speed</span>
              <div className="bg-slate-950/20 p-3.5 border border-white/5 rounded-xl space-y-3">
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[10px]">
                    <span className="text-slate-300">Playback Speed</span>
                    <span className="font-mono text-sky-400 font-bold">{speed}x</span>
                  </div>
                  <div className="flex gap-1.5">
                    {[0.25, 0.5, 1, 2, 4].map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => onSpeedChange(s)}
                        className={`flex-1 py-1 rounded text-[10px] font-bold transition cursor-pointer border ${
                          speed === s ? 'bg-sky-500/10 border-sky-400 text-sky-400' : 'bg-slate-900 border-white/5 hover:bg-slate-800'
                        }`}
                      >
                        {s}x
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-white/5">
                  <span className="text-xs text-slate-300">Reverse Playback</span>
                  <button
                    type="button"
                    onClick={() => onReverseChange(!reverse)}
                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition cursor-pointer ${
                      reverse ? 'bg-sky-500' : 'bg-slate-800'
                    }`}
                  >
                    <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition ${
                      reverse ? 'translate-x-4.5' : 'translate-x-1'
                    }`} />
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-3.5 pt-2 border-t border-white/5">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Crop Boundaries</span>
              <div className="bg-slate-950/20 p-3 border border-white/5 rounded-xl grid grid-cols-2 gap-3">
                {([['top', 'Crop Top'], ['bottom', 'Crop Bottom'], ['left', 'Crop Left'], ['right', 'Crop Right']] as const).map(([k, label]) => (
                  <div key={k} className="space-y-1">
                    <div className="flex justify-between text-[9px] text-slate-500 font-mono">
                      <span>{label}</span>
                      <span>{crop[k]}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="80"
                      value={crop[k]}
                      onChange={(e) => onCropChange({ [k]: Number(e.target.value) })}
                      className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3.5 pt-2 border-t border-white/5">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Style Border & Shadow</span>
              <div className="bg-slate-950/20 p-3.5 border border-white/5 rounded-xl space-y-3">
                <div className="space-y-1">
                  <div className="flex justify-between text-[9px] text-slate-500">
                    <span>Border Radius</span>
                    <span>{borderRadius}px</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="50"
                    value={borderRadius}
                    onChange={(e) => onBorderRadiusChange(Number(e.target.value))}
                    className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-[9px] text-slate-500">
                    <span>Shadow Glow Blur</span>
                    <span>{shadowBlur}px</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={shadowColor}
                      onChange={(e) => onShadowColorChange(e.target.value)}
                      className="w-5 h-5 rounded cursor-pointer border border-white/10 bg-transparent flex-shrink-0"
                    />
                    <input
                      type="range"
                      min="0"
                      max="30"
                      value={shadowBlur}
                      onChange={(e) => onShadowBlurChange(Number(e.target.value))}
                      className="flex-1 accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-1.5 pt-2 border-t border-white/5">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Crop Masks</span>
              <select
                value={mask}
                onChange={(e) => onMaskChange(e.target.value)}
                className="w-full rounded-md bg-slate-900 border border-white/10 px-2 py-1.5 text-xs text-slate-200 focus:outline-none cursor-pointer font-medium"
              >
                {masks.map((m) => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* KEYFRAMES TAB */}
        {activeTab === 'keyframes' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-slate-400">
              <span>Timeline Keyframes</span>
              <button
                type="button"
                onClick={handleCreateKeyframe}
                className="text-[9px] bg-sky-500/10 border border-sky-500/30 hover:bg-sky-500/20 text-sky-400 px-2 py-1 rounded cursor-pointer font-bold flex items-center gap-1 transition"
              >
                <Plus className="h-3 w-3" /> Insert Keyframe
              </button>
            </div>

            {keyframes.length === 0 ? (
              <div className="rounded-xl border border-dashed border-white/10 p-5 text-center bg-slate-900/20 space-y-2">
                <Key className="h-5 w-5 text-slate-500 mx-auto" />
                <h4 className="text-[10px] font-bold text-slate-400">No Keyframes Set</h4>
                <p className="text-[8px] text-slate-500 max-w-[160px] mx-auto leading-normal">
                  Add keyframe points at current time playhead to record transform coordinates.
                </p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                {keyframes.map((kf) => (
                  <div
                    key={kf.id}
                    className={`bg-slate-900/40 border border-white/5 rounded-xl p-2.5 flex items-center justify-between transition ${
                      Math.abs(currentTime - kf.time) < 0.2 ? 'border-sky-500/30 bg-sky-500/5' : ''
                    }`}
                  >
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[10px] font-bold font-mono text-slate-300">
                        Cue Point: {kf.time.toFixed(1)}s
                      </span>
                      <div className="flex flex-wrap gap-1 mt-0.5 text-[8px] text-slate-500">
                        {kf.properties.scale && <span>Scale: {kf.properties.scale.toFixed(1)}x</span>}
                        {kf.properties.rotation && <span>Rot: {kf.properties.rotation}°</span>}
                        {kf.properties.opacity && <span>Op: {kf.properties.opacity}%</span>}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => onRemoveKeyframe(kf.id)}
                      className="p-1 rounded hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
export default PropertiesPanel;
