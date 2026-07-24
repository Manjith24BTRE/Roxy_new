import React, { useState } from 'react';
import { Volume2, VolumeX, Sparkles, Play, Check } from 'lucide-react';

interface AudioProps {
  volume: number;
  onVolumeChange: (vol: number) => void;
}

export function Audio({ volume, onVolumeChange }: AudioProps) {
  const [eqPreset, setEqPreset] = useState('flat');
  const [noiseReduction, setNoiseReduction] = useState(false);
  const [noiseReductionStrength, setNoiseReductionStrength] = useState(50);
  const [vocalIsolation, setVocalIsolation] = useState(false);
  const [vocalIsolationStrength, setVocalIsolationStrength] = useState(80);
  const [voiceChanger, setVoiceChanger] = useState('none');
  const [playingSfxId, setPlayingSfxId] = useState<string | null>(null);
  const [addedSfxIds, setAddedSfxIds] = useState<string[]>([]);

  const eqPresets = [
    { id: 'flat', name: 'Flat / Off' },
    { id: 'pop', name: 'Pop & Crisp' },
    { id: 'rock', name: 'Rock / Heavy' },
    { id: 'bass', name: 'Bass Booster' },
    { id: 'vocal', name: 'Voice Enhance' }
  ];

  const voiceChangers = [
    { id: 'none', name: 'No Effect', icon: '👤' },
    { id: 'robot', name: 'AI Robot', icon: '🤖' },
    { id: 'chipmunk', name: 'Chipmunk', icon: '🐿️' },
    { id: 'deep', name: 'Deep Bass', icon: '🗣️' },
    { id: 'radio', name: 'Old Radio', icon: '📻' },
    { id: 'echo', name: 'Cave Echo', icon: '⛰️' }
  ];

  const mockSfx = [
    { id: 'whoosh', name: 'Cinematic Whoosh', duration: '0.8s', category: 'Transition', icon: '💨' },
    { id: 'ding', name: 'Clean Ding / Bell', duration: '0.5s', category: 'Accent', icon: '🔔' },
    { id: 'clap', name: 'Crowd Applause', duration: '3.2s', category: 'Crowd', icon: '👏' },
    { id: 'laser', name: 'Sci-Fi Laser', duration: '0.6s', category: 'FX', icon: '🔫' },
    { id: 'explode', name: 'Impact Explosion', duration: '2.5s', category: 'Impact', icon: '💥' },
    { id: 'beep', name: 'Sensor Beep', duration: '0.4s', category: 'Alert', icon: '📟' },
    { id: 'gameover', name: 'Retro Game Over', duration: '1.8s', category: 'Game', icon: '👾' },
    { id: 'glitch', name: 'Glitch Swish', duration: '0.7s', category: 'Transition', icon: '⚡' },
    { id: 'uplift', name: 'Synth Riser', duration: '4.0s', category: 'Riser', icon: '📈' },
    { id: 'tada', name: 'Victory Ta-Da', duration: '1.2s', category: 'Accent', icon: '🎉' }
  ];

  const handlePlaySfx = (id: string) => {
    setPlayingSfxId(id);
    setTimeout(() => {
      setPlayingSfxId(null);
    }, 1000);
  };

  const handleAddSfx = (id: string) => {
    if (!addedSfxIds.includes(id)) {
      setAddedSfxIds([...addedSfxIds, id]);
    } else {
      setAddedSfxIds(addedSfxIds.filter((item) => item !== id));
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#090d16] text-slate-100 select-none">
      <div className="p-4 border-b border-white/10 bg-[#0c101d] flex-shrink-0">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300">Audio Adjustment</h3>
        <p className="text-[10px] text-slate-500 mt-1">Configure audio parameters, EQ settings, and add sound effects.</p>
      </div>

      <div className="flex-1 p-4 overflow-y-auto space-y-5">
        {/* SECTION 1: Volume & Gain */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
            <span>Volume & Gain</span>
            <span className="font-mono text-sky-400">{Math.round(volume * 100)}%</span>
          </div>
          <div className="flex items-center gap-3 bg-slate-900/40 border border-white/5 rounded-xl p-3">
            <button
              type="button"
              onClick={() => onVolumeChange(volume === 0 ? 0.8 : 0)}
              className="text-slate-400 hover:text-white cursor-pointer transition"
            >
              {volume === 0 ? <VolumeX className="h-4.5 w-4.5 text-red-400" /> : <Volume2 className="h-4.5 w-4.5" />}
            </button>
            <input
              type="range"
              min="0"
              max="2"
              step="0.01"
              value={volume}
              onChange={(e) => onVolumeChange(Number(e.target.value))}
              className="flex-1 accent-sky-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
            />
          </div>
        </div>

        {/* SECTION 2: AI Enhancements */}
        <div className="space-y-3">
          <h4 className="text-[10px] font-mono uppercase tracking-wider text-slate-400">AI Enhancements</h4>
          
          <div className="space-y-2.5">
            {/* Background Noise Reduction */}
            <div className="bg-slate-900/40 border border-white/5 rounded-xl p-3 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-slate-300">Background Noise Reduction</span>
                  <span className="text-[9px] text-slate-500 mt-0.5">Remove wind noise, hum, and static.</span>
                </div>
                <button
                  type="button"
                  onClick={() => setNoiseReduction(!noiseReduction)}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors cursor-pointer ${
                    noiseReduction ? 'bg-sky-500' : 'bg-slate-800'
                  }`}
                >
                  <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                    noiseReduction ? 'translate-x-4.5' : 'translate-x-1'
                  }`} />
                </button>
              </div>

              {noiseReduction && (
                <div className="space-y-1.5 transition-all duration-300">
                  <div className="flex justify-between text-[9px] font-mono text-slate-400">
                    <span>Denoise Threshold</span>
                    <span>{noiseReductionStrength}%</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    value={noiseReductionStrength}
                    onChange={(e) => setNoiseReductionStrength(Number(e.target.value))}
                    className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                  />
                </div>
              )}
            </div>

            {/* AI Vocal Isolation */}
            <div className="bg-slate-900/40 border border-white/5 rounded-xl p-3 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                    <Sparkles className="h-3 w-3 text-amber-400" />
                    <span>AI Vocal Isolation</span>
                  </span>
                  <span className="text-[9px] text-slate-500 mt-0.5">Boost dialogue and mute background sound.</span>
                </div>
                <button
                  type="button"
                  onClick={() => setVocalIsolation(!vocalIsolation)}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors cursor-pointer ${
                    vocalIsolation ? 'bg-sky-500' : 'bg-slate-800'
                  }`}
                >
                  <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                    vocalIsolation ? 'translate-x-4.5' : 'translate-x-1'
                  }`} />
                </button>
              </div>

              {vocalIsolation && (
                <div className="space-y-1.5 transition-all duration-300">
                  <div className="flex justify-between text-[9px] font-mono text-slate-400">
                    <span>Isolation Strength</span>
                    <span>{vocalIsolationStrength}%</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    value={vocalIsolationStrength}
                    onChange={(e) => setVocalIsolationStrength(Number(e.target.value))}
                    className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* SECTION 3: Equalizer Presets */}
        <div className="space-y-2.5">
          <h4 className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Equalizer</h4>
          <div className="grid grid-cols-2 gap-1.5">
            {eqPresets.map((preset) => {
              const isActive = eqPreset === preset.id;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => setEqPreset(preset.id)}
                  className={`py-1.5 px-2.5 rounded-lg border text-left text-xs transition duration-200 cursor-pointer ${
                    isActive
                      ? 'bg-sky-500/10 border-sky-400/50 text-sky-400 font-semibold'
                      : 'bg-slate-900/30 border-white/5 hover:border-white/10 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {preset.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* SECTION 4: AI Voice Changer */}
        <div className="space-y-2.5">
          <h4 className="text-[10px] font-mono uppercase tracking-wider text-slate-400">AI Voice Filters</h4>
          <div className="grid grid-cols-3 gap-1.5">
            {voiceChangers.map((filter) => {
              const isActive = voiceChanger === filter.id;
              return (
                <button
                  key={filter.id}
                  type="button"
                  onClick={() => setVoiceChanger(filter.id)}
                  className={`p-2 rounded-lg border flex flex-col items-center justify-center text-center transition duration-200 cursor-pointer ${
                    isActive
                      ? 'bg-sky-500/10 border-sky-400/50 text-sky-400 font-semibold scale-102 shadow-glow'
                      : 'bg-slate-900/30 border-white/5 hover:border-white/10 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span className="text-base mb-1">{filter.icon}</span>
                  <span className="text-[9px] truncate w-full">{filter.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* SECTION 5: Sound Effects Library (10 Samples) */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <h4 className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Sound Effects</h4>
            <span className="text-[8px] bg-slate-900 border border-white/10 px-1.5 py-0.5 rounded text-slate-500 uppercase tracking-widest font-mono">10 Assets</span>
          </div>

          <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-1">
            {mockSfx.map((sfx) => {
              const isPlaying = playingSfxId === sfx.id;
              const isAdded = addedSfxIds.includes(sfx.id);

              return (
                <div
                  key={sfx.id}
                  className="flex items-center justify-between p-2 rounded-lg border border-white/5 bg-slate-950/20 hover:bg-slate-900/50 transition"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-base">{sfx.icon}</span>
                    <div className="flex flex-col min-w-0">
                      <span className="text-[11px] font-medium truncate text-slate-300">{sfx.name}</span>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[8px] text-slate-500 font-mono">{sfx.duration}</span>
                        <span className="text-[8px] text-slate-600 font-mono bg-slate-900 px-1 rounded">{sfx.category}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    {/* Preview Button */}
                    <button
                      type="button"
                      onClick={() => handlePlaySfx(sfx.id)}
                      className={`h-6 w-6 rounded flex items-center justify-center cursor-pointer transition ${
                        isPlaying ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white'
                      }`}
                      title="Preview Sound"
                    >
                      <Play className={`h-3 w-3 ${isPlaying ? 'animate-pulse fill-current' : ''}`} />
                    </button>

                    {/* Add to Timeline Button */}
                    <button
                      type="button"
                      onClick={() => handleAddSfx(sfx.id)}
                      className={`px-1.5 py-1 text-[9px] rounded font-semibold cursor-pointer transition ${
                        isAdded
                          ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                          : 'bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {isAdded ? (
                        <span className="flex items-center gap-0.5">✓ Added</span>
                      ) : (
                        'Add'
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
