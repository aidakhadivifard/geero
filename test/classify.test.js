import { describe, it, expect } from "vitest";
import { classifyIntent } from "../server/classify.js";

// Build order #2 — question ("ask") vs feeling ("feel"). Used as the fallback
// when the UI doesn't pass an explicit intent.
describe("classifyIntent", () => {
  const asks = [
    "Should I take the job offer?",
    "Will today's interview go well?",
    "What do I do about this?",
    "How can I tell him the truth?",
    "is this the right choice",
    "Can I trust her again?",
    "should i go",
  ];
  const feels = [
    "I'm exhausted from work",
    "I feel lonely",
    "no one notices me",
    "I had a fight with my husband",
    "I feel invisible today",
    "I'm carrying so much right now",
    "",
  ];
  for (const t of asks) it(`ask: "${t}"`, () => expect(classifyIntent(t)).toBe("ask"));
  for (const t of feels) it(`feel: "${t}"`, () => expect(classifyIntent(t)).toBe("feel"));
});
