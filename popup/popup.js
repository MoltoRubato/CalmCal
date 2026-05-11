// CalmCal popup script

const PALETTES = {
  blush:     { bg: '#FFF1F5', primary: '#F48FB1', soft: '#FFB6C9', cream: '#FCE4EC', ink: '#3D2B30', plum: '#9D4A6B' },
  bubblegum: { bg: '#FFE4F0', primary: '#FF6FA8', soft: '#FFA1C9', cream: '#FFD4E5', ink: '#3D1E2C', plum: '#B82864' },
  rose:      { bg: '#FBEFEC', primary: '#E89189', soft: '#F4B5AE', cream: '#FADDD7', ink: '#3D2929', plum: '#A04D44' },
  dusty:     { bg: '#F5E6E8', primary: '#D58792', soft: '#E5B0B8', cream: '#EED1D5', ink: '#382B2E', plum: '#8C4A55' },
};

const FUR = '#FFF8FB', BLUSH = '#FFB6C9', STROKE = '#E89BB5', FACE = '#3D2B30';

function mascotSVG(kind, size) {
  const b = `<svg viewBox="0 0 100 100" width="${size}" height="${size}">
    <ellipse cx="38" cy="22" rx="6" ry="16" fill="${FUR}" stroke="${STROKE}" stroke-width="1.5"/>
    <ellipse cx="62" cy="22" rx="6" ry="16" fill="${FUR}" stroke="${STROKE}" stroke-width="1.5"/>
    <ellipse cx="38" cy="22" rx="2" ry="9" fill="${BLUSH}" opacity="0.8"/>
    <ellipse cx="62" cy="22" rx="2" ry="9" fill="${BLUSH}" opacity="0.8"/>
    <ellipse cx="50" cy="56" rx="26" ry="24" fill="${FUR}" stroke="${STROKE}" stroke-width="1.5"/>
    <ellipse cx="32" cy="62" rx="3.2" ry="2" fill="${BLUSH}" opacity="0.7"/>
    <ellipse cx="68" cy="62" rx="3.2" ry="2" fill="${BLUSH}" opacity="0.7"/>
    <ellipse cx="40" cy="52" rx="2.4" ry="2.76" fill="${FACE}"/>
    <ellipse cx="60" cy="52" rx="2.4" ry="2.76" fill="${FACE}"/>
    <circle cx="40.8" cy="51.2" r="0.7" fill="#fff"/>
    <circle cx="60.8" cy="51.2" r="0.7" fill="#fff"/>
    <path d="M 48 58 L 52 58 L 50 60 Z" fill="${BLUSH}" stroke="${STROKE}" stroke-width="0.8"/>
    <path d="M 50 60 L 50 63 M 50 63 Q 47 65 45 63 M 50 63 Q 53 65 55 63" stroke="${FACE}" stroke-width="1.3" fill="none" stroke-linecap="round"/>
  </svg>`;

  const c = `<svg viewBox="0 0 100 100" width="${size}" height="${size}">
    <polygon points="26,42 32,18 44,34" fill="${FUR}" stroke="${STROKE}" stroke-width="1.5" stroke-linejoin="round"/>
    <polygon points="74,42 68,18 56,34" fill="${FUR}" stroke="${STROKE}" stroke-width="1.5" stroke-linejoin="round"/>
    <polygon points="30,38 33,24 39,32" fill="${BLUSH}" opacity="0.8"/>
    <polygon points="70,38 67,24 61,32" fill="${BLUSH}" opacity="0.8"/>
    <ellipse cx="50" cy="54" rx="26" ry="23" fill="${FUR}" stroke="${STROKE}" stroke-width="1.5"/>
    <ellipse cx="32" cy="60" rx="3.2" ry="2" fill="${BLUSH}" opacity="0.7"/>
    <ellipse cx="68" cy="60" rx="3.2" ry="2" fill="${BLUSH}" opacity="0.7"/>
    <ellipse cx="40" cy="52" rx="2.4" ry="2.76" fill="${FACE}"/>
    <ellipse cx="60" cy="52" rx="2.4" ry="2.76" fill="${FACE}"/>
    <path d="M 47 58 L 53 58 L 50 61 Z" fill="${BLUSH}" stroke="${STROKE}" stroke-width="0.8"/>
    <path d="M 50 61 L 50 63 M 50 63 Q 47 65 45 63 M 50 63 Q 53 65 55 63" stroke="${FACE}" stroke-width="1.3" fill="none" stroke-linecap="round"/>
    <g stroke="${STROKE}" stroke-width="0.9" stroke-linecap="round" opacity="0.7">
      <path d="M 28 58 L 20 56"/><path d="M 28 61 L 20 62"/>
      <path d="M 72 58 L 80 56"/><path d="M 72 61 L 80 62"/>
    </g>
  </svg>`;

  const cl = `<svg viewBox="0 0 100 100" width="${size}" height="${size}">
    <g fill="${FUR}" stroke="${STROKE}" stroke-width="1.5" stroke-linejoin="round">
      <circle cx="32" cy="56" r="16"/><circle cx="50" cy="44" r="18"/>
      <circle cx="68" cy="56" r="16"/><circle cx="42" cy="62" r="14"/><circle cx="58" cy="62" r="14"/>
    </g>
    <ellipse cx="50" cy="62" rx="34" ry="14" fill="${FUR}"/>
    <ellipse cx="36" cy="58" rx="3.2" ry="2" fill="${BLUSH}" opacity="0.7"/>
    <ellipse cx="64" cy="58" rx="3.2" ry="2" fill="${BLUSH}" opacity="0.7"/>
    <ellipse cx="43" cy="52" rx="2.2" ry="2.53" fill="${FACE}"/>
    <ellipse cx="57" cy="52" rx="2.2" ry="2.53" fill="${FACE}"/>
    <path d="M 47 58 Q 50 60 53 58" stroke="${FACE}" stroke-width="1.8" fill="none" stroke-linecap="round"/>
  </svg>`;

  const f = `<svg viewBox="0 0 100 100" width="${size}" height="${size}">
    <g transform="translate(50 50)">
      ${[0,72,144,216,288].map(d=>`<ellipse cx="0" cy="-22" rx="11" ry="16" transform="rotate(${d})" fill="${FUR}" stroke="${STROKE}" stroke-width="1.5"/>`).join('')}
      ${[0,72,144,216,288].map(d=>`<ellipse cx="0" cy="-22" rx="6" ry="10" transform="rotate(${d})" fill="${BLUSH}" opacity="0.5"/>`).join('')}
      <circle r="14" fill="#FFE5B4" stroke="${STROKE}" stroke-width="1.5"/>
      <ellipse cx="-7" cy="3" rx="3.2" ry="2" fill="${BLUSH}" opacity="0.7"/>
      <ellipse cx="7" cy="3" rx="3.2" ry="2" fill="${BLUSH}" opacity="0.7"/>
      <ellipse cx="-5" cy="-2" rx="2" ry="2.3" fill="${FACE}"/>
      <ellipse cx="5" cy="-2" rx="2" ry="2.3" fill="${FACE}"/>
      <path d="M -2.5 3 Q 0 5 2.5 3" stroke="${FACE}" stroke-width="1.6" fill="none" stroke-linecap="round"/>
    </g>
  </svg>`;

  return { bunny: b, cat: c, cloud: cl, flower: f }[kind] || b;
}

// ── state ──────────────────────────────────────────────────────────────────

let settings = {
  nudgeAfter: 10,
  strictMode: false,
  dailyLimit: 25,
  cooldown: 10,
  mascot: 'bunny',
  palette: 'blush',
};
let activeSeconds = 0;
let pausedUntil = 0;

// ── init ───────────────────────────────────────────────────────────────────

async function init() {
  const state = await chrome.runtime.sendMessage({ type: 'GET_STATE' });
  settings = state.settings || settings;
  activeSeconds = state.activeSeconds || 0;
  pausedUntil = state.pausedUntil || 0;

  applyPalette(settings.palette);
  renderHeader();
  renderTodayBar();
  renderSettings();
  bindActions();
}

function applyPalette(name) {
  const p = PALETTES[name] || PALETTES.blush;
  const root = document.documentElement;
  root.style.setProperty('--bg', p.bg);
  root.style.setProperty('--primary', p.primary);
  root.style.setProperty('--soft', p.soft);
  root.style.setProperty('--cream', p.cream);
  root.style.setProperty('--ink', p.ink);
  root.style.setProperty('--plum', p.plum);
}

function renderHeader() {
  document.getElementById('mascot-slot').innerHTML = mascotSVG(settings.mascot, 40);
  const mins = Math.round(activeSeconds / 60);
  const paused = pausedUntil && Date.now() < pausedUntil;
  document.getElementById('app-status').textContent =
    paused ? 'Paused for today, Clair Bear 🌷' : `Watching gently, Clair Bear · ${mins} min today`;
}

function renderTodayBar() {
  const mins = Math.round(activeSeconds / 60);
  const limit = settings.dailyLimit || 25;
  const pct = Math.min(100, (mins / limit) * 100);
  const left = Math.max(0, limit - mins);
  document.getElementById('progress-fill').style.width = pct + '%';
  document.getElementById('progress-label').textContent =
    settings.dailyLimit > 0
      ? `${mins} of ${limit} min · ${left} min left`
      : `${mins} min today`;
}

function renderSettings() {
  // segments
  document.querySelectorAll('.seg').forEach((seg) => {
    const key = seg.dataset.key;
    const val = String(settings[key]);
    seg.querySelectorAll('.seg-opt').forEach((opt) => {
      opt.classList.toggle('active', opt.dataset.val === val);
      opt.addEventListener('click', () => {
        const newVal = isNaN(opt.dataset.val) ? opt.dataset.val : Number(opt.dataset.val);
        settings[key] = newVal;
        seg.querySelectorAll('.seg-opt').forEach(o => o.classList.remove('active'));
        opt.classList.add('active');
        save();
      });
    });
  });

  // strict toggle
  const tog = document.getElementById('toggle-strict');
  tog.classList.toggle('on', settings.strictMode);
  document.getElementById('strict-sub').textContent =
    settings.strictMode ? 'Closes tab after limit' : 'Off -  gentle nudges only';
  tog.addEventListener('click', () => {
    settings.strictMode = !settings.strictMode;
    tog.classList.toggle('on', settings.strictMode);
    document.getElementById('strict-sub').textContent =
      settings.strictMode ? 'Closes tab after limit' : 'Off -  gentle nudges only';
    save();
  });

  // mascot picker -  inject SVGs
  document.querySelectorAll('.mascot-opt').forEach((opt) => {
    opt.innerHTML = mascotSVG(opt.dataset.val, 22);
    opt.classList.toggle('active', opt.dataset.val === settings.mascot);
    opt.addEventListener('click', () => {
      settings.mascot = opt.dataset.val;
      document.querySelectorAll('.mascot-opt').forEach(o => o.classList.remove('active'));
      opt.classList.add('active');
      document.getElementById('mascot-slot').innerHTML = mascotSVG(settings.mascot, 40);
      save();
    });
  });

  // palette chips
  document.querySelectorAll('.palette-chip').forEach((chip) => {
    chip.classList.toggle('active', chip.dataset.val === settings.palette);
    chip.addEventListener('click', () => {
      settings.palette = chip.dataset.val;
      document.querySelectorAll('.palette-chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      applyPalette(settings.palette);
      save();
    });
  });
}

function bindActions() {
  const paused = pausedUntil && Date.now() < pausedUntil;
  const btn = document.getElementById('btn-pause');
  if (paused) {
    btn.textContent = 'Paused for today ✓';
    btn.classList.add('paused');
  }
  btn.addEventListener('click', async () => {
    if (paused) return;
    await chrome.runtime.sendMessage({ type: 'PAUSE_TODAY' });
    btn.textContent = 'Paused for today ✓';
    btn.classList.add('paused');
    document.getElementById('app-status').textContent = 'Paused for today, Clair Bear 🌷';
  });
}

async function save() {
  await chrome.runtime.sendMessage({ type: 'SAVE_SETTINGS', settings });
}

init();
