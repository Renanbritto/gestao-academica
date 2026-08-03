// =============================================================================
// APP STATE & LOCALSTORAGE MANAGER (SEMÁFORO INTELIGENTE E NÃO-AGRESSIVO)
// =============================================================================

const STORAGE_KEYS = {
  PROFILE: 'academic_profile_v5',
  SUBJECTS: 'academic_subjects_v5',
  ACTIVITIES: 'academic_activities_v5',
  THEME: 'academic_theme_v5'
};

const PASSING_GRADE = 70.0; // Pontuação mínima para aprovação na faculdade

// Initial Profile for Monalysa
const DEFAULT_PROFILE = {
  name: 'Monalysa Delvivo Rocha',
  course: 'Direito',
  period: '7º Período',
  target_gpa: 85.0, // Meta 85 pontos de 100
  love_note: 'Você é incrível e vai arrasar em todas as provas de Direito! ❤️',
  theme: 'dark',
  avatar_data_url: null
};

// Subjects for Direito 7º Período
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

const DEFAULT_ACTIVITIES = [
  { id: 101, subject_id: 1, title: 'Prova 1 (Tratados Internacionais)', type: 'Prova', due_date: getFormattedDate(3), weight: 40, max_grade: 100, obtained_grade: null, status: 'Pendente', notes: 'Conteúdo: Fontes do Direito Internacional, Tratados e Convenções.' },
  { id: 102, subject_id: 2, title: 'Estudo de Caso - Direito Sucessório', type: 'Trabalho', due_date: getFormattedDate(-3), weight: 30, max_grade: 100, obtained_grade: 95.0, status: 'Concluído', notes: 'Análise jurisprudencial do STJ.' },
  { id: 103, subject_id: 3, title: 'Redação de Reclamação Trabalhista', type: 'Trabalho', due_date: getFormattedDate(7), weight: 30, max_grade: 100, obtained_grade: null, status: 'Pendente', notes: 'Peça prática simulada de petição inicial.' },
  { id: 104, subject_id: 4, title: 'Peça Prática - Contestação Cível', type: 'Trabalho', due_date: getFormattedDate(10), weight: 25, max_grade: 100, obtained_grade: null, status: 'Pendente', notes: 'Simulação de audiência de conciliação e contestação.' },
  { id: 105, subject_id: 5, title: 'Entrega da 1ª Etapa do Projeto', type: 'Exercício', due_date: getFormattedDate(-2), weight: 20, max_grade: 100, obtained_grade: 90.0, status: 'Concluído', notes: 'Tema e estrutura metodológica.' }
];

// Helper to Load & Save LocalStorage
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

// Initialize Theme
document.documentElement.setAttribute('data-theme', profile.theme || 'dark');
updateThemeIcon(profile.theme || 'dark');

// =============================================================================
// CUSTOM MODAL & TOAST NOTIFICATION SYSTEM
// =============================================================================

function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;

  let icon = '<i class="fa-solid fa-circle-check" style="color: var(--accent-success);"></i>';
  if (type === 'warning') icon = '<i class="fa-solid fa-triangle-exclamation" style="color: var(--accent-warning);"></i>';
  if (type === 'danger') icon = '<i class="fa-solid fa-circle-exclamation" style="color: var(--accent-danger);"></i>';

  toast.innerHTML = `${icon} <span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    toast.style.transition = 'all 0.3s ease-out';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
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
// UI RENDERERS
// =============================================================================

function renderHeader() {
  document.getElementById('display-name').innerText = profile.name;
  document.getElementById('display-course').innerText = `${profile.course} (${profile.period})`;
  document.getElementById('display-romantic-note').innerText = profile.love_note;

  // Render Avatar (Photo or Icon)
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
  // 1. Calculate Average Grade (CR em escala 0-100)
  const doneActivities = activities.filter(a => a.status === 'Concluído' && a.obtained_grade !== null);
  let avgGPA = 0;
  if (doneActivities.length > 0) {
    const sum = doneActivities.reduce((acc, curr) => acc + Number(curr.obtained_grade), 0);
    avgGPA = sum / doneActivities.length;
  }

  document.getElementById('metric-gpa').innerText = `${avgGPA.toFixed(1)} / 100`;
  const targetGpa = Number(profile.target_gpa) || 85.0;
  const gpaSub = document.getElementById('metric-gpa-sub');
  if (avgGPA >= targetGpa) {
    gpaSub.innerHTML = `<i class="fa-solid fa-arrow-up"></i> Meta: ${targetGpa.toFixed(0)} pts (Superada! 🎉)`;
    gpaSub.style.color = 'var(--accent-success)';
  } else {
    gpaSub.innerHTML = `Meta: ${targetGpa.toFixed(0)} pts • Mínimo p/ Passar: 70 pts`;
    gpaSub.style.color = 'var(--accent-warning)';
  }

  // 2. Active Subjects
  document.getElementById('metric-subjects-count').innerText = subjects.length;

  // 3. Pending Activities
  const pendingActs = activities.filter(a => a.status === 'Pendente');
  document.getElementById('metric-pending-count').innerText = pendingActs.length;

  const examsCount = pendingActs.filter(a => a.type === 'Prova').length;
  document.getElementById('metric-pending-sub').innerText = `${examsCount} Prova(s) pendente(s)`;

  // 4. Next Exam / Deadline
  const nextExamSub = document.getElementById('metric-next-exam-val');
  const nextExamTitle = document.getElementById('metric-next-exam-title');

  if (pendingActs.length > 0) {
    const sorted = [...pendingActs].sort((a, b) => new Date(a.due_date) - new Date(b.due_date));
    const nearest = sorted[0];
    const subject = subjects.find(s => s.id === nearest.subject_id);
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

// RENDER SEMÁFORO INTELIGENTE E NÃO-AGRESSIVO POR MATÉRIA
function renderSemaphoreCards() {
  const container = document.getElementById('semaphore-cards-container');
  if (!container) return;
  container.innerHTML = '';

  if (subjects.length === 0) {
    container.innerHTML = '<p style="color: var(--text-muted); font-size: 0.9rem;">Nenhuma matéria cadastrada.</p>';
    return;
  }

  subjects.forEach(sub => {
    const subDoneActs = activities.filter(a => a.subject_id === sub.id && a.status === 'Concluído' && a.obtained_grade !== null);
    const allSubActs = activities.filter(a => a.subject_id === sub.id);

    // 1. Pontuação obtida acumulada
    let currentScore = 0;
    if (subDoneActs.length > 0) {
      currentScore = subDoneActs.reduce((acc, a) => acc + Number(a.obtained_grade), 0) / subDoneActs.length;
    }

    const targetGrade = Number(sub.target_grade) || 85.0;
    const ptsToPass = Math.max(0, PASSING_GRADE - currentScore);
    const ptsToTarget = Math.max(0, targetGrade - currentScore);

    // 2. Lógica Inteligente & Não-Agressiva do Semáforo
    let semClass = 'semaphore-blue';
    let semText = '🔵 EM DIA (Semestre Iniciando)';
    let passBadgeMsg = `📌 100 pontos em disputa. Faltam <strong>70 pts</strong> para passar.`;

    if (subDoneActs.length === 0) {
      // Nenhuma prova/trabalho concluído ainda -> Não alarda nada!
      semClass = 'semaphore-blue';
      semText = '🔵 Início do Semestre (aguardando provas e atividades)';
      passBadgeMsg = `📌 100 pontos em disputa no semestre. Faltam <strong>70 pts</strong> para a aprovação.`;
    } else if (currentScore >= PASSING_GRADE) {
      // Já atingiu 70 pts ou mais -> Aprovada com Sucesso!
      semClass = 'semaphore-green';
      semText = '🟢 APROVADA! 🎉';
      passBadgeMsg = `✨ Você já garantiu os 70 pts necessários de aprovação!`;
    } else {
      // Já realizou provas
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

      <!-- Placa de Pontuação -->
      <div style="text-align:center; min-width:140px;">
        <div style="font-size:0.78rem; color:var(--text-muted); font-weight:600; text-transform:uppercase;">Pontuação Atual</div>
        <div style="font-size:1.6rem; font-weight:800; color:var(--text-main);">${subDoneActs.length > 0 ? currentScore.toFixed(1) : '0.0'} <span style="font-size:0.9rem; color:var(--text-muted);">/ 100</span></div>
      </div>

      <!-- Indicadores do Semáforo -->
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
    const subActivities = activities.filter(a => a.subject_id === sub.id && a.status === 'Concluído' && a.obtained_grade !== null);
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
    const sub = subjects.find(s => s.id === act.subject_id);
    const subName = sub ? sub.name : 'Outra';
    const gradeText = act.obtained_grade !== null ? `${Number(act.obtained_grade).toFixed(1)} / 100` : '-';

    let statusBadge = `<span class="badge badge-warning">Pendente</span>`;
    if (act.status === 'Concluído') {
      statusBadge = `<span class="badge badge-success">Concluído</span>`;
    }

    let typeBadge = `<span class="badge badge-info">${act.type}</span>`;
    if (act.type === 'Prova') typeBadge = `<span class="badge badge-danger">Prova</span>`;

    // 1. Render Desktop Table Row
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
          <button class="btn-secondary" onclick="toggleActivityStatus(${act.id})">
            ${act.status === 'Pendente' ? '✅ Concluir' : '🔄 Reabrir'}
          </button>
          <button class="btn-danger" onclick="deleteActivity(${act.id})">
            <i class="fa-solid fa-trash"></i>
          </button>
        </td>
      `;
      tbody.appendChild(tr);
    }

    // 2. Render Mobile Card Item
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
          <button class="btn-secondary" onclick="toggleActivityStatus(${act.id})">
            ${act.status === 'Pendente' ? '✅ Concluir' : '🔄 Reabrir'}
          </button>
          <button class="btn-danger" onclick="deleteActivity(${act.id})">
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

  // Sort by date
  const sorted = [...pending].sort((a, b) => new Date(a.due_date) - new Date(b.due_date));
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  sorted.forEach(act => {
    const sub = subjects.find(s => s.id === act.subject_id);
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

  // Subjects List Table in Subject Management
  const subTbody = document.getElementById('subjects-list-tbody');
  if (subTbody) {
    subTbody.innerHTML = '';
    subjects.forEach(sub => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><span style="display:inline-block; width:12px; height:12px; border-radius:50%; background:${sub.color}; margin-right:8px;"></span><strong>${sub.name}</strong></td>
        <td>${sub.professor || '-'}</td>
        <td>${sub.target_grade} pts</td>
        <td>
          <button class="btn-danger" onclick="deleteSubject(${sub.id})"><i class="fa-solid fa-trash"></i></button>
        </td>
      `;
      subTbody.appendChild(tr);
    });
  }
}

function renderProfileForm() {
  document.getElementById('input-name').value = profile.name || '';
  document.getElementById('input-course').value = profile.course || '';
  document.getElementById('input-period').value = profile.period || '';
  document.getElementById('input-target-gpa').value = profile.target_gpa || 85.0;
  document.getElementById('input-note').value = profile.love_note || '';

  // Render Profile Photo Preview in Form
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

function handlePhotoUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  if (file.size > 3 * 1024 * 1024) {
    showToast('Por favor, escolha uma imagem com menos de 3MB.', 'warning');
    return;
  }

  const reader = new FileReader();
  reader.onload = function(evt) {
    profile.avatar_data_url = evt.target.result;
    saveData(STORAGE_KEYS.PROFILE, profile);
    renderHeader();
    renderProfileForm();
    showToast('Foto de perfil atualizada! 📸');
  };
  reader.readAsDataURL(file);
}

function removePhoto() {
  profile.avatar_data_url = null;
  saveData(STORAGE_KEYS.PROFILE, profile);
  renderHeader();
  renderProfileForm();
  showToast('Foto de perfil removida.', 'warning');
}

// =============================================================================
// CALCULATOR LOGIC (ESCALA 0-100)
// =============================================================================

function calculateTargetScore() {
  const targetGpa = Number(document.getElementById('calc-target-input').value) || 85.0;
  const currentGrade = Number(document.getElementById('calc-current-input').value) || 60.0;
  const weight = Number(document.getElementById('calc-weight-input').value) || 40.0;

  // Formula: needed = (Target - Current * (1 - Weight/100)) / (Weight / 100)
  let needed = (targetGpa - (currentGrade * (100 - weight) / 100)) / (weight / 100);
  needed = Math.max(0, Math.min(100, needed));

  document.getElementById('calc-result-val').innerText = `${needed.toFixed(1)} / 100 pts`;
}

// =============================================================================
// HANDLERS (ADD / UPDATE / DELETE VIA CUSTOM MODALS & TOASTS)
// =============================================================================

function toggleActivityStatus(actId) {
  const act = activities.find(a => a.id === actId);
  if (!act) return;

  if (act.status === 'Pendente') {
    showPromptModal(
      '✅ Concluir Atividade',
      `Digite a nota obtida em <strong>"${act.title}"</strong> (escala 0 a 100):`,
      '90',
      function(inputGrade) {
        if (inputGrade !== null && inputGrade !== '') {
          act.status = 'Concluído';
          act.obtained_grade = parseFloat(inputGrade) || 0;
          saveData(STORAGE_KEYS.ACTIVITIES, activities);
          refreshAll();
          showToast(`Parabéns! Nota ${act.obtained_grade.toFixed(1)} pts salva para "${act.title}"! 🎉`);
        }
      }
    );
  } else {
    act.status = 'Pendente';
    act.obtained_grade = null;
    saveData(STORAGE_KEYS.ACTIVITIES, activities);
    refreshAll();
    showToast(`Atividade "${act.title}" reaberta.`, 'warning');
  }
}

function deleteActivity(actId) {
  const act = activities.find(a => a.id === actId);
  const title = act ? act.title : 'esta atividade';

  showConfirmModal(
    '🗑️ Excluir Atividade',
    `Tem certeza que deseja excluir a atividade <strong>"${title}"</strong>?`,
    'Sim, Excluir',
    function() {
      activities = activities.filter(a => a.id !== actId);
      saveData(STORAGE_KEYS.ACTIVITIES, activities);
      refreshAll();
      showToast(`Atividade "${title}" removida com sucesso!`, 'danger');
    }
  );
}

function addSubject(e) {
  e.preventDefault();
  const name = document.getElementById('sub-name-input').value.trim();
  const prof = document.getElementById('sub-prof-input').value.trim();
  const target = parseFloat(document.getElementById('sub-target-input').value) || 85.0;
  const color = document.getElementById('sub-color-input').value;

  if (!name) {
    showToast('Por favor, informe o nome da matéria.', 'warning');
    return;
  }

  const newSub = {
    id: Date.now(),
    name: name,
    professor: prof,
    target_grade: target,
    color: color
  };

  subjects.push(newSub);
  saveData(STORAGE_KEYS.SUBJECTS, subjects);

  document.getElementById('form-add-subject').reset();
  showToast(`Matéria "${name}" cadastrada com sucesso! ✨`);
  refreshAll();
}

function deleteSubject(subId) {
  const sub = subjects.find(s => s.id === subId);
  const name = sub ? sub.name : 'esta matéria';

  showConfirmModal(
    '🗑️ Excluir Matéria',
    `Atenção: Excluir a matéria <strong>"${name}"</strong> também excluirá todas as atividades vinculadas a ela. Deseja continuar?`,
    'Sim, Excluir Matéria',
    function() {
      subjects = subjects.filter(s => s.id !== subId);
      activities = activities.filter(a => a.subject_id !== subId);

      saveData(STORAGE_KEYS.SUBJECTS, subjects);
      saveData(STORAGE_KEYS.ACTIVITIES, activities);
      refreshAll();
      showToast(`Matéria "${name}" e suas atividades foram excluídas.`, 'danger');
    }
  );
}

function addActivity(e) {
  e.preventDefault();
  const subId = parseInt(document.getElementById('act-subject-select').value);
  const title = document.getElementById('act-title-input').value.trim();
  const type = document.getElementById('act-type-select').value;
  const dueDate = document.getElementById('act-date-input').value;
  const weight = parseFloat(document.getElementById('act-weight-input').value) || 20;
  const notes = document.getElementById('act-notes-input').value.trim();

  if (!title || !dueDate) {
    showToast('Por favor, preencha o título e a data de entrega.', 'warning');
    return;
  }

  const newAct = {
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

  activities.push(newAct);
  saveData(STORAGE_KEYS.ACTIVITIES, activities);

  document.getElementById('form-add-activity').reset();
  showToast(`Atividade "${title}" cadastrada com sucesso! 📌`);
  refreshAll();
}

function updateProfile(e) {
  e.preventDefault();
  profile.name = document.getElementById('input-name').value;
  profile.course = document.getElementById('input-course').value;
  profile.period = document.getElementById('input-period').value;
  profile.target_gpa = parseFloat(document.getElementById('input-target-gpa').value) || 85.0;
  profile.love_note = document.getElementById('input-note').value;

  saveData(STORAGE_KEYS.PROFILE, profile);
  renderHeader();
  renderMetrics();
  showToast('Perfil atualizado com sucesso! ✨');
}

// =============================================================================
// NAVIGATION & THEME
// =============================================================================

function switchTab(tabName, element) {
  document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
  document.querySelectorAll('.menu-item').forEach(item => item.classList.remove('active'));

  document.getElementById('tab-' + tabName).classList.add('active');
  if (element) element.classList.add('active');
}

function switchSubTab(subTabName, element) {
  document.querySelectorAll('.sub-tab-content').forEach(tab => tab.style.display = 'none');
  document.querySelectorAll('.sub-tab-btn').forEach(btn => btn.classList.remove('active'));

  document.getElementById('subtab-' + subTabName).style.display = 'block';
  if (element) element.classList.add('active');
}

function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

  document.documentElement.setAttribute('data-theme', newTheme);
  updateThemeIcon(newTheme);

  profile.theme = newTheme;
  saveData(STORAGE_KEYS.PROFILE, profile);
  showToast(`Modo ${newTheme === 'dark' ? 'Escuro 🌙' : 'Claro ☀️'} ativado!`);
}

function updateThemeIcon(theme) {
  const icon = document.getElementById('theme-icon');
  if (icon) {
    icon.className = theme === 'dark' ? 'fa-solid fa-moon' : 'fa-solid fa-sun';
  }
}

// Global Refresh
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

// On Load
document.addEventListener('DOMContentLoaded', () => {
  refreshAll();

  // Set default date picker to today
  const actDateInput = document.getElementById('act-date-input');
  if (actDateInput) {
    actDateInput.value = new Date().toISOString().split('T')[0];
  }
});
