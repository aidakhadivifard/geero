import Anthropic from "@anthropic-ai/sdk";
import { detectCrisis, crisisResponse } from "./safety.js";
import { classifyIntent } from "./classify.js";

// NOTE: the brief requested `claude-sonnet-4-20250514`, but that exact model is
// deprecated and scheduled to retire 2026-06-15 — an app on it would break within
// hours. `claude-sonnet-4-6` is Anthropic's current Sonnet and the official
// drop-in replacement (same family, same API). Change this one constant to swap.
const MODEL = "claude-sonnet-4-6";

const SYSTEM_PROMPT = `You are the writer behind "Dawnhalo", a daily affirmation & oracle-card app. Every response is presented to the user as a single quiet "card", never a chat message.

VOICE
- Warm, confident, a little mystical — like a grounded friend with a gift for perspective.
- NOT childish, NOT religious, NOT heavy occult/witchy, NOT an AI companion.
- Literary and spare. Second person. Present tense. No lists, no emoji, no headings.
- Core promise: "You're doing better than you think. Here's a little light for your next step."

A CARD = three parts:
- "opener": ONE sentence — a warm, intuitive "reading" opener, like a reader leaning in to read the energy of the card or the person's situation. It appears (in italic) above the title. It must feel personal and present, never generic or robotic, never theatrical or over-the-top. Vary it naturally — never reuse the same phrasing. One sentence only.
    · Daily card, e.g.: "I'm reading the energy of today's card for you…" / "This card has something specific to say to you today…"
    · Question card, e.g.: "Let me read what this card is saying about your question…" / "I'm drawing the energy around what you're asking…"
    · Feeling card, e.g.: "Let me sit with what you're carrying for a moment…" / "I'm reading the energy of what you just shared…"
    · Follow-up, e.g.: "Let me look a little deeper into this for you…"
- "title": one short, evocative line — the perspective itself (roughly 6–18 words). The heart of the card. Concrete and a little poetic, e.g. "Tired is a real weather. Not a failing."
- "body": 1–2 short sentences that ground or extend the title. Gentle, specific, never a lecture.

RULES
1. Validate before reframe: for a hard feeling, acknowledge it honestly FIRST, then offer a grounded reframe. Never dismissive positivity.
2. No appearance focus: even if they mention how they look, redirect to how they feel or what their day needs. Never affirm or comment on physical appearance.
3. Loneliness / wanting to be noticed: if they feel unseen, unnoticed, lonely, or wish someone paid attention to them or found them desirable, affirm their worth and that they ARE seen — speaking AS the card, in your own voice. NEVER invent a person, character, or admirer who notices/wants/desires them, and never simulate a relationship.
4. Questions: respond with grounded, non-deterministic guidance — perspective and a next step, not a prediction.
5. Keep it short. Seconds to read.`;

const CARD_SCHEMA = {
  type: "object",
  properties: {
    opener: { type: "string" },
    title: { type: "string" },
    body: { type: "string" },
  },
  required: ["opener", "title", "body"],
  additionalProperties: false,
};

// Safety-net openers used for fallback cards and if the model ever omits one.
const OPENERS = {
  daily: [
    "I'm reading the energy of today's card for you…",
    "This card has something specific to say to you today…",
    "Let me see what today is quietly offering you…",
  ],
  ask: [
    "Let me read what this card is saying about your question…",
    "I'm drawing the energy around what you're asking…",
  ],
  feel: [
    "Let me sit with what you're carrying for a moment…",
    "I'm reading the energy of what you just shared…",
  ],
  follow: ["Let me look a little deeper into this for you…", "Let me read what's underneath that…"],
};
function openerFor(intent) {
  const list = OPENERS[intent] || OPENERS.daily;
  return list[Math.floor(Math.random() * list.length)];
}

let client = null;
function getClient() {
  if (!process.env.ANTHROPIC_API_KEY) return null;
  if (!client) client = new Anthropic();
  return client;
}
export function hasApiKey() {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

function buildUserPrompt({ intent, input, previous }) {
  if (intent === "daily")
    return `Request: DAILY CARD. Write today's daily card — a general "morning perspective" of gentle encouragement (the user hasn't told you anything specific). Make it feel freshly written.`;
  if (intent === "follow")
    return `Request: FOLLOW-UP. The user already drew this card:
  Title: "${previous?.title}"
  Body: "${previous?.body}"
They asked one follow-up: "${input}"
Answer their follow-up directly, staying true to that card's spirit.`;
  if (intent === "ask")
    return `Request: QUESTION. The user asked: "${input}"
Respond with guidance-style framing — perspective and a next step, not a prediction.`;
  return `Request: FEELING. The user shared: "${input}"
Validate the feeling first, then offer a grounded reframe. Follow the loneliness and no-appearance rules if relevant.`;
}

// Offline demo content (used only when DAWNHALO_ALLOW_FALLBACK=1 and no key),
// mirroring the prototype so the demo looks identical to the loved design.
const FALLBACK_DAILY = [
  { title: "You don't have to carry the whole world today. Just the part you're standing on.", body: "Focus on the immediate. The small tasks. The breath in your lungs." },
  { title: "The morning does not ask you to be ready. Only to arrive.", body: "Show up gently. The rest will meet you there." },
  { title: "Something quiet is moving in your favor.", body: "You may not see it yet. Trust the slow shape of it." },
  { title: "You are allowed to begin again, mid-week, mid-morning, mid-sentence.", body: "There is no rule that says you must finish what no longer fits." },
];
const FALLBACK_ASK = [
  { title: "The answer is closer to you than you think.", body: "Notice where your body softens when you sit with the question. That direction is worth following." },
  { title: "You are not being asked to know — only to choose.", body: "Pick the path that lets you stay honest with yourself, even if it's the harder one." },
];
const FALLBACK_FEEL = {
  invisible: { title: "I see you.", body: "Even when the world is looking past you, your presence matters. Your softness is not a small thing." },
  tired: { title: "Tired is a real weather. Not a failing.", body: "Today, do less than you think you should. The day will hold what you can give it." },
  sad: { title: "What you're feeling is allowed to take up space.", body: "You don't have to fix it to be okay. It is moving, even when it feels still." },
  default: { title: "Whatever you're carrying — set it down for a moment here.", body: "You don't have to name it perfectly. Just let yourself feel it without rushing through." },
};

function hash(s) {
  let h = 0;
  const str = String(s);
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) | 0;
  return Math.abs(h);
}
function fallbackCard({ intent, input }) {
  let base;
  if (intent === "daily") base = FALLBACK_DAILY[hash(new Date().toISOString().slice(0, 10)) % FALLBACK_DAILY.length];
  else if (intent === "ask" || intent === "follow") base = FALLBACK_ASK[hash(input || Date.now()) % FALLBACK_ASK.length];
  else {
    const lo = (input || "").toLowerCase();
    if (/(invisible|unseen|no one|nobody|lonely|notice)/.test(lo)) base = FALLBACK_FEEL.invisible;
    else if (/(tired|exhaust|drained)/.test(lo)) base = FALLBACK_FEEL.tired;
    else if (/(sad|down|low|cry)/.test(lo)) base = FALLBACK_FEEL.sad;
    else base = FALLBACK_FEEL.default;
  }
  return { ...base, opener: openerFor(intent) };
}

function parseCardJson(text) {
  try {
    return JSON.parse(text);
  } catch {
    /* fall through */
  }
  const m = text.match(/\{[\s\S]*\}/);
  if (m) {
    try {
      return JSON.parse(m[0]);
    } catch {
      /* ignore */
    }
  }
  return null;
}

export async function generateCard({ intent, input = "", previous = null }) {
  if (intent !== "daily" && intent !== "ask" && intent !== "feel" && intent !== "follow") {
    intent = classifyIntent(input);
  }

  // Layer 1: deterministic crisis gate, BEFORE any API call.
  if (intent !== "daily" && detectCrisis(input)) return crisisResponse();

  const anthropic = getClient();
  if (!anthropic) {
    if (process.env.DAWNHALO_ALLOW_FALLBACK === "1") {
      return { ...fallbackCard({ intent, input }), intent, fallback: true };
    }
    const err = new Error("missing_api_key");
    err.code = "missing_api_key";
    throw err;
  }

  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 500,
    system: SYSTEM_PROMPT,
    output_config: { format: { type: "json_schema", schema: CARD_SCHEMA } },
    messages: [{ role: "user", content: buildUserPrompt({ intent, input, previous }) }],
  });

  const text = response.content.find((b) => b.type === "text")?.text ?? "{}";
  const card = parseCardJson(text);
  if (!card || !card.title || !card.body) {
    const e = new Error("bad_model_output");
    e.code = "bad_model_output";
    throw e;
  }

  // Layer 2: re-check the model's output for crisis language, just in case.
  if (detectCrisis(`${card.title} ${card.body}`)) return crisisResponse();

  return {
    opener: card.opener || openerFor(intent),
    title: card.title,
    body: card.body,
    intent,
    isCrisis: false,
  };
}
