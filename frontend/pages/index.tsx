import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';

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

export default function LoginPage() {
  const router = useRouter();
  const { signIn, signUp, signInWithGoogle, continueAsGuest, user, isGuest } = useAuth();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isCardShaking, setIsCardShaking] = useState(false);

  // Robot State
  const [robotMood, setRobotMood] = useState<'idle' | 'happy' | 'shy' | 'excited' | 'success'>('idle');
  const [isTurned, setIsTurned] = useState(false);
  const [robotMessage, setRobotMessage] = useState('Hora do e-mail! Sem spam por aqui.');
  const [eyeOffset, setEyeOffset] = useState({ x: 0, y: 0 });
  const [headTilt, setHeadTilt] = useState({ rx: 0, ry: 0 });

  // Se já logado, redireciona para dashboard
  useEffect(() => {
    if (user || isGuest) {
      router.replace('/dashboard');
    }
  }, [user, isGuest, router]);

  // Piscar de olhos natural do robô
  useEffect(() => {
    if (isTurned) return;
    const interval = setInterval(() => {
      const eyesEl = document.getElementById('eyes');
      if (eyesEl) {
        eyesEl.classList.add('blink');
        setTimeout(() => eyesEl.classList.remove('blink'), 220);
      }
    }, 4200);
    return () => clearInterval(interval);
  }, [isTurned]);

  const followTyping = (val: string) => {
    const ratio = Math.min(val.length / 22, 1);
    setEyeOffset({ x: -6 + 12 * ratio, y: 5 });
    setHeadTilt({ ry: -5 + 10 * ratio, rx: -8 });
  };

  const handleModeChange = (newMode: 'login' | 'register') => {
    setMode(newMode);
    setErrorMsg('');
    if (newMode === 'login') {
      setRobotMood('idle');
      setRobotMessage('Hora do e-mail! Sem spam por aqui.');
    } else {
      setRobotMood('happy');
      setRobotMessage('Informe seu nome, e-mail e crie uma senha.');
    }
  };

  const handlePasswordFocus = () => {
    if (!showPassword) {
      setIsTurned(true);
      setRobotMessage('Sem espiar a senha! 🙈');
    }
  };

  const handlePasswordBlur = () => {
    setIsTurned(false);
    setRobotMessage('Pode continuar...');
    setEyeOffset({ x: 0, y: 0 });
    setHeadTilt({ rx: 0, ry: 0 });
  };

  const togglePeekPassword = () => {
    const next = !showPassword;
    setShowPassword(next);
    if (next) {
      setIsTurned(false);
      setRobotMood('happy');
      setRobotMessage('Agora você pode ver a senha! 👀');
    } else {
      setIsTurned(true);
      setRobotMessage('Escondendo de novo! 🙈');
    }
  };

  const triggerShake = () => {
    setIsCardShaking(true);
    setTimeout(() => setIsCardShaking(false), 500);
  };

  const handleGoogleLogin = async () => {
    setIsGoogleSubmitting(true);
    setErrorMsg('');
    setIsTurned(false);
    setRobotMood('happy');
    setRobotMessage('Conectando com o Google... 🌐');

    const res = await signInWithGoogle();

    if (res.error) {
      setErrorMsg(res.error);
      setRobotMood('idle');
      setRobotMessage('Ops! Tivemos um detalhe na conexão com o Google.');
      setIsGoogleSubmitting(false);
      triggerShake();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setIsSubmitting(true);
    setErrorMsg('');
    setIsTurned(false);
    setRobotMood('excited');
    setRobotMessage('Verificando credenciais... ⚡');

    if (mode === 'login') {
      const res = await signIn(email, password);
      if (res.error) {
        setErrorMsg(res.error);
        setRobotMood('idle');
        setRobotMessage('Ops! E-mail ou senha incorretos.');
        setIsSubmitting(false);
        triggerShake();
      } else {
        setRobotMood('success');
        setRobotMessage('Acesso liberado! Bem-vindo ao Ió! 🚀');
        setTimeout(() => {
          router.push('/dashboard');
        }, 400);
      }
    } else {
      if (!name) {
        setErrorMsg('Por favor, informe seu nome completo.');
        setIsSubmitting(false);
        triggerShake();
        return;
      }
      if (password.length < 6) {
        setErrorMsg('A senha precisa ter pelo menos 6 caracteres.');
        setIsSubmitting(false);
        triggerShake();
        return;
      }

      const res = await signUp(email, password, name);
      if (res.error) {
        setErrorMsg(res.error);
        setRobotMood('idle');
        setRobotMessage('Ops, erro ao criar sua conta.');
        setIsSubmitting(false);
        triggerShake();
      } else {
        setRobotMood('success');
        setRobotMessage('Conta criada com sucesso! Redirecionando... 🎉');
        setTimeout(() => {
          router.push('/dashboard');
        }, 600);
      }
    }
  };

  const handleGuest = () => {
    setIsTurned(false);
    setRobotMood('success');
    setRobotMessage('Acesso liberado em Modo Demonstração! 🚀');
    continueAsGuest();
    setTimeout(() => {
      router.push('/dashboard');
    }, 300);
  };

  return (
    <div className="robot-scene">
      <main className="stage" id="stage">

        {/* ROBOT VOLT */}
        <div
          className={`robot ${isTurned ? 'is-turned' : ''}`}
          id="robot"
          data-mood={robotMood}
        >
          {/* Balão de Fala */}
          <div className="bubble pop" id="bubble" role="status" aria-live="polite">
            <span id="bubbleText">{robotMessage}</span>
          </div>

          {/* Antena */}
          <div className="antenna" aria-hidden="true">
            <span className="antenna-rod"></span>
            <span className="antenna-tip"></span>
          </div>

          {/* Cabeça 3D */}
          <div
            className="head3d"
            aria-hidden="true"
            style={{
              transform: `translateY(var(--hy, 0px)) scale(var(--hsc, 1)) rotateX(${headTilt.rx}deg) rotateY(${headTilt.ry}deg)`
            }}
          >
            <div className="head" id="head">
              <span className="ear ear--l"></span>
              <span className="ear ear--r"></span>

              {/* Face Frontal */}
              <div className="face face--front">
                <div className="visor">
                  <div
                    className="eyes"
                    id="eyes"
                    style={{ transform: `translate(${eyeOffset.x}px, ${eyeOffset.y}px)` }}
                  >
                    <span className="eye eye--l"></span>
                    <span className="eye eye--r"></span>
                  </div>
                  <span className="cheek cheek--l"></span>
                  <span className="cheek cheek--r"></span>
                  <span className="mouth"></span>
                </div>
              </div>

              {/* Face Traseira (Sem espiar senha) */}
              <div className="face face--back">
                <div className="panel">
                  <span className="panel-lights"><i></i><i></i><i></i></span>
                  <div className="meter" id="meter" data-lvl="4">
                    <i className="on"></i>
                    <i className="on"></i>
                    <i className="on"></i>
                    <i className="on"></i>
                  </div>
                  <p className="panel-label">SEM ESPIAR 🙈</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* FORM CARD (COM AS PATINHAS E PÉS DO VOLT) */}
        <form
          className={`robot-card ${isCardShaking ? 'shake' : ''}`}
          id="form"
          onSubmit={handleSubmit}
          noValidate
        >
          {/* Mãozinhas do Volt segurando o card */}
          <span className="hand hand--l" aria-hidden="true"></span>
          <span className="hand hand--r" aria-hidden="true"></span>

          {/* Switch Entrar / Criar Conta */}
          <div className="robot-auth-switch">
            <button
              type="button"
              className={`robot-switch-btn ${mode === 'login' ? 'active' : ''}`}
              onClick={() => handleModeChange('login')}
            >
              Entrar
            </button>
            <button
              type="button"
              className={`robot-switch-btn ${mode === 'register' ? 'active' : ''}`}
              onClick={() => handleModeChange('register')}
            >
              Criar Conta
            </button>
          </div>

          <h1 className="title" id="robot-form-title">
            {mode === 'login' ? 'Beep boop. Quem vai entrar?' : 'Criando seu novo acesso! ✨'}
          </h1>

          {/* BOTÃO GOOGLE / GMAIL */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isGoogleSubmitting}
            className="btn-google-auth"
          >
            {isGoogleSubmitting ? (
              <div className="w-4 h-4 border-2 border-slate-400 border-t-indigo-600 rounded-full animate-spin" />
            ) : (
              <GoogleIcon className="w-4 h-4" />
            )}
            <span>
              {isGoogleSubmitting
                ? 'Conectando...'
                : mode === 'login'
                  ? 'Continuar com Google'
                  : 'Cadastrar com Google'}
            </span>
          </button>

          <div className="robot-divider">
            <span>ou com e-mail</span>
          </div>

          {errorMsg && (
            <div style={{
              padding: '9px 12px',
              borderRadius: '10px',
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#f87171',
              fontSize: '12px',
              fontWeight: 600,
              marginBottom: '14px',
              textAlign: 'center',
              lineHeight: 1.4
            }}>
              {errorMsg}
            </div>
          )}

          {/* Campo Nome Completo (quando Criar Conta) */}
          {mode === 'register' && (
            <label className="field">
              <svg className="field-icon" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 12a4.5 4.5 0 1 0-4.5-4.5A4.5 4.5 0 0 0 12 12Zm0 2c-3.9 0-8 2-8 5v1.5h16V19c0-3-4.1-5-8-5Z"/>
              </svg>
              <input
                id="name"
                type="text"
                placeholder="Seu nome completo"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  followTyping(e.target.value);
                }}
                required
              />
            </label>
          )}

          {/* Campo E-mail */}
          <label className="field">
            <svg className="field-icon" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M4 5h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Zm8 7.3L4.4 7h15.2L12 12.3ZM4 9.2V17h16V9.2l-8 5.3-8-5.3Z"/>
            </svg>
            <input
              id="email"
              type="email"
              placeholder="Seu e-mail"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                followTyping(e.target.value);
              }}
              onFocus={() => {
                setRobotMood('idle');
                setRobotMessage('Hora do e-mail! Sem spam por aqui.');
              }}
              required
            />
          </label>

          {/* Campo Senha */}
          <label className="field">
            <svg className="field-icon" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 2a5 5 0 0 0-5 5v3H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2h-1V7a5 5 0 0 0-5-5Zm-3 8V7a3 3 0 0 1 6 0v3H9Zm3 4a2 2 0 0 1 1 3.7V19h-2v-1.3a2 2 0 0 1 1-3.7Z"/>
            </svg>
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Sua senha secreta"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onFocus={handlePasswordFocus}
              onBlur={handlePasswordBlur}
              required
            />
            <button
              className="peek"
              id="togglePass"
              type="button"
              onClick={togglePeekPassword}
              aria-label={showPassword ? 'Ocultar senha' : 'Ver senha'}
              aria-pressed={showPassword}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 5c-5 0-9.3 3.1-11 7.5C2.7 16.9 7 20 12 20s9.3-3.1 11-7.5C21.3 8.1 17 5 12 5Zm0 12.5a5 5 0 1 1 5-5 5 5 0 0 1-5 5Zm0-8a3 3 0 1 0 3 3 3 3 0 0 0-3-3Z"/>
              </svg>
            </button>
          </label>

          {/* Botão de Envio com Raio */}
          <button
            className="btn-submit"
            id="loginBtn"
            type="submit"
            disabled={isSubmitting}
          >
            <span className="btn-bolt" aria-hidden="true">⚡</span>
            <span className="btn-label" id="btnLabel">
              {isSubmitting
                ? 'VERIFICANDO...'
                : mode === 'login'
                  ? 'ENTRAR NO PAINEL'
                  : 'CRIAR MINHA CONTA'}
            </span>
          </button>

          {/* Pés do Volt saindo embaixo do card */}
          <span className="foot foot--l" aria-hidden="true"></span>
          <span className="foot foot--r" aria-hidden="true"></span>

          {/* Links Inferiores */}
          <div style={{
            marginTop: '18px',
            textAlign: 'center',
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '11.5px'
          }}>
            <button
              type="button"
              onClick={handleGuest}
              style={{
                color: 'var(--text-muted)',
                textDecoration: 'underline',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: 0,
                font: 'inherit'
              }}
            >
              Entrar como visitante (Local)
            </button>
            <button
              type="button"
              onClick={handleGuest}
              style={{
                color: 'var(--text-muted)',
                textDecoration: 'underline',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: 0,
                font: 'inherit'
              }}
            >
              ⚡ Testar sem cadastro
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
