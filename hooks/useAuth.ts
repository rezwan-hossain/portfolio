// hooks/useAuth.ts (Enhanced with session caching)
"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  image: string | null;
} | null;

// Cache auth state in sessionStorage for instant loads
const AUTH_CACHE_KEY = "auth_user_cache";

function getCachedUser(): AuthUser {
  if (typeof window === "undefined") return null;
  try {
    const cached = sessionStorage.getItem(AUTH_CACHE_KEY);
    return cached ? JSON.parse(cached) : null;
  } catch {
    return null;
  }
}

function setCachedUser(user: AuthUser) {
  if (typeof window === "undefined") return;
  try {
    if (user) {
      sessionStorage.setItem(AUTH_CACHE_KEY, JSON.stringify(user));
    } else {
      sessionStorage.removeItem(AUTH_CACHE_KEY);
    }
  } catch {
    // Ignore storage errors
  }
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser>(getCachedUser);
  const [loading, setLoading] = useState(!getCachedUser());

  const updateUser = useCallback((newUser: AuthUser) => {
    setUser(newUser);
    setCachedUser(newUser);
  }, []);

  useEffect(() => {
    let mounted = true;

    const getUser = async () => {
      const supabase = createClient();
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();

      if (!mounted) return;

      const userData = authUser
        ? {
            id: authUser.id,
            email: authUser.email || "",
            name:
              authUser.user_metadata?.full_name ||
              authUser.user_metadata?.name ||
              authUser.email?.split("@")[0] ||
              "User",
            image: authUser.user_metadata?.avatar_url || null,
          }
        : null;

      updateUser(userData);
      setLoading(false);
    };

    // Only fetch if no cached user
    if (!getCachedUser()) {
      getUser();
    } else {
      setLoading(false);
    }

    const supabase = createClient();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;

      const userData = session?.user
        ? {
            id: session.user.id,
            email: session.user.email || "",
            name:
              session.user.user_metadata?.full_name ||
              session.user.user_metadata?.name ||
              session.user.email?.split("@")[0] ||
              "User",
            image: session.user.user_metadata?.avatar_url || null,
          }
        : null;

      updateUser(userData);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [updateUser]);

  return { user, loading, setUser: updateUser };
}
