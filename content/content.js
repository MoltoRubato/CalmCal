// CalmCal content script — runs on calendar.google.com
// One job: send heartbeats and render the single 5-minute check-in nudge.
// The hard 15-min limit is enforced entirely by the service worker
// (redirects + lockUntil), so a refresh cannot escape it.

(function () {
  'use strict';

  const FONT_URL = 'https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800;900&display=swap';

  // Soft pink palette (mascot/palette pickers removed).
  const P = { bg: '#FFF1F5', primary: '#F48FB1', soft: '#FFB6C9', cream: '#FCE4EC', ink: '#3D2B30', plum: '#9D4A6B' };
  const FUR = '#FFF8FB', BLUSH = '#FFB6C9', STROKE = '#E89BB5', FACE = '#3D2B30';

  function bunnySVG(size = 40) {
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

  // ── state ────────────────────────────────────────────────────────────────

  let overlayEl = null;
  let heartbeatInterval = null;
  let escHandler = null;

  // ── heartbeat ────────────────────────────────────────────────────────────

  function startHeartbeat() {
    if (heartbeatInterval) return;
    heartbeatInterval = setInterval(() => {
      if (document.visibilityState !== 'visible') return;
      if (!document.hasFocus()) return;
      chrome.runtime.sendMessage({ type: 'HEARTBEAT' })
        .then((res) => {
          // If SW says we're locked, leave for calm.html immediately.
          if (res && res.locked) {
            window.location.replace(chrome.runtime.getURL('pages/calm.html'));
          }
        })
        .catch(() => {});
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

  // Belt-and-braces: on script load, ask SW for state. If locked, bounce.
  chrome.runtime.sendMessage({ type: 'GET_STATE' }).then((state) => {
    if (state && state.lockUntil && Date.now() < state.lockUntil && state.settings?.enabled) {
      window.location.replace(chrome.runtime.getURL('pages/calm.html'));
    }
  }).catch(() => {});

  startHeartbeat();

  // ── message listener ─────────────────────────────────────────────────────

  chrome.runtime.onMessage.addListener((msg) => {
    if (msg.type === 'SHOW_NUDGE') showNudge(msg.minutes);
  });

  // ── nudge overlay (corner toast) ─────────────────────────────────────────

  function injectFont() {
    if (document.getElementById('calmcal-font')) return;
    const link = document.createElement('link');
    link.id = 'calmcal-font';
    link.rel = 'stylesheet';
    link.href = FONT_URL;
    document.head.appendChild(link);
  }

  function injectStyles() {
    if (document.getElementById('calmcal-styles')) return;
    const s = document.createElement('style');
    s.id = 'calmcal-styles';
    s.textContent = `
      @keyframes cc-pop {
        from { transform: translateY(12px) scale(.94); opacity: 0; }
        to   { transform: translateY(0) scale(1); opacity: 1; }
      }
      #calmcal-nudge { animation: cc-pop 0.35s cubic-bezier(.2,1.4,.4,1) both; }
      #calmcal-nudge button:hover { opacity: 0.82; }
    `;
    document.head.appendChild(s);
  }

  function removeOverlay() {
    if (escHandler) {
      document.removeEventListener('keydown', escHandler);
      escHandler = null;
    }
    if (overlayEl) {
      overlayEl.remove();
      overlayEl = null;
    }
  }

  function showNudge(minutes) {
    injectFont();
    injectStyles();
    removeOverlay();

    const el = document.createElement('div');
    el.id = 'calmcal-nudge';
    el.style.cssText = `
      position: fixed; right: 24px; bottom: 24px; width: 340px; z-index: 2147483647;
      background: #fff; border-radius: 22px;
      box-shadow: 0 24px 60px -12px rgba(124,41,79,.35), 0 0 0 1px rgba(244,143,177,.2);
      padding: 20px 22px 18px;
      font-family: Nunito, system-ui, sans-serif; color: ${P.ink};
    `;
    el.innerHTML = `
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px">
        <div style="width:48px;height:48px;border-radius:24px;background:${P.bg};display:flex;align-items:center;justify-content:center;flex-shrink:0">
          ${bunnySVG(40)}
        </div>
        <div>
          <div style="font-size:13px;font-weight:700;color:${P.plum};letter-spacing:0.2px">Hey Clair Bear 🌷</div>
          <div style="font-size:11px;font-weight:600;color:#A88">${minutes} min of planning · 10 min left</div>
        </div>
        <div style="flex:1"></div>
        <button id="cc-x" aria-label="Dismiss" style="width:24px;height:24px;border:0;background:transparent;color:#BAA;font-size:14px;cursor:pointer;padding:0;line-height:1">✕</button>
      </div>
      <div style="font-size:15px;font-weight:600;line-height:1.45;margin-bottom:14px">
        Just checking in, Clair — Calendar will tuck in at 15 min. Want a tiny breath first?
      </div>
      <div style="display:flex;gap:6px">
        <button id="cc-snooze" style="${btnStyle(P.cream, P.plum)}flex:1;justify-content:center;font-size:13px">
          Remind in 5 min
        </button>
        <button id="cc-keep" style="${btnStyle(P.primary, '#fff')}flex:1;justify-content:center;font-size:13px">
          Keep planning
        </button>
      </div>
    `;
    document.body.appendChild(el);
    overlayEl = el;

    el.querySelector('#cc-x').onclick = () => dismiss();
    el.querySelector('#cc-keep').onclick = () => dismiss();
    el.querySelector('#cc-snooze').onclick = () => snooze();

    escHandler = (e) => { if (e.key === 'Escape') dismiss(); };
    document.addEventListener('keydown', escHandler);
  }

  function dismiss() {
    removeOverlay();
    chrome.runtime.sendMessage({ type: 'DISMISS_NUDGE' }).catch(() => {});
  }

  function snooze() {
    removeOverlay();
    chrome.runtime.sendMessage({ type: 'SNOOZE_NUDGE' }).catch(() => {});
  }

  function btnStyle(bg, fg) {
    return `
      height: 38px; padding: 0 16px; border: 0; border-radius: 19px;
      background: ${bg}; color: ${fg};
      font-family: Nunito, system-ui, sans-serif; font-weight: 700;
      cursor: pointer; display: inline-flex; align-items: center; gap: 6px;
      transition: opacity .15s;
    `;
  }

})();
