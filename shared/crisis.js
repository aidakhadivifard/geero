// Single source of truth for crisis detection, shared by the Express server
// (gate before any model call) and the React client (instant support panel).
// Conservative by design: when in doubt, surface support (PRD §3.6, §4.3 Case C).

export const CRISIS_PATTERNS = [
  /\bsuicid/i,
  /\bkill(ing)?\s+my\s*self\b/i,
  /\bkill\s+me\b/i,
  /\bend(ing)?\s+(my|my\s+own)\s+life\b/i,
  /\bend(ing)?\s+it\s+all\b/i,
  /\btak(e|ing)\s+my\s+(own\s+)?life\b/i,
  /\b(don'?t|do\s+not)\s+want\s+to\s+(live|be\s+(alive|here)|wake\s+up)\b/i,
  /\bwant\s+to\s+die\b/i,
  /\bwant\s+to\s+disappear\b/i,
  /\bno\s+reason\s+to\s+(live|go\s+on)\b/i,
  /\bbetter\s+off\s+(dead|without\s+me|if\s+i\s+(was|were)\s+gone)\b/i,
  /\bharm(ing)?\s+my\s*self\b/i,
  /\bhurt(ing)?\s+my\s*self\b/i,
  /\bself[-\s]?harm\b/i,
  /\bcut(ting)?\s+my\s*self\b/i,
  /\bcan'?t\s+(go\s+on|do\s+this\s+anymore|keep\s+going)\b/i,
  /\bhopeless\b/i,
  /\boverdos/i,
];

export function detectCrisis(text) {
  if (!text || typeof text !== "string") return false;
  return CRISIS_PATTERNS.some((re) => re.test(text));
}

export const CRISIS_RESOURCES = [
  { region: "US", name: "988 Suicide & Crisis Lifeline", contact: "Call or text 988", tel: "988" },
  { region: "UK", name: "Samaritans", contact: "Call 116 123", tel: "116123" },
];

export function crisisResponse() {
  return {
    isCrisis: true,
    title: "I want to pause here with you.",
    body: "What you wrote sounds like more than a hard day. A card isn't the right thing to offer right now — a real person is.",
    resources: CRISIS_RESOURCES,
  };
}
