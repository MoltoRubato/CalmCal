// CalmCal popup script

const PALETTE = { bg: '#FFF1F5', primary: '#F48FB1', soft: '#FFB6C9', cream: '#FCE4EC', ink: '#3D2B30', plum: '#9D4A6B' };

const FUR = '#FFF8FB', BLUSH = '#FFB6C9', STROKE = '#E89BB5', FACE = '#3D2B30';

function bunnysvg(size) {
  return `<svg viewBox="0 0 100 100" width="${size}" height="${size}">
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
    <path d="M 50 60 L 50 63 M 50 63 Q 47 65 45 63 M 50 63 Q 53 65 55 63"
      stroke="${FACE}" stroke-width="1.3" fill="none" stroke-linecap="round"/>
  </svg>`;
}

// ── state ──────────────────────────────────────────────────────────────────

let settings = { nudgeAfter: 10, strictMode: false, dailyLimit: 25, cooldown: 10, mascot: 'bunny', palette: 'blush' };
let activeSeconds = 0;
let pausedUntil = 0;

// ── init ───────────────────────────────────────────────────────────────────

async function init() {
  const state = await chrome.runtime.sendMessage({ type: 'GET_STATE' });
  settings = state.settings || settings;
  activeSeconds = state.activeSeconds || 0;
  pausedUntil = state.pausedUntil || 0;

  renderHeader();
  renderTodayBar();
  renderSettings();
  bindActions();
}

function renderHeader() {
  document.getElementById('mascot-slot').innerHTML = bunnysvg(40);
  const mins = Math.round(activeSeconds / 60);
  const paused = pausedUntil && Date.now() < pausedUntil;
  document.getElementById('app-status').textContent =
    paused ? 'Paused for today, Clair 🌷' : `Watching gently, Clair · ${mins} min today`;
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

  const tog = document.getElementById('toggle-strict');
  tog.classList.toggle('on', settings.strictMode);
  document.getElementById('strict-sub').textContent =
    settings.strictMode ? 'Closes tab after limit' : 'Off - gentle nudges only';
  tog.addEventListener('click', () => {
    settings.strictMode = !settings.strictMode;
    tog.classList.toggle('on', settings.strictMode);
    document.getElementById('strict-sub').textContent =
      settings.strictMode ? 'Closes tab after limit' : 'Off - gentle nudges only';
    save();
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
    document.getElementById('app-status').textContent = 'Paused for today, Clair 🌷';
  });
}

async function save() {
  await chrome.runtime.sendMessage({ type: 'SAVE_SETTINGS', settings });
}

init();
