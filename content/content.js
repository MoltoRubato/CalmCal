// CalmCal content script -  runs on calendar.google.com
// Sends heartbeats while the tab is active & visible; renders overlays on demand.

(function () {
  'use strict';

  const FONT_URL = 'https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800;900&display=swap';

  // ── palette & mascots ────────────────────────────────────────────────────

  const PALETTES = {
    blush:     { bg: '#FFF1F5', primary: '#F48FB1', soft: '#FFB6C9', cream: '#FCE4EC', ink: '#3D2B30', plum: '#9D4A6B' },
    bubblegum: { bg: '#FFE4F0', primary: '#FF6FA8', soft: '#FFA1C9', cream: '#FFD4E5', ink: '#3D1E2C', plum: '#B82864' },
    rose:      { bg: '#FBEFEC', primary: '#E89189', soft: '#F4B5AE', cream: '#FADDD7', ink: '#3D2929', plum: '#A04D44' },
    dusty:     { bg: '#F5E6E8', primary: '#D58792', soft: '#E5B0B8', cream: '#EED1D5', ink: '#382B2E', plum: '#8C4A55' },
  };

  function getPalette(name) {
    return PALETTES[name] || PALETTES.blush;
  }

  // SVG mascots -  identical to design prototypes
  function mascotSVG(kind, size = 48) {
    const FUR = '#FFF8FB', BLUSH = '#FFB6C9', STROKE = '#E89BB5', FACE = '#3D2B30';

    const bunny = `<svg viewBox="0 0 100 100" width="${size}" height="${size}">
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

    const cat = `<svg viewBox="0 0 100 100" width="${size}" height="${size}">
      <polygon points="26,42 32,18 44,34" fill="${FUR}" stroke="${STROKE}" stroke-width="1.5" stroke-linejoin="round"/>
      <polygon points="74,42 68,18 56,34" fill="${FUR}" stroke="${STROKE}" stroke-width="1.5" stroke-linejoin="round"/>
      <polygon points="30,38 33,24 39,32" fill="${BLUSH}" opacity="0.8"/>
      <polygon points="70,38 67,24 61,32" fill="${BLUSH}" opacity="0.8"/>
      <ellipse cx="50" cy="54" rx="26" ry="23" fill="${FUR}" stroke="${STROKE}" stroke-width="1.5"/>
      <ellipse cx="32" cy="60" rx="3.2" ry="2" fill="${BLUSH}" opacity="0.7"/>
      <ellipse cx="68" cy="60" rx="3.2" ry="2" fill="${BLUSH}" opacity="0.7"/>
      <ellipse cx="40" cy="52" rx="2.4" ry="2.76" fill="${FACE}"/>
      <ellipse cx="60" cy="52" rx="2.4" ry="2.76" fill="${FACE}"/>
      <circle cx="40.8" cy="51.2" r="0.7" fill="#fff"/>
      <circle cx="60.8" cy="51.2" r="0.7" fill="#fff"/>
      <path d="M 47 58 L 53 58 L 50 61 Z" fill="${BLUSH}" stroke="${STROKE}" stroke-width="0.8"/>
      <path d="M 50 61 L 50 63 M 50 63 Q 47 65 45 63 M 50 63 Q 53 65 55 63" stroke="${FACE}" stroke-width="1.3" fill="none" stroke-linecap="round"/>
      <g stroke="${STROKE}" stroke-width="0.9" stroke-linecap="round" opacity="0.7">
        <path d="M 28 58 L 20 56"/><path d="M 28 61 L 20 62"/>
        <path d="M 72 58 L 80 56"/><path d="M 72 61 L 80 62"/>
      </g>
    </svg>`;

    const cloud = `<svg viewBox="0 0 100 100" width="${size}" height="${size}">
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

    const flower = `<svg viewBox="0 0 100 100" width="${size}" height="${size}">
      <g transform="translate(50 50)">
        ${[0,72,144,216,288].map(d => `<ellipse cx="0" cy="-22" rx="11" ry="16" transform="rotate(${d})" fill="${FUR}" stroke="${STROKE}" stroke-width="1.5"/>`).join('')}
        ${[0,72,144,216,288].map(d => `<ellipse cx="0" cy="-22" rx="6" ry="10" transform="rotate(${d})" fill="${BLUSH}" opacity="0.5"/>`).join('')}
        <circle r="14" fill="#FFE5B4" stroke="${STROKE}" stroke-width="1.5"/>
        <ellipse cx="-7" cy="3" rx="3.2" ry="2" fill="${BLUSH}" opacity="0.7"/>
        <ellipse cx="7" cy="3" rx="3.2" ry="2" fill="${BLUSH}" opacity="0.7"/>
        <ellipse cx="-5" cy="-2" rx="2" ry="2.3" fill="${FACE}"/>
        <ellipse cx="5" cy="-2" rx="2" ry="2.3" fill="${FACE}"/>
        <path d="M -2.5 3 Q 0 5 2.5 3" stroke="${FACE}" stroke-width="1.6" fill="none" stroke-linecap="round"/>
      </g>
    </svg>`;

    return { bunny, cat, cloud, flower }[kind] || bunny;
  }

  // ── state ────────────────────────────────────────────────────────────────

  let currentLevel = 0;
  let overlayEl = null;
  let heartbeatInterval = null;

  // ── heartbeat ────────────────────────────────────────────────────────────

  function startHeartbeat() {
    if (heartbeatInterval) return;
    heartbeatInterval = setInterval(() => {
      if (document.visibilityState !== 'visible') return;
      chrome.runtime.sendMessage({ type: 'HEARTBEAT' }).catch(() => {});
    }, 1000);
  }

  function stopHeartbeat() {
    if (heartbeatInterval) {
      clearInterval(heartbeatInterval);
      heartbeatInterval = null;
    }
  }

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') startHeartbeat();
    else stopHeartbeat();
  });

  startHeartbeat();

  // ── message listener ─────────────────────────────────────────────────────

  chrome.runtime.onMessage.addListener((msg) => {
    if (msg.type === 'SHOW_OVERLAY') {
      showOverlay(msg.level, msg.minutes, msg.settings || {});
    }
  });

  // ── overlay rendering ─────────────────────────────────────────────────────

  function injectFont() {
    if (document.getElementById('calmcal-font')) return;
    const link = document.createElement('link');
    link.id = 'calmcal-font';
    link.rel = 'stylesheet';
    link.href = FONT_URL;
    document.head.appendChild(link);
  }

  function showOverlay(level, minutes, settings) {
    injectFont();
    removeOverlay();

    currentLevel = level;
    const p = getPalette(settings.palette);
    const mascot = settings.mascot || 'bunny';

    if (level === 1) renderLevel1(p, mascot, minutes);
    else if (level === 2) renderLevel2(p, mascot, minutes);
    else if (level === 3) renderLevel3(p, mascot, minutes);
  }

  function removeOverlay() {
    if (overlayEl) {
      overlayEl.remove();
      overlayEl = null;
    }
    // also remove any backdrop
    const bd = document.getElementById('calmcal-backdrop');
    if (bd) bd.remove();
  }

  function injectStyles(css) {
    const s = document.createElement('style');
    s.id = 'calmcal-styles';
    s.textContent = css;
    // remove old
    document.getElementById('calmcal-styles')?.remove();
    document.head.appendChild(s);
  }

  // ── LEVEL 1: corner toast ────────────────────────────────────────────────

  function renderLevel1(p, mascot, minutes) {
    injectStyles(`
      @keyframes cc-pop {
        from { transform: translateY(12px) scale(.94); opacity: 0; }
        to   { transform: translateY(0) scale(1); opacity: 1; }
      }
      #calmcal-l1 { animation: cc-pop 0.35s cubic-bezier(.2,1.4,.4,1) both; }
      #calmcal-l1 button:hover { opacity: 0.82; }
    `);

    const el = document.createElement('div');
    el.id = 'calmcal-l1';
    el.style.cssText = `
      position: fixed; right: 24px; bottom: 24px; width: 340px; z-index: 2147483647;
      background: #fff; border-radius: 22px;
      box-shadow: 0 24px 60px -12px rgba(124,41,79,.35), 0 0 0 1px rgba(244,143,177,.2);
      padding: 20px 22px 18px;
      font-family: Nunito, system-ui, sans-serif; color: ${p.ink};
    `;
    el.innerHTML = `
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px">
        <div style="width:48px;height:48px;border-radius:24px;background:${p.bg};display:flex;align-items:center;justify-content:center;flex-shrink:0">
          ${mascotSVG(mascot, 40)}
        </div>
        <div>
          <div style="font-size:13px;font-weight:700;color:${p.plum};letter-spacing:0.2px">Hey Clair Bear 🌷</div>
          <div style="font-size:11px;font-weight:600;color:#A88">${minutes} min of planning</div>
        </div>
        <div style="flex:1"></div>
        <button id="cc-l1-x" style="width:24px;height:24px;border:0;background:transparent;color:#BAA;font-size:14px;cursor:pointer;padding:0;line-height:1">✕</button>
      </div>
      <div style="font-size:15px;font-weight:600;line-height:1.45;margin-bottom:14px">
        You've been calendar-wrangling for a bit, Clair. Want a tiny breath before the next one?
      </div>
      <div style="display:flex;flex-direction:column;gap:6px">
        <button id="cc-l1-pause" style="${btnStyle(p.primary,'#fff')}width:100%;justify-content:center">
          🌷 Take a 30s pause
        </button>
        <div style="display:flex;gap:6px">
          <button id="cc-l1-snooze" style="${btnStyle(p.cream,p.plum)}flex:1;justify-content:center;font-size:13px">
            Remind in 5 min
          </button>
          <button id="cc-l1-keep" style="${btnStyle('transparent',p.plum)}flex:1;justify-content:center;font-size:13px">
            Keep planning
          </button>
        </div>
      </div>
    `;
    document.body.appendChild(el);
    overlayEl = el;

    el.querySelector('#cc-l1-x').onclick = () => dismiss();
    el.querySelector('#cc-l1-keep').onclick = () => dismiss();
    el.querySelector('#cc-l1-snooze').onclick = () => snooze(5);
    el.querySelector('#cc-l1-pause').onclick = () => openCalm(30);
  }

  // ── LEVEL 2: dimmed backdrop + centred modal ──────────────────────────────

  function renderLevel2(p, mascot, minutes) {
    injectStyles(`
      @keyframes cc-fade { from { opacity:0 } to { opacity:1 } }
      @keyframes cc-pop2 {
        from { transform: translateY(16px) scale(.95); opacity:0 }
        to   { transform: translateY(0) scale(1); opacity:1 }
      }
      #calmcal-backdrop { animation: cc-fade .3s ease both }
      #calmcal-l2 { animation: cc-pop2 .35s cubic-bezier(.2,1.4,.4,1) .05s both }
      #calmcal-l2 button:hover { opacity:0.82 }
    `);

    const bd = document.createElement('div');
    bd.id = 'calmcal-backdrop';
    bd.style.cssText = `
      position:fixed;inset:0;z-index:2147483646;
      background:linear-gradient(180deg,rgba(255,241,245,.72),rgba(255,182,201,.5));
      backdrop-filter:blur(5px);
    `;
    document.body.appendChild(bd);

    const el = document.createElement('div');
    el.id = 'calmcal-l2';
    el.style.cssText = `
      position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);
      z-index:2147483647;width:440px;
      background:#fff;border-radius:28px;
      box-shadow:0 30px 80px -20px rgba(124,41,79,.4),0 0 0 1px rgba(244,143,177,.15);
      padding:36px 36px 32px;
      font-family:Nunito,system-ui,sans-serif;color:${p.ink};text-align:center;
    `;
    el.innerHTML = `
      <div style="margin-bottom:14px;display:flex;justify-content:center">
        <div style="width:110px;height:110px;border-radius:55px;background:${p.bg};display:flex;align-items:center;justify-content:center">
          ${mascotSVG(mascot, 96)}
        </div>
      </div>
      <div style="font-size:12px;font-weight:800;color:${p.plum};letter-spacing:1.5px;text-transform:uppercase;margin-bottom:8px">
        CalmCal · ${minutes} min
      </div>
      <div style="font-size:24px;font-weight:800;line-height:1.2;margin-bottom:10px;letter-spacing:-0.4px">
        Clair, this might be getting heavy.
      </div>
      <div style="font-size:15px;line-height:1.5;color:#6B4A55;margin-bottom:22px">
        The calendar will still be here in 5&nbsp;minutes.<br>Want to step away for a bit?
      </div>
      <div style="display:flex;flex-direction:column;gap:8px">
        <button id="cc-l2-away" style="${btnStyle(p.primary,'#fff')}width:100%;justify-content:center;height:48px;font-size:15px">
          Take 5 minutes away
        </button>
        <div style="display:flex;gap:8px">
          <button id="cc-l2-snooze" style="${btnStyle(p.cream,p.plum)}flex:1;justify-content:center">
            5 more min
          </button>
          <button id="cc-l2-pause" style="${btnStyle('#fff',p.plum,'1.5px solid '+p.soft)}flex:1;justify-content:center">
            Pause for today
          </button>
        </div>
      </div>
      <div style="margin-top:18px;font-size:12px;color:#B89AA3">
        You set this · <span id="cc-l2-settings" style="cursor:pointer;text-decoration:underline">settings</span> · <span id="cc-l2-dismiss" style="cursor:pointer">not now</span>
      </div>
    `;
    document.body.appendChild(el);
    overlayEl = el;

    el.querySelector('#cc-l2-away').onclick = () => openCalm(300);
    el.querySelector('#cc-l2-snooze').onclick = () => snooze(5);
    el.querySelector('#cc-l2-pause').onclick = () => pauseToday();
    el.querySelector('#cc-l2-dismiss').onclick = () => dismiss();
    el.querySelector('#cc-l2-settings').onclick = () => chrome.runtime.sendMessage({ type: 'OPEN_POPUP' });
  }

  // ── LEVEL 3: strict mode ──────────────────────────────────────────────────

  function renderLevel3(p, mascot, minutes) {
    injectStyles(`
      @keyframes cc-fade { from{opacity:0}to{opacity:1} }
      @keyframes cc-pop3 { from{transform:translate(-50%,-50%) scale(.93);opacity:0} to{transform:translate(-50%,-50%) scale(1);opacity:1} }
      #calmcal-backdrop { animation: cc-fade .3s ease both }
      #calmcal-l3 { animation: cc-pop3 .35s cubic-bezier(.2,1.4,.4,1) both }
      #calmcal-l3 button:hover { opacity:0.82 }
      @keyframes cc-countdown { from{stroke-dashoffset:0} to{stroke-dashoffset:${2*Math.PI*62}} }
    `);

    const bd = document.createElement('div');
    bd.id = 'calmcal-backdrop';
    bd.style.cssText = `
      position:fixed;inset:0;z-index:2147483646;
      background:linear-gradient(180deg,rgba(255,182,201,.6),rgba(255,241,245,.8));
      backdrop-filter:blur(8px);
    `;
    document.body.appendChild(bd);

    let secs = 8;

    const el = document.createElement('div');
    el.id = 'calmcal-l3';
    el.style.cssText = `
      position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);
      z-index:2147483647;width:460px;
      background:#fff;border-radius:28px;
      box-shadow:0 30px 80px -20px rgba(124,41,79,.4),0 0 0 1px rgba(244,143,177,.15);
      padding:40px 36px 28px;
      font-family:Nunito,system-ui,sans-serif;color:${p.ink};text-align:center;
    `;
    el.innerHTML = `
      <div style="position:relative;display:flex;justify-content:center;margin-bottom:18px">
        <svg width="140" height="140" viewBox="0 0 140 140">
          <circle cx="70" cy="70" r="62" fill="none" stroke="${p.cream}" stroke-width="6"/>
          <circle id="cc-ring" cx="70" cy="70" r="62" fill="none" stroke="${p.primary}" stroke-width="6"
            stroke-linecap="round"
            stroke-dasharray="${2*Math.PI*62}"
            stroke-dashoffset="0"
            transform="rotate(-90 70 70)"
            style="transition:stroke-dashoffset 1s linear"/>
        </svg>
        <div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center">
          ${mascotSVG(mascot, 70)}
          <div id="cc-l3-count" style="font-size:11px;font-weight:800;color:${p.plum};margin-top:-4px;letter-spacing:0.5px">0:08</div>
        </div>
      </div>
      <div style="font-size:12px;font-weight:800;color:${p.plum};letter-spacing:1.5px;text-transform:uppercase;margin-bottom:8px">
        Strict mode · ${minutes} min
      </div>
      <div style="font-size:23px;font-weight:800;line-height:1.2;margin-bottom:10px;letter-spacing:-0.4px">
        Tucking Calendar in for you, Clair.
      </div>
      <div style="font-size:14px;line-height:1.5;color:#6B4A55;margin-bottom:22px">
        Past Clair Bear was looking after present Clair Bear.<br>Closing in <span id="cc-l3-s">${secs}</span>&nbsp;seconds.
      </div>
      <div style="display:flex;gap:8px">
        <button id="cc-l3-now" style="${btnStyle(p.primary,'#fff')}flex:1;justify-content:center">
          Close now
        </button>
        <button id="cc-l3-last" style="${btnStyle('#fff',p.plum,'1.5px solid '+p.soft)}flex:1;justify-content:center">
          One last thing
        </button>
      </div>
      <div style="margin-top:14px;font-size:12px;color:#B89AA3">Cooldown · 15 min</div>
    `;
    document.body.appendChild(el);
    overlayEl = el;

    const ring = el.querySelector('#cc-ring');
    const circumference = 2 * Math.PI * 62;

    const tick = setInterval(() => {
      secs--;
      const countEl = el.querySelector('#cc-l3-s');
      const countEl2 = el.querySelector('#cc-l3-count');
      if (countEl) countEl.textContent = secs;
      if (countEl2) countEl2.textContent = `0:0${Math.max(0,secs)}`;
      if (ring) ring.style.strokeDashoffset = circumference * (1 - secs / 8);
      if (secs <= 0) {
        clearInterval(tick);
        closeTab();
      }
    }, 1000);

    el.querySelector('#cc-l3-now').onclick = () => { clearInterval(tick); closeTab(); };
    el.querySelector('#cc-l3-last').onclick = () => { clearInterval(tick); snooze(5); };
  }

  // ── actions ───────────────────────────────────────────────────────────────

  function dismiss() {
    removeOverlay();
    chrome.runtime.sendMessage({ type: 'DISMISS' }).catch(() => {});
  }

  function snooze(minutes) {
    removeOverlay();
    chrome.runtime.sendMessage({ type: 'SNOOZE', minutes }).catch(() => {});
  }

  function pauseToday() {
    removeOverlay();
    chrome.runtime.sendMessage({ type: 'PAUSE_TODAY' }).catch(() => {});
    showToast('Paused for today, Clair. Go enjoy yourself 🌷');
  }

  function openCalm(seconds) {
    removeOverlay();
    chrome.runtime.sendMessage({ type: 'CLOSE_TAB' }).catch(() => {});
    // The service worker will redirect this tab to calm.html
  }

  function closeTab() {
    chrome.runtime.sendMessage({ type: 'CLOSE_TAB' }).catch(() => {});
  }

  function showToast(text) {
    const t = document.createElement('div');
    t.style.cssText = `
      position:fixed;bottom:24px;left:50%;transform:translateX(-50%);
      background:#fff;border-radius:999px;padding:12px 22px;
      font-family:Nunito,system-ui,sans-serif;font-size:14px;font-weight:600;
      color:#3D2B30;box-shadow:0 8px 30px rgba(124,41,79,.2);
      z-index:2147483647;white-space:nowrap;
    `;
    t.textContent = text;
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 3000);
  }

  // ── style helpers ─────────────────────────────────────────────────────────

  function btnStyle(bg, fg, border = 'transparent') {
    return `
      height:44px;padding:0 18px;border:1.5px solid ${border};
      border-radius:22px;background:${bg};color:${fg};
      font-family:Nunito,system-ui,sans-serif;font-size:14px;font-weight:700;
      cursor:pointer;display:inline-flex;align-items:center;gap:6px;
      transition:opacity .15s;
    `;
  }

})();
