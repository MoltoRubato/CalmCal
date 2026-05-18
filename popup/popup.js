// CalmCal popup — minimal: ON/OFF, today usage, pause for today.

const FUR = '#FFF8FB', BLUSH = '#FFB6C9', STROKE = '#E89BB5', FACE = '#3D2B30';

const LIMIT_MIN = 15;

function bunnySVG(size) {
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

let enabled = true;
let activeSeconds = 0;
let pausedUntil = 0;
let lockUntil = 0;

async function init() {
  const state = await chrome.runtime.sendMessage({ type: 'GET_STATE' });
  enabled = state?.settings?.enabled !== false;
  activeSeconds = state?.activeSeconds || 0;
  pausedUntil = state?.pausedUntil || 0;
  lockUntil = state?.lockUntil || 0;

  document.getElementById('mascot-slot').innerHTML = bunnySVG(40);
  render();
  bindToggle();
  bindPause();
}

function isPaused() { return pausedUntil && Date.now() < pausedUntil; }
function isLocked() { return lockUntil && Date.now() < lockUntil; }

function render() {
  const mins = Math.round(activeSeconds / 60);
  const status = document.getElementById('app-status');
  if (!enabled)        status.textContent = 'Off — sleeping quietly';
  else if (isLocked()) status.textContent = `Locked until tomorrow, Clair 🌷`;
  else if (isPaused()) status.textContent = 'Paused for today, Clair 🌷';
  else                 status.textContent = `Watching gently, Clair · ${mins} min today`;

  const pct = Math.min(100, (mins / LIMIT_MIN) * 100);
  const left = Math.max(0, LIMIT_MIN - mins);
  document.getElementById('progress-fill').style.width = pct + '%';
  document.getElementById('progress-label').textContent =
    `${mins} of ${LIMIT_MIN} min · ${left} min left`;

  const tog = document.getElementById('toggle-enabled');
  tog.classList.toggle('on', enabled);
  document.getElementById('enabled-sub').textContent =
    enabled ? 'On — 5 min check-in, 15 min limit' : 'Off — sleeping quietly';

  const pauseBtn = document.getElementById('btn-pause');
  if (isPaused()) {
    pauseBtn.textContent = 'Paused for today ✓';
    pauseBtn.classList.add('paused');
  } else {
    pauseBtn.textContent = 'Pause CalmCal for today';
    pauseBtn.classList.remove('paused');
  }
}

function bindToggle() {
  document.getElementById('toggle-enabled').addEventListener('click', async () => {
    enabled = !enabled;
    await chrome.runtime.sendMessage({ type: 'SET_ENABLED', enabled });
    render();
  });
}

function bindPause() {
  document.getElementById('btn-pause').addEventListener('click', async () => {
    if (isPaused()) return;
    await chrome.runtime.sendMessage({ type: 'PAUSE_TODAY' });
    pausedUntil = endOfToday();
    render();
  });
}

function endOfToday() {
  const d = new Date();
  d.setHours(23, 59, 59, 999);
  return d.getTime();
}

init();
