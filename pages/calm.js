// CalmCal calm page

const PALETTES = {
  blush:     { bg: '#FFF1F5', primary: '#F48FB1', soft: '#FFB6C9', cream: '#FCE4EC', ink: '#3D2B30', plum: '#9D4A6B' },
  bubblegum: { bg: '#FFE4F0', primary: '#FF6FA8', soft: '#FFA1C9', cream: '#FFD4E5', ink: '#3D1E2C', plum: '#B82864' },
  rose:      { bg: '#FBEFEC', primary: '#E89189', soft: '#F4B5AE', cream: '#FADDD7', ink: '#3D2929', plum: '#A04D44' },
  dusty:     { bg: '#F5E6E8', primary: '#D58792', soft: '#E5B0B8', cream: '#EED1D5', ink: '#382B2E', plum: '#8C4A55' },
};

const FUR = '#FFF8FB', BLUSH = '#FFB6C9', STROKE = '#E89BB5', FACE = '#3D2B30';

function mascotSVG(kind, size) {
  const svgs = {
    bunny: `<svg viewBox="0 0 100 100" width="${size}" height="${size}">
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
    </svg>`,
    cat: `<svg viewBox="0 0 100 100" width="${size}" height="${size}">
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
    </svg>`,
    cloud: `<svg viewBox="0 0 100 100" width="${size}" height="${size}">
      <g fill="${FUR}" stroke="${STROKE}" stroke-width="1.5">
        <circle cx="32" cy="56" r="16"/><circle cx="50" cy="44" r="18"/>
        <circle cx="68" cy="56" r="16"/><circle cx="42" cy="62" r="14"/><circle cx="58" cy="62" r="14"/>
      </g>
      <ellipse cx="50" cy="62" rx="34" ry="14" fill="${FUR}"/>
      <ellipse cx="36" cy="58" rx="3.2" ry="2" fill="${BLUSH}" opacity="0.7"/>
      <ellipse cx="64" cy="58" rx="3.2" ry="2" fill="${BLUSH}" opacity="0.7"/>
      <ellipse cx="43" cy="52" rx="2.2" ry="2.53" fill="${FACE}"/>
      <ellipse cx="57" cy="52" rx="2.2" ry="2.53" fill="${FACE}"/>
      <path d="M 47 58 Q 50 60 53 58" stroke="${FACE}" stroke-width="1.8" fill="none" stroke-linecap="round"/>
    </svg>`,
    flower: `<svg viewBox="0 0 100 100" width="${size}" height="${size}">
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
    </svg>`,
  };
  return svgs[kind] || svgs.bunny;
}

function applyPalette(p) {
  const r = document.documentElement;
  r.style.setProperty('--bg', p.bg);
  r.style.setProperty('--primary', p.primary);
  r.style.setProperty('--soft', p.soft);
  r.style.setProperty('--cream', p.cream);
  r.style.setProperty('--ink', p.ink);
  r.style.setProperty('--plum', p.plum);
}

function addConfetti(p) {
  const dots = [
    {x:8,y:12,s:6,c:p.soft},{x:92,y:22,s:8,c:p.primary},{x:14,y:78,s:10,c:p.cream},
    {x:86,y:84,s:7,c:p.soft},{x:50,y:8,s:5,c:p.primary},{x:25,y:40,s:4,c:p.soft},
    {x:78,y:55,s:6,c:p.cream},{x:96,y:50,s:4,c:p.primary},{x:5,y:50,s:5,c:p.cream},
  ];
  dots.forEach(d => {
    const el = document.createElement('div');
    el.className = 'dot';
    el.style.cssText = `left:${d.x}%;top:${d.y}%;width:${d.s}px;height:${d.s}px;background:${d.c}`;
    document.body.appendChild(el);
  });
}

// ── breathing text cycle ──────────────────────────────────────────────────

const breathPhases = ['breathe in', 'hold…', 'breathe out', 'rest…'];
const breathDurations = [4000, 2000, 4000, 2000]; // ms each
let phaseIdx = 0;
const breathEl = document.getElementById('breath-text');

function nextBreathPhase() {
  phaseIdx = (phaseIdx + 1) % breathPhases.length;
  breathEl.style.opacity = '0';
  setTimeout(() => {
    breathEl.textContent = breathPhases[phaseIdx];
    breathEl.style.opacity = '1';
  }, 400);
  setTimeout(nextBreathPhase, breathDurations[phaseIdx]);
}
setTimeout(nextBreathPhase, breathDurations[0]);

// ── countdown / lockout sync ──────────────────────────────────────────────
// Two modes:
//   1. Voluntary break: a flat 5-minute breathing timer.
//   2. Hard lockout (strict mode triggered): respects lockUntil — back button
//      is disabled until the lock expires, so closing and reopening Calendar
//      can't bypass it.

const countEl = document.getElementById('countdown');
const backBtn = document.getElementById('btn-back');
let lockUntil = 0;
let ticker = null;

function formatTime(s) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${String(sec).padStart(2, '0')}`;
}

function startVoluntaryTimer() {
  let secondsLeft = 5 * 60;
  countEl.textContent = formatTime(secondsLeft);
  ticker = setInterval(() => {
    secondsLeft--;
    if (secondsLeft <= 0) {
      clearInterval(ticker);
      ticker = null;
      countEl.textContent = '0:00';
    } else {
      countEl.textContent = formatTime(secondsLeft);
    }
  }, 1000);
}

function startLockoutTimer() {
  backBtn.disabled = true;
  backBtn.style.opacity = '0.5';
  backBtn.style.cursor = 'not-allowed';
  backBtn.textContent = 'Locked';

  const tick = () => {
    const secondsLeft = Math.max(0, Math.ceil((lockUntil - Date.now()) / 1000));
    countEl.textContent = formatTime(secondsLeft);
    if (secondsLeft <= 0) {
      clearInterval(ticker);
      ticker = null;
      backBtn.disabled = false;
      backBtn.style.opacity = '';
      backBtn.style.cursor = '';
      backBtn.textContent = "I'm ready, go back";
      // Reset the day counters so user doesn't get re-triggered instantly.
      chrome.runtime.sendMessage({ type: 'RESET_DAY' }).catch(() => {});
    }
  };
  tick();
  ticker = setInterval(tick, 1000);
}

backBtn.addEventListener('click', () => {
  if (backBtn.disabled) return;
  window.location.href = 'https://calendar.google.com';
});

// ── load state ────────────────────────────────────────────────────────────

async function init() {
  let state = null;
  try {
    state = await chrome.runtime.sendMessage({ type: 'GET_STATE' });
  } catch { /* opened outside extension context */ }

  const s = state?.settings || {};
  const p = PALETTES[s.palette] || PALETTES.blush;
  const mascot = s.mascot || 'bunny';

  applyPalette(p);
  addConfetti(p);
  document.getElementById('mascot-wrap').innerHTML = mascotSVG(mascot, 180);
  document.getElementById('headline').textContent = `Breathe with ${mascot}.`;

  lockUntil = (state && state.lockUntil) || 0;
  if (lockUntil && Date.now() < lockUntil) {
    document.querySelector('.eyebrow').textContent = '✦  Strict cooldown · Calendar is resting  ✦';
    document.querySelector('.sub').textContent =
      "Past Clair Bear is looking after present Clair Bear. Calendar will reopen when the timer ends.";
    startLockoutTimer();
  } else {
    startVoluntaryTimer();
  }
}

init();
