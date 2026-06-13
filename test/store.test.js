import { describe, it, expect, beforeEach } from "vitest";
import {
  todayKey,
  computeStreak,
  toggleSave,
  removeSaved,
  getSaved,
  isSaved,
  encodeSpark,
  decodeSpark,
  recordHistory,
  getHistory,
  cacheDaily,
  getCachedDaily,
  clearAllData,
} from "../src/store.js";

beforeEach(() => localStorage.clear());

describe("todayKey — local date parts (doc §8.2)", () => {
  it("formats a given date as local YYYY-MM-DD", () => {
    expect(todayKey(new Date(2026, 5, 13))).toBe("2026-06-13");
    expect(todayKey(new Date(2026, 0, 1))).toBe("2026-01-01");
  });
  it("uses local parts, not UTC (no midnight shift)", () => {
    // 11:30pm local on Jun 13 must stay 06-13 regardless of UTC offset.
    expect(todayKey(new Date(2026, 5, 13, 23, 30))).toBe("2026-06-13");
  });
});

describe("computeStreak — consecutive app-open days (doc §4.5, §8.2)", () => {
  const now = new Date(2026, 5, 13, 12, 0, 0);
  const keyOffset = (n) => {
    const d = new Date(now);
    d.setDate(now.getDate() - n);
    return todayKey(d);
  };
  const setOpens = (offsets) =>
    localStorage.setItem("dawnhalo.opens", JSON.stringify(offsets.map(keyOffset)));

  it("is 0 with no opens", () => {
    expect(computeStreak(now)).toBe(0);
  });
  it("counts today only as 1", () => {
    setOpens([0]);
    expect(computeStreak(now)).toBe(1);
  });
  it("counts today + yesterday as 2", () => {
    setOpens([0, 1]);
    expect(computeStreak(now)).toBe(2);
  });
  it("stops at a gap (today, then skip yesterday)", () => {
    setOpens([0, 2, 3]);
    expect(computeStreak(now)).toBe(1);
  });
  it("is 0 if today was not opened, even if yesterday was", () => {
    setOpens([1, 2]);
    expect(computeStreak(now)).toBe(0);
  });
  it("counts a long unbroken run", () => {
    setOpens([0, 1, 2, 3, 4]);
    expect(computeStreak(now)).toBe(5);
  });
});

describe("save / retrieve (doc §8.4)", () => {
  const card = { id: "a1", cardName: "Steady Ground", message: "m", theme: "anchor" };
  it("saves, reports saved, then removes via toggle", () => {
    expect(isSaved("a1")).toBe(false);
    toggleSave(card);
    expect(isSaved("a1")).toBe(true);
    expect(getSaved()).toHaveLength(1);
    toggleSave(card);
    expect(isSaved("a1")).toBe(false);
    expect(getSaved()).toHaveLength(0);
  });
  it("removeSaved deletes by id", () => {
    toggleSave(card);
    toggleSave({ id: "b2", cardName: "Open Door", theme: "open_door" });
    expect(getSaved()).toHaveLength(2);
    removeSaved("a1");
    expect(getSaved().map((c) => c.id)).toEqual(["b2"]);
  });
});

describe("history feeds the calendar (doc §4.5)", () => {
  it("records a card under today's key", () => {
    recordHistory({ id: "x", cardName: "Sunrise", theme: "sunrise" });
    const hist = getHistory();
    expect(hist[todayKey()]).toHaveLength(1);
  });
  it("never records a crisis response as a card", () => {
    recordHistory({ isCrisis: true, cardName: "You are not alone" });
    expect(getHistory()[todayKey()]).toBeUndefined();
  });
});

describe("daily card cache (doc §4.1 — once per day)", () => {
  it("returns the cached card the same day", () => {
    const card = { id: "d", cardName: "First Light", theme: "sunrise" };
    cacheDaily(card);
    expect(getCachedDaily()).toMatchObject({ id: "d" });
  });
  it("ignores a stale cache from another day", () => {
    localStorage.setItem(
      "dawnhalo.daily",
      JSON.stringify({ date: "2000-01-01", card: { id: "old" } })
    );
    expect(getCachedDaily()).toBeNull();
  });
});

describe("Send a Spark codec (doc §4.6)", () => {
  it("round-trips card fields through the URL payload", () => {
    const card = {
      cardName: "The Open Door",
      message: "A new way is opening — you don't have to rush through it.",
      context: "Notice one small invitation today.",
      theme: "open_door",
    };
    const decoded = decodeSpark(encodeSpark(card));
    expect(decoded).toEqual({
      cardName: card.cardName,
      message: card.message,
      context: card.context,
      theme: card.theme,
    });
  });
  it("handles unicode safely", () => {
    const card = { cardName: "Café ✦", message: "naïve — résumé 🌙", context: "", theme: "moon" };
    expect(decodeSpark(encodeSpark(card)).message).toBe(card.message);
  });
  it("returns null for malformed payloads", () => {
    expect(decodeSpark("!!!not-base64!!!")).toBeNull();
    expect(decodeSpark("")).toBeNull();
  });
});

describe("clearAllData", () => {
  it("wipes saved, history, opens, daily, settings", () => {
    toggleSave({ id: "a1", theme: "anchor" });
    recordHistory({ id: "h", theme: "sunrise" });
    localStorage.setItem("dawnhalo.opens", JSON.stringify(["2026-06-13"]));
    clearAllData();
    expect(getSaved()).toHaveLength(0);
    expect(Object.keys(getHistory())).toHaveLength(0);
    expect(localStorage.getItem("dawnhalo.opens")).toBeNull();
  });
});
