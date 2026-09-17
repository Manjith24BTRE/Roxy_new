import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, supabaseAdmin } from '../lib/supabase';

export interface UserProfileData {
  id: string;
  email: string | null;
  display_name: string | null;
  full_name?: string | null;
  avatar_url: string | null;
  username?: string | null;
  phone?: string | null;
  country?: string | null;
  language?: string | null;
  timezone?: string | null;
  bio?: string | null;
  occupation?: string | null;
  company?: string | null;
  website?: string | null;
  portfolio?: string | null;
  social_links?: Record<string, string> | null;
  socialLinks?: Record<string, string> | null;
  workspace_settings?: { autoSave: boolean; autoRecovery: boolean } | null;
  notification_settings?: { desktop: boolean; email: boolean; updates: boolean; completion: boolean; marketing: boolean } | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface SignUpResult {
  session: Session | null;
  user: User | null;
  isExistingUser?: boolean;
}

type AuthModalMode = 'signin' | 'signup' | 'forgot' | null;

export const CONTROLLER_EMAIL = 'official@mavrostech.in';

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  userProfile: UserProfileData | null;
  isSignedIn: boolean;
  isLoading: boolean;
  role: 'user' | 'controller' | null;
  
  authModalMode: AuthModalMode;
  isAuthModalOpen: boolean;
  openAuthModal: (mode: AuthModalMode) => void;
  closeAuthModal: () => void;
  redirectAfterLogin: string | null;
  setRedirectAfterLogin: (path: string | null) => void;

  signInWithEmail: (email: string, password: string, rememberMe?: boolean) => Promise<User | undefined>;
  signUpWithEmail: (email: string, password: string, fullName: string) => Promise<SignUpResult>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  syncProfile: () => Promise<UserProfileData | null>;
  updateUserProfile: (data: Partial<UserProfileData>) => Promise<UserProfileData | null>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  session: null,
  userProfile: null,
  isSignedIn: false,
  isLoading: true,
  role: null,
  authModalMode: null,
  isAuthModalOpen: false,
  openAuthModal: () => {},
  closeAuthModal: () => {},
  redirectAfterLogin: null,
  setRedirectAfterLogin: () => {},
  signInWithEmail: async () => undefined,
  signUpWithEmail: async () => ({ session: null, user: null }),
  signInWithGoogle: async () => {},
  signOut: async () => {},
  resetPassword: async () => {},
  syncProfile: async () => null,
  updateUserProfile: async () => null,
});

function computeRole(user: User | null): 'user' | 'controller' | null {
  if (!user) return null;
  return user.email?.toLowerCase() === CONTROLLER_EMAIL ? 'controller' : 'user';
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userProfile, setUserProfileState] = useState<UserProfileData | null>(() => {
    try {
      const stored = localStorage.getItem('veytrix_user_profile');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const setUserProfile = useCallback((profileOrUpdater: UserProfileData | null | ((prev: UserProfileData | null) => UserProfileData | null)) => {
    setUserProfileState(prev => {
      const next = typeof profileOrUpdater === 'function' ? profileOrUpdater(prev) : profileOrUpdater;
      if (next) {
        try { localStorage.setItem('veytrix_user_profile', JSON.stringify(next)); } catch {}
      } else {
        try { localStorage.removeItem('veytrix_user_profile'); } catch {}
      }
      return next;
    });
  }, []);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [authModalMode, setAuthModalMode] = useState<AuthModalMode>(null);
  const [redirectAfterLogin, setRedirectAfterLogin] = useState<string | null>(null);

  const openAuthModal = useCallback((mode: AuthModalMode) => {
    setAuthModalMode(mode);
  }, []);

  const closeAuthModal = useCallback(() => {
    setAuthModalMode(null);
  }, []);

  const syncInProgressRef = useRef<boolean>(false);
  const lastSyncedUserIdRef = useRef<string | null>(null);

  const syncProfile = useCallback(async (): Promise<UserProfileData | null> => {
    if (syncInProgressRef.current) return null;
    syncInProgressRef.current = true;

    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser) {
        setUserProfile(null);
        lastSyncedUserIdRef.current = null;
        return null;
      }

      console.log(`[AVATAR] Fetching profile from database for user_id='${currentUser.id}'`);

      // Query profiles table from database
      let dbProfile: any = null;
      const { data: dbProfileData, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', currentUser.id)
        .maybeSingle();

      if (dbProfileData) {
        dbProfile = dbProfileData;
      } else {
        // Fallback query via admin client if regular RLS returns empty
        try {
          const { data: adminDbData } = await supabaseAdmin
            .from('profiles')
            .select('*')
            .eq('user_id', currentUser.id)
            .maybeSingle();
          if (adminDbData) dbProfile = adminDbData;
        } catch (adminErr) {
          console.warn('[AVATAR] Admin profile fetch warning:', adminErr);
        }
      }

      if (!dbProfile && !fetchError) {
        // Create initial profile record if none exists
        const newProfile = {
          user_id: currentUser.id,
          display_name: currentUser.user_metadata?.full_name || currentUser.user_metadata?.name || 'Mavros Member',
          avatar_url: currentUser.user_metadata?.avatar_url || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        const { data: insertedData } = await supabase
          .from('profiles')
          .upsert(newProfile, { onConflict: 'user_id' })
          .select()
          .maybeSingle();
        dbProfile = insertedData || newProfile;
      }

      const meta = currentUser.user_metadata || {};
      
      // Determine single source of truth for avatar_url
      // Priority: DB profile avatar_url -> Auth metadata avatar_url -> Cached profile avatar_url
      const resolvedAvatarUrl =
        dbProfile?.avatar_url ??
        meta.avatar_url ??
        (userProfile?.id === currentUser.id ? userProfile?.avatar_url : null);

      console.log(`[AVATAR] Loaded From Database: avatar_url='${resolvedAvatarUrl}'`);

      const profileData: UserProfileData = {
        id: currentUser.id,
        email: currentUser.email || null,
        display_name: dbProfile?.display_name || meta.full_name || meta.name || 'Mavros Member',
        avatar_url: resolvedAvatarUrl,
        username: meta.username || null,
        phone: meta.phone || null,
        country: meta.country || null,
        language: meta.language || 'English (US)',
        timezone: meta.timezone || 'UTC+5:30 (IST)',
        bio: meta.bio || null,
        occupation: meta.occupation || null,
        company: meta.company || null,
        website: meta.website || null,
        portfolio: meta.portfolio || null,
        social_links: meta.social_links || {},
        socialLinks: meta.social_links || {},
        workspace_settings: meta.workspace_settings || { autoSave: true, autoRecovery: true },
        notification_settings: meta.notification_settings || { desktop: true, email: true, updates: true, completion: true, marketing: false },
        created_at: dbProfile?.created_at || currentUser.created_at || null,
        updated_at: dbProfile?.updated_at || null,
      };

      setUserProfile(profileData);
      lastSyncedUserIdRef.current = currentUser.id;
      return profileData;
    } catch (err) {
      console.error('[AVATAR] Profile sync error:', err);
    } finally {
      syncInProgressRef.current = false;
    }
    return null;
  }, [setUserProfile, userProfile]);

  // Realtime subscription to profiles table for instant avatar & name updates
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel(`profile_realtime_${user.id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'profiles', filter: `user_id=eq.${user.id}` },
        (payload: any) => {
          console.log('[AVATAR] Realtime profile update received:', payload);
          if (payload.new && payload.new.avatar_url !== undefined) {
            setUserProfile((prev) => prev ? { ...prev, avatar_url: payload.new.avatar_url } : null);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, setUserProfile]);

  useEffect(() => {
    let isMounted = true;

    // Restore initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!isMounted) return;

      if (session) {
        setSession(session);
        setUser(session.user);
        if (lastSyncedUserIdRef.current !== session.user.id) {
          syncProfile();
        }
      } else {
        setSession(null);
        setUser(null);
        setUserProfile(null);
        lastSyncedUserIdRef.current = null;
      }
      setIsLoading(false);
    });

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!isMounted) return;

      if (session) {
        setSession(session);
        setUser(session.user);
        if (event === 'SIGNED_IN' || event === 'USER_UPDATED' || lastSyncedUserIdRef.current !== session.user.id) {
          await syncProfile();
        }
      } else {
        setSession(null);
        setUser(null);
        setUserProfile(null);
        lastSyncedUserIdRef.current = null;
      }
      setIsLoading(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [syncProfile, setUserProfile]);

  const signInWithEmail = useCallback(async (email: string, password: string, rememberMe: boolean = true) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      setSession(data.session);
      setUser(data.user);
      if (data.session) {
        await syncProfile();
      }
      return data.user;
    } finally {
      setIsLoading(false);
    }
  }, [syncProfile]);

  const signUpWithEmail = useCallback(async (email: string, password: string, fullName: string): Promise<SignUpResult> => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            name: fullName,
          },
        },
      });

      if (error) {
        throw error;
      }

      const isExistingUser = !!(
        data.user &&
        Array.isArray(data.user.identities) &&
        data.user.identities.length === 0
      );

      if (data.session) {
        setSession(data.session);
        setUser(data.user);
        await syncProfile();
      }

      return { session: data.session, user: data.user, isExistingUser };
    } finally {
      setIsLoading(false);
    }
  }, [syncProfile]);

  const signInWithGoogle = useCallback(async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/home`,
      },
    });
    if (error) throw error;
  }, []);

  const signOut = useCallback(async () => {
    const currentRole = computeRole(user);
    setIsLoading(true);
    try {
      await supabase.auth.signOut({ scope: 'global' });
      
      setSession(null);
      setUser(null);
      setUserProfile(null);
      
      window.location.href = currentRole === 'controller' ? '/' : '/login';
    } catch (error) {
      console.error('Logout error:', error);
      setIsLoading(false);
    }
  }, [user]);

  const resetPassword = useCallback(async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/`,
    });
    if (error) throw error;
  }, []);

  const updateUserProfile = useCallback(async (data: Partial<UserProfileData>): Promise<UserProfileData | null> => {
    const { data: { user: currentUser } } = await supabase.auth.getUser();
    if (!currentUser) throw new Error('Not authenticated');

    console.log(`[AVATAR] Updating user profile database row for user_id='${currentUser.id}'`, data);

    // 1. Guaranteed UPSERT into profiles table so row is created if non-existent
    const dbPayload: any = {
      user_id: currentUser.id,
      updated_at: new Date().toISOString(),
    };
    if (data.display_name !== undefined) dbPayload.display_name = data.display_name;
    if (data.avatar_url !== undefined) dbPayload.avatar_url = data.avatar_url;

    const { error: dbError } = await supabase
      .from('profiles')
      .upsert(dbPayload, { onConflict: 'user_id' });

    if (dbError) {
      console.warn('[AVATAR] Standard client profiles upsert failed, using admin fallback:', dbError.message);
      const { error: adminError } = await supabaseAdmin
        .from('profiles')
        .upsert(dbPayload, { onConflict: 'user_id' });

      if (adminError) {
        console.error('[AVATAR] Admin profiles upsert error:', adminError);
      }
    }

    // 2. Update auth user metadata
    const metaPayload: any = {};
    if (data.display_name !== undefined) {
      metaPayload.full_name = data.display_name;
      metaPayload.name = data.display_name;
    }
    if (data.avatar_url !== undefined) metaPayload.avatar_url = data.avatar_url;
    if (data.username !== undefined) metaPayload.username = data.username;
    if (data.phone !== undefined) metaPayload.phone = data.phone;
    if (data.country !== undefined) metaPayload.country = data.country;
    if (data.language !== undefined) metaPayload.language = data.language;
    if (data.timezone !== undefined) metaPayload.timezone = data.timezone;
    if (data.bio !== undefined) metaPayload.bio = data.bio;
    if (data.occupation !== undefined) metaPayload.occupation = data.occupation;
    if (data.company !== undefined) metaPayload.company = data.company;
    if (data.website !== undefined) metaPayload.website = data.website;
    if (data.portfolio !== undefined) metaPayload.portfolio = data.portfolio;
    if (data.social_links !== undefined) metaPayload.social_links = data.social_links;
    if (data.socialLinks !== undefined) metaPayload.social_links = data.socialLinks;
    if (data.workspace_settings !== undefined) metaPayload.workspace_settings = data.workspace_settings;
    if (data.notification_settings !== undefined) metaPayload.notification_settings = data.notification_settings;

    if (Object.keys(metaPayload).length > 0) {
      await supabase.auth.updateUser({
        data: metaPayload,
      }).catch((authErr) => console.warn('[AVATAR] updateUser metadata warning:', authErr));
    }

    const nextProfile: UserProfileData = {
      ...userProfile,
      ...data,
      id: currentUser.id,
      email: currentUser.email || null,
      created_at: userProfile?.created_at || currentUser.created_at || null,
      updated_at: new Date().toISOString(),
    } as UserProfileData;

    setUserProfile(nextProfile);
    console.log('[AVATAR] Profile state & localStorage updated:', nextProfile.avatar_url);
    return nextProfile;
  }, [userProfile, setUserProfile]);

  const role = computeRole(user);

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        userProfile,
        isSignedIn: !!session,
        isLoading,
        role,
        authModalMode,
        isAuthModalOpen: authModalMode !== null,
        openAuthModal,
        closeAuthModal,
        redirectAfterLogin,
        setRedirectAfterLogin,
        signInWithEmail,
        signUpWithEmail,
        signInWithGoogle,
        signOut,
        resetPassword,
        syncProfile,
        updateUserProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
