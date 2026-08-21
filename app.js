// =============================================================================
// APP STATE & DATABASE MANAGER (LOCALSTORAGE + SUPABASE REALTIME CLOUD)
// =============================================================================

const STORAGE_KEYS = {
  PROFILE: 'academic_profile_v6',
  SUBJECTS: 'academic_subjects_v6',
  ACTIVITIES: 'academic_activities_v6',
  THEME: 'academic_theme_v6'
};

const PASSING_GRADE = 70.0; // Pontuação mínima para aprovação na faculdade

// Perfil Inicial Padrão
const DEFAULT_PROFILE = {
  name: 'Monalysa Delvivo Rocha',
  course: 'Direito',
  period: '7º Período',
  target_gpa: 85.0, // Meta 85 pontos de 100
  love_note: 'Bem vinda ao seu painel da facul, boa volta as aulas! ❤️',
  theme: 'dark',
  avatar_data_url: null
};

// Matérias Iniciais
const DEFAULT_SUBJECTS = [
  { id: 1, name: 'Direito Internacional Público', professor: 'Prof. Marcus Vinícius', target_grade: 85.0, color: '#6366f1' },
  { id: 2, name: 'Direito Civil VII', professor: 'Profa. Helena Santos', target_grade: 80.0, color: '#10b981' },
  { id: 3, name: 'Prática Jurídica Simulada Trabalhista', professor: 'Prof. André Luiz', target_grade: 90.0, color: '#ec4899' },
  { id: 4, name: 'Prática Jurídica Simulada Cível II', professor: 'Profa. Camila Oliveira', target_grade: 85.0, color: '#8b5cf6' },
  { id: 5, name: 'Projeto Integrador', professor: 'Prof. Fernando Rocha', target_grade: 90.0, color: '#f59e0b' }
];

function getFormattedDate(daysFromNow) {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  return d.toISOString().split('T')[0];
}

// Atividades Iniciais
const DEFAULT_ACTIVITIES = [
  { id: 101, subject_id: 1, title: 'Prova 1 (Tratados Internacionais)', type: 'Prova', due_date: getFormattedDate(3), weight: 40, max_grade: 100, obtained_grade: null, status: 'Pendente', notes: 'Conteúdo: Fontes do Direito Internacional, Tratados e Convenções.' },
  { id: 102, subject_id: 2, title: 'Estudo de Caso - Direito Sucessório', type: 'Trabalho', due_date: getFormattedDate(-3), weight: 30, max_grade: 100, obtained_grade: 95.0, status: 'Concluído', notes: 'Análise jurisprudencial do STJ.' },
  { id: 103, subject_id: 3, title: 'Redação de Reclamação Trabalhista', type: 'Trabalho', due_date: getFormattedDate(7), weight: 30, max_grade: 100, obtained_grade: null, status: 'Pendente', notes: 'Peça prática simulada de petição inicial.' },
  { id: 104, subject_id: 4, title: 'Peça Prática - Contestação Cível', type: 'Trabalho', due_date: getFormattedDate(10), weight: 25, max_grade: 100, obtained_grade: null, status: 'Pendente', notes: 'Simulação de audiência de conciliação e contestação.' },
  { id: 105, subject_id: 5, title: 'Entrega da 1ª Etapa do Projeto', type: 'Exercício', due_date: getFormattedDate(-2), weight: 20, max_grade: 100, obtained_grade: 90.0, status: 'Concluído', notes: 'Tema e estrutura metodológica.' }
];

// Helper para Leitura & Gravação em LocalStorage (Fallback / Offline)
function loadData(key, defaultVal) {
  const raw = localStorage.getItem(key);
  if (!raw) {
    localStorage.setItem(key, JSON.stringify(defaultVal));
    return defaultVal;
  }
  try {
    return JSON.parse(raw);
  } catch (e) {
    return defaultVal;
  }
}

function saveData(key, val) {
  localStorage.setItem(key, JSON.stringify(val));
}

// App State
let profile = loadData(STORAGE_KEYS.PROFILE, DEFAULT_PROFILE);
let subjects = loadData(STORAGE_KEYS.SUBJECTS, DEFAULT_SUBJECTS);
let activities = loadData(STORAGE_KEYS.ACTIVITIES, DEFAULT_ACTIVITIES);
let currentUser = null;
let isGuestMode = false;
let robotAuthMode = 'login'; // 'login' ou 'register'

// Inicializa Tema
document.documentElement.setAttribute('data-theme', profile.theme || 'dark');

// =============================================================================
// TOAST NOTIFICATION & MODAL DIALOGS
// =============================================================================

function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;

  let icon = '<i class="fa-solid fa-circle-check" style="color: var(--accent-success);"></i>';
  if (type === 'warning') icon = '<i class="fa-solid fa-triangle-exclamation" style="color: var(--accent-warning);"></i>';
  if (type === 'danger') icon = '<i class="fa-solid fa-circle-exclamation" style="color: var(--accent-danger);"></i>';
  if (type === 'info') icon = '<i class="fa-solid fa-circle-info" style="color: var(--accent-primary);"></i>';

  toast.innerHTML = `${icon} <span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    toast.style.transition = 'all 0.3s ease-out';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

function closeCustomModal() {
  const overlay = document.getElementById('custom-modal-overlay');
  if (overlay) overlay.style.display = 'none';
}

function showConfirmModal(title, bodyText, confirmText, onConfirmCallback) {
  document.getElementById('custom-modal-title').innerHTML = title;
  document.getElementById('custom-modal-body').innerHTML = `<p style="font-size: 0.95rem; color: var(--text-main);">${bodyText}</p>`;
  
  const footer = document.getElementById('custom-modal-footer');
  footer.innerHTML = `
    <button class="btn-secondary" onclick="closeCustomModal()">Cancelar</button>
    <button class="btn-danger" id="modal-btn-confirm">${confirmText || 'Confirmar'}</button>
  `;

  document.getElementById('modal-btn-confirm').onclick = function() {
    closeCustomModal();
    if (onConfirmCallback) onConfirmCallback();
  };

  document.getElementById('custom-modal-overlay').style.display = 'flex';
}

function showPromptModal(title, labelText, defaultVal, onSubmitCallback) {
  document.getElementById('custom-modal-title').innerHTML = title;
  document.getElementById('custom-modal-body').innerHTML = `
    <div class="form-group">
      <label style="font-size:0.9rem; font-weight:600; color:var(--text-muted);">${labelText}</label>
      <input type="number" class="form-control" id="modal-prompt-input" value="${defaultVal || ''}" step="1" min="0" max="100" autofocus required>
    </div>
  `;

  const footer = document.getElementById('custom-modal-footer');
  footer.innerHTML = `
    <button class="btn-secondary" onclick="closeCustomModal()">Cancelar</button>
    <button class="btn-primary" id="modal-btn-submit"><i class="fa-solid fa-check"></i> Salvar Nota</button>
  `;

  document.getElementById('modal-btn-submit').onclick = function() {
    const val = document.getElementById('modal-prompt-input').value;
    closeCustomModal();
    if (onSubmitCallback) onSubmitCallback(val);
  };

  document.getElementById('custom-modal-overlay').style.display = 'flex';
}

// =============================================================================
// SUPABASE AUTHENTICATION & DATA SYNC
// =============================================================================

async function initSupabaseAuth() {
  const client = getSupabase();
  const loginScene = document.getElementById('login-scene');

  if (!client) {
    // Sem Supabase: mostra a tela de login inicial
    if (loginScene && !currentUser && !isGuestMode) {
      loginScene.classList.remove('hidden');
    }
    updateCloudUIStatus();
    return;
  }

  try {
    const { data: { session }, error } = await client.auth.getSession();
    if (session && session.user) {
      currentUser = session.user;
      await syncDataFromSupabase();
      if (loginScene) loginScene.classList.add('hidden');
    } else {
      currentUser = null;
      if (loginScene && !isGuestMode) {
        loginScene.classList.remove('hidden');
      }
    }
  } catch (err) {
    console.warn('Erro ao verificar sessão Supabase:', err);
    if (loginScene && !isGuestMode) loginScene.classList.remove('hidden');
  }

  updateCloudUIStatus();

  // Escuta mudanças de autenticação
  client.auth.onAuthStateChange(async (event, session) => {
    if (session && session.user) {
      currentUser = session.user;
      await syncDataFromSupabase();
      if (loginScene) loginScene.classList.add('hidden');
    } else {
      currentUser = null;
      if (!isGuestMode && loginScene) {
        loginScene.classList.remove('hidden');
      }
    }
    updateCloudUIStatus();
    refreshAll();
  });
}

function updateCloudUIStatus() {
  const headerBtn = document.getElementById('header-auth-btn');
  const headerText = document.getElementById('header-auth-text');
  const headerIcon = document.getElementById('header-auth-icon');
  const sidebarBtn = document.getElementById('sidebar-cloud-status-btn');
  const sidebarText = document.getElementById('sidebar-cloud-text');
  const sidebarIcon = document.getElementById('sidebar-cloud-icon');
  const profileStatusText = document.getElementById('profile-cloud-status-text');
  const profileAuthActions = document.getElementById('profile-auth-actions');

  const configured = SUPABASE_CONFIG.isConfigured();

  if (currentUser) {
    if (headerBtn) {
      headerBtn.className = 'auth-pill-btn connected';
      headerText.innerText = 'Nuvem Sincronizada';
      headerIcon.className = 'fa-solid fa-cloud-check';
    }
    if (sidebarText && sidebarIcon) {
      sidebarText.innerText = 'Nuvem Conectada';
      sidebarIcon.className = 'fa-solid fa-cloud-check';
      sidebarIcon.style.color = 'var(--accent-success)';
    }
    if (profileStatusText) {
      profileStatusText.innerHTML = `Conectado como <strong>${currentUser.email}</strong> • Seus dados estão salvos na nuvem.`;
    }
    if (profileAuthActions) {
      profileAuthActions.innerHTML = `
        <span class="auth-user-badge"><i class="fa-solid fa-circle-check"></i> ${currentUser.email}</span>
        <button class="btn-danger" style="font-size: 0.82rem; padding: 6px 14px;" onclick="handleSignOut()">
          <i class="fa-solid fa-arrow-right-from-bracket"></i> Desconectar / Sair
        </button>
      `;
    }
  } else if (configured) {
    if (headerBtn) {
      headerBtn.className = 'auth-pill-btn';
      headerText.innerText = 'Entrar / Sincronizar';
      headerIcon.className = 'fa-solid fa-cloud-arrow-up';
    }
    if (sidebarText && sidebarIcon) {
      sidebarText.innerText = 'Entrar na Nuvem';
      sidebarIcon.className = 'fa-solid fa-cloud-arrow-up';
      sidebarIcon.style.color = 'var(--accent-primary)';
    }
    if (profileStatusText) {
      profileStatusText.innerText = 'Pronto para sincronizar! Faça login para salvar seus dados na nuvem.';
    }
    if (profileAuthActions) {
      profileAuthActions.innerHTML = `
        <button class="btn-primary" style="font-size: 0.82rem; padding: 6px 16px;" onclick="openLoginScene('login')">
          <i class="fa-solid fa-arrow-right-to-bracket"></i> Fazer Login
        </button>
        <button class="btn-secondary" style="font-size: 0.82rem; padding: 6px 16px;" onclick="openLoginScene('register')">
          <i class="fa-solid fa-user-plus"></i> Criar Conta
        </button>
      `;
    }
  } else {
    if (headerBtn) {
      headerBtn.className = 'auth-pill-btn';
      headerText.innerText = 'Conectar Nuvem';
      headerIcon.className = 'fa-solid fa-cloud';
    }
    if (sidebarText && sidebarIcon) {
      sidebarText.innerText = 'Modo Local (Offline)';
      sidebarIcon.className = 'fa-solid fa-hard-drive';
      sidebarIcon.style.color = 'var(--accent-warning)';
    }
    if (profileStatusText) {
      profileStatusText.innerText = 'Salvando localmente no navegador. Conecte ao Supabase para sincronizar no celular e tablet.';
    }
    if (profileAuthActions) {
      profileAuthActions.innerHTML = `
        <button class="btn-primary" style="font-size: 0.82rem; padding: 6px 16px;" onclick="openSupabaseSettingsModal()">
          <i class="fa-solid fa-plug"></i> Conectar ao Supabase Gratuito
        </button>
      `;
    }
  }
}

// Sincronização Completa com o Banco de Dados Supabase
async function syncDataFromSupabase() {
  const client = getSupabase();
  if (!client || !currentUser) return;

  try {
    // 1. Carregar ou criar Profile
    const { data: dbProfile } = await client
      .from('profiles')
      .select('*')
      .eq('id', currentUser.id)
      .maybeSingle();

    if (dbProfile) {
      profile = {
        name: dbProfile.name || profile.name,
        course: dbProfile.course || profile.course,
        period: dbProfile.period || profile.period,
        target_gpa: dbProfile.target_gpa !== null ? Number(dbProfile.target_gpa) : profile.target_gpa,
        love_note: dbProfile.love_note || profile.love_note,
        theme: dbProfile.theme || profile.theme,
        avatar_data_url: dbProfile.avatar_data_url || profile.avatar_data_url
      };
      saveData(STORAGE_KEYS.PROFILE, profile);
      document.documentElement.setAttribute('data-theme', profile.theme || 'dark');
      updateThemeIcon(profile.theme || 'dark');
    } else {
      await client.from('profiles').upsert({
        id: currentUser.id,
        name: profile.name,
        course: profile.course,
        period: profile.period,
        target_gpa: profile.target_gpa,
        love_note: profile.love_note,
        theme: profile.theme,
        avatar_data_url: profile.avatar_data_url
      });
    }

    // 2. Carregar Matérias
    const { data: dbSubjects } = await client
      .from('subjects')
      .select('*')
      .eq('user_id', currentUser.id)
      .order('id', { ascending: true });

    if (dbSubjects && dbSubjects.length > 0) {
      subjects = dbSubjects;
      saveData(STORAGE_KEYS.SUBJECTS, subjects);
    } else if (subjects && subjects.length > 0) {
      const toInsert = subjects.map(s => ({
        user_id: currentUser.id,
        name: s.name,
        professor: s.professor,
        target_grade: s.target_grade,
        color: s.color
      }));
      const { data: insertedSubs } = await client.from('subjects').insert(toInsert).select();
      if (insertedSubs) {
        subjects = insertedSubs;
        saveData(STORAGE_KEYS.SUBJECTS, subjects);
      }
    }

    // 3. Carregar Atividades
    const { data: dbActs } = await client
      .from('activities')
      .select('*')
      .eq('user_id', currentUser.id)
      .order('due_date', { ascending: true });

    if (dbActs && dbActs.length > 0) {
      activities = dbActs;
      saveData(STORAGE_KEYS.ACTIVITIES, activities);
    } else if (activities && activities.length > 0 && subjects.length > 0) {
      const matchingSub = subjects[0];
      const toInsertActs = activities.map(a => ({
        user_id: currentUser.id,
        subject_id: matchingSub ? matchingSub.id : null,
        title: a.title,
        type: a.type,
        due_date: a.due_date,
        weight: a.weight,
        max_grade: a.max_grade || 100,
        obtained_grade: a.obtained_grade,
        status: a.status,
        notes: a.notes
      }));
      const { data: insertedActs } = await client.from('activities').insert(toInsertActs).select();
      if (insertedActs) {
        activities = insertedActs;
        saveData(STORAGE_KEYS.ACTIVITIES, activities);
      }
    }

    refreshAll();
  } catch (err) {
    console.error('Erro na sincronização com o Supabase:', err);
  }
}

// =============================================================================
// MODAIS E CONTROLE DA TELA DE LOGIN DO ROBÔ VOLT
// =============================================================================

function openLoginScene(mode = 'login') {
  setRobotAuthMode(mode);
  const loginScene = document.getElementById('login-scene');
  if (loginScene) loginScene.classList.remove('hidden');
}

function handleAuthButtonClick() {
  if (!SUPABASE_CONFIG.isConfigured()) {
    openSupabaseSettingsModal();
  } else if (!currentUser) {
    openLoginScene('login');
  } else {
    switchTab('perfil');
  }
}

function continueAsGuest() {
  isGuestMode = true;
  const loginScene = document.getElementById('login-scene');
  if (loginScene) {
    const sayFn = window.voltSay || say;
    sayFn("Modo visitante ativado! Aproveite o painel. ✨");
    setTimeout(() => {
      loginScene.classList.add('hidden');
    }, 600);
  }
}

function setRobotAuthMode(mode) {
  robotAuthMode = mode;
  const btnLogin = document.getElementById('btn-mode-login');
  const btnReg = document.getElementById('btn-mode-register');
  const nameBox = document.getElementById('field-name-box');
  const titleEl = document.getElementById('robot-form-title');
  const btnLabel = document.getElementById('btnLabel');

  if (mode === 'login') {
    if (btnLogin) btnLogin.classList.add('active');
    if (btnReg) btnReg.classList.remove('active');
    if (nameBox) nameBox.style.display = 'none';
    if (titleEl) titleEl.innerText = 'Beep boop. Quem vai entrar?';
    if (btnLabel) btnLabel.innerText = 'ENTRAR NO PAINEL';
    say('Digite seu e-mail e senha cadastrados para entrar.');
  } else {
    if (btnLogin) btnLogin.classList.remove('active');
    if (btnReg) btnReg.classList.add('active');
    if (nameBox) nameBox.style.display = 'flex';
    if (titleEl) titleEl.innerText = 'Criando seu novo acesso! ✨';
    if (btnLabel) btnLabel.innerText = 'CRIAR MINHA CONTA';
    say('Informe seu nome, e-mail e crie uma senha.');
  }
}

function openSupabaseSettingsModal() {
  document.getElementById('input-supabase-url').value = SUPABASE_CONFIG.getUrl();
  document.getElementById('input-supabase-key').value = SUPABASE_CONFIG.getAnonKey();
  document.getElementById('supabase-settings-modal-overlay').style.display = 'flex';
}

function closeSupabaseSettingsModal() {
  document.getElementById('supabase-settings-modal-overlay').style.display = 'none';
}

function handleSaveSupabaseSettings(e) {
  e.preventDefault();
  const url = document.getElementById('input-supabase-url').value.trim();
  const key = document.getElementById('input-supabase-key').value.trim();

  if (!url || !key) {
    showToast('Preencha a URL e a Anon Key do Supabase.', 'warning');
    return;
  }

  SUPABASE_CONFIG.saveCredentials(url, key);
  closeSupabaseSettingsModal();
  showToast('Credenciais salvas! Conectando à nuvem... ✨', 'info');

  supabaseClient = null;
  initSupabaseAuth();
}

function handleClearSupabaseSettings() {
  showConfirmModal(
    '🗑️ Limpar Configuração do Supabase',
    'Deseja remover as chaves da nuvem salvas neste navegador?',
    'Sim, Limpar',
    () => {
      SUPABASE_CONFIG.clearCredentials();
      supabaseClient = null;
      currentUser = null;
      closeSupabaseSettingsModal();
      updateCloudUIStatus();
      showToast('Configurações removidas. O site operará no modo local.', 'info');
    }
  );
}

async function handleSignOut() {
  const client = getSupabase();
  if (client) {
    await client.auth.signOut();
  }
  currentUser = null;
  isGuestMode = false;
  updateCloudUIStatus();
  showToast('Você desconectou da nuvem.', 'info');
  openLoginScene('login');
  refreshAll();
}

// =============================================================================
// ROBÔ VOLT INTERATIVO (LÓGICA DE ANIMAÇÃO, MOVIMENTO E FEEDBACK)
// =============================================================================

let voltDone = false;
let lastSaid = '';

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

function setMood(mood) {
  const robot = document.getElementById('robot');
  if (robot && !voltDone) robot.dataset.mood = mood;
}

function say(text) {
  const bubble = document.getElementById('bubble');
  const bubbleText = document.getElementById('bubbleText');
  if (!bubble || !bubbleText) return;

  if (text === lastSaid) return;
  lastSaid = text;
  bubbleText.textContent = text;
  bubble.classList.remove('pop');
  void bubble.offsetWidth;
  bubble.classList.add('pop');
}
window.voltSay = say;

function look(x, y) {
  const eyes = document.getElementById('eyes');
  if (eyes) {
    eyes.style.setProperty('--lx', `${x}px`);
    eyes.style.setProperty('--ly', `${y}px`);
  }
}

function tilt(ry, rx) {
  const head3d = document.querySelector('.head3d');
  if (head3d) {
    head3d.style.setProperty('--ry', `${ry}deg`);
    head3d.style.setProperty('--rx', `${rx}deg`);
  }
}

function followTyping(input) {
  const ratio = Math.min(input.value.length / 22, 1);
  look(-6 + 12 * ratio, 5);
  tilt(-5 + 10 * ratio, -8);
}

function turnAway(on) {
  const robot = document.getElementById('robot');
  if (robot) robot.classList.toggle('is-turned', on);
}

function confettiBurst() {
  const colors = ['#ff6b4b', '#2ec4b6', '#ffc53d', '#23252d', '#fffdf8', '#6366f1', '#ec4899'];
  const btn = document.getElementById('loginBtn');
  const host = document.querySelector('.scene');
  if (!btn || !host) return;

  const origin = btn.getBoundingClientRect();
  const hostRect = host.getBoundingClientRect();
  const ox = origin.left - hostRect.left + origin.width / 2;
  const oy = origin.top - hostRect.top;

  for (let i = 0; i < 65; i++) {
    const bit = document.createElement('span');
    bit.className = 'confetti';
    bit.style.background = pick(colors);
    if (Math.random() > 0.5) bit.style.borderRadius = '50%';
    host.appendChild(bit);

    const angle = -Math.PI / 2 + (Math.random() - 0.5) * 1.6;
    const speed = 240 + Math.random() * 380;
    const tx = Math.cos(angle) * speed;
    const ty = Math.sin(angle) * speed;

    bit.animate(
      [
        { transform: `translate(${ox}px, ${oy}px) rotate(0deg) scale(1)`, opacity: 1 },
        { transform: `translate(${ox + tx}px, ${oy + ty + 320}px) rotate(${540 * (Math.random() > 0.5 ? 1 : -1)}deg) scale(.6)`, opacity: 0 }
      ],
      { duration: 1100 + Math.random() * 700, easing: 'cubic-bezier(.15,.6,.35,1)' }
    ).onfinish = function () { bit.remove(); };
  }
}

function initVoltRobot() {
  const robot = document.getElementById('robot');
  const form = document.getElementById('form');
  const nameI = document.getElementById('name');
  const emailI = document.getElementById('email');
  const passI = document.getElementById('password');
  const peekBtn = document.getElementById('togglePass');
  const btn = document.getElementById('loginBtn');
  const btnLabel = document.getElementById('btnLabel');
  const meter = document.getElementById('meter');
  const panelLabel = document.getElementById('panelLabel');

  if (!form || !emailI || !passI) return;

  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  const meterBars = meter ? [...meter.children] : [];

  // 1. Campo Nome
  if (nameI) {
    nameI.addEventListener('focus', () => {
      turnAway(false);
      setMood('watching');
      say(pick(["Olá! Digite seu nome completo.", "Detectei digitação. Pode continuar!"]));
      followTyping(nameI);
    });

    nameI.addEventListener('input', () => {
      followTyping(nameI);
      const v = nameI.value.trim();
      if (v.length >= 2) say(`${v}! Nome lindo, registrado com sucesso.`);
    });
  }

  // 2. Campo E-mail
  emailI.addEventListener('focus', () => {
    turnAway(false);
    setMood('watching');
    say(pick(["Hora do e-mail! Sem spam por aqui.", "Digite seu e-mail de acesso."]));
    followTyping(emailI);
  });

  emailI.addEventListener('input', () => {
    followTyping(emailI);
    if (EMAIL_RE.test(emailI.value.trim())) {
      setMood('happy');
      say(pick(['E-mail válido! Excelente.', 'Formato correto detectado. Adorei!']));
    } else {
      setMood('watching');
      if (emailI.value.includes('@')) say('Quase lá... complete seu domínio.');
    }
  });

  // 3. Campo Senha (Vira a cabeça para trás)
  passI.addEventListener('focus', () => {
    setMood('shy');
    turnAway(true);
    look(0, 0);
    tilt(0, 0);
    say("Senha secreta? Já virei de costas! 🙈");
    if (panelLabel) panelLabel.textContent = 'SEM ESPIAR 🙈';
  });

  passI.addEventListener('blur', (e) => {
    if (e.relatedTarget === peekBtn) return;
    turnAway(false);
  });

  passI.addEventListener('input', () => {
    const v = passI.value;
    let score = 0;
    if (v.length >= 6) score++;
    if (v.length >= 8) score++;
    if (/\d/.test(v)) score++;
    if (/[^a-zA-Z0-9]/.test(v) || (/[a-z]/.test(v) && /[A-Z]/.test(v))) score++;
    if (v.length > 0 && score === 0) score = 1;

    if (meter) {
      meter.dataset.lvl = score;
      meterBars.forEach((bar, i) => bar.classList.toggle('on', i < score));
    }
    if (panelLabel) {
      panelLabel.textContent = v.length === 0
        ? 'SEM ESPIAR 🙈'
        : ['SEM ESPIAR 🙈', 'MUITO CURTA', 'BOA SENHA', 'FORTE', 'COFRE FORTE'][score] || 'BOA';
    }
  });

  // 4. Mostrar / Ocultar Senha
  if (peekBtn) {
    peekBtn.addEventListener('click', () => {
      const show = passI.type === 'password';
      passI.type = show ? 'text' : 'password';
      peekBtn.setAttribute('aria-pressed', String(show));
      if (show) say('Quer espiar? Ainda bem que continuo de costas!');
      passI.focus();
    });
  }

  // 5. Botão Hover & Click
  function hype(on) {
    if (voltDone) return;
    if (on && robot && robot.classList.contains('is-pressed')) return;
    if (robot) robot.classList.toggle('is-hyped', on);
    if (on) {
      turnAway(false);
      setMood('excited');
      say(pick(['Pode clicar! Estou pronto.', 'Vamos lá, clique no botão! ⚡']));
    } else {
      setMood('idle');
      say('Estou de olho por aqui.');
    }
  }

  if (btn) {
    btn.addEventListener('mouseenter', () => hype(true));
    btn.addEventListener('mouseleave', () => hype(false));
    btn.addEventListener('focus', () => hype(true));
    btn.addEventListener('blur', () => hype(false));

    let pressTimer;
    btn.addEventListener('pointerdown', () => {
      clearTimeout(pressTimer);
      if (robot) {
        robot.classList.add('is-pressed');
        robot.dataset.mood = 'pressed';
      }
      say(pick(['Validando...', 'Processando dados...']));
    });

    function releasePress() {
      clearTimeout(pressTimer);
      pressTimer = setTimeout(() => {
        if (robot) {
          robot.classList.remove('is-pressed');
          if (robot.dataset.mood === 'pressed') {
            robot.dataset.mood = voltDone ? 'success' : 'excited';
          }
        }
      }, 340);
    }
    btn.addEventListener('pointerup', releasePress);
    btn.addEventListener('pointercancel', releasePress);
    btn.addEventListener('pointerleave', () => {
      if (robot && robot.classList.contains('is-pressed')) releasePress();
    });
  }

  // 6. Envio do Formulário (Submit e Autenticação)
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (voltDone) return;

    const email = emailI.value.trim();
    const pass = passI.value;
    const name = nameI ? nameI.value.trim() : '';

    if (!EMAIL_RE.test(email)) {
      say('Por favor, digite um e-mail válido.');
      setMood('watching');
      form.classList.remove('shake');
      void form.offsetWidth;
      form.classList.add('shake');
      emailI.focus();
      return;
    }

    if (!pass || pass.length < 6) {
      say('A senha precisa ter pelo menos 6 caracteres.');
      setMood('watching');
      form.classList.remove('shake');
      void form.offsetWidth;
      form.classList.add('shake');
      passI.focus();
      return;
    }

    const client = getSupabase();
    if (btn) btn.disabled = true;

    try {
      if (client) {
        if (robotAuthMode === 'login') {
          const { data, error } = await client.auth.signInWithPassword({ email, password: pass });
          if (error) throw error;
        } else {
          const { data, error } = await client.auth.signUp({
            email,
            password: pass,
            options: { data: { full_name: name || 'Monalysa Delvivo Rocha' } }
          });
          if (error) throw error;
        }
      }

      // Sucesso na Autenticação!
      voltDone = true;
      turnAway(false);
      if (robot) {
        robot.classList.remove('is-hyped');
        robot.dataset.mood = 'success';
        robot.classList.add('is-spinning');
        setTimeout(() => robot.classList.remove('is-spinning'), 950);
      }

      if (btn) {
        btn.classList.add('is-success');
        if (btnLabel) btnLabel.textContent = 'ACESSO LIBERADO ✓';
      }

      look(0, 0);
      tilt(0, 0);
      confettiBurst();
      say(`Acesso liberado! Bem-vinda ao seu painel! ✨`);

      setTimeout(() => {
        const loginScene = document.getElementById('login-scene');
        if (loginScene) loginScene.classList.add('hidden');
        voltDone = false;
        if (btn) {
          btn.disabled = false;
          btn.classList.remove('is-success');
          if (btnLabel) btnLabel.textContent = robotAuthMode === 'login' ? 'ENTRAR NO PAINEL' : 'CRIAR MINHA CONTA';
        }
      }, 1400);

    } catch (err) {
      say(`Ops: ${err.message || 'Erro ao autenticar.'}`);
      setMood('watching');
      form.classList.remove('shake');
      void form.offsetWidth;
      form.classList.add('shake');
      if (btn) btn.disabled = false;
    }
  });

  // Piscar de olhos
  (function blinkLoop() {
    setTimeout(() => {
      const eyes = document.getElementById('eyes');
      if (robot && eyes && robot.dataset.mood !== 'success' && !robot.classList.contains('is-turned')) {
        eyes.classList.add('blink');
        setTimeout(() => eyes.classList.remove('blink'), 150);
      }
      blinkLoop();
    }, 2600 + Math.random() * 2600);
  })();

  // Olhos e cabeça seguindo o cursor do mouse
  let rafPending = false;
  document.addEventListener('mousemove', (e) => {
    const active = document.activeElement;
    if (voltDone || (active && active.tagName === 'INPUT')) return;
    if (rafPending) return;
    rafPending = true;
    requestAnimationFrame(() => {
      rafPending = false;
      if (!robot) return;
      const rect = robot.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = Math.max(-1, Math.min(1, (e.clientX - cx) / 260));
      const dy = Math.max(-1, Math.min(1, (e.clientY - cy) / 260));
      look(dx * 7, dy * 6);
      if (!robot.classList.contains('is-turned')) tilt(dx * 12, -dy * 9);
    });
  });
}

// =============================================================================
// UI RENDERERS DO DASHBOARD ACADÊMICO
// =============================================================================

function renderHeader() {
  document.getElementById('display-name').innerText = profile.name;
  document.getElementById('display-course').innerText = `${profile.course} (${profile.period})`;
  document.getElementById('display-romantic-note').innerText = profile.love_note;

  const avatarBox = document.getElementById('display-avatar-box');
  if (avatarBox) {
    if (profile.avatar_data_url) {
      avatarBox.innerHTML = `<img src="${profile.avatar_data_url}" alt="Foto de Perfil" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;">`;
    } else {
      avatarBox.innerHTML = `<i class="fa-solid fa-graduation-cap"></i>`;
    }
  }
}

function renderMetrics() {
  const doneActivities = activities.filter(a => a.status === 'Concluído' && a.obtained_grade !== null);
  let avgGPA = 0;
  if (doneActivities.length > 0) {
    const sum = doneActivities.reduce((acc, curr) => acc + Number(curr.obtained_grade), 0);
    avgGPA = sum / doneActivities.length;
  }

  document.getElementById('metric-gpa').innerText = `${avgGPA.toFixed(1)} / 100`;
  const targetGpa = Number(profile.target_gpa) || 85.0;
  const gpaSub = document.getElementById('metric-gpa-sub');
  if (avgGPA >= targetGpa && doneActivities.length > 0) {
    gpaSub.innerHTML = `<i class="fa-solid fa-arrow-up"></i> Meta: ${targetGpa.toFixed(0)} pts (Superada! 🎉)`;
    gpaSub.style.color = 'var(--accent-success)';
  } else {
    gpaSub.innerHTML = `Meta: ${targetGpa.toFixed(0)} pts • Mínimo: 70 pts`;
    gpaSub.style.color = 'var(--accent-warning)';
  }

  document.getElementById('metric-subjects-count').innerText = subjects.length;

  const pendingActs = activities.filter(a => a.status === 'Pendente');
  document.getElementById('metric-pending-count').innerText = pendingActs.length;

  const examsCount = pendingActs.filter(a => a.type === 'Prova').length;
  document.getElementById('metric-pending-sub').innerText = `${examsCount} Prova(s) pendente(s)`;

  const nextExamSub = document.getElementById('metric-next-exam-val');
  const nextExamTitle = document.getElementById('metric-next-exam-title');

  if (pendingActs.length > 0) {
    const sorted = [...pendingActs].sort((a, b) => new Date(a.due_date) - new Date(b.due_date));
    const nearest = sorted[0];
    const subject = subjects.find(s => String(s.id) === String(nearest.subject_id));
    const subjectName = subject ? subject.name : '';

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(nearest.due_date + 'T00:00:00');
    const diffDays = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      nextExamSub.innerText = 'Hoje!';
    } else if (diffDays > 0) {
      nextExamSub.innerText = `Em ${diffDays} dia(s)`;
    } else {
      nextExamSub.innerText = `Atrasada (${Math.abs(diffDays)}d)`;
    }
    nextExamTitle.innerText = `${nearest.title} — ${subjectName}`;
  } else {
    nextExamSub.innerText = 'Nenhum';
    nextExamTitle.innerText = 'Tudo em dia! 🎉';
  }
}

function renderSemaphoreCards() {
  const container = document.getElementById('semaphore-cards-container');
  if (!container) return;
  container.innerHTML = '';

  if (subjects.length === 0) {
    container.innerHTML = '<p style="color: var(--text-muted); font-size: 0.9rem;">Nenhuma matéria cadastrada.</p>';
    return;
  }

  subjects.forEach(sub => {
    const subDoneActs = activities.filter(a => String(a.subject_id) === String(sub.id) && a.status === 'Concluído' && a.obtained_grade !== null);
    const allSubActs = activities.filter(a => String(a.subject_id) === String(sub.id));

    let currentScore = 0;
    if (subDoneActs.length > 0) {
      currentScore = subDoneActs.reduce((acc, a) => acc + Number(a.obtained_grade), 0) / subDoneActs.length;
    }

    const targetGrade = Number(sub.target_grade) || 85.0;
    const ptsToPass = Math.max(0, PASSING_GRADE - currentScore);
    const ptsToTarget = Math.max(0, targetGrade - currentScore);

    let semClass = 'semaphore-blue';
    let semText = '🔵 EM DIA (Semestre Iniciando)';
    let passBadgeMsg = `📌 100 pontos em disputa. Faltam <strong>70 pts</strong> para passar.`;

    if (subDoneActs.length === 0) {
      semClass = 'semaphore-blue';
      semText = '🔵 Início do Semestre (aguardando provas e atividades)';
      passBadgeMsg = `📌 100 pontos em disputa no semestre. Faltam <strong>70 pts</strong> para a aprovação.`;
    } else if (currentScore >= PASSING_GRADE) {
      semClass = 'semaphore-green';
      semText = '🟢 APROVADA! 🎉';
      passBadgeMsg = `✨ Você já garantiu os 70 pts necessários de aprovação!`;
    } else {
      if (currentScore >= 60) {
        semClass = 'semaphore-yellow';
        semText = '🟡 BOM RITMO';
        passBadgeMsg = `No caminho! Faltam apenas <strong>${ptsToPass.toFixed(1)}</strong> pts para os 70 pts mínimos.`;
      } else {
        semClass = 'semaphore-yellow';
        semText = '🟡 EM ANDAMENTO';
        passBadgeMsg = `Faltam <strong>${ptsToPass.toFixed(1)}</strong> pts para alcançar os 70 pts.`;
      }
    }

    let targetBadgeMsg = currentScore >= targetGrade 
      ? `⭐ Meta de ${targetGrade.toFixed(0)} pts Alcançada!` 
      : `Faltam <strong>${ptsToTarget.toFixed(1)}</strong> pts para a Meta (${targetGrade.toFixed(0)} pts)`;

    const card = document.createElement('div');
    card.className = 'glass subject-card-item';
    card.style.marginBottom = '12px';
    card.innerHTML = `
      <div style="display:flex; align-items:center; gap:14px; flex:1; min-width:240px;">
        <span style="width:14px; height:14px; border-radius:50%; background:${sub.color}; display:inline-block;"></span>
        <div>
          <h4 style="font-size:1.05rem; font-weight:700;">${sub.name}</h4>
          <span style="font-size:0.82rem; color:var(--text-muted);">${sub.professor || 'Prof. Não informado'} • ${subDoneActs.length} de ${allSubActs.length} avaliações concluídas</span>
        </div>
      </div>

      <div style="text-align:center; min-width:140px;">
        <div style="font-size:0.78rem; color:var(--text-muted); font-weight:600; text-transform:uppercase;">Pontuação Atual</div>
        <div style="font-size:1.6rem; font-weight:800; color:var(--text-main);">${subDoneActs.length > 0 ? currentScore.toFixed(1) : '0.0'} <span style="font-size:0.9rem; color:var(--text-muted);">/ 100</span></div>
      </div>

      <div style="display:flex; flex-direction:column; gap:6px; min-width:270px;">
        <div class="semaphore-badge ${semClass}">
          <span class="semaphore-dot"></span>
          <span>${semText}</span>
        </div>
        <div style="font-size:0.82rem; color:var(--text-main); font-weight:500;">
          ${passBadgeMsg}
        </div>
        <div style="font-size:0.8rem; color:var(--accent-pink); font-weight:600;">
          🎯 ${targetBadgeMsg}
        </div>
      </div>
    `;
    container.appendChild(card);
  });
}

function renderSubjectBarChart() {
  const container = document.getElementById('bar-chart-container');
  if (!container) return;
  container.innerHTML = '';

  if (subjects.length === 0) {
    container.innerHTML = '<p style="color: var(--text-muted); font-size: 0.9rem;">Nenhuma matéria cadastrada.</p>';
    return;
  }

  subjects.forEach(sub => {
    const subActivities = activities.filter(a => String(a.subject_id) === String(sub.id) && a.status === 'Concluído' && a.obtained_grade !== null);
    let avg = 0;
    if (subActivities.length > 0) {
      avg = subActivities.reduce((acc, a) => acc + Number(a.obtained_grade), 0) / subActivities.length;
    }

    const pct = Math.min(100, Math.max(0, avg));

    const item = document.createElement('div');
    item.className = 'bar-item';
    item.innerHTML = `
      <div class="bar-info">
        <span><strong>${sub.name}</strong></span>
        <span>${avg > 0 ? avg.toFixed(1) : 'Aguardando nota'} / 100 pts</span>
      </div>
      <div class="bar-bg">
        <div class="bar-fill" style="width: ${pct > 0 ? pct : 5}%; background: linear-gradient(90deg, ${sub.color || '#6366f1'}, var(--accent-pink));"></div>
      </div>
    `;
    container.appendChild(item);
  });
}

function renderActivitiesTable() {
  const tbody = document.getElementById('activities-tbody');
  const mobileCardsContainer = document.getElementById('mobile-activities-cards');

  if (tbody) tbody.innerHTML = '';
  if (mobileCardsContainer) mobileCardsContainer.innerHTML = '';

  if (activities.length === 0) {
    if (tbody) tbody.innerHTML = `<tr><td colspan="8" style="text-align: center; color: var(--text-muted);">Nenhuma atividade cadastrada.</td></tr>`;
    if (mobileCardsContainer) mobileCardsContainer.innerHTML = `<p style="text-align: center; color: var(--text-muted); font-size: 0.9rem;">Nenhuma atividade cadastrada.</p>`;
    return;
  }

  activities.forEach(act => {
    const sub = subjects.find(s => String(s.id) === String(act.subject_id));
    const subName = sub ? sub.name : 'Matéria';
    const gradeText = act.obtained_grade !== null ? `${Number(act.obtained_grade).toFixed(1)} / 100` : '-';

    let statusBadge = `<span class="badge badge-warning">Pendente</span>`;
    if (act.status === 'Concluído') {
      statusBadge = `<span class="badge badge-success">Concluído</span>`;
    }

    let typeBadge = `<span class="badge badge-info">${act.type}</span>`;
    if (act.type === 'Prova') typeBadge = `<span class="badge badge-danger">Prova</span>`;

    if (tbody) {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><strong>${subName}</strong></td>
        <td>${act.title}</td>
        <td>${typeBadge}</td>
        <td>${act.due_date}</td>
        <td>${act.weight}%</td>
        <td><strong>${gradeText}</strong></td>
        <td>${statusBadge}</td>
        <td>
          <button class="btn-secondary" onclick="toggleActivityStatus('${act.id}')">
            ${act.status === 'Pendente' ? '✅ Concluir' : '🔄 Reabrir'}
          </button>
          <button class="btn-danger" onclick="deleteActivity('${act.id}')">
            <i class="fa-solid fa-trash"></i>
          </button>
        </td>
      `;
      tbody.appendChild(tr);
    }

    if (mobileCardsContainer) {
      const card = document.createElement('div');
      card.className = 'activity-mobile-card';
      card.innerHTML = `
        <div class="activity-mobile-header">
          <span style="font-size: 0.82rem; font-weight: 700; color: ${sub ? sub.color : 'var(--accent-primary)'};">${subName}</span>
          <div style="display:flex; gap:6px;">
            ${typeBadge}
            ${statusBadge}
          </div>
        </div>
        <div class="activity-mobile-title">${act.title}</div>
        <div class="activity-mobile-meta">
          <div>📅 <strong>Data:</strong> ${act.due_date}</div>
          <div>⚖️ <strong>Peso:</strong> ${act.weight}%</div>
          <div>📝 <strong>Nota:</strong> <strong>${gradeText}</strong></div>
          <div>📌 <strong>Obs:</strong> ${act.notes || 'Sem obs'}</div>
        </div>
        <div class="activity-mobile-actions">
          <button class="btn-secondary" onclick="toggleActivityStatus('${act.id}')">
            ${act.status === 'Pendente' ? '✅ Concluir' : '🔄 Reabrir'}
          </button>
          <button class="btn-danger" onclick="deleteActivity('${act.id}')">
            <i class="fa-solid fa-trash"></i> Excluir
          </button>
        </div>
      `;
      mobileCardsContainer.appendChild(card);
    }
  });
}

function renderAlertsList() {
  const container = document.getElementById('alerts-container');
  if (!container) return;
  container.innerHTML = '';

  const pending = activities.filter(a => a.status === 'Pendente');

  if (pending.length === 0) {
    container.innerHTML = `
      <div class="glass" style="padding: 24px; text-align: center; color: var(--accent-success);">
        <h2>🎉 Parabéns Monalysa!</h2>
        <p>Todas as suas provas e peças de Direito estão em dia!</p>
      </div>
    `;
    return;
  }

  const sorted = [...pending].sort((a, b) => new Date(a.due_date) - new Date(b.due_date));
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  sorted.forEach(act => {
    const sub = subjects.find(s => String(s.id) === String(act.subject_id));
    const subName = sub ? sub.name : 'Matéria';
    const dueDate = new Date(act.due_date + 'T00:00:00');
    const diffDays = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));

    let alertClass = 'normal';
    let tagColor = 'background: rgba(16, 185, 129, 0.15); color: var(--accent-success);';
    let daysMsg = `Faltam ${diffDays} dia(s)`;

    if (diffDays < 0) {
      alertClass = 'urgent expired';
      tagColor = 'background: rgba(239, 68, 68, 0.2); color: var(--accent-danger);';
      daysMsg = `Atrasada há ${Math.abs(diffDays)} dia(s)`;
    } else if (diffDays <= 3) {
      alertClass = 'urgent';
      tagColor = 'background: rgba(239, 68, 68, 0.15); color: var(--accent-danger);';
      daysMsg = `🔴 Faltam ${diffDays} dia(s)`;
    } else if (diffDays <= 7) {
      alertClass = 'warning';
      tagColor = 'background: rgba(245, 158, 11, 0.15); color: var(--accent-warning);';
      daysMsg = `🟡 Faltam ${diffDays} dia(s)`;
    } else {
      daysMsg = `🟢 Faltam ${diffDays} dia(s)`;
    }

    const div = document.createElement('div');
    div.className = `glass alert-item ${alertClass}`;
    div.innerHTML = `
      <div>
        <div class="alert-info-title">${act.title} (${subName})</div>
        <div class="alert-info-sub">Tipo: <strong>${act.type}</strong> • Peso na Média: ${act.weight}% • Data: ${act.due_date}</div>
        <div style="font-size: 0.82rem; color: var(--text-muted); margin-top: 4px;">${act.notes || 'Sem observações.'}</div>
      </div>
      <div class="alert-days-tag" style="${tagColor}">
        ${daysMsg}
      </div>
    `;
    container.appendChild(div);
  });
}

function renderSubjectOptions() {
  const calcSelect = document.getElementById('calc-subject-select');
  const actSelect = document.getElementById('act-subject-select');

  const optionsHTML = subjects.map(s => `<option value="${s.id}">${s.name}</option>`).join('');

  if (calcSelect) calcSelect.innerHTML = optionsHTML;
  if (actSelect) actSelect.innerHTML = optionsHTML;

  const subTbody = document.getElementById('subjects-list-tbody');
  const mobileSubList = document.getElementById('mobile-subjects-list');

  if (subTbody) subTbody.innerHTML = '';
  if (mobileSubList) mobileSubList.innerHTML = '';

  subjects.forEach(sub => {
    if (subTbody) {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><span style="display:inline-block; width:12px; height:12px; border-radius:50%; background:${sub.color}; margin-right:8px;"></span><strong>${sub.name}</strong></td>
        <td>${sub.professor || '-'}</td>
        <td>${sub.target_grade} pts</td>
        <td>
          <button class="btn-danger" onclick="deleteSubject('${sub.id}')"><i class="fa-solid fa-trash"></i></button>
        </td>
      `;
      subTbody.appendChild(tr);
    }

    if (mobileSubList) {
      const div = document.createElement('div');
      div.className = 'subject-mobile-card';
      div.innerHTML = `
        <div style="display:flex; align-items:center; gap:10px; flex:1;">
          <span style="width:12px; height:12px; border-radius:50%; background:${sub.color}; display:inline-block; flex-shrink:0;"></span>
          <div>
            <div style="font-weight:700; font-size:0.9rem;">${sub.name}</div>
            <div style="font-size:0.78rem; color:var(--text-muted);">${sub.professor || 'Prof. Não informado'} • Meta: ${sub.target_grade} pts</div>
          </div>
        </div>
        <button class="btn-danger" style="padding:8px 12px;" onclick="deleteSubject('${sub.id}')">
          <i class="fa-solid fa-trash"></i>
        </button>
      `;
      mobileSubList.appendChild(div);
    }
  });
}

function renderProfileForm() {
  document.getElementById('input-name').value = profile.name || '';
  document.getElementById('input-course').value = profile.course || '';
  document.getElementById('input-period').value = profile.period || '';
  document.getElementById('input-target-gpa').value = profile.target_gpa || 85.0;
  document.getElementById('input-note').value = profile.love_note || '';

  const previewBox = document.getElementById('form-avatar-preview');
  if (previewBox) {
    if (profile.avatar_data_url) {
      previewBox.innerHTML = `<img src="${profile.avatar_data_url}" alt="Preview" style="width:70px; height:70px; border-radius:50%; object-fit:cover; border:2px solid var(--accent-pink);">`;
    } else {
      previewBox.innerHTML = `<div style="width:70px; height:70px; border-radius:50%; background:var(--badge-bg); display:flex; align-items:center; justify-content:center; font-size:1.8rem; color:var(--accent-primary);"><i class="fa-solid fa-user"></i></div>`;
    }
  }
}

// =============================================================================
// PHOTO UPLOAD HANDLER
// =============================================================================

async function handlePhotoUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  if (file.size > 2 * 1024 * 1024) {
    showToast('Por favor, escolha uma imagem de até 2MB.', 'warning');
    return;
  }

  const reader = new FileReader();
  reader.onload = async function(evt) {
    profile.avatar_data_url = evt.target.result;
    saveData(STORAGE_KEYS.PROFILE, profile);
    renderHeader();
    renderProfileForm();

    const client = getSupabase();
    if (client && currentUser) {
      await client.from('profiles').update({
        avatar_data_url: profile.avatar_data_url,
        updated_at: new Date()
      }).eq('id', currentUser.id);
    }

    showToast('Foto de perfil atualizada! 📸');
  };
  reader.readAsDataURL(file);
}

async function removePhoto() {
  profile.avatar_data_url = null;
  saveData(STORAGE_KEYS.PROFILE, profile);
  renderHeader();
  renderProfileForm();

  const client = getSupabase();
  if (client && currentUser) {
    await client.from('profiles').update({
      avatar_data_url: null,
      updated_at: new Date()
    }).eq('id', currentUser.id);
  }

  showToast('Foto de perfil removida.', 'warning');
}

// =============================================================================
// CALCULATOR LOGIC (ESCALA 0-100)
// =============================================================================

function calculateTargetScore() {
  const targetGpa = Number(document.getElementById('calc-target-input').value) || 85.0;
  const currentGrade = Number(document.getElementById('calc-current-input').value) || 60.0;
  const weight = Number(document.getElementById('calc-weight-input').value) || 40.0;

  let needed = (targetGpa - (currentGrade * (100 - weight) / 100)) / (weight / 100);
  needed = Math.max(0, Math.min(100, needed));

  document.getElementById('calc-result-val').innerText = `${needed.toFixed(1)} / 100 pts`;
}

// =============================================================================
// CRUD HANDLERS (COM SUPORTE A NUVEM + FALLBACK LOCAL)
// =============================================================================

async function toggleActivityStatus(actId) {
  const act = activities.find(a => String(a.id) === String(actId));
  if (!act) return;

  if (act.status === 'Pendente') {
    showPromptModal(
      '✅ Concluir Atividade',
      `Digite a nota obtida em <strong>"${act.title}"</strong> (escala 0 a 100):`,
      '90',
      async function(inputGrade) {
        if (inputGrade !== null && inputGrade !== '') {
          act.status = 'Concluído';
          act.obtained_grade = parseFloat(inputGrade) || 0;
          saveData(STORAGE_KEYS.ACTIVITIES, activities);
          refreshAll();

          const client = getSupabase();
          if (client && currentUser) {
            await client.from('activities').update({
              status: act.status,
              obtained_grade: act.obtained_grade
            }).eq('id', act.id);
          }

          showToast(`Parabéns! Nota ${act.obtained_grade.toFixed(1)} pts salva para "${act.title}"! 🎉`);
        }
      }
    );
  } else {
    act.status = 'Pendente';
    act.obtained_grade = null;
    saveData(STORAGE_KEYS.ACTIVITIES, activities);
    refreshAll();

    const client = getSupabase();
    if (client && currentUser) {
      await client.from('activities').update({
        status: act.status,
        obtained_grade: null
      }).eq('id', act.id);
    }

    showToast(`Atividade "${act.title}" reaberta.`, 'warning');
  }
}

async function deleteActivity(actId) {
  const act = activities.find(a => String(a.id) === String(actId));
  const title = act ? act.title : 'esta atividade';

  showConfirmModal(
    '🗑️ Excluir Atividade',
    `Tem certeza que deseja excluir a atividade <strong>"${title}"</strong>?`,
    'Sim, Excluir',
    async function() {
      activities = activities.filter(a => String(a.id) !== String(actId));
      saveData(STORAGE_KEYS.ACTIVITIES, activities);
      refreshAll();

      const client = getSupabase();
      if (client && currentUser) {
        await client.from('activities').delete().eq('id', actId);
      }

      showToast(`Atividade "${title}" removida com sucesso!`, 'danger');
    }
  );
}

async function addSubject(e) {
  e.preventDefault();
  const name = document.getElementById('sub-name-input').value.trim();
  const prof = document.getElementById('sub-prof-input').value.trim();
  const target = parseFloat(document.getElementById('sub-target-input').value) || 85.0;
  const color = document.getElementById('sub-color-input').value;

  if (!name) {
    showToast('Por favor, informe o nome da matéria.', 'warning');
    return;
  }

  let newSub = {
    id: Date.now(),
    name: name,
    professor: prof,
    target_grade: target,
    color: color
  };

  const client = getSupabase();
  if (client && currentUser) {
    const { data: inserted } = await client.from('subjects').insert({
      user_id: currentUser.id,
      name: name,
      professor: prof,
      target_grade: target,
      color: color
    }).select().single();

    if (inserted) {
      newSub = inserted;
    }
  }

  subjects.push(newSub);
  saveData(STORAGE_KEYS.SUBJECTS, subjects);

  document.getElementById('form-add-subject').reset();
  showToast(`Matéria "${name}" cadastrada com sucesso! ✨`);
  refreshAll();
}

async function deleteSubject(subId) {
  const sub = subjects.find(s => String(s.id) === String(subId));
  const name = sub ? sub.name : 'esta matéria';

  showConfirmModal(
    '🗑️ Excluir Matéria',
    `Atenção: Excluir a matéria <strong>"${name}"</strong> também excluirá todas as atividades vinculadas a ela. Deseja continuar?`,
    'Sim, Excluir Matéria',
    async function() {
      subjects = subjects.filter(s => String(s.id) !== String(subId));
      activities = activities.filter(a => String(a.subject_id) !== String(subId));

      saveData(STORAGE_KEYS.SUBJECTS, subjects);
      saveData(STORAGE_KEYS.ACTIVITIES, activities);
      refreshAll();

      const client = getSupabase();
      if (client && currentUser) {
        await client.from('subjects').delete().eq('id', subId);
      }

      showToast(`Matéria "${name}" e suas atividades foram excluídas.`, 'danger');
    }
  );
}

async function addActivity(e) {
  e.preventDefault();
  const subId = document.getElementById('act-subject-select').value;
  const title = document.getElementById('act-title-input').value.trim();
  const type = document.getElementById('act-type-select').value;
  const dueDate = document.getElementById('act-date-input').value;
  const weight = parseFloat(document.getElementById('act-weight-input').value) || 20;
  const notes = document.getElementById('act-notes-input').value.trim();

  if (!title || !dueDate) {
    showToast('Por favor, preencha o título e a data de entrega.', 'warning');
    return;
  }

  let newAct = {
    id: Date.now(),
    subject_id: subId,
    title: title,
    type: type,
    due_date: dueDate,
    weight: weight,
    max_grade: 100,
    obtained_grade: null,
    status: 'Pendente',
    notes: notes
  };

  const client = getSupabase();
  if (client && currentUser) {
    const { data: inserted } = await client.from('activities').insert({
      user_id: currentUser.id,
      subject_id: subId,
      title: title,
      type: type,
      due_date: dueDate,
      weight: weight,
      max_grade: 100,
      obtained_grade: null,
      status: 'Pendente',
      notes: notes
    }).select().single();

    if (inserted) {
      newAct = inserted;
    }
  }

  activities.push(newAct);
  saveData(STORAGE_KEYS.ACTIVITIES, activities);

  document.getElementById('form-add-activity').reset();
  showToast(`Atividade "${title}" cadastrada com sucesso! 📌`);
  refreshAll();
}

async function updateProfile(e) {
  e.preventDefault();
  profile.name = document.getElementById('input-name').value;
  profile.course = document.getElementById('input-course').value;
  profile.period = document.getElementById('input-period').value;
  profile.target_gpa = parseFloat(document.getElementById('input-target-gpa').value) || 85.0;
  profile.love_note = document.getElementById('input-note').value;

  saveData(STORAGE_KEYS.PROFILE, profile);
  renderHeader();
  renderMetrics();

  const client = getSupabase();
  if (client && currentUser) {
    await client.from('profiles').upsert({
      id: currentUser.id,
      name: profile.name,
      course: profile.course,
      period: profile.period,
      target_gpa: profile.target_gpa,
      love_note: profile.love_note,
      theme: profile.theme,
      avatar_data_url: profile.avatar_data_url,
      updated_at: new Date()
    });
  }

  showToast('Perfil atualizado com sucesso! ✨');
}

// =============================================================================
// NAVEGAÇÃO, ABAS E TEMAS
// =============================================================================

function switchTab(tabName, element) {
  document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
  document.querySelectorAll('.menu-item').forEach(item => item.classList.remove('active'));

  const targetTab = document.getElementById('tab-' + tabName);
  if (targetTab) targetTab.classList.add('active');
  if (element) element.classList.add('active');
}

function switchSubTab(subTabName, element) {
  document.querySelectorAll('.sub-tab-content').forEach(tab => tab.style.display = 'none');
  document.querySelectorAll('.sub-tab-btn').forEach(btn => btn.classList.remove('active'));

  const targetSubTab = document.getElementById('subtab-' + subTabName);
  if (targetSubTab) targetSubTab.style.display = 'block';
  if (element) element.classList.add('active');
}

async function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

  document.documentElement.setAttribute('data-theme', newTheme);
  updateThemeIcon(newTheme);

  profile.theme = newTheme;
  saveData(STORAGE_KEYS.PROFILE, profile);

  const client = getSupabase();
  if (client && currentUser) {
    await client.from('profiles').update({
      theme: newTheme,
      updated_at: new Date()
    }).eq('id', currentUser.id);
  }

  showToast(`Modo ${newTheme === 'dark' ? 'Escuro 🌙' : 'Claro ☀️'} ativado!`);
}

function updateThemeIcon(theme) {
  const icon = document.getElementById('theme-icon');
  if (icon) {
    icon.className = theme === 'dark' ? 'fa-solid fa-moon' : 'fa-solid fa-sun';
  }
}

function refreshAll() {
  renderHeader();
  renderMetrics();
  renderSemaphoreCards();
  renderSubjectBarChart();
  renderActivitiesTable();
  renderAlertsList();
  renderSubjectOptions();
  renderProfileForm();
  calculateTargetScore();
}

// =============================================================================
// INICIALIZAÇÃO DO APLICATIVO, ROBÔ VOLT E SERVICE WORKER
// =============================================================================

document.addEventListener('DOMContentLoaded', () => {
  refreshAll();
  initVoltRobot();
  initSupabaseAuth();

  const actDateInput = document.getElementById('act-date-input');
  if (actDateInput) {
    actDateInput.value = new Date().toISOString().split('T')[0];
  }
});

// Registro do Service Worker para PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js')
      .then((reg) => console.log('Service Worker PWA registrado:', reg.scope))
      .catch((err) => console.warn('Service Worker erro:', err));
  });
}
