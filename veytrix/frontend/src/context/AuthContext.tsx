import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { apiRequest } from '../lib/api';

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
  created_at: string | null;
  updated_at: string | null;
}

export interface SignUpResult {
  session: Session | null;
  user: User | null;
  isExistingUser?: boolean;
}

type AuthModalMode = 'signin' | 'signup' | 'forgot' | null;

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  userProfile: UserProfileData | null;
  isSignedIn: boolean;
  isLoading: boolean;
  
  // Modal Controller States
  authModalMode: AuthModalMode;
  isAuthModalOpen: boolean;
  openAuthModal: (mode: AuthModalMode) => void;
  closeAuthModal: () => void;
  redirectAfterLogin: string | null;
  setRedirectAfterLogin: (path: string | null) => void;

  signInWithEmail: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
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
  authModalMode: null,
  isAuthModalOpen: false,
  openAuthModal: () => {},
  closeAuthModal: () => {},
  redirectAfterLogin: null,
  setRedirectAfterLogin: () => {},
  signInWithEmail: async () => {},
  signUpWithEmail: async () => ({ session: null, user: null }),
  signInWithGoogle: async () => {},
  signOut: async () => {},
  resetPassword: async () => {},
  syncProfile: async () => null,
  updateUserProfile: async () => null,
});

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
      }
      return next;
    });
  }, []);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [authModalMode, setAuthModalMode] = useState<AuthModalMode>(null);
  const [redirectAfterLogin, setRedirectAfterLogin] = useState<string | null>(null);
  const lastSyncTokenRef = useRef<string | null>(null);

  const openAuthModal = useCallback((mode: AuthModalMode) => {
    setAuthModalMode(mode);
  }, []);

  const closeAuthModal = useCallback(() => {
    setAuthModalMode(null);
  }, []);

  const syncProfile = useCallback(async (): Promise<UserProfileData | null> => {
    try {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      const token = currentSession?.access_token || null;
      if (token && token === lastSyncTokenRef.current && userProfile) {
        return userProfile;
      }
      lastSyncTokenRef.current = token;

      const res = await apiRequest<{ success: boolean; profile?: UserProfileData; user?: UserProfileData }>('/auth/me');
      const profileData = res?.profile || res?.user || null;
      if (profileData) {
        setUserProfile(prev => prev ? { ...profileData, ...prev } : profileData);
        return profileData;
      }
    } catch (err) {
      console.warn('Backend profile sync notice:', err);
    }
    return userProfile;
  }, [userProfile, setUserProfile]);

  useEffect(() => {
    let isMounted = true;

    // Restore initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!isMounted) return;

      if (session) {
        setSession(session);
        setUser(session.user);
        syncProfile();
      } else {
        setSession(null);
        setUser(null);
        setUserProfile(null);
      }
      setIsLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!isMounted) return;

      if (session) {
        setSession(session);
        setUser(session.user);
        await syncProfile();
      } else {
        setSession(null);
        setUser(null);
        setUserProfile(null);
      }
      setIsLoading(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [syncProfile]);

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
    setIsLoading(true);
    try {
      await supabase.auth.signOut();
      setSession(null);
      setUser(null);
      setUserProfile(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/`,
    });
    if (error) throw error;
  }, []);

  const updateUserProfile = useCallback(async (data: Partial<UserProfileData>): Promise<UserProfileData | null> => {
    let updatedProfile: UserProfileData | null = null;
    try {
      const res = await apiRequest<{ success: boolean; profile?: UserProfileData; user?: UserProfileData }>('/auth/me/profile', {
        method: 'PUT',
        body: JSON.stringify(data),
      });

      const updated = res?.profile || res?.user || null;
      if (updated) {
        updatedProfile = updated;
      }
    } catch (err) {
      console.warn('Backend profile update notice:', err);
    }

    if (!updatedProfile) {
      updatedProfile = {
        id: userProfile?.id || '00000000-0000-0000-0000-000000000001',
        email: userProfile?.email || 'member@mavros.in',
        display_name: data.display_name || userProfile?.display_name || 'Mavros Member',
        avatar_url: data.avatar_url || userProfile?.avatar_url || null,
        created_at: userProfile?.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString(),
        ...userProfile,
        ...data,
      };
    }

    setUserProfile(updatedProfile);
    return updatedProfile;
  }, [userProfile]);

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        userProfile,
        isSignedIn: !!session,
        isLoading,
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
