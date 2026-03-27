// ===== DATE =====
const dateEl = document.getElementById('currentDate');
if (dateEl) {
  dateEl.textContent = new Date().toLocaleDateString('es-ES', {
    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
  });
}

// ===== SIDEBAR TOGGLE =====
const sidebar          = document.getElementById('sidebar');
const sidebarToggleBtn = document.getElementById('sidebarToggle');
const isMobile = () => window.innerWidth <= 768;

// Backdrop for mobile
const backdrop = document.createElement('div');
backdrop.className = 'sidebar-backdrop';
document.body.appendChild(backdrop);

sidebarToggleBtn.addEventListener('click', () => {
  if (isMobile()) {
    const isOpen = sidebar.classList.toggle('sidebar--open');
    backdrop.classList.toggle('active', isOpen);
  } else {
    sidebar.classList.toggle('sidebar--open');
  }
});

backdrop.addEventListener('click', () => {
  sidebar.classList.remove('sidebar--open');
  backdrop.classList.remove('active');
});

window.addEventListener('resize', () => {
  if (!isMobile()) {
    backdrop.classList.remove('active');
    // Don't force-close the desktop slim toggle on resize
  }
});

// ===== ACTIVE NAV (Intersection Observer) =====
const sections   = document.querySelectorAll('.section[id]');
const sidebarItems = document.querySelectorAll('.sidebar__item[data-section]');
const mobileItems  = document.querySelectorAll('.mobile-nav__item[data-section]');

function setActiveNav(sectionId) {
  sidebarItems.forEach(el => el.classList.toggle('active', el.dataset.section === sectionId));
  mobileItems.forEach(el => el.classList.toggle('active', el.dataset.section === sectionId));
}

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) setActiveNav(entry.target.id);
    });
  },
  { rootMargin: '-20% 0px -60% 0px', threshold: 0 }
);

sections.forEach(s => observer.observe(s));

// Close sidebar on nav click (mobile)
[...sidebarItems, ...mobileItems].forEach(link => {
  link.addEventListener('click', () => {
    if (isMobile()) {
      sidebar.classList.remove('sidebar--open');
      backdrop.classList.remove('active');
    }
  });
});

// ===== COPY PROMPT =====
document.querySelectorAll('.btn--copy').forEach(btn => {
  btn.addEventListener('click', () => {
    const text = btn.dataset.copy;
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
      const feedback = btn.closest('.card')?.querySelector('.copy-feedback');
      if (feedback) {
        feedback.innerHTML = '&#10003; Copiado';
        setTimeout(() => { feedback.textContent = ''; }, 2000);
      }
      btn.textContent = '✓';
      setTimeout(() => { btn.textContent = '📋'; }, 2000);
    });
  });
});

// ===== CARD HOVER OPTIMIZATION =====
document.querySelectorAll('.card').forEach(card => {
  card.addEventListener('mouseenter', () => { card.style.willChange = 'transform'; });
  card.addEventListener('mouseleave', () => { card.style.willChange = 'auto'; });
});

// ===== RANKINGS DATA (mock — swap fetch() here when API is ready) =====
// Shape: { taskKey: [{ name, score }, ...] }  score: 0-100
const AI_RANKINGS = {
  programar: [
    { name: 'Claude 3.7 Sonnet', score: 96 },
    { name: 'GPT-4o',            score: 92 },
    { name: 'Gemini Ultra 2.0',  score: 87 },
    { name: 'DeepSeek-V3',       score: 84 },
    { name: 'Mistral Large 2',   score: 78 },
    { name: 'Llama 3.3 70B',     score: 71 },
    { name: 'Grok-3',            score: 68 },
  ],
  investigar: [
    { name: 'Perplexity Pro',    score: 97 },
    { name: 'GPT-4o',            score: 91 },
    { name: 'Claude 3.7 Sonnet', score: 90 },
    { name: 'Gemini Ultra 2.0',  score: 88 },
    { name: 'You.com Research',  score: 80 },
    { name: 'Grok-3',            score: 74 },
    { name: 'DeepSeek-V3',       score: 70 },
  ],
  imagenes: [
    { name: 'Midjourney v7',     score: 98 },
    { name: 'DALL-E 4',          score: 90 },
    { name: 'Stable Diffusion 4',score: 86 },
    { name: 'Ideogram 3.0',      score: 83 },
    { name: 'Firefly 4',         score: 79 },
    { name: 'Playground v3',     score: 73 },
    { name: 'Leonardo AI',       score: 69 },
  ],
  redactar: [
    { name: 'Claude 3.7 Sonnet', score: 97 },
    { name: 'GPT-4o',            score: 93 },
    { name: 'Gemini Ultra 2.0',  score: 88 },
    { name: 'Mistral Large 2',   score: 82 },
    { name: 'Grok-3',            score: 76 },
    { name: 'Llama 3.3 70B',     score: 70 },
    { name: 'DeepSeek-V3',       score: 66 },
  ],
  video: [
    { name: 'Sora 2.0',          score: 95 },
    { name: 'Kling 2.0',         score: 90 },
    { name: 'Runway Gen-4',      score: 87 },
    { name: 'Pika 2.0',          score: 82 },
    { name: 'CapCut AI',         score: 77 },
    { name: 'Vidu 2.0',          score: 72 },
    { name: 'Luma Dream Machine',score: 68 },
  ],
  automatizar: [
    { name: 'n8n + Claude',      score: 96 },
    { name: 'Make + GPT-4o',     score: 91 },
    { name: 'Zapier AI',         score: 86 },
    { name: 'Lindy AI',          score: 83 },
    { name: 'Relevance AI',      score: 79 },
    { name: 'Flowise',           score: 74 },
    { name: 'Dify.ai',           score: 70 },
  ],
};

const TASK_LABELS = {
  programar:   'Programar',
  investigar:  'Investigar',
  imagenes:    'Generar Imágenes',
  redactar:    'Redactar',
  video:       'Crear Video',
  automatizar: 'Automatizar',
};

// ===== RANKINGS RENDER =====
const chartEl    = document.getElementById('rankingChart');
const rankListEl = document.getElementById('rankList');
const chartTitle = document.getElementById('chartTitle');

function renderRankings(taskKey) {
  const data  = AI_RANKINGS[taskKey] ?? [];
  const label = TASK_LABELS[taskKey] ?? taskKey;

  // Update title
  chartTitle.textContent = `Top 7 IAs para ${label}`;

  // Build chart rows (set width to 0 first for animation re-trigger)
  chartEl.innerHTML = data.map((ai, i) => `
    <div class="chart-row">
      <span class="chart-row__label" title="${ai.name}">${i + 1}. ${ai.name}</span>
      <div class="chart-row__track">
        <div class="chart-row__bar" data-score="${ai.score}" style="width:0"></div>
      </div>
      <span class="chart-row__score">${ai.score}</span>
    </div>
  `).join('');

  // Animate bars after a micro-delay (allows paint to flush width:0)
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      chartEl.querySelectorAll('.chart-row__bar').forEach(bar => {
        bar.style.width = bar.dataset.score + '%';
      });
    });
  });

  // Build ranked list
  rankListEl.innerHTML = data.map((ai, i) => `
    <li class="rank-item">
      <span class="rank-item__pos">${i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1}</span>
      <span class="rank-item__name">${ai.name}</span>
      <span class="rank-item__score">${ai.score}/100</span>
    </li>
  `).join('');
}

// ===== TASK TAB INTERACTION =====
const taskTabs = document.querySelectorAll('.task-tab');

taskTabs.forEach(tab => {
  tab.addEventListener('click', () => {
    taskTabs.forEach(t => {
      t.classList.remove('task-tab--active');
      t.setAttribute('aria-selected', 'false');
    });
    tab.classList.add('task-tab--active');
    tab.setAttribute('aria-selected', 'true');
    renderRankings(tab.dataset.task);
  });
});

// Initial render
renderRankings('programar');
