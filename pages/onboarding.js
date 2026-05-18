// CalmCal onboarding: one screen, one button.

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
    <path d="M 50 60 L 50 63 M 50 63 Q 47 65 45 63 M 50 63 Q 53 65 55 63"
      stroke="${FACE}" stroke-width="1.3" fill="none" stroke-linecap="round"/>
  </svg>`;
}

function addConfetti() {
  const positions = [
    {x:6,y:10,s:7},{x:90,y:18,s:9},{x:12,y:82,s:11},
    {x:88,y:80,s:8},{x:50,y:6,s:5},{x:22,y:45,s:5},
    {x:80,y:52,s:6},{x:95,y:50,s:4},{x:4,y:55,s:5},
  ];
  positions.forEach(({ x, y, s }) => {
    const dot = document.createElement('div');
    dot.className = 'dot';
    dot.style.cssText = `left:${x}%;top:${y}%;width:${s}px;height:${s}px;background:#FFB6C9`;
    document.body.appendChild(dot);
  });
}

document.getElementById('mascot').innerHTML = bunnySVG(110);
addConfetti();

document.getElementById('btn-finish').addEventListener('click', async () => {
  try {
    await chrome.runtime.sendMessage({ type: 'FINISH_ONBOARDING' });
  } catch { /* opened outside extension context */ }
  window.location.href = 'https://calendar.google.com';
});
