// Intent classification (PRD §4.3): question ("ask") vs feeling ("feel").
//
// In the UI the user picks intent explicitly via the "Draw a card" / "Share
// feeling" buttons, so the API normally receives an explicit intent. This helper
// is the fallback used when intent is omitted (and is unit-tested per the build
// order). Crisis detection lives in safety.js and overrides everything.

const QUESTION_STARTERS =
  /^(should|will|can|could|would|is|are|am|do|does|did|how|what|when|where|who|why|which|shall|may|might)\b/i;

export function classifyIntent(text) {
  const t = (text || "").trim();
  if (!t) return "feel";
  if (t.includes("?")) return "ask";
  if (QUESTION_STARTERS.test(t)) return "ask";
  return "feel";
}
