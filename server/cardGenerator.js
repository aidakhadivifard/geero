import Anthropic from "@anthropic-ai/sdk";
import { detectCrisis, crisisResponse } from "./safety.js";

// The illustration themes the AI may choose from. These map 1:1 to the SVG
// library in src/illustrations/. To add a DALL·E-generated image later, add the
// theme here and a renderer in the frontend manifest — nothing else changes.
export const THEMES = [
  "open_door",
  "sunrise",
  "path",
  "mountain",
  "moon",
  "water",
  "tree",
  "bird",
  "anchor",
  "bridge",
  "star",
  "flame",
];

const MODEL = "claude-opus-4-8";

const SYSTEM_PROMPT = `You are the voice behind "Dawnhalo", a daily affirmation & oracle-card app. Every response you write is presented to the user as a beautifully illustrated card — never a chat bubble.

WHO YOU ARE
- Warm, confident, a little mystical — like a grounded friend who happens to read cards.
- NOT childish, NOT religious, NOT heavy occult/witchy, NOT a clingy AI companion.
- Core promise: "You're doing better than you think. Here's a little light for your next step."

HARD RULES
1. Card-first: output a card name, a short main message, and one extra sentence of context.
2. The card name is 1–4 words, evocative and concrete (e.g. "The Open Door", "Heavy Coat", "Low Tide", "The First Light"). Never generic ("Card", "Affirmation").
3. Message: 1–3 short sentences. Speak directly to the person. No lists, no headings, no emoji spam (at most one tasteful emoji, usually none).
4. Validate before reframe: if the input describes a hard feeling or situation, acknowledge the feeling honestly FIRST, then offer a grounded reframe or next step. Never jump to forced positivity. Never dismiss.
5. No appearance focus: even if the person mentions their looks, redirect gently to how they feel or what their day needs — never comment on or affirm physical appearance.
6. Questions get guidance-style framing: respond to the actual question with grounded, non-deterministic encouragement (you don't predict the future; you offer perspective and a next step).
7. Loneliness / wanting to be noticed: if the person feels unseen, unnoticed, lonely, or wishes someone paid attention to them or found them desirable, warmly affirm their worth and that they ARE seen — speaking AS the card, in your own voice. Never invent a person or character who notices, sees, wants, or desires them, and never simulate a relationship. The reassurance comes from the card itself, not from a fictional admirer. (This honours the need to feel noticed in a healthy, bounded way — you are not a companion.)
8. Keep it short. Seconds to read, not minutes.

ILLUSTRATION
- Choose exactly one "theme" from the allowed list that matches the card's mood:
  open_door (new beginnings, opportunity), sunrise (hope, fresh start), path (direction, journey),
  mountain (challenge, perspective, strength), moon (rest, intuition, night feelings),
  water (emotion, flow, letting go), tree (growth, grounding, patience), bird (freedom, lightness, release),
  anchor (stability, steadiness), bridge (transition, connection), star (guidance, hope, the long view),
  flame (energy, courage, warmth).

REMINDERS
- Only when asked for a daily card: also provide 1–2 very short affirming "reminders for today" (notification-style, under ~10 words each). Otherwise return an empty array.

You will be told the request type. Always answer in the required JSON shape.`;

const CARD_SCHEMA = {
  type: "object",
  properties: {
    cardName: { type: "string" },
    message: { type: "string" },
    context: { type: "string" },
    theme: { type: "string", enum: THEMES },
    kind: {
      type: "string",
      enum: ["daily", "guidance", "validation", "followup"],
    },
    reminders: { type: "array", items: { type: "string" } },
  },
  required: ["cardName", "message", "context", "theme", "kind", "reminders"],
  additionalProperties: false,
};

let client = null;
function getClient() {
  if (!process.env.ANTHROPIC_API_KEY) return null;
  if (!client) client = new Anthropic();
  return client;
}

export function hasApiKey() {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

function buildUserPrompt({ mode, input, previousCard }) {
  if (mode === "daily") {
    return `Request type: DAILY CARD.
Generate today's daily card — a general, uplifting card themed around encouragement for whatever the day holds (the user has not told you anything specific). Also include 1–2 "reminders for today". Set kind = "daily".`;
  }
  if (mode === "follow_up") {
    return `Request type: FOLLOW-UP.
The user already drew this card:
  Name: ${previousCard?.cardName}
  Message: ${previousCard?.message}
  (theme: ${previousCard?.theme})
They asked one follow-up: "${input}"
Answer their follow-up directly, staying true to that card's spirit. You may keep the same card name and theme or shift slightly if it fits better. Set kind = "followup". reminders must be an empty array.`;
  }
  // mode === "input": let the model classify question vs feeling.
  return `Request type: USER INPUT.
The user wrote: "${input}"
First silently decide whether this is a QUESTION (asking for guidance about a decision/outcome) or a FEELING/SITUATION (sharing how they feel or what's going on).
- If a question: respond with guidance-style framing. Set kind = "guidance".
- If a feeling/situation: validate the feeling first, then offer a grounded reframe. Set kind = "validation".
reminders must be an empty array.`;
}

// curated local cards used only when DAWNHALO_ALLOW_FALLBACK=1 and no key is set
const FALLBACK = {
  daily: {
    cardName: "The First Light",
    message:
      "You don't have to have it all figured out to begin. Today asks only for one honest step.",
    context: "Let today be enough, exactly as it is.",
    theme: "sunrise",
    kind: "daily",
    reminders: ["You've survived every hard day so far.", "Small is still forward."],
  },
  input: {
    cardName: "Steady Ground",
    message:
      "Whatever you're carrying, you're allowed to set part of it down. You don't have to hold all of it at once.",
    context: "Notice one thing that is already okay.",
    theme: "anchor",
    kind: "validation",
    reminders: [],
  },
  follow_up: {
    cardName: "Steady Ground",
    message:
      "Trust the next small step more than the whole staircase. You'll see further once you move.",
    context: "You already know more than you think you do.",
    theme: "path",
    kind: "followup",
    reminders: [],
  },
};

// Robust JSON extraction: structured outputs return clean JSON, but this also
// handles a model that wraps it in prose or ```json fences (belt and suspenders).
function parseCardJson(text) {
  try {
    return JSON.parse(text);
  } catch {
    /* fall through */
  }
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced) {
    try {
      return JSON.parse(fenced[1]);
    } catch {
      /* fall through */
    }
  }
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start >= 0 && end > start) {
    try {
      return JSON.parse(text.slice(start, end + 1));
    } catch {
      /* fall through */
    }
  }
  return null;
}

export async function generateCard({ mode = "input", input = "", previousCard = null }) {
  // Layer 1: deterministic safety gate (overrides everything).
  if ((mode === "input" || mode === "follow_up") && detectCrisis(input)) {
    return crisisResponse();
  }

  const anthropic = getClient();

  if (!anthropic) {
    if (process.env.DAWNHALO_ALLOW_FALLBACK === "1") {
      return { ...FALLBACK[mode] || FALLBACK.input };
    }
    const err = new Error("missing_api_key");
    err.code = "missing_api_key";
    throw err;
  }

  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    output_config: {
      format: { type: "json_schema", schema: CARD_SCHEMA },
    },
    messages: [{ role: "user", content: buildUserPrompt({ mode, input, previousCard }) }],
  });

  // Layer 2: trust the structured-output JSON, but re-check for crisis flags the
  // model may have surfaced in free text, just in case.
  const text = response.content.find((b) => b.type === "text")?.text ?? "{}";
  const card = parseCardJson(text);
  if (!card) {
    const e = new Error("bad_model_output");
    e.code = "bad_model_output";
    throw e;
  }

  if (detectCrisis(`${card.cardName} ${card.message} ${card.context}`)) {
    return crisisResponse();
  }

  // normalize
  card.isCrisis = false;
  if (!Array.isArray(card.reminders)) card.reminders = [];
  if (!THEMES.includes(card.theme)) card.theme = "sunrise";
  return card;
}
