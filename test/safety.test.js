import { describe, it, expect } from "vitest";
import { detectCrisis, crisisResponse } from "../server/safety.js";

// Build order #1 — highest priority. The crisis gate must catch self-harm /
// hopelessness signals (true positives) while letting everyday stress, sadness,
// and loneliness through to the normal card flow (true negatives).

describe("detectCrisis — true positives (must trigger support)", () => {
  const positives = [
    "I want to kill myself",
    "thinking about killing myself",
    "I just want to end my life",
    "I want to end it all",
    "I don't want to be alive anymore",
    "I do not want to be alive",
    "I don't want to wake up",
    "honestly I want to die",
    "there's no reason to live",
    "everyone would be better off without me",
    "I'd be better off dead",
    "I've been harming myself",
    "I keep thinking about hurting myself",
    "I want to disappear forever",
    "I can't go on anymore",
    "I feel completely hopeless",
    "I took an overdose",
    "I want to cut myself",
    "I feel like taking my own life",
  ];
  for (const text of positives) {
    it(`flags: "${text}"`, () => expect(detectCrisis(text)).toBe(true));
  }
});

describe("detectCrisis — true negatives (must NOT trigger support)", () => {
  const negatives = [
    "I'm exhausted from work",
    "I had a fight with my husband",
    "I feel ugly today",
    "I'm so stressed about my interview tomorrow",
    "No one notices me",
    "I wish someone paid attention to me",
    "I feel lonely and unseen",
    "Nobody really likes me",
    "I'm sad today",
    "I feel invisible at work",
    "I'm worried about money",
    "I feel like a failure",
    "Should I take the new job offer?",
    "I'm tired of everything going wrong",
    "",
    null,
    undefined,
  ];
  for (const text of negatives) {
    it(`allows: ${JSON.stringify(text)}`, () => expect(detectCrisis(text)).toBe(false));
  }
});

describe("crisisResponse", () => {
  it("is a non-card support payload with 988 + Samaritans", () => {
    const r = crisisResponse();
    expect(r.isCrisis).toBe(true);
    expect(r.title).toBeTruthy();
    const tels = r.resources.map((x) => x.tel);
    expect(tels).toContain("988");
    expect(tels).toContain("116123");
  });
});
