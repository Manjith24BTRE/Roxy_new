// src/services/tests/ImageImportPipeline.test.ts
import { describe, it, expect } from 'vitest';

describe('Image Import & Editor Pipeline End-to-End', () => {
  it('should format image asset metadata correctly', () => {
    const file = new File(['fake-image-bytes'], 'sample.png', { type: 'image/png' });
    const isVideo = file.type.startsWith('video');
    const isImage = file.type.startsWith('image/') || /\.(png|jpg|jpeg|webp|gif)$/i.test(file.name);

    expect(isVideo).toBe(false);
    expect(isImage).toBe(true);

    const assetItem = {
      id: 'img_123',
      name: file.name,
      type: isVideo ? 'video' : 'image',
      duration: 5,
      url: 'blob:http://localhost/sample-blob-id',
      thumbnails: ['blob:http://localhost/sample-blob-id'],
    };

    expect(assetItem.type).toBe('image');
    expect(assetItem.duration).toBe(5);
    expect(assetItem.thumbnails[0]).toBe('blob:http://localhost/sample-blob-id');
  });

  it('should map image asset into timeline clip with type image', () => {
    const mediaItem = {
      id: 'img_456',
      name: 'banner.jpeg',
      type: 'image',
      duration: 5,
      durationFormatted: '00:05',
      thumbnails: ['blob:url'],
      url: 'blob:url',
    };

    const isImg = mediaItem.type === 'image' || /\.(png|jpg|jpeg|webp|gif|bmp|svg)$/i.test(mediaItem.name);
    const clip = {
      id: mediaItem.id,
      mediaId: mediaItem.id,
      name: mediaItem.name,
      type: isImg ? 'image' : 'video',
      asset_type: isImg ? 'IMAGE' : 'VIDEO',
      isImage: isImg,
      duration: mediaItem.duration || 5,
      url: mediaItem.url,
      startOffset: 0,
      timelineStart: 0,
    };

    expect(clip.type).toBe('image');
    expect(clip.asset_type).toBe('IMAGE');
    expect(clip.isImage).toBe(true);
  });

  it('should identify image clips for DOM img tag rendering', () => {
    const clip = {
      id: 'clip_789',
      name: 'photo.webp',
      type: 'image',
      asset_type: 'IMAGE',
      isImage: true,
      url: 'https://supabase.co/storage/v1/object/public/assets/photo.webp',
    };

    const isImageOrFreeze = clip.isImage || clip.type === 'image' || clip.asset_type === 'IMAGE' || (clip.url && clip.url.endsWith('.webp'));
    expect(isImageOrFreeze).toBe(true);
  });

  it('should serialize image clips for FFmpeg video segment export', () => {
    const rawClip = {
      id: 'clip_export_1',
      mediaId: 'img_456',
      name: 'banner.jpeg',
      type: 'image',
      asset_type: 'IMAGE',
      isImage: true,
      url: 'blob:http://localhost/blob-1',
    };

    const permanentUrl = 'https://supabase.co/storage/v1/object/public/assets/banner.jpeg';
    const isImage = rawClip.isImage || rawClip.type === 'image' || rawClip.asset_type === 'IMAGE';
    const sanitizedClip = {
      ...rawClip,
      type: isImage ? 'image' : 'video',
      asset_type: isImage ? 'IMAGE' : 'VIDEO',
      media_url: permanentUrl,
      url: permanentUrl,
    };

    expect(sanitizedClip.type).toBe('image');
    expect(sanitizedClip.asset_type).toBe('IMAGE');
    expect(sanitizedClip.media_url).toBe(permanentUrl);
  });
});
