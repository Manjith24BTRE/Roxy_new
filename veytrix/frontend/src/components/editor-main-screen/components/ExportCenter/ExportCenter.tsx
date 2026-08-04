// ExportCenter.tsx
// Full Export Center modal with settings selection, live progress, and download.
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  X, Download, Loader2, CheckCircle2, AlertCircle,
  ChevronDown, Monitor, Film, Zap, FileVideo, Droplets,
  RotateCcw, Square,
} from 'lucide-react';
import type { ExportCenterProps, ExportSettings, ExportJob } from './ExportCenter.types';
import {
  DEFAULT_EXPORT_SETTINGS,
  RESOLUTION_OPTIONS,
  FPS_OPTIONS,
  CODEC_OPTIONS,
  BITRATE_OPTIONS,
  FORMAT_OPTIONS,
  ASPECT_RATIO_OPTIONS,
  POLL_INTERVAL_MS,
} from './ExportCenter.constants';
import {
  createExport,
  getExportStatus,
  getExportDownload,
  cancelExport,
} from '../../../../services/export.service';
import { useProjectMedia } from '../../../../contexts/ProjectMediaContext';
import { ExportResultScreen } from './ExportResultScreen';

type Phase = 'settings' | 'progress' | 'done' | 'error';

export function ExportCenter({ isOpen, onClose, projectId, projectTitle, timelineJson }: ExportCenterProps) {
  const { getPermanentMediaUrl } = useProjectMedia();

  const [phase, setPhase] = useState<Phase>('settings');
  const [settings, setSettings] = useState<ExportSettings>({ ...DEFAULT_EXPORT_SETTINGS });
  const [currentJob, setCurrentJob] = useState<ExportJob | null>(null);
  const [progress, setProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');
  const [downloadUrl, setDownloadUrl] = useState('');
  const [fileName, setFileName] = useState('');
  const [stageLabel, setStageLabel] = useState('Preparing workspace & assets...');
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setPhase('settings');
      setSettings({ ...DEFAULT_EXPORT_SETTINGS });
      setCurrentJob(null);
      setProgress(0);
      setErrorMsg('');
      setDownloadUrl('');
      setFileName('');
    }
  }, [isOpen]);

  const stopPolling = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, []);

  const startPolling = useCallback((exportId: string) => {
    stopPolling();
    pollRef.current = setInterval(async () => {
      try {
        const statusRes = await getExportStatus(exportId);
        setProgress(statusRes.progress);

        if (statusRes.status === 'completed') {
          stopPolling();
          setPhase('done');
          // Fetch download URL
          try {
            const dlRes = await getExportDownload(exportId);
            setDownloadUrl(dlRes.download_url);
            setFileName(dlRes.file_name);
          } catch {
            setDownloadUrl('');
          }
        } else if (statusRes.status === 'failed') {
          stopPolling();
          setErrorMsg(statusRes.error_message || 'Export rendering failed.');
          setPhase('error');
        } else if (statusRes.status === 'cancelled') {
          stopPolling();
          setPhase('settings');
        }
      } catch {
        // Ignore transient poll errors
      }
    }, POLL_INTERVAL_MS);
  }, [stopPolling]);

  const handleStartExport = async () => {
    console.log('[1] Export button clicked');
    console.log('[2] Export handler entered: handleStartExport');
    console.log('[3] Validation started: Checking timeline JSON & media assets...');
    setPhase('progress');
    setProgress(0);
    setErrorMsg('');
    setStageLabel('Uploading & validating media assets...');
    try {
      // Sanitize timelineJson clips & tracks: resolve every blob URL to permanent Supabase Storage URL
      let sanitizedTimelineJson = { ...timelineJson };

      if (Array.isArray(timelineJson?.tracks)) {
        const sanitizedTracks = await Promise.all(
          timelineJson.tracks.map(async (track: any) => {
            const rawTrackClips = Array.isArray(track?.clips) ? track.clips : [];
            const sanitizedTrackClips = await Promise.all(
              rawTrackClips.map(async (clip: any) => {
                let mediaUrl = clip.media_url || clip.url || clip.src || clip.file_path || '';
                if (!mediaUrl || mediaUrl.startsWith('blob:')) {
                  const resolved = await getPermanentMediaUrl(clip.mediaId || clip.id || clip.asset_id || mediaUrl);
                  if (resolved && !resolved.startsWith('blob:')) {
                    mediaUrl = resolved;
                  }
                }
                return {
                  ...clip,
                  media_url: mediaUrl,
                  url: mediaUrl,
                  src: mediaUrl,
                  file_path: mediaUrl,
                };
              })
            );
            return { ...track, clips: sanitizedTrackClips };
          })
        );
        sanitizedTimelineJson.tracks = sanitizedTracks;
      }

      if (Array.isArray(timelineJson?.clips)) {
        const rawClips = timelineJson.clips;
        const sanitizedClips = await Promise.all(
          rawClips.map(async (clip: any) => {
            let mediaUrl = clip.media_url || clip.url || clip.src || clip.file_path || '';
            if (!mediaUrl || mediaUrl.startsWith('blob:')) {
              const resolved = await getPermanentMediaUrl(clip.mediaId || clip.id || clip.asset_id || mediaUrl);
              if (resolved && !resolved.startsWith('blob:')) {
                mediaUrl = resolved;
              }
            }
            return {
              ...clip,
              media_url: mediaUrl,
              url: mediaUrl,
              src: mediaUrl,
              file_path: mediaUrl,
            };
          })
        );
        sanitizedTimelineJson.clips = sanitizedClips;
      }

      console.log('[4] Validation passed: All timeline media references sanitized');
      console.log('[5] Calling createExport() with project:', projectId);

      setStageLabel('Queued in render pipeline...');
      const job = await createExport({
        project_id: projectId,
        title: projectTitle,
        timeline_json: sanitizedTimelineJson,
        settings,
      });
      setCurrentJob(job);
      setProgress(job.progress);
      startPolling(job.id);
    } catch (err: any) {
      console.error('[!] Export handler failed:', err);
      setErrorMsg(err?.message || 'Failed to start export.');
      setPhase('error');
    }
  };

  const handleCancel = async () => {
    stopPolling();
    if (currentJob) {
      try {
        await cancelExport(currentJob.id);
      } catch {
        // Ignore cancel errors
      }
    }
    setPhase('settings');
  };

  const handleRetry = () => {
    setPhase('settings');
    setErrorMsg('');
    setProgress(0);
  };

  const handleDownload = async () => {
    if (!downloadUrl) return;
    try {
      const response = await fetch(downloadUrl);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = blobUrl;
      a.download = fileName || 'export.mp4';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(blobUrl);
    } catch {
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = fileName || 'export.mp4';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  const handleClose = () => {
    stopPolling();
    onClose();
  };

  const updateSetting = <K extends keyof ExportSettings>(key: K, value: ExportSettings[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleDeleteExport = async () => {
    if (currentJob) {
      try {
        await cancelExport(currentJob.id);
      } catch {
        // Ignore errors
      }
    }
    handleClose();
  };

  if (!isOpen) return null;

  if (phase === 'done') {
    return (
      <ExportResultScreen
        isOpen={isOpen}
        onContinueEditing={handleClose}
        onDeleteExport={handleDeleteExport}
        exportJob={currentJob}
        downloadUrl={downloadUrl}
        fileName={fileName}
        projectTitle={projectTitle || 'My Project'}
        settings={settings}
        duration={Number((timelineJson as any)?.duration) || 0}
      />
    );
  }

  return (
    <div style={styles.overlay} onClick={handleClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.headerLeft}>
            <FileVideo size={18} style={{ color: '#38bdf8' }} />
            <span style={styles.headerTitle}>Export Video</span>
          </div>
          <button type="button" style={styles.closeBtn} onClick={handleClose} aria-label="Close">
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div style={styles.content}>
          {phase === 'settings' && (
            <div style={styles.settingsGrid}>
              {/* Resolution */}
              <SettingRow icon={<Monitor size={14} />} label="Resolution">
                <OptionPills
                  options={RESOLUTION_OPTIONS as unknown as string[]}
                  value={settings.resolution}
                  onChange={(v) => updateSetting('resolution', v as ExportSettings['resolution'])}
                />
              </SettingRow>

              {/* FPS */}
              <SettingRow icon={<Film size={14} />} label="Frame Rate">
                <OptionPills
                  options={(FPS_OPTIONS as unknown as number[]).map(String)}
                  value={String(settings.fps)}
                  onChange={(v) => updateSetting('fps', Number(v) as ExportSettings['fps'])}
                  suffix="fps"
                />
              </SettingRow>

              {/* Aspect Ratio */}
              <SettingRow icon={<Square size={14} />} label="Aspect Ratio">
                <OptionPills
                  options={ASPECT_RATIO_OPTIONS as unknown as string[]}
                  value={settings.aspect_ratio}
                  onChange={(v) => updateSetting('aspect_ratio', v as ExportSettings['aspect_ratio'])}
                />
              </SettingRow>

              {/* Format */}
              <SettingRow icon={<FileVideo size={14} />} label="Format">
                <SelectDropdown
                  options={FORMAT_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
                  value={settings.format}
                  onChange={(v) => updateSetting('format', v as ExportSettings['format'])}
                />
              </SettingRow>

              {/* Codec */}
              <SettingRow icon={<Zap size={14} />} label="Codec">
                <SelectDropdown
                  options={CODEC_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
                  value={settings.codec}
                  onChange={(v) => updateSetting('codec', v as ExportSettings['codec'])}
                />
              </SettingRow>

              {/* Bitrate */}
              <SettingRow icon={<Zap size={14} />} label="Bitrate">
                <OptionPills
                  options={BITRATE_OPTIONS.map((o) => o.value)}
                  value={settings.bitrate}
                  onChange={(v) => updateSetting('bitrate', v as ExportSettings['bitrate'])}
                />
              </SettingRow>

              {/* Watermark */}
              <SettingRow icon={<Droplets size={14} />} label="Watermark">
                <ToggleSwitch
                  checked={settings.watermark}
                  onChange={(v) => updateSetting('watermark', v)}
                  label={settings.watermark ? 'Enabled' : 'Removed'}
                />
              </SettingRow>
            </div>
          )}

          {phase === 'progress' && (
            <div style={styles.progressSection}>
              <Loader2 size={40} style={{ color: '#38bdf8', animation: 'spin 1s linear infinite' }} />
              <p style={styles.progressLabel}>
                {progress < 10
                  ? 'Preparing export…'
                  : progress < 90
                  ? 'Rendering video…'
                  : progress < 100
                  ? 'Uploading to cloud…'
                  : 'Finishing up…'}
              </p>
              <div style={styles.progressBarBg}>
                <div style={{ ...styles.progressBarFill, width: `${progress}%` }} />
              </div>
              <span style={styles.progressPercent}>{progress}%</span>
            </div>
          )}

          {phase === 'error' && (
            <div style={styles.errorSection}>
              <AlertCircle size={48} style={{ color: '#f87171' }} />
              <p style={styles.errorTitle}>Export Failed</p>
              <p style={styles.errorMsg}>{errorMsg}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={styles.footer}>
          {phase === 'settings' && (
            <>
              <button type="button" style={styles.secondaryBtn} onClick={handleClose}>
                Cancel
              </button>
              <button type="button" style={styles.primaryBtn} onClick={handleStartExport}>
                <Download size={14} />
                <span>Start Export</span>
              </button>
            </>
          )}
          {phase === 'progress' && (
            <button type="button" style={styles.dangerBtn} onClick={handleCancel}>
              Cancel Export
            </button>
          )}
          {phase === 'error' && (
            <>
              <button type="button" style={styles.secondaryBtn} onClick={handleClose}>
                Close
              </button>
              <button type="button" style={styles.primaryBtn} onClick={handleRetry}>
                <RotateCcw size={14} />
                <span>Retry</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Spin animation keyframe (injected once) */}
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

/* ─── Sub-components ─── */

function SettingRow({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div style={styles.settingRow}>
      <div style={styles.settingLabel}>
        {icon}
        <span>{label}</span>
      </div>
      <div style={styles.settingControl}>{children}</div>
    </div>
  );
}

function OptionPills({
  options,
  value,
  onChange,
  suffix,
}: {
  options: string[];
  value: string;
  onChange: (v: string) => void;
  suffix?: string;
}) {
  return (
    <div style={styles.pillsRow}>
      {options.map((opt) => {
        const isActive = opt === value;
        return (
          <button
            key={opt}
            type="button"
            style={{
              ...styles.pill,
              ...(isActive ? styles.pillActive : {}),
            }}
            onClick={() => onChange(opt)}
          >
            {opt}
            {suffix ? ` ${suffix}` : ''}
          </button>
        );
      })}
    </div>
  );
}

function SelectDropdown({
  options,
  value,
  onChange,
}: {
  options: { value: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div style={styles.selectWrapper}>
      <select
        style={styles.select}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown size={14} style={styles.selectIcon} />
    </div>
  );
}

function ToggleSwitch({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      style={{ ...styles.toggle, ...(checked ? styles.toggleOn : {}) }}
      onClick={() => onChange(!checked)}
      aria-pressed={checked}
    >
      <span style={{ ...styles.toggleThumb, ...(checked ? styles.toggleThumbOn : {}) }} />
      <span style={styles.toggleLabel}>{label}</span>
    </button>
  );
}

/* ─── Inline styles (matching editor dark theme) ─── */

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: 'fixed',
    inset: 0,
    zIndex: 9999,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    backdropFilter: 'blur(6px)',
  },
  modal: {
    width: 480,
    maxHeight: '90vh',
    background: 'linear-gradient(165deg, #131C32 0%, #0B1020 100%)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 14,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    boxShadow: '0 24px 80px rgba(0,0,0,0.6)',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px 20px',
    borderBottom: '1px solid rgba(255,255,255,0.06)',
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: 600,
    color: '#F5F8FC',
    letterSpacing: '-0.01em',
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    color: '#8B9BB4',
    cursor: 'pointer',
    padding: 4,
    borderRadius: 6,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'color 0.15s',
  },
  content: {
    flex: 1,
    padding: '20px',
    overflowY: 'auto',
  },
  settingsGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
  },
  settingRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  settingLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    fontSize: 13,
    color: '#8B9BB4',
    minWidth: 110,
    flexShrink: 0,
  },
  settingControl: {
    flex: 1,
    display: 'flex',
    justifyContent: 'flex-end',
  },
  pillsRow: {
    display: 'flex',
    gap: 4,
  },
  pill: {
    padding: '5px 12px',
    fontSize: 12,
    fontWeight: 500,
    color: '#8B9BB4',
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: 6,
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  pillActive: {
    color: '#38bdf8',
    background: 'rgba(56,189,248,0.12)',
    borderColor: 'rgba(56,189,248,0.3)',
  },
  selectWrapper: {
    position: 'relative' as const,
    display: 'inline-flex',
    alignItems: 'center',
  },
  select: {
    appearance: 'none' as const,
    padding: '5px 28px 5px 10px',
    fontSize: 12,
    fontWeight: 500,
    color: '#F5F8FC',
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 6,
    cursor: 'pointer',
    outline: 'none',
    minWidth: 160,
  },
  selectIcon: {
    position: 'absolute' as const,
    right: 8,
    pointerEvents: 'none' as const,
    color: '#8B9BB4',
  },
  toggle: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '4px 10px',
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: 20,
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  toggleOn: {
    background: 'rgba(56,189,248,0.12)',
    borderColor: 'rgba(56,189,248,0.3)',
  },
  toggleThumb: {
    width: 14,
    height: 14,
    borderRadius: '50%',
    background: '#555',
    transition: 'all 0.2s',
    flexShrink: 0,
  },
  toggleThumbOn: {
    background: '#38bdf8',
  },
  toggleLabel: {
    fontSize: 12,
    fontWeight: 500,
    color: '#F5F8FC',
  },
  progressSection: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    padding: '32px 0',
  },
  progressLabel: {
    fontSize: 14,
    color: '#F5F8FC',
    fontWeight: 500,
  },
  progressBarBg: {
    width: '100%',
    height: 8,
    borderRadius: 4,
    background: 'rgba(255,255,255,0.06)',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
    background: 'linear-gradient(90deg, #38bdf8, #818cf8)',
    transition: 'width 0.4s ease',
  },
  progressPercent: {
    fontSize: 24,
    fontWeight: 700,
    color: '#38bdf8',
    fontVariantNumeric: 'tabular-nums',
  },
  doneSection: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    padding: '32px 0',
  },
  doneTitle: {
    fontSize: 18,
    fontWeight: 600,
    color: '#F5F8FC',
  },
  doneSub: {
    fontSize: 13,
    color: '#8B9BB4',
  },
  errorSection: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    padding: '32px 0',
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: 600,
    color: '#f87171',
  },
  errorMsg: {
    fontSize: 13,
    color: '#8B9BB4',
    textAlign: 'center',
    maxWidth: 320,
    lineHeight: '1.5',
  },
  footer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 8,
    padding: '14px 20px',
    borderTop: '1px solid rgba(255,255,255,0.06)',
  },
  secondaryBtn: {
    padding: '7px 16px',
    fontSize: 13,
    fontWeight: 500,
    color: '#8B9BB4',
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 8,
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  primaryBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '7px 18px',
    fontSize: 13,
    fontWeight: 600,
    color: '#0B1020',
    background: 'linear-gradient(135deg, #38bdf8, #818cf8)',
    border: 'none',
    borderRadius: 8,
    cursor: 'pointer',
    transition: 'all 0.15s',
    boxShadow: '0 2px 12px rgba(56,189,248,0.3)',
  },
  dangerBtn: {
    padding: '7px 18px',
    fontSize: 13,
    fontWeight: 500,
    color: '#fca5a5',
    background: 'rgba(248,113,113,0.1)',
    border: '1px solid rgba(248,113,113,0.2)',
    borderRadius: 8,
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
};
