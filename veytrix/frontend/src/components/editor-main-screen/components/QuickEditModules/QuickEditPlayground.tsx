import React, { useState, useEffect } from 'react';
import { Timeline, TimelineClip, Marker } from '../Timeline/Timeline';
import { TextPanel, TextOverlay as StandaloneTextLayer } from '../../tools/text/TextPanel';
import { Captions, CaptionItem as StandaloneCaptionCue } from '../../tools/captions/Captions';
import { AspectRatio } from '../../tools/aspect-ratio/AspectRatio';
import { PropertiesPanel, Keyframe } from '../PropertiesPanel/PropertiesPanel';
import { PreviewPlayer } from '../PreviewPlayer/PreviewPlayer';
import { Wand2, Layout, Film, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function QuickEditPlayground() {
  const navigate = useNavigate();

  // Shared Global Editor States
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration] = useState(30); // 30 second mock clip
  
  // Left panel tabs navigation
  const [activeLeftTab, setActiveLeftTab] = useState<'text' | 'captions' | 'colors' | 'ratio'>('text');

  // Text Module State
  const [textLayers, setTextLayers] = useState<StandaloneTextLayer[]>([
    {
      id: 'txt-1',
      text: 'CINEMATIC VEYTRIX VIBE',
      font: 'Outfit',
      size: 40,
      color: '#ffffff',
      bgOpacity: 0,
      bgColor: '#000000',
      stroke: true,
      strokeColor: '#000000',
      strokeWidth: 2,
      shadow: true,
      shadowColor: 'rgba(0,0,0,0.5)',
      shadowBlur: 8,
      opacity: 100,
      rotation: 0,
      align: 'center',
      bold: true,
      italic: false,
      underline: false,
      animation: 'fade'
    }
  ]);
  const [activeLayerId, setActiveLayerId] = useState<string | null>(null);

  // Captions Module State
  const [captionCues, setCaptionCues] = useState<StandaloneCaptionCue[]>([]);

  // Color settings State
  const [colorSettings, setColorSettings] = useState<Record<string, number>>({
    brightness: 10,
    contrast: 15,
    saturation: 20,
    exposure: 0.5,
    temperature: 15,
    tint: 5,
    vibrance: 25,
    highlights: -5,
    shadows: 10
  });

  // Aspect Ratio State
  const [aspectRatio, setAspectRatio] = useState('16/9');

  // Right Properties State
  const [posX, setPosX] = useState(0);
  const [posY, setPosY] = useState(0);
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [opacity, setOpacity] = useState(100);
  const [blendMode, setBlendMode] = useState('normal');
  const [crop, setCrop] = useState({ top: 0, bottom: 0, left: 0, right: 0 });
  const [speed, setSpeed] = useState(1);
  const [reverse, setReverse] = useState(false);
  const [borderRadius, setBorderRadius] = useState(0);
  const [shadowBlur, setShadowBlur] = useState(0);
  const [shadowColor, setShadowColor] = useState('#000000');
  const [mask, setMask] = useState('none');

  // Keyframes State
  const [keyframes, setKeyframes] = useState<Keyframe[]>([
    {
      id: 'kf-1',
      time: 2.0,
      properties: { scale: 1.1, rotation: 10, opacity: 100 }
    },
    {
      id: 'kf-2',
      time: 15.0,
      properties: { scale: 1.5, rotation: 0, opacity: 80 }
    }
  ]);

  const [captionStyle, setCaptionStyle] = useState({
    font: 'Outfit',
    size: 24,
    color: '#ffffff',
    bgOpacity: 60,
    bgColor: '#000000',
    position: 'bottom'
  });

  // Video playback ticker simulation
  useEffect(() => {
    let interval: any;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= duration) {
            setIsPlaying(false);
            return 0;
          }
          // Increment time based on speed
          return prev + 0.1 * speed;
        });
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isPlaying, duration, speed]);

  // Handle keyframe interpolation
  useEffect(() => {
    // Interpolate transforms based on closest keyframes
    if (keyframes.length === 0) return;
    const sorted = [...keyframes].sort((a, b) => a.time - b.time);
    
    // Find keyframe boundary
    let prevKf = sorted[0];
    let nextKf = sorted[sorted.length - 1];

    for (let i = 0; i < sorted.length; i++) {
      if (sorted[i].time <= currentTime) {
        prevKf = sorted[i];
      }
      if (sorted[i].time >= currentTime) {
        nextKf = sorted[i];
        break;
      }
    }

    if (prevKf.id === nextKf.id) {
      if (prevKf.properties.scale !== undefined) setScale(prevKf.properties.scale);
      if (prevKf.properties.rotation !== undefined) setRotation(prevKf.properties.rotation);
      if (prevKf.properties.opacity !== undefined) setOpacity(prevKf.properties.opacity);
    } else {
      // Interpolate values
      const timeDiff = nextKf.time - prevKf.time;
      const progress = (currentTime - prevKf.time) / timeDiff;

      const lerp = (start: number, end: number) => start + (end - start) * progress;

      if (prevKf.properties.scale !== undefined && nextKf.properties.scale !== undefined) {
        setScale(lerp(prevKf.properties.scale, nextKf.properties.scale));
      }
      if (prevKf.properties.rotation !== undefined && nextKf.properties.rotation !== undefined) {
        setRotation(lerp(prevKf.properties.rotation, nextKf.properties.rotation));
      }
      if (prevKf.properties.opacity !== undefined && nextKf.properties.opacity !== undefined) {
        setOpacity(lerp(prevKf.properties.opacity, nextKf.properties.opacity));
      }
    }
  }, [currentTime, keyframes]);

  // Handlers for lists updates
  const handleAddText = (layer: Omit<StandaloneTextLayer, 'id'>) => {
    const id = `txt-lay-${Date.now()}`;
    setTextLayers([...textLayers, { id, ...layer }]);
    setActiveLayerId(id);
  };

  const handleRemoveText = (id: string) => {
    setTextLayers(textLayers.filter((l) => l.id !== id));
  };

  const handleUpdateText = (id: string, updates: Partial<StandaloneTextLayer>) => {
    setTextLayers(textLayers.map((l) => (l.id === id ? { ...l, ...updates } : l)));
  };

  const handleAddCue = (cue: Omit<StandaloneCaptionCue, 'id'>) => {
    const id = `cue-${Date.now()}`;
    setCaptionCues([...captionCues, { id, ...cue }]);
  };

  const handleRemoveCue = (id: string) => {
    setCaptionCues(captionCues.filter((c) => c.id !== id));
  };

  const handleUpdateCue = (id: string, updates: Partial<StandaloneCaptionCue>) => {
    setCaptionCues(captionCues.map((c) => (c.id === id ? { ...c, ...updates } : c)));
  };

  const handleAddKeyframe = (time: number, props: any) => {
    const id = `kf-${Date.now()}`;
    setKeyframes([...keyframes, { id, time, properties: props }]);
  };

  const handleRemoveKeyframe = (id: string) => {
    setKeyframes(keyframes.filter((k) => k.id !== id));
  };

  const handleColorChange = (setting: string, val: number) => {
    setColorSettings((prev) => ({ ...prev, [setting]: val }));
  };

  const handleResetColors = () => {
    setColorSettings({
      brightness: 0,
      contrast: 0,
      saturation: 0,
      exposure: 0,
      temperature: 0,
      tint: 0,
      vibrance: 0,
      highlights: 0,
      shadows: 0
    });
  };

  const handleCropChange = (updates: Partial<{ top: number; bottom: number; left: number; right: number }>) => {
    setCrop((prev) => ({ ...prev, ...updates }));
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-background text-foreground overflow-hidden font-sans select-none">
      
      {/* HEADER SECTION */}
      <header className="h-12 border-b border-border bg-surface px-4 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/editor')}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground px-2.5 py-1.5 rounded-md hover:bg-surface-hover transition cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Standard Editor</span>
          </button>
          <div className="h-4 w-px bg-white/10" />
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-semibold text-foreground">
              Veytrix AI / Quick Edit Module Playground
            </span>
            <span className="rounded bg-primary/10 border border-sky-500/25 text-primary text-[10px] font-mono px-2 py-0.5 animate-pulse">
              Playground Live
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            className="px-3 py-1.5 text-xs rounded-md bg-surface border border-border hover:border-border-strong text-foreground transition cursor-pointer"
          >
            Export Project XML
          </button>
        </div>
      </header>

      {/* THREE COLUMN EDITOR LAYOUT */}
      <div className="flex-1 grid grid-cols-[280px_1fr_300px] overflow-hidden min-h-0">
        
        {/* LEFT COLUMN: Sidebar with sub-modules */}
        <aside className="border-r border-border bg-surface flex flex-col overflow-hidden">
          {/* Sidebar Tab switches */}
          <div className="flex border-b border-border bg-surface p-1 gap-1">
            {[
              { id: 'text', label: 'Text', icon: Film },
              { id: 'captions', label: 'Captions', icon: Wand2 },
              { id: 'ratio', label: 'Ratio', icon: Layout }
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveLeftTab(tab.id as any)}
                className={`flex-1 py-1.5 text-[10px] font-semibold rounded-md transition cursor-pointer text-center ${
                  activeLeftTab === tab.id
                    ? 'bg-primary/10 text-primary border border-sky-500/20'
                    : 'text-muted-foreground hover:bg-surface-hover'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto flex flex-col min-h-0">
            {activeLeftTab === 'text' && (
              <TextPanel
                overlays={textLayers}
                onAddOverlay={handleAddText}
                onRemoveOverlay={handleRemoveText}
                onUpdateOverlay={handleUpdateText}
                activeOverlayId={activeLayerId}
                setActiveOverlayId={setActiveLayerId}
              />
            )}

            {activeLeftTab === 'captions' && (
              <Captions
                captions={captionCues}
                onAddCaption={handleAddCue}
                onRemoveCaption={handleRemoveCue}
                onUpdateCaption={handleUpdateCue}
                onSeek={setCurrentTime}
                onBatchCaptions={setCaptionCues}
                captionStyle={captionStyle}
                setCaptionStyle={setCaptionStyle}
              />
            )}

            {activeLeftTab === 'ratio' && (
              <AspectRatio
                currentRatio={aspectRatio}
                onRatioChange={setAspectRatio}
              />
            )}
          </div>
        </aside>

        {/* CENTER COLUMN: Preview Monitor */}
        <main className="flex flex-col overflow-hidden border-r border-border bg-background">
          <PreviewPlayer
            isPlaying={isPlaying}
            onPlayToggle={() => setIsPlaying(!isPlaying)}
            currentTime={currentTime}
            onTimeChange={setCurrentTime}
            duration={duration}
            aspectRatio={aspectRatio}
            colorSettings={colorSettings}
            activeFilterId={null}
            activeEffectId={null}
            textOverlays={textLayers}
          />
        </main>

        {/* RIGHT COLUMN: Right Properties Panel */}
        <aside className="overflow-hidden flex flex-col bg-surface">
          <PropertiesPanel
            posX={posX}
            onPosXChange={setPosX}
            posY={posY}
            onPosYChange={setPosY}
            scale={scale}
            onScaleChange={setScale}
            rotation={rotation}
            onRotationChange={setRotation}
            opacity={opacity}
            onOpacityChange={setOpacity}
            blendMode={blendMode}
            onBlendModeChange={setBlendMode}
            crop={crop}
            onCropChange={handleCropChange}
            speed={speed}
            onSpeedChange={setSpeed}
            reverse={reverse}
            onReverseChange={setReverse}
            borderRadius={borderRadius}
            onBorderRadiusChange={setBorderRadius}
            shadowBlur={shadowBlur}
            onShadowBlurChange={setShadowBlur}
            shadowColor={shadowColor}
            onShadowColorChange={setShadowColor}
            mask={mask}
            onMaskChange={setMask}
            keyframes={keyframes}
            onAddKeyframe={handleAddKeyframe}
            onRemoveKeyframe={handleRemoveKeyframe}
            currentTime={currentTime}
          />
        </aside>
      </div>

      {/* BOTTOM FOOTER: Multi-track Timeline */}
      <footer className="h-56 flex-shrink-0 bg-surface border-t border-border">
        <Timeline
          currentTime={currentTime}
          onTimeChange={setCurrentTime}
        />
      </footer>

    </div>
  );
}
export default QuickEditPlayground;
