import React from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { User as UserIcon, Mail, ShieldCheck, Calendar } from 'lucide-react';

export function ProfilePage() {
  const { user, userProfile } = useAuth();

  const name = userProfile?.display_name || user?.user_metadata?.full_name || user?.user_metadata?.name || 'Creator';
  const email = user?.email || 'No email provided';
  const avatarUrl = userProfile?.avatar_url || user?.user_metadata?.avatar_url || user?.user_metadata?.picture;
  const provider = user?.app_metadata?.provider || (user?.app_metadata?.providers?.[0] || 'email');
  const createdAt = user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A';

  const getInitials = (n?: string, e?: string) => {
    if (n && n.trim()) return n.substring(0, 2).toUpperCase();
    if (e && e.trim()) return e.substring(0, 2).toUpperCase();
    return 'VX';
  };

  return (
    <div className="px-4 md:px-6 xl:px-8 py-8 w-full max-w-3xl mx-auto flex flex-col h-full">
      <h1 className="text-2xl md:text-[32px] font-display font-bold text-foreground mb-8">User Profile</h1>

      <div className="glass rounded-3xl p-6 md:p-10 shadow-elegant border border-border flex flex-col md:flex-row items-start gap-8">
        <div className="flex-shrink-0">
          {avatarUrl ? (
            <img src={avatarUrl} alt="Avatar" className="w-24 h-24 rounded-2xl object-cover border border-border shadow-sm" />
          ) : (
            <div className="w-24 h-24 rounded-2xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center text-2xl font-bold font-mono">
              {getInitials(name, email)}
            </div>
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
