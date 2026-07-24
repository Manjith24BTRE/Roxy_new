import React, { createContext, useContext, useState, useCallback } from 'react';

export interface MockUser {
  displayName: string;
  email: string;
  avatarUrl: string;
}

interface AuthContextValue {
  user: MockUser | null;
  isSignedIn: boolean;
  signIn: (provider?: string) => void;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  isSignedIn: false,
  signIn: () => {},
  signOut: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<MockUser | null>(() => {
    // Restore from sessionStorage so refresh doesn't lose state
    const stored = sessionStorage.getItem('veytrix_mock_user');
    return stored ? JSON.parse(stored) : null;
  });

  const signIn = useCallback((provider?: string) => {
    const mockUser: MockUser = {
      displayName: provider === 'discord' ? 'VeytrixCreator' : 'Google Demo',
      email: provider === 'discord' ? 'creator@veytrix.dev' : 'googledemo@gmail.com',
      avatarUrl: `https://ui-avatars.com/api/?name=${provider === 'discord' ? 'VC' : 'GD'}&background=0ea5e9&color=fff&bold=true&size=128`,
    };
    setUser(mockUser);
    sessionStorage.setItem('veytrix_mock_user', JSON.stringify(mockUser));
  }, []);

  const signOut = useCallback(() => {
    setUser(null);
    sessionStorage.removeItem('veytrix_mock_user');
  }, []);

  return (
    <AuthContext.Provider value={{ user, isSignedIn: !!user, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
