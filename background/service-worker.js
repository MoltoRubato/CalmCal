// CalmCal background service worker -  MV3
// All state lives in chrome.storage.local (service workers can be killed at any time).

const CALENDAR_MATCH = /^https:\/\/calendar\.google\.com\//;

const DEFAULTS = {
  settings: {
    nudgeAfter: 10,   // minutes → L1 threshold
    strictMode: false,
    dailyLimit: 25,   // minutes (0 = off)
    cooldown: 10,     // minutes lockout after strict close
    mascot: 'bunny',
    palette: 'blush',
  },
  activeSeconds: 0,
  lastHeartbeat: 0,
  lastHeartbeatTab: 0,   // only one tab counts at a time
  lastDate: '',
  snoozeUntil: 0,
  pausedUntil: 0,
  lockUntil: 0,          // hard lock — redirect calendar tabs to calm.html
  cooldownUntil: 0,      // soft — no nudges during this window
  overlayLevel: 0,
  dismissedLevel: 0,     // last level user actively dismissed (anti-nag)
  onboardingDone: false,
};

// ── install / startup ────────────────────────────────────────────────────────

chrome.runtime.onInstalled.addListener(async ({ reason }) => {
  const data = await chrome.storage.local.get(null);
  // Fill in any missing defaults (without clobbering existing state on update)
  const patch = {};
  for (const [k, v] of Object.entries(DEFAULTS)) {
    if (data[k] === undefined) patch[k] = v;
  }
  if (data.settings) {
    patch.settings = { ...DEFAULTS.settings, ...data.settings };
  }
  if (Object.keys(patch).length) await chrome.storage.local.set(patch);

  if (reason === 'install') {
    chrome.tabs.create({ url: chrome.runtime.getURL('pages/onboarding.html') });
  }
  scheduleAlarms();
});

chrome.runtime.onStartup.addListener(() => {
  scheduleAlarms();
});

function scheduleAlarms() {
  chrome.alarms.create('heartbeat-check', { periodInMinutes: 0.5 });
  chrome.alarms.create('daily-reset', { periodInMinutes: 5 });
}

// ── lockout enforcement ──────────────────────────────────────────────────────
// Any time a tab navigates to calendar.google.com while a hard lock is active,
// redirect it straight to the calm page. Belt + suspenders for the content
// script check, and the only way to enforce strict mode against close/reopen.

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  const url = changeInfo.url || tab.url;
  if (!url || !CALENDAR_MATCH.test(url)) return;
  const { lockUntil } = await chrome.storage.local.get('lockUntil');
  if (lockUntil && Date.now() < lockUntil) {
    chrome.tabs.update(tabId, { url: chrome.runtime.getURL('pages/calm.html') });
  }
});

// ── alarm handler ────────────────────────────────────────────────────────────

chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === 'daily-reset') {
    await maybeResetDay();
  }
  if (alarm.name === 'heartbeat-check') {
    await checkStaleHeartbeat();
  }
});

async function maybeResetDay() {
  const today = dateStr();
  const { lastDate } = await chrome.storage.local.get('lastDate');
  if (lastDate !== today) {
    await chrome.storage.local.set({
      lastDate: today,
      activeSeconds: 0,
      snoozeUntil: 0,
      pausedUntil: 0,
      cooldownUntil: 0,
      lockUntil: 0,
      overlayLevel: 0,
      dismissedLevel: 0,
    });
  }
}

async function checkStaleHeartbeat() {
  // If heartbeat stopped (tab closed/hidden) stop counting
  const { lastHeartbeat } = await chrome.storage.local.get('lastHeartbeat');
  const stale = Date.now() - lastHeartbeat > 5000;
  if (stale) {
    await chrome.storage.local.set({ lastHeartbeat: 0 });
  }
}

// ── message handler ──────────────────────────────────────────────────────────

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  handleMessage(msg, sender).then(sendResponse).catch((e) => {
    console.error('[CalmCal SW]', e);
    sendResponse({ ok: false });
  });
  return true; // keep channel open for async
});

async function handleMessage(msg, sender) {
  switch (msg.type) {
    case 'HEARTBEAT':
      return onHeartbeat(sender.tab);

    case 'SNOOZE':
      await chrome.storage.local.set({
        snoozeUntil: Date.now() + (msg.minutes || 5) * 60_000,
        overlayLevel: 0,
      });
      return { ok: true };

    case 'PAUSE_TODAY':
      await chrome.storage.local.set({
        pausedUntil: endOfDay(),
        overlayLevel: 0,
      });
      return { ok: true };

    case 'DISMISS': {
      // Anti-nag: after a manual dismiss, give a short silence so the same
      // overlay doesn't re-render on the next 1-second heartbeat.
      const level = msg.level || 0;
      await chrome.storage.local.set({
        overlayLevel: 0,
        dismissedLevel: level,
        // 3-minute soft snooze prevents immediate re-fire of the same level.
        snoozeUntil: Date.now() + 3 * 60_000,
      });
      return { ok: true };
    }

    case 'CLOSE_TAB': {
      // Voluntary pause from L1/L2 — redirect this tab, soft cooldown only.
      const { settings } = await chrome.storage.local.get('settings');
      await chrome.storage.local.set({
        cooldownUntil: Date.now() + (settings?.cooldown || 10) * 60_000,
        overlayLevel: 0,
      });
      if (sender.tab?.id) {
        chrome.tabs.update(sender.tab.id, {
          url: chrome.runtime.getURL('pages/calm.html'),
        });
      }
      return { ok: true };
    }

    case 'STRICT_CLOSE': {
      // Hard lockout — every calendar tab gets redirected until lockUntil.
      // activeSeconds resets so the user gets a genuine fresh start after.
      const { settings } = await chrome.storage.local.get('settings');
      const until = Date.now() + (settings?.cooldown || 10) * 60_000;
      await chrome.storage.local.set({
        lockUntil: until,
        cooldownUntil: until,
        overlayLevel: 0,
        activeSeconds: 0,
        dismissedLevel: 0,
      });
      // Sweep every open calendar tab into the calm page.
      const tabs = await chrome.tabs.query({ url: 'https://calendar.google.com/*' });
      for (const t of tabs) {
        chrome.tabs.update(t.id, { url: chrome.runtime.getURL('pages/calm.html') });
      }
      return { ok: true };
    }

    case 'GET_STATE': {
      const state = await chrome.storage.local.get(null);
      return state;
    }

    case 'SAVE_SETTINGS': {
      const current = (await chrome.storage.local.get('settings')).settings || {};
      const merged = { ...DEFAULTS.settings, ...current, ...msg.settings };
      await chrome.storage.local.set({ settings: merged });
      return { ok: true };
    }

    case 'RESET_DAY': {
      // Used by calm.html when lockout finishes — clear counters so user
      // returns to calendar with a clean slate.
      await chrome.storage.local.set({
        activeSeconds: 0,
        snoozeUntil: 0,
        overlayLevel: 0,
        dismissedLevel: 0,
      });
      return { ok: true };
    }

    default:
      return { ok: false, error: 'unknown message type' };
  }
}

// ── heartbeat logic ──────────────────────────────────────────────────────────

async function onHeartbeat(tab) {
  const now = Date.now();
  const state = await chrome.storage.local.get(null);
  const tabId = tab?.id || 0;

  // Daily reset guard
  await maybeResetDay();

  // Hard lockout — content script should never be alive on calendar during a
  // lock (the tabs listener redirects), but defend in depth.
  if (state.lockUntil && now < state.lockUntil) {
    if (tabId) {
      chrome.tabs.update(tabId, { url: chrome.runtime.getURL('pages/calm.html') })
        .catch(() => {});
    }
    return { locked: true, lockUntil: state.lockUntil };
  }

  // Paused for today?
  if (state.pausedUntil && now < state.pausedUntil) return { paused: true };

  // Soft cooldown — no nudges, but still count time so a returning user
  // doesn't get an instant L2/L3 the moment the window ends.
  const inCooldown = state.cooldownUntil && now < state.cooldownUntil;

  // Snoozed?
  const snoozed = state.snoozeUntil && now < state.snoozeUntil;

  // De-duplicate heartbeats across multiple calendar tabs: only the tab that
  // owns `lastHeartbeatTab` counts. Switch ownership if the prior owner has
  // been silent for >3s (closed/hidden), so the active tab takes over.
  const lastHB = state.lastHeartbeat || 0;
  const ownerStale = !lastHB || now - lastHB > 3000;
  const isOwner = state.lastHeartbeatTab === tabId || ownerStale;

  let activeSeconds = state.activeSeconds || 0;
  if (isOwner && lastHB > 0 && now - lastHB < 3000) {
    activeSeconds += 1;
  }

  await chrome.storage.local.set({
    lastHeartbeat: now,
    lastHeartbeatTab: isOwner ? tabId : state.lastHeartbeatTab,
    activeSeconds,
  });

  if (inCooldown) return { cooldown: true, activeSeconds };
  if (snoozed) return { snoozed: true, activeSeconds };

  // Compute thresholds (in seconds)
  const settings = state.settings || DEFAULTS.settings;
  const nudge = settings.nudgeAfter * 60;
  const l2 = Math.round(nudge * 1.6);
  const l3 = nudge * 3;

  let targetLevel = 0;
  if (settings.strictMode && activeSeconds >= l3) targetLevel = 3;
  else if (activeSeconds >= l2) targetLevel = 2;
  else if (activeSeconds >= nudge) targetLevel = 1;

  // Daily limit check — promote to L2 (or L3 in strict mode)
  if (settings.dailyLimit > 0 && activeSeconds >= settings.dailyLimit * 60) {
    targetLevel = Math.max(targetLevel, settings.strictMode ? 3 : 2);
  }

  const currentLevel = state.overlayLevel || 0;
  const dismissedLevel = state.dismissedLevel || 0;

  // Don't re-fire the same level the user just dismissed. Allow escalation
  // to a strictly higher level even after a dismiss.
  if (targetLevel > 0 && targetLevel <= dismissedLevel) {
    return { ok: true, activeSeconds, level: currentLevel, suppressed: true };
  }

  // Only escalate, never de-escalate within a session
  if (targetLevel > currentLevel) {
    await chrome.storage.local.set({ overlayLevel: targetLevel });
    if (tabId) {
      chrome.tabs.sendMessage(tabId, {
        type: 'SHOW_OVERLAY',
        level: targetLevel,
        minutes: Math.round(activeSeconds / 60),
        settings,
      }).catch(() => {});
    }
    return { ok: true, level: targetLevel };
  }

  return { ok: true, activeSeconds, level: currentLevel };
}

// ── helpers ──────────────────────────────────────────────────────────────────

function dateStr() {
  return new Date().toISOString().slice(0, 10);
}

function endOfDay() {
  const d = new Date();
  d.setHours(23, 59, 59, 999);
  return d.getTime();
}
