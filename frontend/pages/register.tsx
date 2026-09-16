import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import { RobotVolt } from '@/components/volt/RobotVolt';
import { Mail, Lock, User, ArrowRight, ArrowLeft, AlertCircle } from 'lucide-react';
import Link from 'next/link';

// Ícone oficial SVG do Google em 4 cores
const GoogleIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
    />
  </svg>
);

export default function RegisterPage() {
  const router = useRouter();
  const { signUp, signInWithGoogle } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [robotMood, setRobotMood] = useState<'idle' | 'shy' | 'happy'>('happy');
  const [robotMessage, setRobotMessage] = useState('Oba! Uma nova conta no Ió! 🚀');

  const handleGoogleSignup = async () => {
    setIsGoogleSubmitting(true);
    setErrorMsg('');
    setRobotMood('happy');
    setRobotMessage('Conectando com sua conta Google... 🌐');

    const res = await signInWithGoogle();

    if (res.error) {
      setErrorMsg(res.error);
      setRobotMood('idle');
      setRobotMessage('Ops! Detalhe na conexão com o Google.');
      setIsGoogleSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) return;

    if (password.length < 6) {
      setErrorMsg('A senha precisa ter pelo menos 6 caracteres.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');
    setRobotMessage('Criando seu espaço acadêmico... ✨');

    const res = await signUp(email, password, name);

    if (res.error) {
      setErrorMsg(res.error);
      setRobotMood('idle');
      setRobotMessage('Ops, algo deu errado ao registrar.');
      setIsSubmitting(false);
    } else {
      setSuccessMsg('Conta criada com sucesso! Redirecionando...');
      setRobotMood('happy');
      setRobotMessage('Prontinho! Bem-vindo à família Ió! 🎉');
      setTimeout(() => {
        router.push('/dashboard');
      }, 800);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-[var(--bg-gradient)] relative overflow-hidden">
      
      <div className="w-full max-w-sm sm:max-w-md z-10">
        
        <RobotVolt mood={robotMood} customMessage={robotMessage} />

        <div className="glass p-6 sm:p-8 rounded-3xl border border-card-border shadow-2xl space-y-5">
          
          <div className="text-center space-y-1">
            <h1 className="text-2xl font-display font-black text-[var(--text-main)] tracking-tight">
              Criar Conta no Ió
            </h1>
            <p className="text-xs text-[var(--text-muted)]">
              Comece a gerenciar suas notas, matérias e metas com facilidade.
            </p>
          </div>

          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold flex items-start gap-2 animate-fade-in">
              <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold text-center animate-fade-in">
              {successMsg}
            </div>
          )}

          {/* Cadastro rápido com Google */}
          <button
            type="button"
            onClick={handleGoogleSignup}
            disabled={isGoogleSubmitting}
            className="w-full py-3.5 px-4 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 text-sm font-bold shadow-lg shadow-black/10 hover:shadow-indigo-500/20 transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-3 border border-slate-200 group"
          >
            {isGoogleSubmitting ? (
              <div className="w-5 h-5 border-2 border-slate-400 border-t-indigo-600 rounded-full animate-spin" />
            ) : (
              <GoogleIcon className="w-5 h-5 group-hover:scale-110 transition-transform" />
            )}
            <span className="tracking-tight">
              {isGoogleSubmitting ? 'Iniciando Google...' : 'Cadastrar com Google'}
            </span>
          </button>

          {/* Divisor */}
          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-[var(--glass-border)]"></div>
            <span className="flex-shrink mx-3 text-[11px] text-[var(--text-muted)] uppercase tracking-wider font-semibold">
              ou crie com e-mail
            </span>
            <div className="flex-grow border-t border-[var(--glass-border)]"></div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="text-xs font-semibold text-[var(--text-muted)] block mb-1">
                Seu Nome Completo
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={17} />
                <input
                  type="text"
                  required
                  placeholder="Ex: Monalysa Rocha"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-2xl bg-card border border-card-border text-sm font-medium focus:outline-none focus:border-indigo-500 text-[var(--text-main)] transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-[var(--text-muted)] block mb-1">
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
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-2xl bg-card border border-card-border text-sm font-medium focus:outline-none focus:border-indigo-500 text-[var(--text-main)] transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-[var(--text-muted)] block mb-1">
                Crie uma Senha
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={17} />
                <input
                  type="password"
                  required
                  minLength={6}
                  placeholder="Mínimo 6 caracteres"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-2xl bg-card border border-card-border text-sm font-medium focus:outline-none focus:border-indigo-500 text-[var(--text-main)] transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-pink-600 hover:opacity-95 text-white text-xs font-bold shadow-md shadow-indigo-600/25 transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
            >
              <span>{isSubmitting ? 'Cadastrando...' : 'CRIAR CONTA'}</span>
              <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          <div className="pt-3 border-t border-card-border/60 text-center text-xs text-[var(--text-muted)] flex items-center justify-center gap-1.5">
            <span>Já possui cadastro?</span>
            <Link href="/" className="text-indigo-400 hover:text-indigo-300 font-bold underline">
              Fazer Login
            </Link>
          </div>

        </div>

      </div>
    </div>
  );
}
