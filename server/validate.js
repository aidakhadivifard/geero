// Request validation for /api/card — caps input size (cost/abuse control),
// whitelists intent, and sanitizes the follow-up payload down to safe fields.
export const MAX_INPUT = 600;
const INTENTS = new Set(["daily", "ask", "feel", "follow"]);

export function validateCardRequest(body) {
  if (!body || typeof body !== "object") {
    return { ok: false, error: "invalid_request", message: "Invalid request body." };
  }
  const { intent, previous } = body;
  let { input } = body;

  if (intent !== undefined && !INTENTS.has(intent)) {
    return { ok: false, error: "invalid_intent", message: "Unknown intent." };
  }
  if (input !== undefined && typeof input !== "string") {
    return { ok: false, error: "invalid_input", message: "Input must be text." };
  }
  input = (input || "").slice(0, MAX_INPUT).trim();

  // Non-daily flows need words to read; an absent intent will be classified, so
  // it also needs input.
  if (intent !== "daily" && !input) {
    return { ok: false, error: "missing_input", message: "Please share a few words first." };
  }

  let prev = null;
  if (previous && typeof previous === "object") {
    prev = {
      title: typeof previous.title === "string" ? previous.title.slice(0, 300) : "",
      body: typeof previous.body === "string" ? previous.body.slice(0, 600) : "",
    };
  }

  return { ok: true, value: { intent, input, previous: prev } };
}
