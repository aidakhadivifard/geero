// Local-only persistence (product doc §6: account/sync out of scope for v1).
const KEYS = {
  saved: "dawnhalo.saved",
  history: "dawnhalo.history",
  opens: "dawnhalo.opens",
  daily: "dawnhalo.daily",
  settings: "dawnhalo.settings",
};

function read(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}
function write(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore quota */
  }
}

export function todayKey(d = new Date()) {
  return d.toISOString().slice(0, 10); // YYYY-MM-DD (local-ish, fine for prototype)
}

export function uid() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

// ---- daily card cache (generated once per day) ----
export function getCachedDaily() {
  const d = read(KEYS.daily, null);
  return d && d.date === todayKey() ? d.card : null;
}
export function cacheDaily(card) {
  write(KEYS.daily, { date: todayKey(), card });
}

// ---- history: every card received that day (saved or not, §4.5) ----
export function recordHistory(card) {
  if (card.isCrisis) return; // crisis responses are never logged as cards
  const hist = read(KEYS.history, {});
  const k = todayKey();
  hist[k] = hist[k] || [];
  hist[k].push(card);
  write(KEYS.history, hist);
}
export function getHistory() {
  return read(KEYS.history, {});
}

// ---- saved cards ----
export function getSaved() {
  return read(KEYS.saved, []);
}
export function isSaved(id) {
  return getSaved().some((c) => c.id === id);
}
export function toggleSave(card) {
  const saved = getSaved();
  const idx = saved.findIndex((c) => c.id === card.id);
  if (idx >= 0) {
    saved.splice(idx, 1);
  } else {
    saved.unshift({ ...card, savedAt: Date.now() });
  }
  write(KEYS.saved, saved);
  return getSaved();
}

// ---- streak: consecutive days the app was opened (§4.5) ----
export function registerOpen() {
  const opens = read(KEYS.opens, []);
  const k = todayKey();
  if (!opens.includes(k)) {
    opens.push(k);
    write(KEYS.opens, opens);
  }
  return computeStreak();
}
export function computeStreak() {
  const opens = new Set(read(KEYS.opens, []));
  let streak = 0;
  const cursor = new Date();
  // count back from today while each day is present
  // (today not yet counted if app never opened — but registerOpen runs at mount)
  for (;;) {
    if (opens.has(todayKey(cursor))) {
      streak += 1;
      cursor.setDate(cursor.getDate() - 1);
    } else {
      break;
    }
  }
  return streak;
}

// ---- settings ----
export function getSettings() {
  return read(KEYS.settings, { reminderTime: "08:00", remindersOn: true });
}
export function saveSettings(s) {
  write(KEYS.settings, s);
  return s;
}

// ---- Send a Spark encoding (no backend/login needed for recipient, §4.6) ----
export function encodeSpark(card) {
  const slim = {
    n: card.cardName,
    m: card.message,
    c: card.context,
    t: card.theme,
  };
  const json = JSON.stringify(slim);
  // base64url of UTF-8
  const b64 = btoa(unescape(encodeURIComponent(json)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
  return b64;
}
export function decodeSpark(b64) {
  try {
    const pad = b64.replace(/-/g, "+").replace(/_/g, "/");
    const json = decodeURIComponent(escape(atob(pad)));
    const s = JSON.parse(json);
    return { cardName: s.n, message: s.m, context: s.c, theme: s.t };
  } catch {
    return null;
  }
}
