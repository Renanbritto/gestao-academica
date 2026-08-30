import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import { RobotVolt } from '@/components/volt/RobotVolt';
import { Mail, Lock, Eye, EyeOff, Sparkles, ArrowRight, UserPlus, User } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const { signIn, continueAsGuest, user, isGuest } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [robotMood, setRobotMood] = useState<'idle' | 'shy' | 'happy'>('idle');
  const [robotMessage, setRobotMessage] = useState('Oi! Eu sou o Volt. Eu protejo o seu painel.');

  // Se já logado, redireciona para dashboard
  React.useEffect(() => {
    if (user || isGuest) {
      router.replace('/dashboard');
    }
  }, [user, isGuest, router]);

  const handlePasswordFocus = () => {
    if (!showPassword) {
      setRobotMood('shy');
      setRobotMessage('Sem espiar a senha! 🙈');
    }
  };

  const handlePasswordBlur = () => {
    setRobotMood('idle');
    setRobotMessage('Pode continuar digitando...');
  };

  const togglePeekPassword = () => {
    const next = !showPassword;
    setShowPassword(next);
    if (next) {
      setRobotMood('happy');
      setRobotMessage('Agora você pode ver a senha! 👀');
    } else {
      setRobotMood('shy');
      setRobotMessage('Escondendo de novo! 🙈');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setIsSubmitting(true);
    setErrorMsg('');
    setRobotMessage('Verificando suas credenciais... ⚡');

    const res = await signIn(email, password);

    if (res.error) {
      setErrorMsg(res.error);
      setRobotMessage('Ops! E-mail ou senha incorretos.');
      setIsSubmitting(false);
    } else {
      setRobotMood('happy');
      setRobotMessage('Acesso liberado! Bem-vindo ao Ló! 🚀');
      setTimeout(() => {
        router.push('/dashboard');
      }, 500);
    }
  };

  const handleGuest = () => {
    continueAsGuest();
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-[var(--bg-gradient)] relative overflow-hidden">
      
      {/* Luzes de fundo decorativas */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-pink-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-sm sm:max-w-md z-10">
        
        {/* Robô Volt 3D */}
        <RobotVolt mood={robotMood} customMessage={robotMessage} />

        {/* Card do Formulário */}
        <div className="glass p-6 sm:p-8 rounded-3xl border border-card-border shadow-2xl space-y-5">
          
          <div className="text-center space-y-1">
            <h1 className="text-2xl font-display font-black text-[var(--text-main)] tracking-tight">
              Entrar no Ló Acadêmico
            </h1>
            <p className="text-xs text-[var(--text-muted)]">
              Seu painel acadêmico sincronizado em tempo real.
            </p>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold text-center animate-fade-in">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-[var(--text-muted)] block mb-1.5">
                Seu E-mail
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={17} />
                <input
                  type="email"
                  required
                  placeholder="exemplo@universidade.edu.br"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => {
                    setRobotMood('idle');
                    setRobotMessage('Digite seu e-mail cadastrado 📧');
                  }}
                  className="w-full pl-10 pr-3.5 py-3 rounded-2xl bg-card border border-card-border text-sm font-medium focus:outline-none focus:border-indigo-500 text-[var(--text-main)] transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-[var(--text-muted)] block mb-1.5">
                Sua Senha
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={17} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={handlePasswordFocus}
                  onBlur={handlePasswordBlur}
                  className="w-full pl-10 pr-11 py-3 rounded-2xl bg-card border border-card-border text-sm font-medium focus:outline-none focus:border-indigo-500 text-[var(--text-main)] transition-colors"
                />
                <button
                  type="button"
                  onClick={togglePeekPassword}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors"
                  aria-label={showPassword ? 'Ocultar senha' : 'Ver senha'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-pink-600 hover:opacity-95 text-white text-sm font-bold shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
            >
              <span>{isSubmitting ? 'Entrando...' : 'ENTRAR NO PAINEL'}</span>
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          {/* Links Auxiliares */}
          <div className="pt-3 border-t border-card-border/60 flex flex-col sm:flex-row items-center justify-between gap-2.5 text-xs text-[var(--text-muted)]">
            <button
              type="button"
              onClick={handleGuest}
              className="hover:text-[var(--text-main)] underline flex items-center gap-1 transition-colors"
            >
              <User size={13} />
              <span>Modo Visitante (Offline)</span>
            </button>

            <Link
              href="/register"
              className="text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1 transition-colors"
            >
              <UserPlus size={13} />
              <span>Criar nova conta</span>
            </Link>
          </div>

        </div>

      </div>
    </div>
  );
}
