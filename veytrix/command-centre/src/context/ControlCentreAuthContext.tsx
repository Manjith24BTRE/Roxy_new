import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  isUnauthorizedNormalUser: boolean;
  login: (emailRaw: string, passwordRaw: string, rememberMe: boolean) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  isLoading: true,
  isUnauthorizedNormalUser: false,
  login: async () => ({ success: false }),
  logout: async () => {},
});

const AUTHORIZED_EMAIL = 'official@mavrostech.in';

export const ControlCentreAuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUnauthorizedNormalUser, setIsUnauthorizedNormalUser] = useState(false);

  useEffect(() => {
    let isMounted = true;
    
    localStorage.removeItem('veytrix_control_session');
    sessionStorage.removeItem('veytrix_control_session');

    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      if (!isMounted) return;
      if (currentSession) {
        if (currentSession.user.email?.toLowerCase() === AUTHORIZED_EMAIL) {
          setSession(currentSession);
          setUser(currentSession.user);
          setIsUnauthorizedNormalUser(false);
        } else {
          setSession(null);
          setUser(null);
          setIsUnauthorizedNormalUser(true);
        }
      } else {
        setSession(null);
        setUser(null);
        setIsUnauthorizedNormalUser(false);
      }
      setIsLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      if (!isMounted) return;
      if (currentSession) {
        if (currentSession.user.email?.toLowerCase() === AUTHORIZED_EMAIL) {
          setSession(currentSession);
          setUser(currentSession.user);
          setIsUnauthorizedNormalUser(false);
        } else {
          setSession(null);
          setUser(null);
          setIsUnauthorizedNormalUser(true);
        }
      } else {
        setSession(null);
        setUser(null);
        setIsUnauthorizedNormalUser(false);
      }
      setIsLoading(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const login = async (emailRaw: string, passwordRaw: string, _rememberMe: boolean) => {
    const email = emailRaw.trim();
    if (!email || !passwordRaw) {
      return { success: false, error: 'Invalid login credentials' };
    }

    // Must be the authorized controller
    if (email.toLowerCase() !== AUTHORIZED_EMAIL) {
      return { success: false, error: 'Invalid login credentials' };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password: passwordRaw,
      });

      if (error || !data.user) {
        return { success: false, error: 'Invalid login credentials' };
      }

      if (data.user.email?.toLowerCase() !== AUTHORIZED_EMAIL) {
        await supabase.auth.signOut();
        return { success: false, error: 'Invalid login credentials' };
      }

      setSession(data.session);
      setUser(data.user);
      setIsUnauthorizedNormalUser(false);
      return { success: true };
    } catch (e) {
      return { success: false, error: 'Invalid login credentials' };
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      
      localStorage.removeItem('veytrix_control_session');
      sessionStorage.removeItem('veytrix_control_session');
      
      setSession(null);
      setUser(null);
      
      window.location.href = '/';
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ session, user, isLoading, isUnauthorizedNormalUser, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useControlCentreAuth = () => useContext(AuthContext);
