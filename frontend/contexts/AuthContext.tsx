import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { getSupabase } from '@/lib/supabase';
import { api } from '@/lib/api';
import { Profile } from '@/lib/types';
import { DEFAULT_PROFILE, seedGuestDataIfEmpty } from '@/lib/defaults';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  isGuest: boolean;
  isLoading: boolean;
  signIn: (email: string, pass: string) => Promise<{ error?: string }>;
  signInWithGoogle: () => Promise<{ error?: string }>;
  signUp: (email: string, pass: string, name: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  continueAsGuest: () => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isGuest, setIsGuest] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const supabase = getSupabase();

  const fetchProfile = async (currentUser: User) => {
    try {
      // 1. Tenta buscar via API C#
      const res = await api.get('/profile');
      if (res.data) {
        setProfile(res.data);
        return;
      }
    } catch (err) {
      console.warn('API C# não respondeu, buscando via Supabase direto:', err);
    }

    // 2. Fallback Supabase direto
    try {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', currentUser.id)
        .single();

      if (data) {
        setProfile({
          id: data.id,
          name: data.name || currentUser.user_metadata?.full_name || currentUser.user_metadata?.name || 'Estudante Ió',
          course: data.course || 'Direito',
          period: data.period || '7º Período',
          targetGpa: Number(data.target_gpa) || 85.0,
          motivationNote: data.motivation_note || data.love_note || 'Bora conquistar esse semestre! 🚀',
          theme: data.theme || 'dark',
          accentColor: data.accent_color || '#6366f1',
          avatarDataUrl: data.avatar_data_url || currentUser.user_metadata?.avatar_url || currentUser.user_metadata?.picture,
          updatedAt: data.updated_at
        });
      } else {
        // Se ainda não existe perfil no banco (ex: novo login Google ou trigger pendente), cria perfil inicial
        const initialProfile: Profile = {
          id: currentUser.id,
          name: currentUser.user_metadata?.full_name || currentUser.user_metadata?.name || currentUser.email?.split('@')[0] || 'Estudante Ió',
          course: 'Direito',
          period: '7º Período',
          targetGpa: 85.0,
          motivationNote: 'Bora conquistar esse semestre! 🚀',
          theme: 'dark',
          accentColor: '#6366f1',
          avatarDataUrl: currentUser.user_metadata?.avatar_url || currentUser.user_metadata?.picture,
          updatedAt: new Date().toISOString()
        };

        await supabase.from('profiles').upsert([
          {
            id: initialProfile.id,
            name: initialProfile.name,
            course: initialProfile.course,
            period: initialProfile.period,
            target_gpa: initialProfile.targetGpa,
            love_note: initialProfile.motivationNote,
            theme: initialProfile.theme,
            avatar_data_url: initialProfile.avatarDataUrl
          }
        ]);

        setProfile(initialProfile);
      }
    } catch (e) {
      console.warn('Erro ao carregar perfil, usando dados de fallback da sessão:', e);
      setProfile({
        id: currentUser.id,
        name: currentUser.user_metadata?.full_name || currentUser.user_metadata?.name || currentUser.email?.split('@')[0] || 'Estudante Ió',
        course: 'Direito',
        period: '7º Período',
        targetGpa: 85.0,
        motivationNote: 'Bora conquistar esse semestre! 🚀',
        theme: 'dark',
        accentColor: '#6366f1',
        avatarDataUrl: currentUser.user_metadata?.avatar_url || currentUser.user_metadata?.picture,
        updatedAt: new Date().toISOString()
      });
    }
  };

  useEffect(() => {
    // Checa se está no modo visitante
    const savedGuest = localStorage.getItem('lo_guest_mode');
    if (savedGuest === 'true') {
      setIsGuest(true);
      seedGuestDataIfEmpty();
      setProfile(DEFAULT_PROFILE);
      setIsLoading(false);
      return;
    }

    // Verifica sessão Supabase
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user);
      }
      setIsLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        setIsGuest(false);
        localStorage.removeItem('lo_guest_mode');
        fetchProfile(session.user);
      } else if (!isGuest) {
        setProfile(null);
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, pass: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: pass,
      });

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          return { error: 'E-mail ou senha incorretos. Verifique os dados ou utilize o Login com Google.' };
        }
        if (error.message.includes('Email not confirmed')) {
          return { error: 'Seu e-mail ainda não foi confirmado no Supabase. Experimente o login com Google!' };
        }
        return { error: error.message };
      }

      if (data.user) {
        setUser(data.user);
        setSession(data.session);
        setIsGuest(false);
        localStorage.removeItem('lo_guest_mode');
        await fetchProfile(data.user);
      }
      return {};
    } catch (e: any) {
      return { error: e.message || 'Erro ao conectar.' };
    }
  };

  const signInWithGoogle = async () => {
    try {
      const redirectTo = typeof window !== 'undefined'
        ? `${window.location.origin}/dashboard`
        : undefined;

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo,
          queryParams: {
            access_type: 'offline',
            prompt: 'select_account',
          }
        }
      });

      if (error) {
        if (error.message.toLowerCase().includes('not enabled') || error.message.toLowerCase().includes('unsupported')) {
          return {
            error: 'O provedor Google ainda precisa ser ativado no painel do Supabase (Authentication > Providers > Google).'
          };
        }
        return { error: error.message };
      }

      return {};
    } catch (e: any) {
      return { error: e.message || 'Erro ao iniciar autenticação com o Google.' };
    }
  };

  const signUp = async (email: string, pass: string, name: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password: pass,
        options: {
          data: { full_name: name.trim() }
        }
      });

      if (error) return { error: error.message };
      if (data.user) {
        setUser(data.user);
        setSession(data.session);
        setIsGuest(false);
        localStorage.removeItem('lo_guest_mode');
      }
      return {};
    } catch (e: any) {
      return { error: e.message || 'Erro ao criar conta.' };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('lo_guest_mode');
    setUser(null);
    setSession(null);
    setProfile(null);
    setIsGuest(false);
  };

  const continueAsGuest = () => {
    setIsGuest(true);
    localStorage.setItem('lo_guest_mode', 'true');
    seedGuestDataIfEmpty();
    setProfile(DEFAULT_PROFILE);
    setUser(null);
  };

  const refreshProfile = async () => {
    if (user) await fetchProfile(user);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        isGuest,
        isLoading,
        signIn,
        signInWithGoogle,
        signUp,
        signOut,
        continueAsGuest,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  return context;
};
