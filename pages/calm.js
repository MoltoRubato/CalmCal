// CalmCal calm page: shown during the 15-min daily lockout.
// Until lockUntil expires, the back button is disabled: refresh/new-tab
// bypass is impossible because the service worker redirects every
// calendar.google.com navigation back here.

const FUR = '#FFF8FB', BLUSH = '#FFB6C9', STROKE = '#E89BB5', FACE = '#3D2B30';

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
    <path d="M 50 60 L 50 63 M 50 63 Q 47 65 45 63 M 50 63 Q 53 65 55 63" stroke="${FACE}" stroke-width="1.3" fill="none" stroke-linecap="round"/>
  </svg>`;
}

function addConfetti() {
  const dots = [
    {x:8,y:12,s:6,c:'#FFB6C9'},{x:92,y:22,s:8,c:'#F48FB1'},{x:14,y:78,s:10,c:'#FCE4EC'},
    {x:86,y:84,s:7,c:'#FFB6C9'},{x:50,y:8,s:5,c:'#F48FB1'},{x:25,y:40,s:4,c:'#FFB6C9'},
    {x:78,y:55,s:6,c:'#FCE4EC'},{x:96,y:50,s:4,c:'#F48FB1'},{x:5,y:50,s:5,c:'#FCE4EC'},
  ];
  dots.forEach(d => {
    const el = document.createElement('div');
    el.className = 'dot';
    el.style.cssText = `left:${d.x}%;top:${d.y}%;width:${d.s}px;height:${d.s}px;background:${d.c}`;
    document.body.appendChild(el);
  });
}

// ── breathing text ─────────────────────────────────────────────────────────

const breathPhases = ['breathe in', 'hold…', 'breathe out', 'rest…'];
const breathDurations = [4000, 2000, 4000, 2000];
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

// ── back button + lockout detection ──────────────────────────────────────

const backBtn = document.getElementById('btn-back');
let lockUntil = 0;
let ticker = null;

function setLocked() {
  backBtn.disabled = true;
  backBtn.style.opacity = '0.5';
  backBtn.style.cursor = 'not-allowed';
  backBtn.textContent = 'Locked until tomorrow';
}

function setUnlocked() {
  backBtn.disabled = false;
  backBtn.style.opacity = '';
  backBtn.style.cursor = '';
  backBtn.textContent = "I'm ready, go back";
  document.getElementById('actions').style.display = '';
}

function startTimer() {
  const tick = () => {
    if (Date.now() >= lockUntil) {
      clearInterval(ticker);
      ticker = null;
      setUnlocked();
    }
  };
  tick();
  ticker = setInterval(tick, 1000);
}

backBtn.addEventListener('click', () => {
  if (backBtn.disabled) return;
  window.location.href = 'https://calendar.google.com';
});

// ── animated / interactive background ─────────────────────────────────────

const PETAL_COLORS = ['#FFB6C9', '#F48FB1', '#FCE4EC', '#ffd9e4'];
const PREFERS_REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function spawnPetals(count = 16) {
  if (PREFERS_REDUCED) return;
  const container = document.getElementById('petals');
  const frag = document.createDocumentFragment();
  for (let i = 0; i < count; i++) {
    const p = document.createElement('div');
    p.className = 'petal';
    const size = 6 + Math.random() * 14;            // 6-20px
    const left = Math.random() * 100;
    const dur  = 22 + Math.random() * 26;           // 22-48s rise
    const delay = -Math.random() * dur;             // negative = stagger from start
    const drift = (Math.random() - 0.5) * 220;      // sideways drift in px
    const spin  = (Math.random() - 0.5) * 540;      // rotation deg
    const peak  = 0.35 + Math.random() * 0.35;      // peak opacity
    const color = PETAL_COLORS[i % PETAL_COLORS.length];
    p.style.cssText = `
      left:${left}%; width:${size}px; height:${size}px;
      background:${color};
      animation-duration:${dur}s; animation-delay:${delay}s;
      --drift:${drift}px; --spin:${spin}deg; --peak:${peak};
    `;
    frag.appendChild(p);
  }
  container.appendChild(frag);
}

// Cursor parallax — store normalized [-1..1] in CSS vars on <body>.
// rAF-throttled so we update at most once per frame regardless of move rate.
function attachParallax() {
  if (PREFERS_REDUCED) return;
  let mx = 0, my = 0, pending = false;
  const onMove = (e) => {
    mx = (e.clientX / window.innerWidth)  * 2 - 1;
    my = (e.clientY / window.innerHeight) * 2 - 1;
    if (pending) return;
    pending = true;
    requestAnimationFrame(() => {
      document.body.style.setProperty('--mx', mx.toFixed(3));
      document.body.style.setProperty('--my', my.toFixed(3));
      pending = false;
    });
  };
  const onLeave = () => {
    requestAnimationFrame(() => {
      document.body.style.setProperty('--mx', '0');
      document.body.style.setProperty('--my', '0');
    });
  };
  window.addEventListener('pointermove', onMove, { passive: true });
  window.addEventListener('pointerleave', onLeave);
}

// Soft ripple on click — spawns one ring at the cursor and removes it after.
function attachRipple() {
  document.addEventListener('click', (e) => {
    if (PREFERS_REDUCED) return;
    // Ignore clicks on the action buttons so they feel snappy.
    if (e.target.closest('button')) return;
    const r = document.createElement('div');
    r.className = 'ripple';
    r.style.left = e.clientX + 'px';
    r.style.top  = e.clientY + 'px';
    document.body.appendChild(r);
    r.addEventListener('animationend', () => r.remove(), { once: true });
  });
}

// ── init ──────────────────────────────────────────────────────────────────

async function init() {
  document.getElementById('mascot-wrap').innerHTML = bunnySVG(180);
  addConfetti();
  spawnPetals(16);
  attachParallax();
  attachRipple();

  let state = null;
  try { state = await chrome.runtime.sendMessage({ type: 'GET_STATE' }); }
  catch { /* opened outside extension context */ }

  lockUntil = (state && state.lockUntil) || 0;

  if (lockUntil && Date.now() < lockUntil) {
    document.querySelector('.eyebrow').textContent =
      '✦  Daily limit reached · Calendar resting  ✦';
    document.querySelector('.sub').textContent =
      "You hit your 15 minutes for today, Clair. Calendar reopens tomorrow: past Clair Bear has your back.";
    // setUnlocked() re-shows this once the lock expires.
    document.getElementById('actions').style.display = 'none';
    setLocked();
    startTimer();
  } else {
    document.querySelector('.sub').textContent =
      "Take a moment with bunny. The week will hold itself together.";
  }
}

init();
