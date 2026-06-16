// Local-only persistence (PRD §6 — no auth/cloud for now). Keys use the
// prototype's "dh:" prefix.
const KEYS = {
  free: "dh:free",
  saved: "dh:saved",
  hist: "dh:hist", // { "YYYY-MM-DD": [cardObjects] }
  opens: "dh:opens", // ["YYYY-MM-DD", ...]
  daily: "dh:daily",
  settings: "dh:settings",
};

export const FREE_LIMIT = 3;
export const WASHES = ["wash", "wash-1", "wash-2", "wash-3"];

function read(k, f) {
  try {
    const r = localStorage.getItem(k);
    return r ? JSON.parse(r) : f;
  } catch {
    return f;
  }
}
function write(k, v) {
  try {
    localStorage.setItem(k, JSON.stringify(v));
  } catch {
    /* ignore quota */
  }
}

export function hash(s) {
  let h = 0;
  const str = String(s);
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) | 0;
  return Math.abs(h);
}
export function washClass(seed) {
  return WASHES[hash(seed) % WASHES.length];
}

export function todayKey(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
export function uid() {
  return Math.random().toString(36).slice(2, 9);
}

// ---- free draws / paywall ----
export function freeUsed() {
  return read(KEYS.free, 0);
}
export function freeRemaining() {
  return Math.max(0, FREE_LIMIT - freeUsed());
}
export function consumeFree() {
  write(KEYS.free, freeUsed() + 1);
  return freeRemaining();
}

// ---- daily card cache (once per day, PRD §4.1) ----
export function getCachedDaily() {
  const d = read(KEYS.daily, null);
  return d && d.date === todayKey() ? d.card : null;
}
export function cacheDaily(card) {
  write(KEYS.daily, { date: todayKey(), card });
}

// ---- history (every card received that day, PRD §4.5) ----
export function recordCard(card) {
  if (!card || card.isCrisis) return;
  const hist = read(KEYS.hist, {});
  const k = card.date || todayKey();
  hist[k] = hist[k] || [];
  hist[k].push(card);
  write(KEYS.hist, hist);
}
export function getHistory() {
  return read(KEYS.hist, {});
}

// ---- saved ----
export function getSaved() {
  return read(KEYS.saved, []);
}
export function isSaved(id) {
  return getSaved().some((c) => c.id === id);
}
export function toggleSave(card) {
  const saved = getSaved();
  const i = saved.findIndex((c) => c.id === card.id);
  if (i >= 0) saved.splice(i, 1);
  else saved.unshift({ ...card, savedAt: Date.now() });
  write(KEYS.saved, saved);
  return getSaved();
}
export function removeSaved(id) {
  write(KEYS.saved, getSaved().filter((c) => c.id !== id));
  return getSaved();
}

// ---- opens / streak (consecutive days the app was opened, PRD §4.5) ----
export function registerOpen(now = new Date()) {
  const opens = read(KEYS.opens, []);
  const k = todayKey(now);
  if (!opens.includes(k)) {
    opens.push(k);
    write(KEYS.opens, opens);
  }
  return computeStreak(now);
}
export function getOpens() {
  return read(KEYS.opens, []);
}
export function computeStreak(now = new Date()) {
  const opens = new Set(read(KEYS.opens, []));
  let streak = 0;
  const cursor = new Date(now);
  for (;;) {
    if (opens.has(todayKey(cursor))) {
      streak += 1;
      cursor.setDate(cursor.getDate() - 1);
    } else break;
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

export function clearAllData() {
  Object.values(KEYS).forEach((k) => localStorage.removeItem(k));
}

// ---- Send a Spark codec (PRD §4.6 — card travels in the URL, no backend) ----
// Optionally carries a short personal note from the sender.
export function encodeSpark(card, note = "") {
  const slim = { t: card.title, b: card.body, w: hash(card.id || card.title) % WASHES.length };
  const n = String(note || "").trim().slice(0, 240);
  if (n) slim.n = n;
  const b64 = btoa(unescape(encodeURIComponent(JSON.stringify(slim))))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
  return b64;
}
export function decodeSpark(b64) {
  try {
    const pad = String(b64).replace(/-/g, "+").replace(/_/g, "/");
    const s = JSON.parse(decodeURIComponent(escape(atob(pad))));
    if (!s || typeof s.t !== "string") return null;
    return {
      title: s.t,
      body: s.b || "",
      wash: WASHES[s.w] || "wash",
      note: typeof s.n === "string" ? s.n : "",
    };
  } catch {
    return null;
  }
}
