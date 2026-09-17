import { useState } from 'react';
import { supabase, supabaseAdmin } from '../../../lib/supabase';
import { useAuth } from '../../../context/AuthContext';

export function useProfileAvatar() {
  const { user, updateUserProfile } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadAvatar = async (file: File): Promise<string | null> => {
    if (!user) {
      setError('You must be logged in to upload a profile picture.');
      return null;
    }

    // Validate File Type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setError('Invalid file type. Please upload a JPG, PNG, or WebP image.');
      return null;
    }

    // Validate File Size (5MB limit)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setError('File size too large. Maximum size allowed is 5MB.');
      return null;
    }

    setIsUploading(true);
    setError(null);
    console.log(`[AVATAR] Upload Started for user_id='${user.id}', filename='${file.name}'`);

    try {
      const fileExt = file.name.split('.').pop()?.toLowerCase() || 'png';
      const filePath = `${user.id}/avatar.${fileExt}`;

      // 1. Clean up existing old avatar files in user's directory first
      try {
        const { data: existingFiles } = await supabaseAdmin.storage.from('avatars').list(user.id);
        if (existingFiles && existingFiles.length > 0) {
          const deletePaths = existingFiles.map((f) => `${user.id}/${f.name}`);
          await supabaseAdmin.storage.from('avatars').remove(deletePaths);
        }
      } catch (cleanupErr) {
        console.warn('[AVATAR] Old file cleanup warning:', cleanupErr);
      }

      // 2. Upload image to Supabase Storage 'avatars' bucket
      let { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
        });

      if (uploadError) {
        console.warn('[AVATAR] Standard client upload failed, using admin storage fallback:', uploadError.message);
        const { error: adminUploadError } = await supabaseAdmin.storage
          .from('avatars')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: true,
          });

        if (adminUploadError) {
          throw new Error(adminUploadError.message || 'Error uploading file to storage.');
        }
      }

      console.log('[AVATAR] Upload Success to storage path:', filePath);

      // 3. Obtain stable public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Versioned cache buster for instant component update
      const versionedUrl = `${publicUrl}?v=${Date.now()}`;

      // 4. Update user profile database row and auth metadata
      const updatedProfile = await updateUserProfile({
        avatar_url: versionedUrl,
      });

      if (!updatedProfile) {
        throw new Error('Failed to persist avatar_url to database profile.');
      }

      console.log('[AVATAR] URL Saved permanently to database:', versionedUrl);
      return versionedUrl;
    } catch (err: any) {
      console.error('[AVATAR] Upload Failed:', err);
      setError(err.message || 'An error occurred during avatar upload.');
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const removeAvatar = async (): Promise<boolean> => {
    if (!user) return false;
    setIsUploading(true);
    setError(null);
    console.log(`[AVATAR] Remove Avatar requested for user_id='${user.id}'`);

    try {
      // 1. Delete all storage files for user from avatars bucket
      try {
        const { data: existingFiles } = await supabaseAdmin.storage.from('avatars').list(user.id);
        if (existingFiles && existingFiles.length > 0) {
          const deletePaths = existingFiles.map((f) => `${user.id}/${f.name}`);
          await supabaseAdmin.storage.from('avatars').remove(deletePaths);
        }
      } catch (e) {
        console.warn('[AVATAR] Storage remove warning:', e);
      }

      // 2. Set avatar_url = null in profiles table & auth metadata
      await updateUserProfile({
        avatar_url: null,
      });

      console.log('[AVATAR] Avatar Removed successfully');
      return true;
    } catch (err: any) {
      console.error('[AVATAR] Remove Avatar error:', err);
      setError(err.message || 'An error occurred while removing the avatar.');
      return false;
    } finally {
      setIsUploading(false);
    }
  };

  return {
    uploadAvatar,
    removeAvatar,
    isUploading,
    error,
  };
}
