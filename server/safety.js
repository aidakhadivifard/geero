// Safety-first crisis handling (product doc §3.6, §4.3 Case C).
//
// This is a deterministic local pre-check that runs BEFORE any model call. If it
// fires, we never produce an oracle card — we return a gentle, respectful message
// pointing to real support resources. The model is ALSO instructed to flag crisis
// input (see cardGenerator.js) as a second layer, but this local gate guarantees a
// safe response even if the API is unreachable.
//
// This is intentionally conservative: when in doubt, surface support. A prototype
// safety net is not a clinical tool.

const CRISIS_PATTERNS = [
  /\bkill(ing)?\s+my\s*self\b/i,
  /\bkill\s+me\b/i,
  /\bsuicid/i,
  /\bend(ing)?\s+(my|my\s+own)\s+life\b/i,
  /\bend(ing)?\s+it\s+all\b/i,
  /\btak(e|ing)\s+my\s+(own\s+)?life\b/i,
  /\bdon'?t\s+want\s+to\s+(be\s+(alive|here)|live)\b/i,
  /\bwant\s+to\s+die\b/i,
  /\bwant\s+to\s+disappear\b/i,
  /\bno\s+reason\s+to\s+(live|go\s+on)\b/i,
  /\bbetter\s+off\s+(without\s+me|dead|if\s+i\s+(was|were)\s+gone)\b/i,
  /\bharm(ing)?\s+my\s*self\b/i,
  /\bhurt(ing)?\s+my\s*self\b/i,
  /\bself[-\s]?harm\b/i,
  /\bcut(ting)?\s+my\s*self\b/i,
  /\bcan'?t\s+(go\s+on|do\s+this\s+anymore|keep\s+going)\b/i,
  /\bnothing\s+matters\s+anymore\b/i,
  /\boverdos/i,
];

export function detectCrisis(text) {
  if (!text || typeof text !== "string") return false;
  return CRISIS_PATTERNS.some((re) => re.test(text));
}

// Region-aware-ish resource list. English-first (US/UK) per product scope.
export function crisisResponse() {
  return {
    isCrisis: true,
    cardName: "You are not alone",
    message:
      "It sounds like you're carrying something really heavy right now, and I'm glad you said it out loud. You deserve support from someone who can be fully present with you.",
    context:
      "Please reach out to people who are trained to help — they want to hear from you.",
    resources: [
      {
        region: "US",
        name: "988 Suicide & Crisis Lifeline",
        contact: "Call or text 988",
      },
      {
        region: "UK & ROI",
        name: "Samaritans",
        contact: "Call 116 123 (free, 24/7)",
      },
      {
        region: "Anywhere",
        name: "Find a Helpline",
        contact: "findahelpline.com",
      },
    ],
    theme: "light",
  };
}
