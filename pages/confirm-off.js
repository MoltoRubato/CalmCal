// CalmCal confirm-off — typing gate + Ryan-loves-you-too landing.

const REQUIRED_PHRASE = "I want to be on google calendar for longer but won't get stressed thinking too far ahead. Life will be okay, and I will have a great day after planning this all out <3 I love Ryan";

// ── mascot ──────────────────────────────────────────────────────────────

const FUR = '#FFF8FB', BLUSH = '#FFB6C9', STROKE = '#E89BB5', FACE = '#3D2B30';

function bunnySVG(size, mood) {
  const eyes = mood === 'sleepy'
    ? `<g stroke="${FACE}" stroke-width="2.2" stroke-linecap="round" fill="none">
         <path d="M 36 52 Q 40 55 44 52"/>
         <path d="M 56 52 Q 60 55 64 52"/>
       </g>`
    : `<g fill="${FACE}">
         <ellipse cx="40" cy="52" rx="2.4" ry="2.76"/>
         <ellipse cx="60" cy="52" rx="2.4" ry="2.76"/>
         <circle cx="40.8" cy="51.2" r="0.7" fill="#fff"/>
         <circle cx="60.8" cy="51.2" r="0.7" fill="#fff"/>
       </g>`;
  return `<svg viewBox="0 0 100 100" width="${size}" height="${size}">
    <ellipse cx="38" cy="22" rx="6" ry="16" fill="${FUR}" stroke="${STROKE}" stroke-width="1.5"/>
    <ellipse cx="62" cy="22" rx="6" ry="16" fill="${FUR}" stroke="${STROKE}" stroke-width="1.5"/>
    <ellipse cx="38" cy="22" rx="2" ry="9" fill="${BLUSH}" opacity="0.8"/>
    <ellipse cx="62" cy="22" rx="2" ry="9" fill="${BLUSH}" opacity="0.8"/>
    <ellipse cx="50" cy="56" rx="26" ry="24" fill="${FUR}" stroke="${STROKE}" stroke-width="1.5"/>
    <ellipse cx="32" cy="62" rx="3.2" ry="2" fill="${BLUSH}" opacity="0.7"/>
    <ellipse cx="68" cy="62" rx="3.2" ry="2" fill="${BLUSH}" opacity="0.7"/>
    ${eyes}
    <path d="M 48 58 L 52 58 L 50 60 Z" fill="${BLUSH}" stroke="${STROKE}" stroke-width="0.8"/>
    <path d="M 50 60 L 50 63 M 50 63 Q 47 65 45 63 M 50 63 Q 53 65 55 63"
      stroke="${FACE}" stroke-width="1.3" fill="none" stroke-linecap="round"/>
  </svg>`;
}

function heartSVG(size, color) {
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none">
    <path d="M12 21s-7-4.35-7-10a4.5 4.5 0 0 1 8-2.85A4.5 4.5 0 0 1 19 11c0 5.65-7 10-7 10z"
      fill="${color}" stroke="#fff" stroke-width="1.2" stroke-linejoin="round"/>
  </svg>`;
}

// ── confetti + floating hearts ──────────────────────────────────────────

function addConfetti() {
  const dots = [
    {x:6,y:10,s:7,c:'#FFB6C9'}, {x:90,y:18,s:9,c:'#F48FB1'}, {x:12,y:82,s:11,c:'#FCE4EC'},
    {x:88,y:80,s:8,c:'#FFB6C9'}, {x:50,y:6,s:5,c:'#F48FB1'}, {x:22,y:45,s:5,c:'#FFB6C9'},
    {x:80,y:52,s:6,c:'#FCE4EC'}, {x:95,y:50,s:4,c:'#F48FB1'}, {x:4,y:55,s:5,c:'#FCE4EC'},
  ];
  dots.forEach((d) => {
    const el = document.createElement('div');
    el.className = 'dot';
    el.style.cssText = `left:${d.x}%;top:${d.y}%;width:${d.s}px;height:${d.s}px;background:${d.c}`;
    document.body.appendChild(el);
  });
}

function addFloatingHearts(container) {
  const hearts = [
    { x: 8, y: 18, s: 18, d: 0,   c: '#F48FB1' },
    { x: 88, y: 14, s: 22, d: 1.2, c: '#FFB6C9' },
    { x: 12, y: 72, s: 16, d: 2.0, c: '#FFB6C9' },
    { x: 92, y: 78, s: 20, d: 0.6, c: '#F48FB1' },
    { x: 50, y: 88, s: 14, d: 1.6, c: '#F48FB1' },
    { x: 78, y: 36, s: 12, d: 2.4, c: '#FFB6C9' },
    { x: 22, y: 44, s: 14, d: 0.9, c: '#F48FB1' },
  ];
  hearts.forEach((h) => {
    const el = document.createElement('div');
    el.className = 'floating-heart';
    el.style.left = h.x + '%';
    el.style.top = h.y + '%';
    el.style.animationDelay = h.d + 's';
    el.innerHTML = heartSVG(h.s, h.c);
    container.appendChild(el);
  });
}

// ── phrase rendering ────────────────────────────────────────────────────

function correctPrefixLen(typed) {
  let i = 0;
  while (i < typed.length && i < REQUIRED_PHRASE.length && typed[i] === REQUIRED_PHRASE[i]) i++;
  return i;
}

function renderPhrase(typed) {
  const correct = correctPrefixLen(typed);
  const phraseEl = document.getElementById('phrase');
  phraseEl.innerHTML = REQUIRED_PHRASE.split('').map((ch, i) => {
    const cls = i < correct ? 'done' : i === correct ? 'next' : 'todo';
    // Escape entities; the only special chars we expect are '<' and '>' from "<3"
    const safe = ch === '<' ? '&lt;' : ch === '>' ? '&gt;' : ch === ' ' ? '&nbsp;' : ch;
    return `<span class="${cls}">${safe}</span>`;
  }).join('');
}

// ── update on each keystroke ────────────────────────────────────────────

function update() {
  const ta = document.getElementById('ta');
  const typed = ta.value;
  const correct = correctPrefixLen(typed);
  const pct = Math.min(1, correct / REQUIRED_PHRASE.length);
  const ok = typed === REQUIRED_PHRASE;

  renderPhrase(typed);

  const chip = document.getElementById('chip');
  chip.textContent = ok ? '✓ matched' : `${Math.round(pct * 100)}%`;

  const fill = document.getElementById('fill');
  fill.style.width = (pct * 100) + '%';
  fill.classList.toggle('matched', ok);

  ta.classList.toggle('matched', ok);

  const btn = document.getElementById('btn-confirm');
  btn.disabled = !ok;
  btn.classList.toggle('enabled', ok);
  btn.textContent = ok ? 'Switch off CalmCal →' : 'Switch off CalmCal';
}

// ── celebration → actually disable + open Calendar ──────────────────────

async function confirmOff() {
  // Build mascot + orbiting hearts in the celebration screen
  const mascotWrap = document.getElementById('celebrate-mascot');
  mascotWrap.innerHTML = bunnySVG(180, 'happy');
  const orbits = [
    { x: -36, y: -8, s: 22, delay: '0s' },
    { x: 152, y: 6,  s: 18, delay: '.4s' },
    { x: 70, y: -38, s: 26, delay: '.8s' },
  ];
  orbits.forEach((o) => {
    const el = document.createElement('div');
    el.className = 'orbit-heart';
    el.style.left = o.x + 'px';
    el.style.top = o.y + 'px';
    el.style.animationDelay = o.delay;
    el.innerHTML = heartSVG(o.s, '#F48FB1');
    mascotWrap.appendChild(el);
  });

  document.getElementById('chip-mascot').innerHTML = bunnySVG(26, 'happy');
  const celebrateBox = document.getElementById('celebrate');
  addFloatingHearts(celebrateBox);
  celebrateBox.classList.add('show');

  // Actually disable CalmCal in storage.
  try {
    await chrome.runtime.sendMessage({ type: 'SET_ENABLED', enabled: false });
  } catch {}
}

// ── wire up ─────────────────────────────────────────────────────────────

document.getElementById('mascot-frame').innerHTML = bunnySVG(78, 'sleepy');
addConfetti();
renderPhrase('');

document.getElementById('ta').addEventListener('input', update);
document.getElementById('ta').focus();

document.getElementById('btn-cancel').addEventListener('click', () => {
  // CalmCal stays on; just take them to Calendar.
  window.location.href = 'https://calendar.google.com';
});

document.getElementById('btn-confirm').addEventListener('click', () => {
  const btn = document.getElementById('btn-confirm');
  if (btn.disabled) return;
  confirmOff();
});

document.getElementById('chip-btn').addEventListener('click', () => {
  window.location.href = 'https://calendar.google.com';
});
