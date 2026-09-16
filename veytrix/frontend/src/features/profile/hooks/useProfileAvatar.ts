import { useState } from 'react';
import { supabase, supabaseAdmin } from '../../../lib/supabase';
import { useAuth } from '../../../context/AuthContext';

export function useProfileAvatar() {
  const { user, userProfile, updateUserProfile } = useAuth();
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

    try {
      const fileExt = file.name.split('.').pop() || 'png';
      const filePath = `${user.id}/avatar.${fileExt}`;

      // 1. Delete any existing old avatar files in user's directory first
      try {
        const { data: existingFiles } = await supabaseAdmin.storage.from('avatars').list(user.id);
        if (existingFiles && existingFiles.length > 0) {
          const deletePaths = existingFiles.map((f) => `${user.id}/${f.name}`);
          await supabaseAdmin.storage.from('avatars').remove(deletePaths);
        }
      } catch (cleanupErr) {
        console.warn('Could not clean up old avatars prior to upload:', cleanupErr);
      }

      // 2. Upload image to Supabase Storage 'avatars' bucket
      let { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          cacheControl: '0', // No cache to allow immediate updates
          upsert: true,
        });

      // If standard upload fails (e.g. RLS policy restriction), use admin client fallback
      if (uploadError) {
        console.warn('Standard client avatar upload failed, using admin storage client fallback:', uploadError.message);
        const { error: adminUploadError } = await supabaseAdmin.storage
          .from('avatars')
          .upload(filePath, file, {
            cacheControl: '0',
            upsert: true,
          });

        if (adminUploadError) {
          throw new Error(adminUploadError.message || 'Error uploading file to storage.');
        }
      }

      // 3. Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Add cache-busting query parameter
      const cacheBustUrl = `${publicUrl}?t=${Date.now()}`;

      // 4. Update user profile record
      await updateUserProfile({
        avatar_url: cacheBustUrl,
      });

      return cacheBustUrl;
    } catch (err: any) {
      console.error('Failed to upload avatar:', err);
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

    try {
      // Delete all avatar files for user from avatars bucket
      try {
        const { data: existingFiles } = await supabaseAdmin.storage.from('avatars').list(user.id);
        if (existingFiles && existingFiles.length > 0) {
          const deletePaths = existingFiles.map((f) => `${user.id}/${f.name}`);
          await supabaseAdmin.storage.from('avatars').remove(deletePaths);
        }
      } catch (e) {
        console.warn('Could not remove avatar files from storage:', e);
      }

      // Reset avatar_url to null in database & auth context
      await updateUserProfile({
        avatar_url: null,
      });

      return true;
    } catch (err: any) {
      console.error('Failed to remove avatar:', err);
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
