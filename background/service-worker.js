// CalmCal background service worker — MV3
// All state lives in chrome.storage.local (service workers can be killed at any time).

const CALENDAR_MATCH = /^https:\/\/calendar\.google\.com\//;

// Fixed timings. No user options.
const NUDGE_AT_SECONDS = 5 * 60;     // gentle check-in
const LIMIT_SECONDS    = 15 * 60;    // hard daily limit

const DEFAULTS = {
  settings: {
    enabled: true,
  },
  activeSeconds: 0,
  lastHeartbeat: 0,
  lastHeartbeatTab: 0,
  lastDate: '',
  snoozeUntil: 0,
  lockUntil: 0,
  nudgedToday: false,
  onboardingDone: false,
};

// ── install / startup ────────────────────────────────────────────────────────

chrome.runtime.onInstalled.addListener(async ({ reason }) => {
  const data = await chrome.storage.local.get(null);
  // Fill missing defaults; never clobber existing state on update.
  const patch = {};
  for (const [k, v] of Object.entries(DEFAULTS)) {
    if (data[k] === undefined) patch[k] = v;
  }
  if (data.settings) patch.settings = { ...DEFAULTS.settings, ...data.settings };
  if (Object.keys(patch).length) await chrome.storage.local.set(patch);

  if (reason === 'install') {
    chrome.tabs.create({ url: chrome.runtime.getURL('pages/onboarding.html') });
  }
  scheduleAlarms();
});

chrome.runtime.onStartup.addListener(scheduleAlarms);

function scheduleAlarms() {
  chrome.alarms.create('daily-reset', { periodInMinutes: 5 });
}

chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === 'daily-reset') await maybeResetDay();
});

async function maybeResetDay() {
  const today = dateStr();
  const { lastDate } = await chrome.storage.local.get('lastDate');
  if (lastDate !== today) {
    await chrome.storage.local.set({
      lastDate: today,
      activeSeconds: 0,
      snoozeUntil: 0,
      lockUntil: 0,
      nudgedToday: false,
    });
  }
}

// ── lockout enforcement ──────────────────────────────────────────────────────
// Any navigation to calendar.google.com while locked is redirected to the
// calm page. This is what makes refresh / new-tab bypass impossible.

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  const url = changeInfo.url || tab.url;
  if (!url || !CALENDAR_MATCH.test(url)) return;
  const { lockUntil, settings } = await chrome.storage.local.get(['lockUntil', 'settings']);
  if (!settings?.enabled) return;
  if (lockUntil && Date.now() < lockUntil) {
    chrome.tabs.update(tabId, { url: chrome.runtime.getURL('pages/calm.html') });
  }
});

// ── message handler ──────────────────────────────────────────────────────────

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  handleMessage(msg, sender).then(sendResponse).catch((e) => {
    console.error('[CalmCal SW]', e);
    sendResponse({ ok: false });
  });
  return true;
});

async function handleMessage(msg, sender) {
  switch (msg.type) {
    case 'HEARTBEAT':
      return onHeartbeat(sender.tab);

    case 'GET_STATE':
      return chrome.storage.local.get(null);

    case 'SET_ENABLED': {
      const current = (await chrome.storage.local.get('settings')).settings || {};
      await chrome.storage.local.set({ settings: { ...current, enabled: !!msg.enabled } });
      return { ok: true };
    }

    case 'DISMISS_NUDGE':
      // Nudge already fires once per day — nothing else to do, but mark it
      // dismissed for clarity.
      await chrome.storage.local.set({ nudgedToday: true });
      return { ok: true };

    case 'SNOOZE_NUDGE':
      // 5-min silence. The hard 15-min lockout still applies.
      await chrome.storage.local.set({
        snoozeUntil: Date.now() + 5 * 60_000,
        nudgedToday: true,
      });
      return { ok: true };

    case 'FINISH_ONBOARDING':
      await chrome.storage.local.set({ onboardingDone: true });
      return { ok: true };

    default:
      return { ok: false, error: 'unknown message type' };
  }
}

// ── heartbeat logic ──────────────────────────────────────────────────────────

async function onHeartbeat(tab) {
  const now = Date.now();
  const tabId = tab?.id || 0;

  // Reset BEFORE reading state — otherwise yesterday's activeSeconds/lockUntil
  // would survive the day rollover and immediately re-lock the user.
  await maybeResetDay();
  const state = await chrome.storage.local.get(null);

  if (!state.settings?.enabled) return { disabled: true };

  // Hard lockout — defence in depth alongside tabs.onUpdated.
  if (state.lockUntil && now < state.lockUntil) {
    if (tabId) {
      chrome.tabs.update(tabId, { url: chrome.runtime.getURL('pages/calm.html') })
        .catch(() => {});
    }
    return { locked: true, lockUntil: state.lockUntil };
  }

  // Tab dedup — only one tab counts seconds. Ownership transfers if the
  // current owner has gone silent for >3s.
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

  // Hard limit hit — lock everything for the rest of the day.
  if (activeSeconds >= LIMIT_SECONDS) {
    const lockUntil = endOfDay();
    await chrome.storage.local.set({ lockUntil });
    const tabs = await chrome.tabs.query({ url: 'https://calendar.google.com/*' });
    for (const t of tabs) {
      chrome.tabs.update(t.id, { url: chrome.runtime.getURL('pages/calm.html') });
    }
    return { locked: true, lockUntil };
  }

  // Soft snooze (after dismissing a nudge with "remind me later")
  if (state.snoozeUntil && now < state.snoozeUntil) {
    return { snoozed: true, activeSeconds };
  }

  // 5-min check-in nudge. Fires at most once per day.
  if (activeSeconds >= NUDGE_AT_SECONDS && !state.nudgedToday) {
    await chrome.storage.local.set({ nudgedToday: true });
    if (tabId) {
      chrome.tabs.sendMessage(tabId, {
        type: 'SHOW_NUDGE',
        minutes: Math.round(activeSeconds / 60),
      }).catch(() => {});
    }
    return { ok: true, nudged: true };
  }

  return { ok: true, activeSeconds };
}

// ── helpers ──────────────────────────────────────────────────────────────────

function dateStr() {
  // Local-time date key — matches endOfDay() so the reset lines up with the
  // user's actual midnight, not UTC midnight.
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function endOfDay() {
  const d = new Date();
  d.setHours(23, 59, 59, 999);
  return d.getTime();
}
