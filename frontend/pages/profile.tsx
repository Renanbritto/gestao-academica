import React, { useState, useEffect } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { TelegramLinkWidget } from '@/components/profile/TelegramLinkWidget';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { api } from '@/lib/api';
import { getSupabase } from '@/lib/supabase';
import { User, Camera, Trash2, Save, Moon, Sun, Palette, Sparkles, LogOut } from 'lucide-react';
import { useRouter } from 'next/router';

const ACCENT_COLORS = [
  { label: 'Indigo (Padrão)', value: '#6366f1' },
  { label: 'Esmeralda', value: '#10b981' },
  { label: 'Rosa Pink', value: '#ec4899' },
  { label: 'Roxo Real', value: '#8b5cf6' },
  { label: 'Âmbar Dourado', value: '#f59e0b' },
  { label: 'Azul Celeste', value: '#0ea5e9' },
];

export default function ProfilePage() {
  const router = useRouter();
  const { profile, refreshProfile, signOut, user, isGuest } = useAuth();
  const { theme, toggleTheme, accentColor, setAccentColor } = useTheme();

  const [name, setName] = useState('');
  const [course, setCourse] = useState('');
  const [period, setPeriod] = useState('');
  const [targetGpa, setTargetGpa] = useState(85);
  const [motivationNote, setMotivationNote] = useState('');
  const [avatarDataUrl, setAvatarDataUrl] = useState<string | undefined>(undefined);
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (profile) {
      setName(profile.name || '');
      setCourse(profile.course || '');
      setPeriod(profile.period || '');
      setTargetGpa(profile.targetGpa || 85);
      setMotivationNote(profile.motivationNote || '');
      setAvatarDataUrl(profile.avatarDataUrl);
    }
  }, [profile]);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setAvatarDataUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    setAvatarDataUrl(undefined);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSavedSuccess(false);

    const payload = {
      name: name.trim(),
      course: course.trim(),
      period: period.trim(),
      targetGpa,
      motivationNote: motivationNote.trim(),
      theme,
      accentColor,
      avatarDataUrl
    };

    try {
      await api.put('/profile', payload);
    } catch (err) {
      // Fallback Supabase
      const supabase = getSupabase();
      if (user) {
        await supabase.from('profiles').upsert({
          id: user.id,
          name: payload.name,
          course: payload.course,
          period: payload.period,
          target_gpa: payload.targetGpa,
          motivation_note: payload.motivationNote,
          theme: payload.theme,
          accent_color: payload.accentColor,
          avatar_data_url: payload.avatarDataUrl,
          updated_at: new Date().toISOString()
        });
      } else {
        localStorage.setItem('academic_profile_v6', JSON.stringify({
          ...payload,
          target_gpa: payload.targetGpa,
          love_note: payload.motivationNote
        }));
      }
    }

    await refreshProfile();
    setIsSaving(false);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <AppShell>
      <div className="space-y-6 max-w-3xl mx-auto animate-fade-in pb-10">
        
        {/* Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-black text-[var(--text-main)] tracking-tight">
            Configurações do Perfil ⚙️
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-0.5">
            Personalize seus dados, mensagem de motivação, tema visual e conecte o assistente do Telegram.
          </p>
        </div>

        {/* Widget do Telegram com Gemini IA */}
        <TelegramLinkWidget />

        {/* Formulário de Dados Cadastrais */}
        <div className="glass p-6 sm:p-8 rounded-3xl border border-card-border space-y-6">
          
          <div className="flex flex-col sm:flex-row items-center gap-5 pb-6 border-b border-card-border">
            <div className="relative group">
              <div className="w-20 h-20 rounded-3xl bg-indigo-500/20 border-2 border-indigo-500/40 overflow-hidden flex items-center justify-center text-indigo-400">
                {avatarDataUrl ? (
                  <img src={avatarDataUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <User size={36} />
                )}
              </div>

              <label className="absolute -bottom-1 -right-1 p-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer shadow-lg shadow-indigo-600/30 transition-transform hover:scale-110">
                <Camera size={14} />
                <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
              </label>
            </div>

            <div className="space-y-1 text-center sm:text-left">
              <h3 className="font-display font-bold text-base text-[var(--text-main)]">
                {name || 'Estudante IO'}
              </h3>
              <p className="text-xs text-[var(--text-muted)]">
                {course ? `${course} • ${period}` : 'Universitário'}
              </p>
              {avatarDataUrl && (
                <button
                  type="button"
                  onClick={handleRemovePhoto}
                  className="text-[11px] text-rose-400 hover:underline flex items-center gap-1 mx-auto sm:mx-0 pt-1"
                >
                  <Trash2 size={12} />
                  <span>Remover foto</span>
                </button>
              )}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-[var(--text-muted)] block mb-1">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-card border border-card-border text-sm font-medium focus:outline-none focus:border-indigo-500 text-[var(--text-main)]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[var(--text-muted)] block mb-1">
                  Curso Universitário
                </label>
                <input
                  type="text"
                  placeholder="Ex: Direito, Medicina, Engenharia..."
                  value={course}
                  onChange={(e) => setCourse(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-card border border-card-border text-sm font-medium focus:outline-none focus:border-indigo-500 text-[var(--text-main)]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[var(--text-muted)] block mb-1">
                  Período / Semestre
                </label>
                <input
                  type="text"
                  placeholder="Ex: 7º Período"
                  value={period}
                  onChange={(e) => setPeriod(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-card border border-card-border text-sm font-medium focus:outline-none focus:border-indigo-500 text-[var(--text-main)]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[var(--text-muted)] block mb-1">
                  Meta Geral de Rendimento (CR em pontos)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="1"
                  value={targetGpa}
                  onChange={(e) => setTargetGpa(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-card border border-card-border text-sm font-medium focus:outline-none focus:border-indigo-500 text-[var(--text-main)]"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-[var(--text-muted)] block mb-1">
                Mensagem Motivacional no Cabeçalho 💖
              </label>
              <input
                type="text"
                value={motivationNote}
                placeholder="Ex: Bora conquistar esse semestre! 🚀"
                onChange={(e) => setMotivationNote(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-card border border-card-border text-sm font-medium focus:outline-none focus:border-indigo-500 text-[var(--text-main)]"
              />
            </div>

            {/* Seletor de Cores de Destaque */}
            <div>
              <label className="text-xs font-semibold text-[var(--text-muted)] block mb-2">
                Cor de Destaque da Plataforma
              </label>
              <div className="flex gap-2 flex-wrap">
                {ACCENT_COLORS.map((c) => (
                  <button
                    type="button"
                    key={c.value}
                    onClick={() => setAccentColor(c.value)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
                      accentColor === c.value
                        ? 'border-white bg-card shadow-md scale-105'
                        : 'border-card-border bg-card/40 hover:bg-card text-[var(--text-muted)]'
                    }`}
                  >
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: c.value }} />
                    <span>{c.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {savedSuccess && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold text-center animate-fade-in">
                Alterações salvas com sucesso! ✨
              </div>
            )}

            <button
              type="submit"
              disabled={isSaving}
              className="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2"
            >
              <Save size={16} />
              <span>{isSaving ? 'Salvando...' : 'Salvar Alterações do Perfil'}</span>
            </button>
          </form>

          {/* Botão Sair */}
          <div className="pt-4 border-t border-card-border flex justify-end">
            <button
              onClick={() => signOut().then(() => router.push('/'))}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-500/10 transition-colors"
            >
              <LogOut size={14} />
              <span>Desconectar desta conta</span>
            </button>
          </div>

        </div>

      </div>
    </AppShell>
  );
}
