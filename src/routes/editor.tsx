import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  Film, Type, Palette, AudioWaveform, Layers, Wand2, Image as ImageIcon,
  Music, Shapes, Sparkles, Sliders, Scissors, Copy, Trash2,
  Undo2, Redo2, Save, Download, Play, Pause, SkipBack, SkipForward,
  Maximize2, Grid3x3, ZoomIn, ZoomOut, Volume2, Search,
  Settings2, ChevronLeft, Bot, Plus,
} from "lucide-react";
import { VeytrixLogo } from "@/components/site/VeytrixLogo";

export const Route = createFileRoute("/editor")({
  head: () => ({
    meta: [
      { title: "Editor — VEYTRIX" },
      { name: "description", content: "The VEYTRIX manual editor workspace — timeline, preview, toolbar, and export in one focused canvas." },
      { property: "og:title", content: "VEYTRIX Editor" },
      { property: "og:description", content: "Timeline, preview, toolbar, and export in one focused canvas." },
    ],
  }),
  component: EditorWorkspace,
});

/* ---------- constants ---------- */

const LEFT_SIDEBAR = [
  { id: "media",     icon: Film,       label: "Media" },
  { id: "text",      icon: Type,       label: "Text" },
  { id: "audio",     icon: Music,      label: "Audio" },
  { id: "effects",   icon: Sparkles,   label: "Effects" },
  { id: "transitions", icon: Shapes,   label: "Transitions" },
  { id: "filters",   icon: Palette,    label: "Filters" },
  { id: "assets",    icon: ImageIcon,  label: "Assets" },
] as const;

const TOOLBAR_TABS = [
  "Basic", "Color", "Filters", "Effects", "Audio", "Text", "Animation", "Advanced",
] as const;

const TRACKS = [
  { name: "V2", type: "video", clips: [{ start: 20, w: 30, color: "from-accent/70 to-accent/40", label: "Overlay" }] },
  { name: "V1", type: "video", clips: [
    { start: 0,  w: 25, color: "from-primary/70 to-primary/40", label: "clip_001.mp4" },
    { start: 26, w: 20, color: "from-primary/60 to-primary/40", label: "clip_002.mp4" },
    { start: 48, w: 32, color: "from-primary/70 to-primary/40", label: "clip_003.mp4" },
  ] },
  { name: "A1", type: "audio", clips: [{ start: 0,  w: 78, color: "from-success/60 to-success/30", label: "score.wav", wave: true }] },
  { name: "A2", type: "audio", clips: [{ start: 30, w: 28, color: "from-warning/60 to-warning/30", label: "vo.wav", wave: true }] },
] as const;

/* ---------- root ---------- */

function EditorWorkspace() {
  const [leftTab, setLeftTab] = useState<string>("media");
  const [toolTab, setToolTab] = useState<string>("Basic");
  const [playing, setPlaying] = useState(false);

  return (
    <div className="h-screen w-screen flex flex-col bg-background text-foreground overflow-hidden">
      <TopNav />

      <div className="flex-1 min-h-0 grid grid-cols-[56px_260px_1fr_300px]">
        <LeftRail active={leftTab} onChange={setLeftTab} />
        <AssetPanel active={leftTab} />

        <div className="flex flex-col min-w-0 border-x border-border">
          <PreviewPlayer playing={playing} setPlaying={setPlaying} />
          <EditingToolbar tab={toolTab} setTab={setToolTab} />
          <Timeline />
        </div>

        <PropertiesPanel />
      </div>

      <ExportCenter />
    </div>
  );
}

/* ---------- top nav ---------- */

function TopNav() {
  return (
    <div className="h-12 flex items-center border-b border-border bg-surface/60 px-3 gap-2">
      <Link to="/" className="flex items-center gap-2 px-2 py-1 rounded hover:bg-surface-2 transition">
        <ChevronLeft className="h-4 w-4 text-muted-foreground" />
        <VeytrixLogo className="h-5 w-5" />
        <span className="font-display text-sm font-semibold">VEYTRIX</span>
      </Link>

      <div className="mx-2 h-6 w-px bg-border" />

      <div className="flex items-center gap-1 text-sm text-muted-foreground">
        <span>My Projects</span>
        <span>/</span>
        <span className="text-foreground font-medium">Untitled Project</span>
      </div>

      <div className="mx-2 h-6 w-px bg-border" />

      <div className="flex items-center gap-1">
        {[Undo2, Redo2, Save].map((I, i) => (
          <button key={i} className="grid h-8 w-8 place-items-center rounded hover:bg-surface-2 text-muted-foreground hover:text-foreground">
            <I className="h-4 w-4" />
          </button>
        ))}
      </div>

      <div className="ml-auto flex items-center gap-2">
        <div className="hidden md:flex items-center rounded-md hairline bg-surface px-2 py-1 text-xs font-mono text-muted-foreground gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-success" />
          autosaved 12s ago
        </div>
        <button className="inline-flex items-center gap-2 rounded-md hairline bg-surface px-3 py-1.5 text-sm hover:bg-surface-2">
          <Bot className="h-4 w-4 text-primary" />
          AI Command
          <span className="ml-1 rounded bg-surface-3 px-1.5 py-0.5 text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
            reserved
          </span>
        </button>
        <button className="inline-flex items-center gap-2 rounded-md bg-gradient-primary px-4 py-1.5 text-sm font-semibold text-primary-foreground shadow-glow">
          <Download className="h-4 w-4" />
          Export
        </button>
      </div>
    </div>
  );
}

/* ---------- left rail (icons) ---------- */

function LeftRail({ active, onChange }: { active: string; onChange: (id: string) => void }) {
  return (
    <div className="border-r border-border bg-surface/40 flex flex-col items-center py-3 gap-2">
      {LEFT_SIDEBAR.map((item) => {
        const A = item.icon;
        const isActive = active === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onChange(item.id)}
            className={[
              "group relative h-11 w-11 grid place-items-center rounded-lg transition",
              isActive
                ? "bg-primary/15 text-primary hairline-strong"
                : "text-muted-foreground hover:bg-surface-2 hover:text-foreground",
            ].join(" ")}
            title={item.label}
          >
            <A className="h-4.5 w-4.5" />
            <span className="pointer-events-none absolute left-full ml-2 whitespace-nowrap rounded bg-surface-3 px-2 py-1 text-[11px] opacity-0 group-hover:opacity-100 transition z-10">
              {item.label}
            </span>
          </button>
        );
      })}
      <div className="mt-auto flex flex-col items-center gap-2">
        <button className="h-11 w-11 grid place-items-center rounded-lg text-muted-foreground hover:bg-surface-2">
          <Settings2 className="h-4.5 w-4.5" />
        </button>
      </div>
    </div>
  );
}

/* ---------- asset panel ---------- */

function AssetPanel({ active }: { active: string }) {
  const current = LEFT_SIDEBAR.find((i) => i.id === active) ?? LEFT_SIDEBAR[0];
  return (
    <div className="flex flex-col min-h-0 border-r border-border bg-surface/30">
      <div className="p-3 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="font-display text-sm font-semibold">{current.label}</div>
          <button className="grid h-6 w-6 place-items-center rounded hover:bg-surface-2 text-muted-foreground">
            <Plus className="h-3.5 w-3.5" />
          </button>
        </div>
        <div className="mt-2 flex items-center gap-2 rounded-md bg-input hairline px-2 py-1.5">
          <Search className="h-3.5 w-3.5 text-muted-foreground" />
          <input
            className="flex-1 bg-transparent text-xs outline-none placeholder:text-muted-foreground"
            placeholder={`Search ${current.label.toLowerCase()}…`}
          />
        </div>
      </div>

      <div className="flex-1 overflow-auto p-3">
        <div className="flex flex-wrap gap-1 mb-3">
          {["All", "Videos", "Images", "Audio", "Favorites", "Recent"].map((t, i) => (
            <button
              key={t}
              className={[
                "px-2 py-0.5 rounded-full text-[11px] transition",
                i === 0 ? "bg-primary text-primary-foreground" : "bg-surface hairline text-muted-foreground hover:text-foreground",
              ].join(" ")}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-2">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="group relative aspect-video rounded-md overflow-hidden hairline cursor-grab">
              <div className={`absolute inset-0 bg-gradient-to-br ${i % 2 ? "from-primary/40 to-accent/40" : "from-accent/40 to-primary/40"}`} />
              <div className="absolute inset-0 bg-mesh opacity-60" />
              <div className="absolute bottom-1 left-1 right-1 flex items-center justify-between text-[9px] font-mono text-white/80">
                <span className="rounded bg-black/50 px-1">clip_{String(i + 1).padStart(3, "0")}</span>
                <span className="rounded bg-black/50 px-1">0:{10 + i}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---------- preview player ---------- */

function PreviewPlayer({ playing, setPlaying }: { playing: boolean; setPlaying: (v: boolean) => void }) {
  return (
    <div className="flex-1 min-h-0 flex flex-col bg-black/40">
      <div className="flex-1 min-h-0 grid place-items-center p-6">
        <div className="relative w-full max-w-4xl aspect-video rounded-lg overflow-hidden shadow-elegant hairline">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/35 via-accent/25 to-transparent" />
          <div className="absolute inset-0 bg-mesh opacity-70" />
          <div className="absolute inset-0 grid-lines opacity-10" />

          {/* HUD */}
          <div className="absolute top-3 left-3 right-3 flex items-center gap-2 text-[10px] font-mono">
            <span className="rounded bg-black/50 px-2 py-0.5 text-white/90">3840×2160 · 24fps</span>
            <span className="rounded bg-black/50 px-2 py-0.5 text-white/90">Rec. 709</span>
            <span className={[
              "ml-auto rounded px-2 py-0.5",
              playing ? "bg-primary text-primary-foreground" : "bg-black/50 text-white/80",
            ].join(" ")}>
              {playing ? "PLAYING" : "PAUSED"}
            </span>
          </div>

          {/* Safe area */}
          <div className="absolute inset-6 border border-primary/30 rounded-sm pointer-events-none" />
          <div className="absolute inset-12 border border-accent/30 rounded-sm pointer-events-none" />

          {/* Play button */}
          <button
            onClick={() => setPlaying(!playing)}
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-16 w-16 rounded-full bg-white/95 grid place-items-center shadow-glow hover:scale-105 transition"
          >
            {playing ? <Pause className="h-6 w-6 text-black" /> : <Play className="h-6 w-6 text-black translate-x-0.5" />}
          </button>
        </div>
      </div>

      {/* Playback controls */}
      <div className="border-t border-border bg-surface/60 px-4 py-2 flex items-center gap-3">
        <div className="flex items-center gap-1">
          <button className="grid h-8 w-8 place-items-center rounded hover:bg-surface-2 text-muted-foreground hover:text-foreground">
            <SkipBack className="h-4 w-4" />
          </button>
          <button
            onClick={() => setPlaying(!playing)}
            className="grid h-9 w-9 place-items-center rounded-md bg-gradient-primary text-primary-foreground shadow-glow"
          >
            {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 translate-x-0.5" />}
          </button>
          <button className="grid h-8 w-8 place-items-center rounded hover:bg-surface-2 text-muted-foreground hover:text-foreground">
            <SkipForward className="h-4 w-4" />
          </button>
        </div>

        <div className="text-xs font-mono text-muted-foreground">
          <span className="text-foreground">00:00:12:04</span> / 00:01:24:18
        </div>

        <div className="ml-auto flex items-center gap-1">
          <button className="grid h-8 w-8 place-items-center rounded hover:bg-surface-2 text-muted-foreground hover:text-foreground" title="Grid">
            <Grid3x3 className="h-4 w-4" />
          </button>
          <button className="grid h-8 w-8 place-items-center rounded hover:bg-surface-2 text-muted-foreground hover:text-foreground" title="Fullscreen">
            <Maximize2 className="h-4 w-4" />
          </button>
          <div className="mx-1 h-5 w-px bg-border" />
          <Volume2 className="h-4 w-4 text-muted-foreground" />
          <div className="h-1 w-20 rounded-full bg-surface-3 overflow-hidden">
            <div className="h-1 w-2/3 bg-gradient-primary" />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- editing toolbar ---------- */

function EditingToolbar({ tab, setTab }: { tab: string; setTab: (t: string) => void }) {
  return (
    <div className="border-t border-border bg-surface/60">
      <div className="flex items-center gap-1 px-3 pt-2 overflow-x-auto">
        {TOOLBAR_TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={[
              "px-3 py-1.5 text-xs rounded-t-md transition whitespace-nowrap",
              tab === t
                ? "bg-background text-foreground border-t border-x border-border -mb-px"
                : "text-muted-foreground hover:text-foreground",
            ].join(" ")}
          >
            {t}
          </button>
        ))}
      </div>
      <div className="border-t border-border px-3 py-2 flex items-center gap-1 flex-wrap">
        {[
          Scissors, Copy, Trash2, Layers, Sliders, AudioWaveform, Wand2, Sparkles,
        ].map((I, i) => (
          <button key={i} className="inline-flex items-center gap-1.5 rounded-md hairline bg-surface px-2.5 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-surface-2">
            <I className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{["Cut", "Copy", "Delete", "Layers", "Adjust", "Audio", "Effect", "Magic"][i]}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ---------- timeline ---------- */

function Timeline() {
  return (
    <div className="border-t border-border bg-surface/40 min-h-0">
      {/* ruler */}
      <div className="flex items-center gap-2 px-3 py-1.5 border-b border-border text-[10px] font-mono text-muted-foreground">
        <span className="uppercase tracking-widest">Timeline</span>
        <span>·</span>
        <span>{TRACKS.length} tracks</span>
        <div className="ml-auto flex items-center gap-1">
          <button className="grid h-6 w-6 place-items-center rounded hover:bg-surface-2"><ZoomOut className="h-3.5 w-3.5" /></button>
          <span className="w-12 text-center">100%</span>
          <button className="grid h-6 w-6 place-items-center rounded hover:bg-surface-2"><ZoomIn className="h-3.5 w-3.5" /></button>
        </div>
      </div>

      {/* time ruler */}
      <div className="relative h-6 border-b border-border pl-16 pr-3">
        <div className="relative h-full">
          {Array.from({ length: 11 }).map((_, i) => (
            <div key={i} className="absolute top-0 h-full flex flex-col items-center" style={{ left: `${i * 10}%` }}>
              <div className="h-2 w-px bg-border-strong" />
              <span className="mt-0.5 text-[9px] font-mono text-muted-foreground">
                00:{String(i * 3).padStart(2, "0")}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* tracks */}
      <div className="relative">
        {/* playhead */}
        <div className="absolute top-0 bottom-0 z-20 pointer-events-none" style={{ left: "calc(4rem + (100% - 4rem - 0.75rem) * 0.32)" }}>
          <div className="h-full w-px bg-primary shadow-glow" />
          <div className="absolute -top-1 -translate-x-1/2 h-2 w-2 rotate-45 bg-primary" />
        </div>

        {TRACKS.map((track) => (
          <div key={track.name} className="flex items-stretch border-b border-border last:border-b-0">
            <div className="w-16 shrink-0 px-3 py-2 border-r border-border bg-surface/60 flex items-center gap-1.5">
              <span className={[
                "h-1.5 w-1.5 rounded-full",
                track.type === "video" ? "bg-primary" : "bg-success",
              ].join(" ")} />
              <span className="text-[10px] font-mono text-muted-foreground">{track.name}</span>
            </div>
            <div className="relative flex-1 h-11">
              {track.clips.map((clip, ci) => (
                <div
                  key={ci}
                  className={`absolute top-1 bottom-1 rounded-md bg-gradient-to-r ${clip.color} hairline overflow-hidden cursor-grab`}
                  style={{ left: `${clip.start}%`, width: `${clip.w}%` }}
                >
                  <div className="px-2 py-1 text-[10px] font-mono text-white/90 truncate">
                    {clip.label}
                  </div>
                  {"wave" in clip && clip.wave && (
                    <div className="absolute inset-x-0 bottom-0 h-4 flex items-end gap-px px-1">
                      {Array.from({ length: 60 }).map((_, i) => (
                        <div
                          key={i}
                          className="flex-1 bg-white/50"
                          style={{ height: `${20 + Math.abs(Math.sin(i * 0.6)) * 70}%` }}
                        />
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------- properties panel ---------- */

function PropertiesPanel() {
  return (
    <div className="flex flex-col min-h-0 bg-surface/30 overflow-hidden">
      <div className="border-b border-border p-3">
        <div className="font-display text-sm font-semibold">Properties</div>
        <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mt-0.5">
          clip_001.mp4
        </div>
      </div>
      <div className="flex-1 overflow-auto p-4 space-y-6">
        <Section title="Transform">
          <Row label="Position X" value="0 px" />
          <Row label="Position Y" value="0 px" />
          <Row label="Scale" value="1.00x" slider />
          <Row label="Rotation" value="0.0°" slider />
        </Section>

        <Section title="Opacity & Blend">
          <Row label="Opacity" value="100%" slider />
          <Row label="Blend" value="Normal" />
        </Section>

        <Section title="Color">
          <div className="grid grid-cols-4 gap-1.5">
            {["from-red-500", "from-orange-500", "from-yellow-500", "from-lime-500", "from-cyan-500", "from-blue-500", "from-fuchsia-500", "from-pink-500"].map((c) => (
              <div key={c} className={`aspect-square rounded bg-gradient-to-br ${c} to-transparent hairline`} />
            ))}
          </div>
        </Section>

        <div className="rounded-md bg-gradient-primary/10 hairline p-3">
          <div className="text-[10px] font-mono uppercase tracking-widest text-primary">
            AI Command Engine
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Reserved for future implementation.
          </p>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-2">
        {title}
      </div>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function Row({ label, value, slider }: { label: string; value: string; slider?: boolean }) {
  return (
    <div>
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-mono">{value}</span>
      </div>
      {slider && (
        <div className="mt-1.5 h-1 rounded-full bg-surface-3 overflow-hidden">
          <div className="h-1 w-1/2 bg-gradient-primary" />
        </div>
      )}
    </div>
  );
}

/* ---------- bottom export bar ---------- */

function ExportCenter() {
  return (
    <div className="h-9 border-t border-border bg-surface/60 flex items-center px-3 gap-4 text-[11px] font-mono text-muted-foreground">
      <span>Project · 4K · 24fps · H.264</span>
      <span>·</span>
      <span>3 tracks · 5 clips · 01:24:18</span>
      <div className="ml-auto flex items-center gap-3">
        <span className="text-success">● connected</span>
        <span>render queue: idle</span>
      </div>
    </div>
  );
}
