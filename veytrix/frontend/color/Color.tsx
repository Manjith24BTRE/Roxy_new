import React, { useState } from 'react';
import { RefreshCw, Sliders } from 'lucide-react';

interface ColorProps {
  colorSettings: Record<string, number>;
  onColorSettingChange: (setting: string, val: number) => void;
  onResetColors: () => void;
}

export function Color({ colorSettings, onColorSettingChange, onResetColors }: ColorProps) {
  const [activeCurveTab, setActiveCurveTab] = useState<'rgb' | 'red' | 'green' | 'blue'>('rgb');
  
  // Bezier control points for the curves editor
  const [curvePoints, setCurvePoints] = useState<Record<string, { x1: number; y1: number; x2: number; y2: number }>>({
    rgb: { x1: 25, y1: 75, x2: 75, y2: 25 },
    red: { x1: 20, y1: 80, x2: 80, y2: 20 },
    green: { x1: 30, y1: 70, x2: 70, y2: 30 },
    blue: { x1: 40, y1: 60, x2: 60, y2: 40 }
  });

  const sliders = [
    { id: 'brightness', name: 'Brightness', min: -50, max: 50, unit: '%' },
    { id: 'contrast', name: 'Contrast', min: -50, max: 50, unit: '%' },
    { id: 'saturation', name: 'Saturation', min: -50, max: 50, unit: '%' },
    { id: 'exposure', name: 'Exposure', min: -2, max: 2, step: 0.1, unit: ' EV' },
    { id: 'temperature', name: 'Temperature', min: -50, max: 50, unit: ' K' },
    { id: 'tint', name: 'Tint', min: -50, max: 50, unit: '%' },
    { id: 'vibrance', name: 'Vibrance', min: -50, max: 50, unit: '%' },
    { id: 'highlights', name: 'Highlights', min: -50, max: 50, unit: '%' },
    { id: 'shadows', name: 'Shadows', min: -50, max: 50, unit: '%' }
  ];

  const handleCurveDrag = (point: 'p1' | 'p2', e: React.MouseEvent<SVGSVGElement>) => {
    if (e.buttons !== 1) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, Math.round(((e.clientX - rect.left) / rect.width) * 100)));
    const y = Math.max(0, Math.min(100, Math.round(((e.clientY - rect.top) / rect.height) * 100)));

    const activeCurve = curvePoints[activeCurveTab];
    if (point === 'p1') {
      setCurvePoints({
        ...curvePoints,
        [activeCurveTab]: { ...activeCurve, x1: x, y1: y }
      });
    } else {
      setCurvePoints({
        ...curvePoints,
        [activeCurveTab]: { ...activeCurve, x2: x, y2: y }
      });
    }
  };

  const handleResetCurve = () => {
    setCurvePoints({
      ...curvePoints,
      [activeCurveTab]: { x1: 25, y1: 75, x2: 75, y2: 25 }
    });
  };

  const activePoints = curvePoints[activeCurveTab];

  return (
    <div className="flex flex-col h-full bg-[#090d16] text-slate-100 select-none">
      {/* Header */}
      <div className="p-4 border-b border-white/10 bg-[#0c101d] flex-shrink-0 flex items-center justify-between">
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300">Color Grading</h3>
          <p className="text-[10px] text-slate-500 mt-1">Calibrate color wheels, balance values, and drag curve points.</p>
        </div>
        <button
          type="button"
          onClick={() => {
            onResetColors();
            setCurvePoints({
              rgb: { x1: 25, y1: 75, x2: 75, y2: 25 },
              red: { x1: 20, y1: 80, x2: 80, y2: 20 },
              green: { x1: 30, y1: 70, x2: 70, y2: 30 },
              blue: { x1: 40, y1: 60, x2: 60, y2: 40 }
            });
          }}
          className="p-1.5 rounded bg-slate-900 border border-white/10 hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer transition flex items-center gap-1 text-[9px] font-bold"
          title="Reset Color Adjustments"
        >
          <RefreshCw className="h-3 w-3" />
          <span>Reset</span>
        </button>
      </div>

      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {/* SLIDERS BLOCK */}
        <div className="space-y-3">
          <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Sliders Adjustment</div>
          
          <div className="grid grid-cols-1 gap-2.5 bg-slate-950/20 p-3.5 border border-white/5 rounded-xl">
            {sliders.map((s) => {
              const val = colorSettings[s.id] ?? 0;
              return (
                <div key={s.id} className="space-y-1.5">
                  <div className="flex justify-between text-[10px] font-medium">
                    <span className="text-slate-300">{s.name}</span>
                    <span className="font-mono text-sky-400">
                      {val > 0 ? `+${val}` : val}
                      {s.unit}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={s.min}
                    max={s.max}
                    step={s.step ?? 1}
                    value={val}
                    onChange={(e) => onColorSettingChange(s.id, Number(e.target.value))}
                    className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* CURVES BLOCK */}
        <div className="space-y-3 pt-3 border-t border-white/5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Bezier Curves Editor</span>
            <button
              type="button"
              onClick={handleResetCurve}
              className="text-[9px] text-sky-400 hover:underline cursor-pointer font-bold"
            >
              Reset Curve
            </button>
          </div>

          {/* Curves Channel Tabs */}
          <div className="flex border border-white/10 rounded-lg bg-slate-950/60 p-0.5">
            {(['rgb', 'red', 'green', 'blue'] as const).map((chan) => (
              <button
                key={chan}
                type="button"
                onClick={() => setActiveCurveTab(chan)}
                className={`flex-1 py-1 text-[9px] font-bold rounded capitalize cursor-pointer transition ${
                  activeCurveTab === chan
                    ? chan === 'red' ? 'bg-red-500/20 text-red-400 border border-red-500/20 shadow-sm' :
                      chan === 'green' ? 'bg-green-500/20 text-green-400 border border-green-500/20 shadow-sm' :
                      chan === 'blue' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/20 shadow-sm' :
                      'bg-sky-500/10 text-sky-400 border border-sky-500/20 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {chan}
              </button>
            ))}
          </div>

          {/* Curve SVG Area */}
          <div className="relative aspect-square w-full rounded-xl border border-white/10 bg-[#05070c] p-2 overflow-hidden">
            {/* Grid layout */}
            <svg
              className="w-full h-full cursor-crosshair overflow-visible"
              viewBox="0 0 100 100"
              onMouseMove={(e) => {
                if (e.buttons === 1) {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const mx = ((e.clientX - rect.left) / rect.width) * 100;
                  const d1 = Math.hypot(mx - activePoints.x1);
                  const d2 = Math.hypot(mx - activePoints.x2);
                  handleCurveDrag(d1 < d2 ? 'p1' : 'p2', e);
                }
              }}
            >
              {/* Guides */}
              <line x1="25" y1="0" x2="25" y2="100" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
              <line x1="50" y1="0" x2="50" y2="100" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
              <line x1="75" y1="0" x2="75" y2="100" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
              <line x1="0" y1="25" x2="100" y2="25" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
              <line x1="0" y1="50" x2="100" y2="50" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
              <line x1="0" y1="75" x2="100" y2="75" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
              
              {/* Diagonal base line */}
              <line x1="0" y1="100" x2="100" y2="0" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" strokeDasharray="3" />

              {/* Curve Line */}
              <path
                d={`M 0 100 C ${activePoints.x1} ${activePoints.y1}, ${activePoints.x2} ${activePoints.y2}, 100 0`}
                fill="none"
                stroke={
                  activeCurveTab === 'red' ? '#ef4444' :
                  activeCurveTab === 'green' ? '#22c55e' :
                  activeCurveTab === 'blue' ? '#3b82f6' :
                  '#38bdf8'
                }
                strokeWidth="3.5"
                className="shadow-glow"
              />

              {/* Bezier control lines */}
              <line x1="0" y1="100" x2={activePoints.x1} y2={activePoints.y1} stroke="rgba(255,255,255,0.25)" strokeWidth="1" />
              <line x1="100" y1="0" x2={activePoints.x2} y2={activePoints.y2} stroke="rgba(255,255,255,0.25)" strokeWidth="1" />

              {/* Control Handles */}
              <circle
                cx={activePoints.x1}
                cy={activePoints.y1}
                r="4.5"
                fill={
                  activeCurveTab === 'red' ? '#fca5a5' :
                  activeCurveTab === 'green' ? '#86efac' :
                  activeCurveTab === 'blue' ? '#93c5fd' :
                  '#bae6fd'
                }
                stroke="white"
                strokeWidth="1.5"
                className="cursor-pointer"
              />
              <circle
                cx={activePoints.x2}
                cy={activePoints.y2}
                r="4.5"
                fill={
                  activeCurveTab === 'red' ? '#fca5a5' :
                  activeCurveTab === 'green' ? '#86efac' :
                  activeCurveTab === 'blue' ? '#93c5fd' :
                  '#bae6fd'
                }
                stroke="white"
                strokeWidth="1.5"
                className="cursor-pointer"
              />
            </svg>
          </div>
        </div>

      </div>
    </div>
  );
}
export default Color;
