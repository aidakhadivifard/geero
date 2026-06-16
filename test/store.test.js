import { describe, it, expect, beforeEach } from "vitest";
import {
  todayKey,
  computeStreak,
  freeRemaining,
  consumeFree,
  FREE_LIMIT,
  toggleSave,
  removeSaved,
  getSaved,
  isSaved,
  recordCard,
  getHistory,
  cacheDaily,
  getCachedDaily,
  encodeSpark,
  decodeSpark,
  washClass,
  clearAllData,
} from "../src/store.js";

beforeEach(() => localStorage.clear());

describe("todayKey — local date parts", () => {
  it("formats local Y-M-D (no UTC midnight shift)", () => {
    expect(todayKey(new Date(2026, 5, 14))).toBe("2026-06-14");
    expect(todayKey(new Date(2026, 5, 14, 23, 30))).toBe("2026-06-14");
  });
});

describe("computeStreak (build order #2)", () => {
  const now = new Date(2026, 5, 14, 12);
  const k = (n) => {
    const d = new Date(now);
    d.setDate(now.getDate() - n);
    return todayKey(d);
  };
  const setOpens = (offsets) => localStorage.setItem("dh:opens", JSON.stringify(offsets.map(k)));

  it("is 0 with no opens", () => expect(computeStreak(now)).toBe(0));
  it("today only -> 1", () => { setOpens([0]); expect(computeStreak(now)).toBe(1); });
  it("today+yesterday -> 2", () => { setOpens([0, 1]); expect(computeStreak(now)).toBe(2); });
  it("stops at a gap", () => { setOpens([0, 2, 3]); expect(computeStreak(now)).toBe(1); });
  it("0 if today not opened", () => { setOpens([1, 2]); expect(computeStreak(now)).toBe(0); });
});

describe("free draws / paywall", () => {
  it("counts down from the free limit", () => {
    expect(freeRemaining()).toBe(FREE_LIMIT);
    consumeFree();
    expect(freeRemaining()).toBe(FREE_LIMIT - 1);
    consumeFree();
    consumeFree();
    expect(freeRemaining()).toBe(0);
  });
});

describe("save / retrieve (build order #4)", () => {
  const card = { id: "a1", title: "Steady ground", body: "m" };
  it("toggles save and reports state", () => {
    expect(isSaved("a1")).toBe(false);
    toggleSave(card);
    expect(isSaved("a1")).toBe(true);
    expect(getSaved()).toHaveLength(1);
    toggleSave(card);
    expect(getSaved()).toHaveLength(0);
  });
  it("removeSaved deletes by id", () => {
    toggleSave(card);
    toggleSave({ id: "b2", title: "Open door" });
    removeSaved("a1");
    expect(getSaved().map((c) => c.id)).toEqual(["b2"]);
  });
});

describe("history feeds the calendar (build order #4)", () => {
  it("records under the card's date; never records crisis", () => {
    recordCard({ id: "x", title: "Sunrise", date: todayKey() });
    expect(getHistory()[todayKey()]).toHaveLength(1);
    recordCard({ isCrisis: true, title: "pause" });
    expect(getHistory()[todayKey()]).toHaveLength(1);
  });
});

describe("daily cache (once per day)", () => {
  it("returns same-day card, ignores stale", () => {
    cacheDaily({ id: "d", title: "First light" });
    expect(getCachedDaily()).toMatchObject({ id: "d" });
    localStorage.setItem("dh:daily", JSON.stringify({ date: "2000-01-01", card: { id: "old" } }));
    expect(getCachedDaily()).toBeNull();
  });
});

describe("washClass is deterministic", () => {
  it("same seed -> same wash; known set", () => {
    expect(washClass("abc")).toBe(washClass("abc"));
    expect(["wash", "wash-1", "wash-2", "wash-3"]).toContain(washClass("anything"));
  });
});

describe("Send a Spark codec (build order #6 / §4.6)", () => {
  it("round-trips title + body + a wash class through the URL", () => {
    const card = { id: "c9", title: "The Open Door", body: "A new way is opening." };
    const d = decodeSpark(encodeSpark(card));
    expect(d.title).toBe(card.title);
    expect(d.body).toBe(card.body);
    expect(["wash", "wash-1", "wash-2", "wash-3"]).toContain(d.wash);
  });
  it("carries an optional personal note (capped)", () => {
    const card = { id: "c9", title: "T", body: "B" };
    expect(decodeSpark(encodeSpark(card)).note).toBe("");
    expect(decodeSpark(encodeSpark(card, "thought of you xx")).note).toBe("thought of you xx");
    expect(decodeSpark(encodeSpark(card, "z".repeat(500))).note.length).toBeLessThanOrEqual(240);
  });
  it("handles unicode and rejects garbage", () => {
    expect(decodeSpark(encodeSpark({ id: "u", title: "Café ✦ résumé 🌙", body: "" })).title).toBe("Café ✦ résumé 🌙");
    expect(decodeSpark("!!!")).toBeNull();
    expect(decodeSpark("")).toBeNull();
  });
});

describe("clearAllData", () => {
  it("wipes dh:* keys", () => {
    toggleSave({ id: "a1" });
    localStorage.setItem("dh:opens", JSON.stringify(["2026-06-14"]));
    clearAllData();
    expect(getSaved()).toHaveLength(0);
    expect(localStorage.getItem("dh:opens")).toBeNull();
  });
});
