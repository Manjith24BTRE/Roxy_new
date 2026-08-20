import React, { useRef, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { User as UserIcon, Mail, ShieldCheck, Calendar, Camera, Trash2, Loader2, Check, X } from 'lucide-react';
import { Avatar } from '../components/Avatar';
import { useProfileAvatar } from '../hooks/useProfileAvatar';

export function ProfilePage() {
  const { user, userProfile } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadAvatar, removeAvatar, isUploading, error: uploadError } = useProfileAvatar();
  
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const name = userProfile?.display_name || user?.user_metadata?.full_name || user?.user_metadata?.name || 'Creator';
  const email = user?.email || 'No email provided';
  const avatarUrl = userProfile?.avatar_url || user?.user_metadata?.avatar_url || user?.user_metadata?.picture;
  const provider = user?.app_metadata?.provider || (user?.app_metadata?.providers?.[0] || 'email');
  const createdAt = user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A';

  const handleAvatarClick = () => {
    if (isUploading) return;
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleConfirmUpload = async () => {
    if (selectedFile) {
      await uploadAvatar(selectedFile);
      handleCancelPreview();
    }
  };

  const handleCancelPreview = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemovePhoto = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to remove your profile picture?')) {
      await removeAvatar();
    }
  };

  return (
    <div className="px-4 md:px-6 xl:px-8 py-8 w-full max-w-3xl mx-auto flex flex-col h-full">
      <h1 className="text-2xl md:text-[32px] font-display font-bold text-foreground mb-8">User Profile</h1>

      <div className="glass rounded-3xl p-6 md:p-10 shadow-elegant border border-border flex flex-col md:flex-row items-start gap-8">
        <div className="flex flex-col items-center gap-4 flex-shrink-0">
          <div 
            onClick={handleAvatarClick}
            className="group relative cursor-pointer select-none overflow-hidden rounded-[24px] border border-border/60 shadow-sm"
          >
            {/* Real Avatar or Fallback Preview */}
            <Avatar 
              src={previewUrl || avatarUrl} 
              name={name} 
              size="xl" 
            />

            {/* Hover overlay for Uploading / Camera Action */}
            <div className="absolute inset-0 bg-[#1D2B64]/65 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white transition-opacity duration-200 gap-1 rounded-[24px]">
              <Camera size={20} className="text-white" />
              <span className="text-[10px] font-bold uppercase tracking-wider">Change</span>
            </div>

            {/* Loading Overlay */}
            {isUploading && (
              <div className="absolute inset-0 bg-[#1D2B64]/80 flex flex-col items-center justify-center text-white gap-1 rounded-[24px]">
                <Loader2 size={22} className="animate-spin text-white" />
                <span className="text-[9px] font-bold uppercase tracking-wider">Uploading</span>
              </div>
            )}
          </div>

          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange}
            accept="image/jpeg, image/png, image/webp" 
            className="hidden" 
          />

          {/* Action Buttons for Confirming Previews or Removing Current Image */}
          {previewUrl ? (
            <div className="flex items-center gap-2 animate-in fade-in duration-200">
              <button
                type="button"
                onClick={handleConfirmUpload}
                className="p-1.5 rounded-lg bg-emerald-500 text-white hover:bg-emerald-600 transition shadow-sm cursor-pointer"
                title="Confirm Upload"
              >
                <Check size={14} />
              </button>
              <button
                type="button"
                onClick={handleCancelPreview}
                className="p-1.5 rounded-lg bg-red-500 text-white hover:bg-red-600 transition shadow-sm cursor-pointer"
                title="Cancel"
              >
                <X size={14} />
              </button>
            </div>
          ) : (
            avatarUrl && (
              <button
                type="button"
                onClick={handleRemovePhoto}
                disabled={isUploading}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-red-500/10 hover:bg-red-500/5 text-red-500 hover:text-red-600 text-[10px] font-bold transition cursor-pointer disabled:opacity-50"
              >
                <Trash2 size={12} />
                <span>Remove Photo</span>
              </button>
            )
          )}

          {uploadError && (
            <span className="text-[9px] text-red-500 font-semibold max-w-[120px] text-center mt-1">
              ⚠️ {uploadError}
            </span>
          )}
        </div>

        <div className="flex-1 w-full space-y-5">
          <div>
            <label className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
              <UserIcon size={14} /> Full Name
            </label>
            <div className="text-base font-medium text-foreground bg-surface/50 px-4 py-3 rounded-xl border border-border">
              {name}
            </div>
          </div>

          <div>
            <label className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
              <Mail size={14} /> Email Address
            </label>
            <div className="text-base font-medium text-foreground bg-surface/50 px-4 py-3 rounded-xl border border-border">
              {email}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                <ShieldCheck size={14} /> Provider
              </label>
              <div className="text-sm font-medium text-foreground bg-surface/50 px-4 py-2.5 rounded-xl border border-border capitalize">
                {provider}
              </div>
            </div>

            <div>
              <label className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                <Calendar size={14} /> Joined
              </label>
              <div className="text-sm font-medium text-foreground bg-surface/50 px-4 py-2.5 rounded-xl border border-border">
                {createdAt}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
