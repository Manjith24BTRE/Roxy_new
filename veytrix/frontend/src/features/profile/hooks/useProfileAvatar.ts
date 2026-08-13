import { useState } from 'react';
import { supabase } from '../../../lib/supabase';
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
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      // Upload image to Supabase Storage 'avatars' bucket
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
        });

      if (uploadError) {
        throw new Error(uploadError.message || 'Error uploading file to storage.');
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Update user profile record
      await updateUserProfile({
        avatar_url: publicUrl,
      });

      return publicUrl;
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
      // If there is an existing avatar, delete it from storage
      if (userProfile?.avatar_url) {
        const urlParts = userProfile.avatar_url.split('/avatars/');
        if (urlParts.length > 1) {
          const filePath = decodeURIComponent(urlParts[1]);
          await supabase.storage.from('avatars').remove([filePath]).catch((e) => {
            console.warn('Could not delete old avatar file:', e);
          });
        }
      }

      // Reset avatar_url to null in database
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
