import React, { createContext, useContext, useState } from 'react';
import { uploadAsset } from '../services/asset.service';

export interface MediaItem {
  id: string;
  file: File;
  url: string; // Blob URL for immediate local preview
  serverUrl?: string; // Permanent Supabase storage URL
  name: string;
  size: string;
  type: 'video' | 'image';
  duration: number;
  durationFormatted: string;
  thumbnails: string[];
  uploadStatus?: 'uploading' | 'completed' | 'error';
}

interface ProjectMediaContextType {
  projectId: string;
  projectTitle: string;
  setProjectTitle: (title: string) => void;
  mediaFiles: MediaItem[];
  activeMediaId: string | null;
  addMediaFiles: (files: File[]) => Promise<void>;
  removeMediaFile: (id: string) => void;
  updateMediaName: (id: string, name: string) => void;
  setActiveMediaId: (id: string | null) => void;
  clearMedia: () => void;
  getPermanentMediaUrl: (mediaIdOrUrl: string) => Promise<string>;
}

const ProjectMediaContext = createContext<ProjectMediaContextType | undefined>(undefined);

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

// Generate thumbnail frames using client-side HTML5 canvas
async function generateVideoThumbnails(url: string, duration: number, count: number = 4): Promise<string[]> {
  return new Promise((resolve) => {
    const video = document.createElement('video');
    video.src = url;
    video.crossOrigin = 'anonymous';
    video.muted = true;
    video.currentTime = 0.5;

    const thumbnails: string[] = [];
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    video.onloadeddata = async () => {
      canvas.width = 160;
      canvas.height = 90;
      const step = Math.max(1, (duration || 5) / count);

      for (let i = 0; i < count; i++) {
        video.currentTime = Math.min(duration - 0.1, i * step + 0.5);
        await new Promise((res) => {
          video.onseeked = res;
        });
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          thumbnails.push(canvas.toDataURL('image/jpeg', 0.6));
        }
      }
      resolve(thumbnails.length > 0 ? thumbnails : [url]);
    };

    video.onerror = () => {
      resolve([url]);
    };
  });
}

export const ProjectMediaProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [projectId] = useState<string>(() => crypto.randomUUID());
  const [projectTitle, setProjectTitle] = useState<string>('My Project');
  const [mediaFiles, setMediaFiles] = useState<MediaItem[]>([]);
  const [activeMediaId, setActiveMediaId] = useState<string | null>(null);

  const addMediaFiles = async (files: File[]) => {
    const newItems: MediaItem[] = [];

    for (const file of files) {
      const isVideo = file.type.startsWith('video');
      const blobUrl = URL.createObjectURL(file);
      let duration = 5;

      if (isVideo) {
        duration = await new Promise<number>((resolve) => {
          const tempVid = document.createElement('video');
          tempVid.src = blobUrl;
          tempVid.onloadedmetadata = () => resolve(tempVid.duration || 5);
          tempVid.onerror = () => resolve(5);
        });
      }

      const thumbnails = isVideo
        ? await generateVideoThumbnails(blobUrl, duration, 4)
        : [blobUrl];

      const itemId = Math.random().toString(36).substring(2, 9);
      const item: MediaItem = {
        id: itemId,
        file,
        url: blobUrl,
        name: file.name,
        size: formatFileSize(file.size),
        type: isVideo ? 'video' : 'image',
        duration,
        durationFormatted: formatDuration(duration),
        thumbnails,
        uploadStatus: 'uploading',
      };

      newItems.push(item);

      // Trigger immediate background upload to Supabase Storage
      uploadAsset(file, isVideo ? 'VIDEO' : 'IMAGE')
        .then((result) => {
          setMediaFiles((prev) =>
            prev.map((m) =>
              m.id === itemId
                ? { ...m, serverUrl: result.file_url, uploadStatus: 'completed' }
                : m
            )
          );
        })
        .catch((err) => {
          console.warn('Background media asset upload warning:', err);
          setMediaFiles((prev) =>
            prev.map((m) => (m.id === itemId ? { ...m, uploadStatus: 'error' } : m))
          );
        });
    }

    setMediaFiles((prev) => {
      const updated = [...prev, ...newItems];
      if (!activeMediaId && updated.length > 0) {
        setActiveMediaId(updated[0].id);
      }
      return updated;
    });
  };

  const getPermanentMediaUrl = async (mediaIdOrUrl: string): Promise<string> => {
    const target = mediaFiles.find(
      (m) => m.id === mediaIdOrUrl || m.url === mediaIdOrUrl || m.serverUrl === mediaIdOrUrl
    );
    if (!target) return mediaIdOrUrl;

    if (target.serverUrl) return target.serverUrl;

    // If upload is still in progress or hasn't run, upload now
    try {
      const result = await uploadAsset(target.file, target.type === 'video' ? 'VIDEO' : 'IMAGE');
      target.serverUrl = result.file_url;
      target.uploadStatus = 'completed';
      setMediaFiles((prev) =>
        prev.map((m) => (m.id === target.id ? { ...m, serverUrl: result.file_url, uploadStatus: 'completed' } : m))
      );
      return result.file_url;
    } catch {
      return mediaIdOrUrl;
    }
  };

  const updateMediaName = (id: string, name: string) => {
    setMediaFiles((prev) =>
      prev.map((item) => (item.id === id ? { ...item, name } : item))
    );
  };

  const removeMediaFile = (id: string) => {
    setMediaFiles((prev) => {
      const filtered = prev.filter((item) => item.id !== id);
      if (activeMediaId === id) {
        setActiveMediaId(filtered.length > 0 ? filtered[0].id : null);
      }
      return filtered;
    });
  };

  const clearMedia = () => {
    setMediaFiles([]);
    setActiveMediaId(null);
  };

  return (
    <ProjectMediaContext.Provider
      value={{
        projectId,
        projectTitle,
        setProjectTitle,
        mediaFiles,
        activeMediaId,
        addMediaFiles,
        removeMediaFile,
        updateMediaName,
        setActiveMediaId,
        clearMedia,
        getPermanentMediaUrl,
      }}
    >
      {children}
    </ProjectMediaContext.Provider>
  );
};

export function useProjectMedia() {
  const context = useContext(ProjectMediaContext);
  if (!context) {
    throw new Error('useProjectMedia must be used within a ProjectMediaProvider');
  }
  return context;
}
