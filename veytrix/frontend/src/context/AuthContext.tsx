import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { apiRequest } from '../lib/api';

export interface UserProfileData {
  id: string;
  email: string | null;
  display_name: string | null;
  avatar_url: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface SignUpResult {
  session: Session | null;
  user: User | null;
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
  signInAsDemo: () => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  syncProfile: () => Promise<UserProfileData | null>;
}

const DEV_SESSION_KEY = 'veytrix_auth_dev_session';

const saveDevSession = (sess: Session | null, u: User | null, p: UserProfileData | null) => {
  if (sess) {
    try {
      localStorage.setItem(DEV_SESSION_KEY, JSON.stringify({ session: sess, user: u, profile: p }));
    } catch {
      // ignore
    }
  } else {
    try {
      localStorage.removeItem(DEV_SESSION_KEY);
    } catch {
      // ignore
    }
  }
};

const getDevSession = () => {
  try {
    const raw = localStorage.getItem(DEV_SESSION_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore
  }
  return null;
};

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
  signInAsDemo: async () => {},
  signOut: async () => {},
  resetPassword: async () => {},
  syncProfile: async () => null,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfileData | null>(null);
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
      if (token && token === lastSyncTokenRef.current) {
        return userProfile;
      }
      lastSyncTokenRef.current = token;

      const res = await apiRequest<{ success: boolean; profile?: UserProfileData; user?: UserProfileData }>('/auth/me');
      const profileData = res?.profile || res?.user || null;
      if (profileData) {
        setUserProfile(profileData);
        return profileData;
      }
    } catch (err) {
      console.warn('Backend profile sync notice:', err);
    }
    return null;
  }, [userProfile]);

  useEffect(() => {
    let isMounted = true;

    // Restore initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!isMounted) return;

      if (session) {
        setSession(session);
        setUser(session.user);
        syncProfile();
        setIsLoading(false);
      } else {
        const dev = getDevSession();
        if (dev && dev.session) {
          setSession(dev.session);
          setUser(dev.user);
          setUserProfile(dev.profile);
        }
        setIsLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!isMounted) return;

      if (session) {
        setSession(session);
        setUser(session.user);
        await syncProfile();
        setIsLoading(false);
      } else {
        const dev = getDevSession();
        if (dev && dev.session) {
          setSession(dev.session);
          setUser(dev.user);
          setUserProfile(dev.profile);
        } else {
          setSession(null);
          setUser(null);
          setUserProfile(null);
        }
        setIsLoading(false);
      }
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

      saveDevSession(null, null, null);
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

      if (data.session) {
        saveDevSession(null, null, null);
        setSession(data.session);
        setUser(data.user);
        await syncProfile();
      }

      return { session: data.session, user: data.user };
    } finally {
      setIsLoading(false);
    }
  }, [syncProfile]);

  const signInAsDemo = useCallback(async () => {
    setIsLoading(true);
    try {
      const devUser = {
        id: 'demo-creator-id-100',
        email: 'creator@veytrix.ai',
        user_metadata: {
          full_name: 'Veytrix Creator',
          name: 'Veytrix Creator',
          avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        },
        app_metadata: { provider: 'demo' },
        created_at: new Date().toISOString(),
      } as any;

      const devSession = {
        access_token: 'dev-demo-access-token',
        token_type: 'bearer',
        user: devUser,
      } as any;

      const devProfile = {
        id: devUser.id,
        email: devUser.email,
        display_name: devUser.user_metadata.full_name,
        avatar_url: devUser.user_metadata.avatar_url,
        created_at: devUser.created_at,
        updated_at: devUser.created_at,
      };

      saveDevSession(devSession, devUser, devProfile);
      setSession(devSession);
      setUser(devUser);
      setUserProfile(devProfile);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signInWithGoogle = useCallback(async () => {
    return signInAsDemo();
  }, [signInAsDemo]);

  const signOut = useCallback(async () => {
    setIsLoading(true);
    try {
      await supabase.auth.signOut();
      saveDevSession(null, null, null);
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
        signInAsDemo,
        signOut,
        resetPassword,
        syncProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
