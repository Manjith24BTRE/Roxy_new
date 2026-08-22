import React, { createContext, useContext, useEffect, useState } from "react";
import { type User } from "@supabase/supabase-js";
import { supabase } from "./supabase";

type Profile = {
  id: string;
  full_name: string;
  avatar_url: string;
  status: string;
};

type Role = {
  name: string;
  description: string;
};

type AuthState = {
  user: User | null;
  profile: Profile | null;
  role: Role | null;
  isLoading: boolean;
};

const AuthContext = createContext<AuthState>({
  user: null,
  profile: null,
  role: null,
  isLoading: true,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    profile: null,
    role: null,
    isLoading: true,
  });

  useEffect(() => {
    if (!supabase) {
      setState((prev) => ({ ...prev, isLoading: false }));
      return;
    }

    let isMounted = true;

    async function fetchUserData(user: User | null) {
      if (!user) {
        if (isMounted) setState({ user: null, profile: null, role: null, isLoading: false });
        return;
      }

      try {
        // Fetch profile
        const { data: profileData } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        // Fetch highest role
        const { data: roleData } = await supabase
          .from("user_roles")
          .select("roles ( name, description )")
          .eq("user_id", user.id)
          .limit(1)
          .maybeSingle();

        let role = null;
        if (roleData?.roles) {
          // supabase-js returns nested joins as objects or arrays. Limit 1 / single usually makes it single object if 1:1, or array if 1:M.
          role = Array.isArray(roleData.roles) ? roleData.roles[0] : roleData.roles;
        }

        if (isMounted) {
          setState({
            user,
            profile: profileData || null,
            role: role as Role | null,
            isLoading: false,
          });
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        if (isMounted) {
          setState({ user, profile: null, role: null, isLoading: false });
        }
      }
    }

    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      fetchUserData(session?.user ?? null);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      fetchUserData(session?.user ?? null);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return <AuthContext.Provider value={state}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
