// ===== CONFIG =====
// Swap these for real API endpoints when backend is ready
const REFRESH_CONTENT_MS = 24 * 60 * 60 * 1000; // 24 hours
const REFRESH_STOCKS_MS  = 15 * 60 * 1000;        // 15 minutes

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
  if (!isMobile()) backdrop.classList.remove('active');
});

// ===== ACTIVE NAV (Intersection Observer) =====
const sections     = document.querySelectorAll('.section[id], .trending-block[id]');
const sidebarItems = document.querySelectorAll('.sidebar__item[data-section]');
const mobileItems  = document.querySelectorAll('.mobile-nav__item[data-section]');

function setActiveNav(sectionId) {
  sidebarItems.forEach(el => el.classList.toggle('active', el.dataset.section === sectionId));
  mobileItems.forEach(el => el.classList.toggle('active', el.dataset.section === sectionId));
}

const observer = new IntersectionObserver(
  entries => entries.forEach(e => { if (e.isIntersecting) setActiveNav(e.target.id); }),
  { rootMargin: '-20% 0px -60% 0px', threshold: 0 }
);
sections.forEach(s => observer.observe(s));

[...sidebarItems, ...mobileItems].forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    const targetId = link.getAttribute('href')?.replace('#', '');
    const target   = targetId ? document.getElementById(targetId) : null;
    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    if (isMobile()) {
      sidebar.classList.remove('sidebar--open');
      backdrop.classList.remove('active');
    }
  });
});

// ===== COPY PROMPT (event delegation — works on dynamically rendered cards) =====
document.addEventListener('click', e => {
  const btn = e.target.closest('.btn--copy');
  if (!btn) return;
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

// ===== CARD HOVER OPTIMIZATION (event delegation) =====
document.addEventListener('mouseenter', e => {
  if (e.target.closest?.('.card')) e.target.closest('.card').style.willChange = 'transform';
}, true);
document.addEventListener('mouseleave', e => {
  if (e.target.closest?.('.card')) e.target.closest('.card').style.willChange = 'auto';
}, true);

// ============================================================
// ===== MOCK DATA — replace fetch() stubs with real API =====
// ============================================================

// --- STOCKS ---
// Shape: { ticker, name, price, change, changePct }
let STOCKS_DATA = [
  { ticker: 'NVDA', name: 'NVIDIA',        price: 875.40,  change: +2.34,  changePct: +0.27 },
  { ticker: 'AMD',  name: 'AMD',           price: 162.80,  change: -1.15,  changePct: -0.70 },
  { ticker: 'MSTR', name: 'MicroStrategy', price: 1284.50, change: +18.20, changePct: +1.44 },
];

// --- NOTICIAS --- (datos dinámicos via /api/news/top)

// --- HERRAMIENTAS ---
// Shape (ai-tools.json contract): { name, description, category, tag_color, emoji, rating, users, platform, difficulty, url }
const HERRAMIENTAS_DATA = [
  {
    name:        'Midjourney v7',
    description: 'Generación de imágenes fotorrealistas con control de estilos, iluminación y composición. Ideal para contenido visual de alta calidad en redes sociales.',
    url:         'https://www.midjourney.com',
    category:    'Imágenes',
    tag_color:   'yellow',
    emoji:       '🎨',
    rating:      4.9,
    users:       '18M',
    platform:    'Web',
    difficulty:  'Media',
  },
  {
    name:        'Claude 3.7 Sonnet',
    description: 'Asistente de escritura avanzado para redacción de copys, guiones, hilos de Twitter y contenido largo con contexto extendido de 200K tokens.',
    url:         'https://claude.ai',
    category:    'Escritura',
    tag_color:   'blue',
    emoji:       '✏️',
    rating:      4.8,
    users:       '12M',
    platform:    'Web, iOS, Android',
    difficulty:  'Baja',
  },
  {
    name:        'Sora + CapCut AI',
    description: 'Combinación para generar y editar reels con IA. Sora genera clips desde texto y CapCut aplica subtítulos, efectos y transiciones automáticamente.',
    url:         'https://sora.com',
    category:    'Video',
    tag_color:   'red',
    emoji:       '🎬',
    rating:      4.7,
    users:       '9M',
    platform:    'Web, iOS',
    difficulty:  'Media',
  },
];

// --- TRENDING PROMPTS (fallback de emergencia) ---
// Shape: { title, desc, uso, category, tag_color, full_prompt }
// Fuente real: json.prompts en data/dashboard-data-structure.json
const trendingPrompts = [
  {
    title:      'Carrusel educativo IA',
    desc:       'Genera 5 slides con gancho, puntos clave con datos y CTA para cualquier tema de IA.',
    uso:        'Instagram / LinkedIn',
    category:   'Carrusel',
    tag_color:  'purple',
    full_prompt: 'Actúa como experto en IA. Crea un carrusel de 5 slides sobre [TEMA]. Slide 1: gancho impactante. Slides 2-4: puntos clave con dato + ejemplo. Slide 5: CTA. Usa lenguaje simple y directo.',
  },
  {
    title:      'Guion Reel 30 segundos',
    desc:       'Hook de impacto + desarrollo conciso + CTA. Tono casual, sin tecnicismos.',
    uso:        'TikTok / Reels',
    category:   'Video',
    tag_color:  'green',
    full_prompt: 'Eres guionista de reels virales. Escribe un guion de 30 segundos sobre [TEMA IA]. Formato: Hook (3s) + Desarrollo (22s) + CTA (5s). Voz casual, activa y sin tecnicismos.',
  },
  {
    title:      'Post LinkedIn IA',
    desc:       '150 palabras: hook + 3 insights + reflexión + pregunta de cierre al lector.',
    uso:        'LinkedIn',
    category:   'Post',
    tag_color:  'blue',
    full_prompt: 'Redacta un post de LinkedIn sobre [NOTICIA IA]. Estructura: 1 línea de hook + 3 insights clave + reflexión personal + pregunta al lector. Máximo 150 palabras. Tono profesional pero cercano.',
  },
];

// --- TRENDING SKILLS (fallback de emergencia) ---
// Shape: { name, desc, para_que, utilidad, tag_color }
// Fuente real: json.trending_skills en data/dashboard-data-structure.json
const trendingSkills = [
  {
    name:      'Prompt Engineering',
    desc:      'Diseñar instrucciones precisas para obtener respuestas óptimas de cualquier LLM.',
    para_que:  'Mejorar la calidad de outputs en automatizaciones y generación de contenido.',
    utilidad:  'Muy Alta',
    tag_color: 'purple',
  },
  {
    name:      'AI Workflow Automation',
    desc:      'Conectar herramientas de IA con n8n o Make para flujos de trabajo sin código.',
    para_que:  'Automatizar tareas repetitivas y escalar la producción de contenido.',
    utilidad:  'Muy Alta',
    tag_color: 'green',
  },
  {
    name:      'Visual AI Branding',
    desc:      'Usar Midjourney y herramientas visuales para crear identidad de marca coherente.',
    para_que:  'Generar assets visuales profesionales sin necesidad de diseñador.',
    utilidad:  'Alta',
    tag_color: 'yellow',
  },
];

// --- IDEAS ---
// Shape: { title, summary, category, tag_color, platform, tags }
const IDEAS_DATA = [
  {
    title:    '"5 herramientas de IA que reemplazarán tu stack en 2025"',
    summary:  'Compara herramientas legacy vs IA nativas. Slide por herramienta con antes/después. Cierra con CTA a seguirte para más actualizaciones semanales.',
    category: 'Carrusel',
    tag_color:'yellow',
    platform: 'Instagram / LinkedIn',
    tags:     ['🔥 Viral', '📊 Educativo'],
  },
  {
    title:    '"Le pedí a 3 IAs que me explicaran la misma noticia"',
    summary:  'Formato comparativo en pantalla dividida. Muestra respuesta de GPT-5, Gemini y Claude ante la misma pregunta. Termina con tu veredicto personal de 10 segundos.',
    category: 'Reel',
    tag_color:'red',
    platform: 'TikTok / Reels',
    tags:     ['🔥 Viral', '🎲 Entretenido'],
  },
  {
    title:    '"Lo que los medios no te cuentan sobre la IA esta semana"',
    summary:  'Hilo de 8 tweets con noticias relevantes presentadas sin hype. Tweet 1 es el gancho, tweets 2-7 son datos, tweet 8 es reflexión + seguimiento.',
    category: 'Thread',
    tag_color:'purple',
    platform: 'X / Twitter',
    tags:     ['📊 Educativo', '🧠 Reflexivo'],
  },
];

// ===== RENDER: NOTICIAS =====
function renderNoticiasSkeleton() {
  const grid = document.getElementById('noticiasGrid');
  if (!grid) return;
  const skelCard = `
    <article class="card card--news">
      <div class="card__top">
        <span class="skel skel--tag"></span>
        <span class="skel skel--time"></span>
      </div>
      <span class="skel skel--hook"></span>
      <span class="skel skel--title"></span>
      <span class="skel skel--desc"></span>
      <div class="card__footer">
        <span class="skel skel--source"></span>
        <span class="skel skel--btn"></span>
      </div>
    </article>`;
  grid.innerHTML = skelCard + skelCard + skelCard;
}

function renderTopNoticias(items) {
  const grid = document.getElementById('noticiasGrid');
  if (!grid) return;

  if (!items || items.length === 0) {
    grid.innerHTML = `
      <article class="card card--news">
        <p class="card__desc" style="text-align:center;padding:1rem 0;color:var(--text-muted);">No hay noticias disponibles.</p>
      </article>`;
    return;
  }

  grid.innerHTML = items.slice(0, 3).map(item => `
    <article class="card card--news">
      <div class="card__top">
        <span class="tag tag--blue">${item.badge}</span>
        <span class="card__time">${item.date}</span>
      </div>
      <p class="card__hook">${item.hook}</p>
      <h3 class="card__title">${item.title}</h3>
      <p class="card__desc">${item.summary}</p>
      <div class="card__footer">
        <span class="card__source">${item.footer_label}</span>
        <a class="btn btn--ghost btn--sm"
           href="${item.source_url}"
           target="_blank"
           rel="noopener noreferrer">Ver más ↗</a>
      </div>
    </article>`).join('');
}

// ===== RENDER: HERRAMIENTAS =====
// Contrato: data/ai-tools.json → { success, items: [{ name, description, category, emoji, rating, users, platform, difficulty, url, tag_color }] }
function renderHerramientas(data) {
  const grid = document.getElementById('herramientasGrid');
  if (!grid) return;

  if (!data || data.length === 0) {
    grid.innerHTML = `
      <article class="card card--tool">
        <p class="card__desc" style="text-align:center;padding:1rem 0;color:var(--text-muted);">No hay herramientas disponibles.</p>
      </article>`;
    return;
  }

  grid.innerHTML = data.map(item => `
    <article class="card card--tool">
      <div class="card__top">
        <span class="tool__emoji">${item.emoji}</span>
        <span class="tag tag--${item.tag_color}">${item.category}</span>
      </div>
      <h3 class="card__title">${item.name}</h3>
      <p class="card__hook">${item.platform} · Dificultad: ${item.difficulty}</p>
      <p class="card__desc">${item.description}</p>
      <div class="card__footer">
        <div class="card__stats">
          <span class="stat">⭐ ${item.rating}</span>
          <span class="stat">👤 ${item.users} usuarios</span>
        </div>
        <a class="btn btn--primary btn--sm"
           href="${item.url}"
           target="_blank"
           rel="noopener noreferrer">Explorar ↗</a>
      </div>
    </article>
  `).join('');
}

// ===== RENDER: TRENDING PROMPTS =====
// Contrato: data/prompts.json → { success, items: [{ title, description, platform, format, category, tag_color, full_prompt, cta_label }] }
function renderTrendingPrompts(data) {
  const container = document.getElementById('trendingPromptsGrid');
  if (!container) return;

  if (!data || data.length === 0) {
    container.innerHTML = `<p style="color:var(--text-muted);font-size:0.82rem;">No hay prompts disponibles.</p>`;
    return;
  }

  container.innerHTML = data.map((item, i) => {
    const copyText  = (item.full_prompt || '').replace(/"/g, '&quot;');
    const usoText   = item.platform || item.format || item.uso || '';
    const colorTag  = item.tag_color || 'purple';
    const copyBtn   = copyText
      ? `<button class="btn--copy" title="Copiar prompt" data-copy="${copyText}">📋</button>`
      : '';
    return `
    <article class="trend-card trend-card--prompt">
      <div class="trend-card__top">
        <span class="tag tag--${colorTag}">${item.category}</span>
        ${copyBtn}
      </div>
      <h3 class="trend-card__title">${item.title}</h3>
      <p class="trend-card__desc">${item.summary || item.description || item.desc || ''}</p>
      <div class="trend-card__meta">
        <span class="trend-card__uso">${usoText}</span>
        <span class="copy-feedback" id="tcopy${i}"></span>
      </div>
    </article>`;
  }).join('');
}

// ===== RENDER: TRENDING SKILLS =====
function renderTrendingSkills(data) {
  const container = document.getElementById('trendingSkillsGrid');
  if (!container) return;
  container.innerHTML = data.map(item => {
    const utilClass = item.utilidad === 'Muy Alta' ? 'muy-alta' : 'alta';
    return `
      <article class="trend-card trend-card--skill">
        <div class="trend-card__top">
          <h3 class="trend-card__title">${item.name}</h3>
          <span class="util-badge util-badge--${utilClass}">${item.utilidad}</span>
        </div>
        <p class="trend-card__desc">${item.desc}</p>
        <p class="trend-card__para-que">&#128161; ${item.para_que}</p>
      </article>
    `;
  }).join('');
}

// ===== RENDER: IDEAS =====
// Contrato: data/ideas.json → { success, items: [{ title, summary, platform, category, tag_color, tags, cta_label }] }
function renderIdeas(data) {
  const grid = document.getElementById('ideasGrid');
  if (!grid) return;

  if (!data || data.length === 0) {
    grid.innerHTML = `
      <article class="card card--idea">
        <p class="card__desc" style="text-align:center;padding:1rem 0;color:var(--text-muted);">No hay ideas disponibles.</p>
      </article>`;
    return;
  }

  grid.innerHTML = data.map(item => `
    <article class="card card--idea">
      <div class="card__top">
        <span class="tag tag--${item.tag_color || 'blue'}">${item.category}</span>
        <span class="idea__platform">${item.platform}</span>
      </div>
      <h3 class="card__title">${item.title}</h3>
      <p class="card__desc">${item.summary}</p>
      <div class="card__footer">
        <div class="idea__tags">
          ${Array.isArray(item.tags) ? item.tags.map(t => `<span class="micro-tag">${t}</span>`).join('') : ''}
        </div>
        <button class="btn btn--ghost btn--sm">${item.cta_label || 'Usar idea'}</button>
      </div>
    </article>
  `).join('');
}

// ===== RENDER: TICKER =====
function renderTicker(data) {
  const container  = document.getElementById('tickerStocks');
  const updatedEl  = document.getElementById('tickerUpdated');
  if (!container) return;

  container.innerHTML = data.map((stock, i) => {
    const isUp      = stock.change >= 0;
    const arrow     = isUp ? '▲' : '▼';
    const cls       = isUp ? 'ticker-item__change--up' : 'ticker-item__change--down';
    const sign      = isUp ? '+' : '';
    const separator = i < data.length - 1 ? '<span class="ticker-item__dot"></span>' : '';
    return `
      <div class="ticker-item">
        <span class="ticker-item__name">${stock.ticker}</span>
        <span class="ticker-item__price">$${stock.price.toFixed(2)}</span>
        <span class="ticker-item__change ${cls}">
          ${arrow} ${sign}${stock.change.toFixed(2)} (${sign}${stock.changePct.toFixed(2)}%)
        </span>
      </div>
      ${separator}
    `;
  }).join('');

  if (updatedEl) {
    const now = new Date();
    updatedEl.textContent = `${now.getHours().toString().padStart(2,'0')}:${now.getMinutes().toString().padStart(2,'0')}`;
  }
}

// ===== FETCH STUBS =====
// Replace these with real fetch() calls when API is ready:
//   async function fetchStocks()  { return fetch('/api/stocks').then(r => r.json());  }

// ===== FETCH: NOTICIAS =====
// Contrato: data/top-news.json → { success, item: {...} }  (o items: [...] si n8n envía array)
async function fetchTopNoticia() {
  try {
    const res = await fetch('data/top-news.json');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    if (!json.success) return null;
    // Soporta contrato singular (item) y plural (items) para compatibilidad
    if (json.item)                    return [json.item];
    if (Array.isArray(json.items))    return json.items;
    return null;
  } catch (err) {
    console.warn('[Polaris] data/top-news.json no disponible.', err);
    return null;
  }
}

// ===== FETCH: HERRAMIENTAS =====
// Contrato: data/ai-tools.json → { success, items: [...] }
async function fetchHerramientas() {
  try {
    const res = await fetch('data/ai-tools.json');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    return (json.success && Array.isArray(json.items)) ? json.items : HERRAMIENTAS_DATA;
  } catch (err) {
    console.warn('[Polaris] data/ai-tools.json no disponible, usando datos de ejemplo.', err);
    return HERRAMIENTAS_DATA;
  }
}

// ===== FETCH: IDEAS =====
// Contrato: data/ideas.json → { success, items: [...] }
async function fetchIdeas() {
  try {
    const res = await fetch('data/ideas.json');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    return (json.success && Array.isArray(json.items)) ? json.items : IDEAS_DATA;
  } catch (err) {
    console.warn('[Polaris] data/ideas.json no disponible, usando datos de ejemplo.', err);
    return IDEAS_DATA;
  }
}

// ===== FETCH: TRENDING PROMPTS =====
// Contrato: data/prompts.json → { success, items: [...] }
async function fetchTrendingPrompts() {
  try {
    const res = await fetch('data/prompts.json');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    return (json.success && Array.isArray(json.items)) ? json.items : trendingPrompts;
  } catch {
    return trendingPrompts;
  }
}

async function fetchTrendingSkills() {
  try {
    const res = await fetch('data/dashboard-data-structure.json');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    return json.trending_skills.slice(0, 3);
  } catch {
    return trendingSkills;
  }
}

async function fetchStocks() {
  // Simulate slight price movement each tick (remove when using real API)
  return STOCKS_DATA.map(s => {
    const delta    = (Math.random() - 0.48) * 2;
    const newPrice = Math.max(1, s.price + delta);
    const change   = parseFloat((s.change + delta * 0.5).toFixed(2));
    const changePct= parseFloat(((change / newPrice) * 100).toFixed(2));
    return { ...s, price: parseFloat(newPrice.toFixed(2)), change, changePct };
  });
}

// ===== REFRESH SCHEDULERS =====
function scheduleContentRefresh() {
  setInterval(async () => {
    const [noticia, herramientas, ideas] = await Promise.all([
      fetchTopNoticia(),
      fetchHerramientas(),
      fetchIdeas(),
    ]);
    renderTopNoticias(noticia);
    renderHerramientas(herramientas);
    renderIdeas(ideas);
  }, REFRESH_CONTENT_MS);
}

function scheduleTrendingRefresh() {
  setInterval(async () => {
    const [prompts, skills] = await Promise.all([fetchTrendingPrompts(), fetchTrendingSkills()]);
    renderTrendingPrompts(prompts);
    renderTrendingSkills(skills);
  }, REFRESH_CONTENT_MS);
}

function scheduleStockRefresh() {
  setInterval(async () => {
    STOCKS_DATA = await fetchStocks();
    renderTicker(STOCKS_DATA);
  }, REFRESH_STOCKS_MS);
}

// ===== INIT =====
(async function init() {
  // Noticias — ruta exclusiva: data/top-news.json → data.item / data.items
  renderNoticiasSkeleton();

  const [noticia, herramientas, ideas] = await Promise.all([
    fetchTopNoticia(),
    fetchHerramientas(),
    fetchIdeas(),
  ]);
  renderTopNoticias(noticia);
  renderHerramientas(herramientas);
  renderIdeas(ideas);

  // Trending (right panel)
  const [prompts, skills] = await Promise.all([fetchTrendingPrompts(), fetchTrendingSkills()]);
  renderTrendingPrompts(prompts);
  renderTrendingSkills(skills);

  // Ticker
  renderTicker(STOCKS_DATA);

  // Rankings (initial)
  renderRankings('programar');

  // Schedulers
  scheduleContentRefresh();
  scheduleTrendingRefresh();
  scheduleStockRefresh();
})();

// ===== RANKINGS DATA =====
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
    { name: 'Midjourney v7',      score: 98 },
    { name: 'DALL-E 4',           score: 90 },
    { name: 'Stable Diffusion 4', score: 86 },
    { name: 'Ideogram 3.0',       score: 83 },
    { name: 'Firefly 4',          score: 79 },
    { name: 'Playground v3',      score: 73 },
    { name: 'Leonardo AI',        score: 69 },
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
    { name: 'Sora 2.0',           score: 95 },
    { name: 'Kling 2.0',          score: 90 },
    { name: 'Runway Gen-4',       score: 87 },
    { name: 'Pika 2.0',           score: 82 },
    { name: 'CapCut AI',          score: 77 },
    { name: 'Vidu 2.0',           score: 72 },
    { name: 'Luma Dream Machine', score: 68 },
  ],
  automatizar: [
    { name: 'n8n + Claude',   score: 96 },
    { name: 'Make + GPT-4o',  score: 91 },
    { name: 'Zapier AI',      score: 86 },
    { name: 'Lindy AI',       score: 83 },
    { name: 'Relevance AI',   score: 79 },
    { name: 'Flowise',        score: 74 },
    { name: 'Dify.ai',        score: 70 },
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

  chartTitle.textContent = `Top 7 IAs para ${label}`;

  chartEl.innerHTML = data.map((ai, i) => `
    <div class="chart-row">
      <span class="chart-row__label" title="${ai.name}">${i + 1}. ${ai.name}</span>
      <div class="chart-row__track">
        <div class="chart-row__bar" data-score="${ai.score}" style="width:0"></div>
      </div>
      <span class="chart-row__score">${ai.score}</span>
    </div>
  `).join('');

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      chartEl.querySelectorAll('.chart-row__bar').forEach(bar => {
        bar.style.width = bar.dataset.score + '%';
      });
    });
  });

  rankListEl.innerHTML = data.map((ai, i) => `
    <li class="rank-item">
      <span class="rank-item__pos">${i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1}</span>
      <span class="rank-item__name">${ai.name}</span>
      <span class="rank-item__score">${ai.score}/100</span>
    </li>
  `).join('');
}

// ===== TASK TAB INTERACTION =====
document.querySelectorAll('.task-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.task-tab').forEach(t => {
      t.classList.remove('task-tab--active');
      t.setAttribute('aria-selected', 'false');
    });
    tab.classList.add('task-tab--active');
    tab.setAttribute('aria-selected', 'true');
    renderRankings(tab.dataset.task);
  });
});
