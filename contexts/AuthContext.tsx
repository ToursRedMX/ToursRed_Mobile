import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import type { DatabaseUser, UserRole } from '@/types/database';

interface AuthContextValue {
  session: Session | null;
  user: User | null;
  profile: DatabaseUser | null;
  role: UserRole | null;
  loading: boolean;
  initializing: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, firstName: string, lastName: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<DatabaseUser | null>(null);
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);

  const loadProfile = useCallback(async (userId: string) => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      console.error('Error loading profile:', error.message);
      return null;
    }
    return data as DatabaseUser | null;
  }, []);

  const refreshProfile = useCallback(async () => {
    if (user?.id) {
      const p = await loadProfile(user.id);
      setProfile(p);
    }
  }, [user, loadProfile]);

  useEffect(() => {
    let mounted = true;

    (async () => {
      const { data: { session: existingSession } } = await supabase.auth.getSession();
      if (!mounted) return;

      setSession(existingSession);
      setUser(existingSession?.user ?? null);

      if (existingSession?.user?.id) {
        const p = await loadProfile(existingSession.user.id);
        if (mounted) setProfile(p);
      }
      if (mounted) setInitializing(false);
    })();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      (async () => {
        setSession(newSession);
        setUser(newSession?.user ?? null);

        if (newSession?.user?.id) {
          const p = await loadProfile(newSession.user.id);
          setProfile(p);
        } else {
          setProfile(null);
        }
        setLoading(false);
      })();
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [loadProfile]);

  const signIn = useCallback(async (email: string, password: string) => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) return { error: error.message };
    return { error: null };
  }, []);

  const signUp = useCallback(async (email: string, password: string, firstName: string, lastName: string) => {
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
          role: 'traveler',
        },
      },
    });
    setLoading(false);
    if (error) return { error: error.message };

    if (data.user) {
      const { error: profileError } = await supabase.from('users').upsert({
        id: data.user.id,
        email,
        first_name: firstName,
        last_name: lastName,
        role: 'traveler',
        is_active: true,
        email_verified: false,
        onboarding_completed: true,
      });
      if (profileError) {
        console.error('Profile creation error:', profileError.message);
      }
    }
    return { error: null };
  }, []);

  const signOut = useCallback(async () => {
    setLoading(true);
    await supabase.auth.signOut();
    setSession(null);
    setUser(null);
    setProfile(null);
    setLoading(false);
  }, []);

  const role = profile?.role ?? null;

  return (
    <AuthContext.Provider
      value={{ session, user, profile, role, loading, initializing, signIn, signUp, signOut, refreshProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
