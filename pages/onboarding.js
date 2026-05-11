// CalmCal onboarding

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

// ── state ─────────────────────────────────────────────────────────────────

const MASCOTS = ['bunny', 'cat', 'cloud', 'flower'];
const MASCOT_LABELS = { bunny: 'Bunny', cat: 'Cat', cloud: 'Cloud', flower: 'Flower' };

let currentStep = 0;
let chosenMascot = 'bunny';
let chosenMinutes = 12;
let chosenStrict = false;

// ── render dots ───────────────────────────────────────────────────────────

function renderDots(containerId, activeIdx) {
  const el = document.getElementById(containerId);
  if (!el) return;
  el.innerHTML = [0,1,2,3].map(i => {
    const w = i === activeIdx ? 22 : 6;
    return `<div class="step-dot ${i === activeIdx ? 'active' : ''}" style="width:${w}px"></div>`;
  }).join('');
}

// ── render mascots on step 2 ──────────────────────────────────────────────

function renderMascotGrid() {
  const grid = document.getElementById('mascot-grid');
  if (!grid) return;
  grid.innerHTML = MASCOTS.map(k => `
    <div class="mascot-card ${k === chosenMascot ? 'active' : ''}" data-mascot="${k}" onclick="pickMascot(this)">
      ${mascotSVG(k, 72)}
      <div class="label">${MASCOT_LABELS[k]}</div>
    </div>
  `).join('');
}

// ── render header mascots ─────────────────────────────────────────────────

function renderHeaderMascots() {
  const sizes = { 0: 150, 1: 90, 3: 90 };
  [0, 1, 3].forEach(s => {
    const el = document.getElementById(`mw-${s}`);
    if (el) el.innerHTML = mascotSVG(chosenMascot, sizes[s]);
  });
}

// ── confetti ──────────────────────────────────────────────────────────────

function addConfetti() {
  const dots = [
    {x:6,y:10,s:7},{x:90,y:18,s:9},{x:12,y:82,s:11},
    {x:88,y:80,s:8},{x:50,y:6,s:5},{x:22,y:45,s:5},
    {x:80,y:52,s:6},{x:95,y:50,s:4},{x:4,y:55,s:5},
  ];
  dots.forEach(d => {
    const el = document.createElement('div');
    el.className = 'dot';
    el.style.cssText = `position:fixed;left:${d.x}%;top:${d.y}%;width:${d.s}px;height:${d.s}px;background:#FFB6C9;opacity:0.45;border-radius:50%;pointer-events:none`;
    document.body.appendChild(el);
  });
}

// ── navigation ────────────────────────────────────────────────────────────

function goTo(step) {
  document.getElementById(`step-${currentStep}`).classList.remove('active');
  currentStep = step;
  document.getElementById(`step-${currentStep}`).classList.add('active');
  renderDots(`dots-${step}`, step);
  if (step === 2) renderMascotGrid();
  renderHeaderMascots();
}

function pickTiming(el) {
  document.querySelectorAll('.timing-opt').forEach(o => o.classList.remove('active'));
  el.classList.add('active');
  chosenMinutes = Number(el.dataset.min);
}

function pickMascot(el) {
  document.querySelectorAll('.mascot-card').forEach(o => o.classList.remove('active'));
  el.classList.add('active');
  chosenMascot = el.dataset.mascot;
  renderHeaderMascots();
}

function pickStrict(el) {
  document.querySelectorAll('.strict-opt').forEach(o => o.classList.remove('active'));
  el.classList.add('active');
  chosenStrict = el.dataset.strict === 'true';
}

async function finish() {
  const settings = {
    nudgeAfter: chosenMinutes,
    strictMode: chosenStrict,
    dailyLimit: 25,
    cooldown: 10,
    mascot: chosenMascot,
    palette: 'blush',
  };
  try {
    await chrome.runtime.sendMessage({ type: 'SAVE_SETTINGS', settings });
    await chrome.storage.local.set({ onboardingDone: true });
  } catch {
    // extension context unavailable in standalone preview
  }
  window.location.href = 'https://calendar.google.com';
}

// ── init ──────────────────────────────────────────────────────────────────

addConfetti();
renderDots('dots-0', 0);
renderHeaderMascots();
