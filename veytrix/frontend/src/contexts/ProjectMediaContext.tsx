import React, { createContext, useContext, useState } from 'react';

export interface MediaItem {
  id: string;
  file: File;
  url: string;
  name: string;
  size: string;
  type: 'video' | 'image';
  duration: number;
  durationFormatted: string;
  thumbnails: string[];
}

interface ProjectMediaContextType {
  mediaFiles: MediaItem[];
  activeMediaId: string | null;
  addMediaFiles: (files: File[]) => Promise<void>;
  removeMediaFile: (id: string) => void;
  updateMediaName: (id: string, name: string) => void;
  setActiveMediaId: (id: string | null) => void;
  clearMedia: () => void;
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
  const [mediaFiles, setMediaFiles] = useState<MediaItem[]>([]);
  const [activeMediaId, setActiveMediaId] = useState<string | null>(null);

  const addMediaFiles = async (files: File[]) => {
    const newItems: MediaItem[] = [];

    for (const file of files) {
      const isVideo = file.type.startsWith('video');
      const url = URL.createObjectURL(file);
      let duration = 5;

      if (isVideo) {
        duration = await new Promise<number>((resolve) => {
          const tempVid = document.createElement('video');
          tempVid.src = url;
          tempVid.onloadedmetadata = () => resolve(tempVid.duration || 5);
          tempVid.onerror = () => resolve(5);
        });
      }

      const thumbnails = isVideo
        ? await generateVideoThumbnails(url, duration, 4)
        : [url];

      const item: MediaItem = {
        id: Math.random().toString(36).substring(2, 9),
        file,
        url,
        name: file.name,
        size: formatFileSize(file.size),
        type: isVideo ? 'video' : 'image',
        duration,
        durationFormatted: formatDuration(duration),
        thumbnails,
      };

      newItems.push(item);
    }

    setMediaFiles((prev) => {
      const updated = [...prev, ...newItems];
      if (!activeMediaId && updated.length > 0) {
        setActiveMediaId(updated[0].id);
      }
      return updated;
    });
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
        mediaFiles,
        activeMediaId,
        addMediaFiles,
        removeMediaFile,
        updateMediaName,
        setActiveMediaId,
        clearMedia,
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
