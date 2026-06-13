import { describe, it, expect } from "vitest";
import { detectCrisis, crisisResponse } from "../server/safety.js";

// Highest-priority logic per doc §8.1. The crisis gate must catch genuine
// self-harm / hopelessness signals (true positives) while letting everyday
// stress, sadness, and loneliness through to the normal card flow (true
// negatives — doc §4.3 Case B and the loneliness tone note).

describe("detectCrisis — true positives (must trigger support)", () => {
  const positives = [
    "I want to kill myself",
    "I've been thinking about killing myself lately",
    "I just want to end my life",
    "I don't want to be alive anymore",
    "honestly I want to die",
    "there's no reason to live",
    "everyone would be better off without me",
    "I've been harming myself",
    "I keep thinking about hurting myself",
    "sometimes I want to disappear forever",
    "I can't go on anymore",
    "I can't keep going",
    "I took an overdose last night",
    "I want to cut myself",
    "I feel like ending it all and taking my own life",
  ];
  for (const text of positives) {
    it(`flags: "${text}"`, () => {
      expect(detectCrisis(text)).toBe(true);
    });
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
    "Will today go well?",
    "I'm tired of everything going wrong",
    "",
    null,
    undefined,
  ];
  for (const text of negatives) {
    it(`allows: ${JSON.stringify(text)}`, () => {
      expect(detectCrisis(text)).toBe(false);
    });
  }
});

describe("crisisResponse shape", () => {
  it("is a non-card support response with real resources", () => {
    const r = crisisResponse();
    expect(r.isCrisis).toBe(true);
    expect(r.cardName).toBeTruthy();
    expect(Array.isArray(r.resources)).toBe(true);
    expect(r.resources.length).toBeGreaterThan(0);
    for (const res of r.resources) {
      expect(res.name).toBeTruthy();
      expect(res.contact).toBeTruthy();
    }
  });
});
