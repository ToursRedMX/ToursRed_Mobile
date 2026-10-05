import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { Platform } from 'react-native';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import { Provider, Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import type { DatabaseUser, UserRole } from '@/types/database';

export type OAuthProvider = 'google' | 'azure' | 'twitter' | 'facebook' | 'linkedin_oidc';

type AuthResult = { error: string | null };

type AuthContextValue = {
  session: Session | null;
  user: User | null;
  profile: DatabaseUser | null;
  role: UserRole | null;
  loading: boolean;
  initializing: boolean;
  mfaRequired: boolean;
  signIn: (email: string, password: string, captchaToken?: string) => Promise<AuthResult>;
  signInWithOAuth: (provider: OAuthProvider) => Promise<AuthResult>;
  signInWithPasskey: () => Promise<AuthResult>;
  signUp: (email: string, password: string, firstName: string, lastName: string, captchaToken?: string) => Promise<AuthResult>;
  resetPassword: (email: string, captchaToken?: string) => Promise<AuthResult>;
  verifyTotp: (code: string) => Promise<AuthResult>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function messageFromError(error: { message: string } | null) {
  if (!error) return null;
  if (error.message.toLowerCase().includes('invalid login credentials')) return 'Correo o contraseña incorrectos.';
  if (error.message.toLowerCase().includes('captcha')) return 'Completa la verificación de seguridad e inténtalo de nuevo.';
  return error.message;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<DatabaseUser | null>(null);
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [mfaRequired, setMfaRequired] = useState(false);
  const [mfaChallengeId, setMfaChallengeId] = useState<string | null>(null);
  const [mfaFactorId, setMfaFactorId] = useState<string | null>(null);

  const loadProfile = useCallback(async (userId: string) => {
    const { data, error } = await supabase.from('users').select('*').eq('id', userId).maybeSingle();
    if (error) {
      console.error('Error loading profile:', error.message);
      return null;
    }
    return data as DatabaseUser | null;
  }, []);

  const checkMfa = useCallback(async () => {
    const { data, error } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
    if (error) {
      setMfaRequired(false);
      return;
    }
    const required = data.nextLevel === 'aal2' && data.currentLevel !== 'aal2';
    setMfaRequired(required);
    if (!required) {
      setMfaChallengeId(null);
      setMfaFactorId(null);
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    if (user?.id) setProfile(await loadProfile(user.id));
  }, [user, loadProfile]);

  useEffect(() => {
    let mounted = true;

    (async () => {
      const { data: { session: existingSession } } = await supabase.auth.getSession();
      if (!mounted) return;
      setSession(existingSession);
      setUser(existingSession?.user ?? null);
      if (existingSession?.user?.id) {
        setProfile(await loadProfile(existingSession.user.id));
        await checkMfa();
      }
      if (mounted) setInitializing(false);
    })();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, newSession) => {
      (async () => {
        if (!mounted) return;
        setSession(newSession);
        setUser(newSession?.user ?? null);
        if (newSession?.user?.id) {
          setProfile(await loadProfile(newSession.user.id));
          await checkMfa();
        } else {
          setProfile(null);
          setMfaRequired(false);
        }
        setLoading(false);
      })();
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [loadProfile, checkMfa]);

  const signIn = useCallback(async (email: string, password: string, captchaToken?: string): Promise<AuthResult> => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
      options: captchaToken ? { captchaToken } : undefined,
    });
    if (!error) await checkMfa();
    setLoading(false);
    return { error: messageFromError(error) };
  }, [checkMfa]);

  const signInWithOAuth = useCallback(async (provider: OAuthProvider): Promise<AuthResult> => {
    setLoading(true);
    const redirectTo = Platform.OS === 'web' ? `${window.location.origin}/` : Linking.createURL('auth/callback');
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: provider as Provider,
      options: { redirectTo, skipBrowserRedirect: Platform.OS !== 'web' },
    });

    if (!error && Platform.OS !== 'web' && data.url) {
      const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
      if (result.type === 'success') await supabase.auth.getSession();
    }
    setLoading(false);
    return { error: messageFromError(error) };
  }, []);

  const signInWithPasskey = useCallback(async (): Promise<AuthResult> => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPasskey();
    setLoading(false);
    return { error: messageFromError(error) };
  }, []);

  const signUp = useCallback(async (email: string, password: string, firstName: string, lastName: string, captchaToken?: string): Promise<AuthResult> => {
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        captchaToken,
        data: { first_name: firstName, last_name: lastName, role: 'traveler' },
      },
    });
    if (error) {
      setLoading(false);
      return { error: messageFromError(error) };
    }
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
      if (profileError) console.error('Profile creation error:', profileError.message);
    }
    setLoading(false);
    return { error: null };
  }, []);

  const resetPassword = useCallback(async (email: string, captchaToken?: string): Promise<AuthResult> => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      captchaToken,
      redirectTo: Platform.OS === 'web' ? `${window.location.origin}/(auth)/login` : Linking.createURL('auth/login'),
    });
    return { error: messageFromError(error) };
  }, []);

  const verifyTotp = useCallback(async (code: string): Promise<AuthResult> => {
    if (!mfaChallengeId || !mfaFactorId) return { error: 'Inicia nuevamente la verificación de seguridad.' };
    setLoading(true);
    const { error } = await supabase.auth.mfa.verify({ factorId: mfaFactorId, challengeId: mfaChallengeId, code });
    if (!error) {
      setMfaRequired(false);
      setMfaChallengeId(null);
      setMfaFactorId(null);
      await supabase.auth.refreshSession();
    }
    setLoading(false);
    return { error: messageFromError(error) };
  }, [mfaChallengeId, mfaFactorId]);

  useEffect(() => {
    if (!mfaRequired || mfaChallengeId) return;
    (async () => {
      const { data, error } = await supabase.auth.mfa.listFactors();
      const factor = data?.totp.find((item) => item.status === 'verified');
      if (error || !factor) {
        setMfaRequired(false);
        return;
      }
      const challenge = await supabase.auth.mfa.challenge({ factorId: factor.id });
      if (challenge.error) {
        setMfaRequired(false);
        return;
      }
      setMfaFactorId(factor.id);
      setMfaChallengeId(challenge.data.id);
    })();
  }, [mfaRequired, mfaChallengeId]);

  const signOut = useCallback(async () => {
    setLoading(true);
    await supabase.auth.signOut();
    setSession(null);
    setUser(null);
    setProfile(null);
    setMfaRequired(false);
    setLoading(false);
  }, []);

  return (
    <AuthContext.Provider value={{
      session,
      user,
      profile,
      role: profile?.role ?? null,
      loading,
      initializing,
      mfaRequired,
      signIn,
      signInWithOAuth,
      signInWithPasskey,
      signUp,
      resetPassword,
      verifyTotp,
      signOut,
      refreshProfile,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
