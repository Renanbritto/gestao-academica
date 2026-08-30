import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import { RobotVolt } from '@/components/volt/RobotVolt';
import { Mail, Lock, User, Sparkles, ArrowRight, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function RegisterPage() {
  const router = useRouter();
  const { signUp } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [robotMood, setRobotMood] = useState<'idle' | 'shy' | 'happy'>('happy');
  const [robotMessage, setRobotMessage] = useState('Oba! Uma nova conta no Ló! 🚀');

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
      setRobotMessage('Prontinho! Bem-vindo à família Ló! 🎉');
      setTimeout(() => {
        router.push('/dashboard');
      }, 1000);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-[var(--bg-gradient)] relative overflow-hidden">
      
      <div className="w-full max-w-sm sm:max-w-md z-10">
        
        <RobotVolt mood={robotMood} customMessage={robotMessage} />

        <div className="glass p-6 sm:p-8 rounded-3xl border border-card-border shadow-2xl space-y-5">
          
          <div className="text-center space-y-1">
            <h1 className="text-2xl font-display font-black text-[var(--text-main)] tracking-tight">
              Criar Conta no Ló
            </h1>
            <p className="text-xs text-[var(--text-muted)]">
              Comece a gerenciar suas notas, provas e metas de forma inteligente.
            </p>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold text-center animate-fade-in">
              {errorMsg}
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold text-center animate-fade-in">
              {successMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-[var(--text-muted)] block mb-1.5">
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
                  className="w-full pl-10 pr-3.5 py-3 rounded-2xl bg-card border border-card-border text-sm font-medium focus:outline-none focus:border-indigo-500 text-[var(--text-main)] transition-colors"
                />
              </div>
            </div>

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
                  className="w-full pl-10 pr-3.5 py-3 rounded-2xl bg-card border border-card-border text-sm font-medium focus:outline-none focus:border-indigo-500 text-[var(--text-main)] transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-[var(--text-muted)] block mb-1.5">
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
                  className="w-full pl-10 pr-3.5 py-3 rounded-2xl bg-card border border-card-border text-sm font-medium focus:outline-none focus:border-indigo-500 text-[var(--text-main)] transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-pink-600 hover:opacity-95 text-white text-sm font-bold shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
            >
              <span>{isSubmitting ? 'Cadastrando...' : 'CRIAR MINHA CONTA'}</span>
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          <div className="pt-3 border-t border-card-border/60 text-center text-xs text-[var(--text-muted)]">
            <span>Já tem uma conta? </span>
            <Link href="/" className="text-indigo-400 hover:text-indigo-300 font-bold underline">
              Fazer Login
            </Link>
          </div>

        </div>

      </div>
    </div>
  );
}
