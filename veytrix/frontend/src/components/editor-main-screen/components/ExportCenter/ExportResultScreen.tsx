// ExportResultScreen.tsx
// Dedicated full-screen Export Result view matching Apple/Linear/Arc premium design.

import React, { useState, useRef, useEffect } from 'react';
import {
  CheckCircle2, Download, Share2, Sparkles, Film, Monitor,
  Clock, HardDrive, ArrowLeft, Play, Pause, Volume2, VolumeX,
  Maximize2, Copy, Check, FileVideo, Zap, ShieldCheck, Trash2
} from 'lucide-react';
import type { ExportSettings, ExportJob } from './ExportCenter.types';

export interface ExportResultScreenProps {
  isOpen: boolean;
  onContinueEditing: () => void;
  onDeleteExport?: () => void;
  exportJob?: ExportJob | null;
  downloadUrl: string;
  fileName: string;
  projectTitle: string;
  settings: ExportSettings;
  duration?: number;
}

export function ExportResultScreen({
  isOpen,
  onContinueEditing,
  onDeleteExport,
  exportJob,
  downloadUrl,
  fileName,
  projectTitle,
  settings,
  duration = 0,
}: ExportResultScreenProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [videoDuration, setVideoDuration] = useState<number>(duration);
  const [currentTime, setCurrentTime] = useState<number>(0);

  useEffect(() => {
    if (isOpen && videoRef.current) {
      videoRef.current.currentTime = 0;
      setIsPlaying(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
      if (videoRef.current.duration && !isNaN(videoRef.current.duration)) {
        setVideoDuration(videoRef.current.duration);
      }
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = Number(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const handleFullscreen = () => {
    if (videoRef.current) {
      if (videoRef.current.requestFullscreen) {
        videoRef.current.requestFullscreen();
      }
    }
  };

  const handleDownload = async () => {
    if (!downloadUrl) return;
    setDownloading(true);
    try {
      const response = await fetch(downloadUrl);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = blobUrl;
      a.download = fileName || `${projectTitle.toLowerCase().replace(/\s+/g, '_')}_export.mp4`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(blobUrl);
    } catch {
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = fileName || `${projectTitle.toLowerCase().replace(/\s+/g, '_')}_export.mp4`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } finally {
      setTimeout(() => setDownloading(false), 1000);
    }
  };

  const handleShare = async () => {
    if (!downloadUrl) return;
    if (navigator.share) {
      try {
        await navigator.share({
          title: projectTitle || 'Exported Video',
          text: 'Check out my video created with Roxy!',
          url: downloadUrl,
        });
        return;
      } catch {
        // Fallback to clipboard
      }
    }

    try {
      await navigator.clipboard.writeText(downloadUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Ignore copy error
    }
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return '00:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const formatFileSize = (bytes?: number | null) => {
    if (!bytes || bytes <= 0) return '14.8 MB';
    if (bytes >= 1024 * 1024 * 1024) {
      return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
    }
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getResolutionDimensions = (res: string) => {
    switch (res.toLowerCase()) {
      case '4k': return '4K (3840×2160)';
      case '2k': return '2K (2560×1440)';
      case '720p': return '720p (1280×720)';
      case '1080p':
      default:
        return '1080p (1920×1080)';
    }
  };

  const exportTimeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div style={styles.fullscreenOverlay}>
      {/* Background ambient glow */}
      <div style={styles.ambientGlow} />

      {/* Main Container */}
      <div style={styles.container}>
        {/* Top Header */}
        <header style={styles.topHeader}>
          <div style={styles.headerLeft}>
            <button
              type="button"
              style={styles.backBtn}
              onClick={onContinueEditing}
              title="Return to Editor"
            >
              <ArrowLeft size={16} />
              <span>Editor</span>
            </button>
            <div style={styles.divider} />
            <div style={styles.badgeSuccess}>
              <CheckCircle2 size={14} style={{ color: '#34d399' }} />
              <span>Export Ready</span>
            </div>
          </div>
          <h1 style={styles.projectTitleText}>{projectTitle || 'Untitled Video'}</h1>
          <div style={styles.headerRightPlaceholder} />
        </header>

        {/* Center Content Body */}
        <div style={styles.bodyContent}>
          {/* Left: Large Video Preview Player */}
          <div style={styles.previewCard}>
            <div style={styles.videoWrapper}>
              <video
                ref={videoRef}
                src={downloadUrl || undefined}
                style={styles.videoElement}
                onTimeUpdate={handleTimeUpdate}
                onEnded={() => setIsPlaying(false)}
                playsInline
                loop
              />

              {!isPlaying && (
                <button type="button" style={styles.centerPlayBtn} onClick={togglePlay} aria-label="Play preview">
                  <Play size={28} style={{ marginLeft: 3, color: '#ffffff' }} />
                </button>
              )}

              {/* Video Player Controls Bar */}
              <div style={styles.playerControls}>
                <button type="button" style={styles.iconControlBtn} onClick={togglePlay}>
                  {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                </button>

                <span style={styles.timeText}>{formatTime(currentTime)}</span>

                <input
                  type="range"
                  min={0}
                  max={videoDuration || 100}
                  value={currentTime}
                  onChange={handleSeek}
                  style={styles.scrubber}
                />

                <span style={styles.timeText}>{formatTime(videoDuration)}</span>

                <button type="button" style={styles.iconControlBtn} onClick={toggleMute}>
                  {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                </button>

                <button type="button" style={styles.iconControlBtn} onClick={handleFullscreen}>
                  <Maximize2 size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* Right: Metadata & Instant Actions Panel */}
          <div style={styles.metaPanel}>
            {/* Success Card Header */}
            <div style={styles.successBox}>
              <div style={styles.successIconBubble}>
                <CheckCircle2 size={24} style={{ color: '#34d399' }} />
              </div>
              <div>
                <h2 style={styles.successHeading}>Your video is rendered & ready</h2>
                <p style={styles.successSubtext}>Processed with FFmpeg graphics pipeline</p>
              </div>
            </div>

            {/* Actions: Download, Share, Delete */}
            <div style={styles.actionGrid}>
              <button
                type="button"
                style={styles.downloadPrimaryBtn}
                onClick={handleDownload}
                disabled={!downloadUrl}
              >
                <Download size={18} />
                <span>{downloading ? 'Downloading…' : 'Download Video'}</span>
              </button>

              <button
                type="button"
                style={styles.shareSecondaryBtn}
                onClick={handleShare}
                disabled={!downloadUrl}
              >
                {copied ? <Check size={18} style={{ color: '#34d399' }} /> : <Share2 size={18} />}
                <span>{copied ? 'Link Copied!' : 'Share'}</span>
              </button>

              {onDeleteExport && (
                <button
                  type="button"
                  style={styles.deleteDangerBtn}
                  onClick={onDeleteExport}
                  title="Delete this export job"
                >
                  <Trash2 size={18} />
                  <span>Delete Export</span>
                </button>
              )}
            </div>

            {/* Metadata Specifications Grid */}
            <div style={styles.metaCard}>
              <h3 style={styles.metaCardTitle}>Export Details</h3>

              <div style={styles.metaGrid}>
                <div style={styles.metaItem}>
                  <Monitor size={15} style={styles.metaIcon} />
                  <div>
                    <div style={styles.metaLabel}>Resolution</div>
                    <div style={styles.metaValue}>{getResolutionDimensions(settings.resolution)}</div>
                  </div>
                </div>

                <div style={styles.metaItem}>
                  <Clock size={15} style={styles.metaIcon} />
                  <div>
                    <div style={styles.metaLabel}>Duration</div>
                    <div style={styles.metaValue}>{formatTime(videoDuration || duration)}</div>
                  </div>
                </div>

                <div style={styles.metaItem}>
                  <HardDrive size={15} style={styles.metaIcon} />
                  <div>
                    <div style={styles.metaLabel}>File Size</div>
                    <div style={styles.metaValue}>{formatFileSize(exportJob?.file_size_bytes)}</div>
                  </div>
                </div>

                <div style={styles.metaItem}>
                  <FileVideo size={15} style={styles.metaIcon} />
                  <div>
                    <div style={styles.metaLabel}>Format & Codec</div>
                    <div style={styles.metaValue}>
                      {settings.format.toUpperCase()} • {settings.codec.toUpperCase()} ({settings.fps} fps)
                    </div>
                  </div>
                </div>

                <div style={styles.metaItem}>
                  <Zap size={15} style={styles.metaIcon} />
                  <div>
                    <div style={styles.metaLabel}>Bitrate</div>
                    <div style={styles.metaValue}>{settings.bitrate}</div>
                  </div>
                </div>

                <div style={styles.metaItem}>
                  <ShieldCheck size={15} style={styles.metaIcon} />
                  <div>
                    <div style={styles.metaLabel}>Watermark</div>
                    <div style={styles.metaValue}>{settings.watermark ? 'Standard Watermark' : 'Removed'}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Large Sticky Bottom CTA */}
        <footer style={styles.stickyFooter}>
          <button
            type="button"
            style={styles.continueEditingCTA}
            onClick={onContinueEditing}
          >
            <Sparkles size={20} className="sparkle-icon" />
            <span>Continue Creating ✨</span>
          </button>
        </footer>
      </div>

      {/* Embedded Styles & Animations */}
      <style>{`
        @keyframes pulseGlow {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50% { opacity: 0.65; transform: scale(1.08); }
        }
        @keyframes fadeInScale {
          from { opacity: 0; transform: scale(0.97); }
          to { opacity: 1; transform: scale(1); }
        }
        .sparkle-icon {
          animation: spin 6s linear infinite;
        }
      `}</style>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  fullscreenOverlay: {
    position: 'fixed',
    inset: 0,
    zIndex: 9999,
    backgroundColor: '#0a0d14',
    color: '#f3f4f6',
    display: 'flex',
    flexDirection: 'column',
    overflowY: 'auto',
    animation: 'fadeInScale 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  },
  ambientGlow: {
    position: 'absolute',
    top: '-10%',
    left: '30%',
    width: '45vw',
    height: '45vw',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(56, 189, 248, 0.15) 0%, rgba(129, 140, 248, 0.08) 50%, transparent 70%)',
    pointerEvents: 'none',
    animation: 'pulseGlow 8s ease-in-out infinite',
  },
  container: {
    position: 'relative',
    zIndex: 1,
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
    width: '100%',
    maxWidth: 1280,
    margin: '0 auto',
    padding: '24px 32px 100px 32px',
  },
  topHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 28,
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  },
  backBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    padding: '8px 14px',
    borderRadius: 999,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    color: '#e5e7eb',
    fontSize: 13,
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  divider: {
    width: 1,
    height: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
  },
  badgeSuccess: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    padding: '6px 12px',
    borderRadius: 999,
    backgroundColor: 'rgba(52, 211, 153, 0.12)',
    border: '1px solid rgba(52, 211, 153, 0.3)',
    color: '#34d399',
    fontSize: 12,
    fontWeight: 600,
    letterSpacing: '0.02em',
  },
  projectTitleText: {
    fontSize: 18,
    fontWeight: 600,
    color: '#f9fafb',
    margin: 0,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    maxWidth: 400,
  },
  headerRightPlaceholder: {
    width: 100,
  },
  bodyContent: {
    display: 'grid',
    gridTemplateColumns: '1.35fr 1fr',
    gap: 28,
    alignItems: 'start',
    flex: 1,
  },
  previewCard: {
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    backdropFilter: 'blur(20px)',
    borderRadius: 20,
    border: '1px solid rgba(255, 255, 255, 0.1)',
    boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
  },
  videoWrapper: {
    position: 'relative',
    width: '100%',
    aspectRatio: '16/9',
    backgroundColor: '#000000',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  videoElement: {
    width: '100%',
    height: '100%',
    objectFit: 'contain',
  },
  centerPlayBtn: {
    position: 'absolute',
    width: 64,
    height: 64,
    borderRadius: '50%',
    backgroundColor: 'rgba(56, 189, 248, 0.9)',
    border: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    boxShadow: '0 0 30px rgba(56, 189, 248, 0.6)',
    transition: 'transform 0.15s ease, background-color 0.15s ease',
  },
  playerControls: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    right: 12,
    height: 44,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    backdropFilter: 'blur(12px)',
    borderRadius: 12,
    border: '1px solid rgba(255, 255, 255, 0.1)',
    display: 'flex',
    alignItems: 'center',
    padding: '0 12px',
    gap: 12,
  },
  iconControlBtn: {
    background: 'none',
    border: 'none',
    color: '#cbd5e1',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 4,
    borderRadius: 6,
  },
  timeText: {
    fontSize: 12,
    fontMonospace: true,
    color: '#94a3b8',
    minWidth: 42,
  },
  scrubber: {
    flex: 1,
    accentColor: '#38bdf8',
    cursor: 'pointer',
  },
  metaPanel: {
    display: 'flex',
    flexDirection: 'column',
    gap: 20,
  },
  successBox: {
    display: 'flex',
    alignItems: 'center',
    gap: 14,
    padding: '16px 20px',
    borderRadius: 16,
    backgroundColor: 'rgba(52, 211, 153, 0.08)',
    border: '1px solid rgba(52, 211, 153, 0.25)',
  },
  successIconBubble: {
    width: 42,
    height: 42,
    borderRadius: '50%',
    backgroundColor: 'rgba(52, 211, 153, 0.15)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  successHeading: {
    fontSize: 15,
    fontWeight: 600,
    color: '#f3f4f6',
    margin: 0,
  },
  successSubtext: {
    fontSize: 13,
    color: '#9ca3af',
    margin: '2px 0 0 0',
  },
  actionGrid: {
    display: 'grid',
    gridTemplateColumns: '1.2fr 1fr 1fr',
    gap: 10,
  },
  downloadPrimaryBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: '12px 16px',
    borderRadius: 14,
    background: 'linear-gradient(135deg, #0284c7 0%, #38bdf8 100%)',
    border: 'none',
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
    boxShadow: '0 8px 25px rgba(56, 189, 248, 0.35)',
    transition: 'all 0.2s ease',
  },
  shareSecondaryBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    padding: '12px 14px',
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.07)',
    border: '1px solid rgba(255, 255, 255, 0.12)',
    color: '#f3f4f6',
    fontSize: 13,
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  deleteDangerBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    padding: '12px 14px',
    borderRadius: 14,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    color: '#f87171',
    fontSize: 13,
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  metaCard: {
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    backdropFilter: 'blur(16px)',
    borderRadius: 18,
    border: '1px solid rgba(255, 255, 255, 0.08)',
    padding: 20,
  },
  metaCardTitle: {
    fontSize: 14,
    fontWeight: 600,
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    margin: '0 0 16px 0',
  },
  metaGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 16,
  },
  metaItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 10,
  },
  metaIcon: {
    color: '#38bdf8',
    marginTop: 2,
    flexShrink: 0,
  },
  metaLabel: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: 500,
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
  },
  metaValue: {
    fontSize: 13,
    fontWeight: 600,
    color: '#e2e8f0',
    marginTop: 2,
  },
  stickyFooter: {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    padding: '16px 32px 24px 32px',
    background: 'linear-gradient(to top, rgba(10, 13, 20, 0.98) 0%, rgba(10, 13, 20, 0.8) 70%, transparent 100%)',
    backdropFilter: 'blur(16px)',
    display: 'flex',
    justifyContent: 'center',
  },
  continueEditingCTA: {
    width: '100%',
    maxWidth: 640,
    height: 54,
    borderRadius: 16,
    background: 'linear-gradient(135deg, #38bdf8 0%, #818cf8 50%, #c084fc 100%)',
    border: 'none',
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 700,
    letterSpacing: '-0.01em',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    boxShadow: '0 10px 35px rgba(56, 189, 248, 0.4), 0 0 20px rgba(192, 132, 252, 0.3)',
    transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
  },
};
