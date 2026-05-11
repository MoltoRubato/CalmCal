// CalmCal background service worker — MV3
// All state lives in chrome.storage.local (service workers can be killed at any time).

const DEFAULTS = {
  settings: {
    nudgeAfter: 10,   // minutes → L1 threshold
    strictMode: false,
    dailyLimit: 25,   // minutes (0 = off)
    cooldown: 10,     // minutes after closing tab
    mascot: 'bunny',
    palette: 'blush',
  },
  activeSeconds: 0,
  lastHeartbeat: 0,
  lastDate: '',
  snoozeUntil: 0,
  pausedUntil: 0,
  cooldownUntil: 0,
  overlayLevel: 0,
  onboardingDone: false,
};

// ── install / startup ────────────────────────────────────────────────────────

chrome.runtime.onInstalled.addListener(async ({ reason }) => {
  const data = await chrome.storage.local.get(null);
  if (!data.settings) {
    await chrome.storage.local.set(DEFAULTS);
  }
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
  chrome.alarms.create('daily-reset', { periodInMinutes: 1 });
}

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
      overlayLevel: 0,
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

    case 'DISMISS':
      await chrome.storage.local.set({ overlayLevel: 0 });
      return { ok: true };

    case 'CLOSE_TAB': {
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

    case 'GET_STATE': {
      const state = await chrome.storage.local.get(null);
      return state;
    }

    case 'SAVE_SETTINGS': {
      await chrome.storage.local.set({ settings: msg.settings });
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

  // Daily reset guard
  await maybeResetDay();

  // Paused for today?
  if (state.pausedUntil && now < state.pausedUntil) return { paused: true };

  // In cooldown?
  if (state.cooldownUntil && now < state.cooldownUntil) return { cooldown: true };

  // Snoozed?
  const snoozed = state.snoozeUntil && now < state.snoozeUntil;

  // Increment active seconds (only if last heartbeat was recent)
  let activeSeconds = state.activeSeconds || 0;
  const lastHB = state.lastHeartbeat || 0;
  if (lastHB > 0 && now - lastHB < 3000) {
    activeSeconds += 1;
  }
  await chrome.storage.local.set({ lastHeartbeat: now, activeSeconds });

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

  // Daily limit check
  if (settings.dailyLimit > 0 && activeSeconds >= settings.dailyLimit * 60) {
    targetLevel = Math.max(targetLevel, 2);
  }

  const currentLevel = state.overlayLevel || 0;

  // Only escalate, never de-escalate within a session
  if (targetLevel > currentLevel) {
    await chrome.storage.local.set({ overlayLevel: targetLevel });
    // Tell the content script to show the new level
    if (tab?.id) {
      chrome.tabs.sendMessage(tab.id, {
        type: 'SHOW_OVERLAY',
        level: targetLevel,
        minutes: Math.round(activeSeconds / 60),
        settings,
      }).catch(() => {}); // tab may have no content script yet
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
