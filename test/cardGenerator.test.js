import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the Anthropic SDK so we can test the generation logic without the network.
const create = vi.fn();
vi.mock("@anthropic-ai/sdk", () => ({
  default: class {
    constructor() {
      this.messages = { create };
    }
  },
}));

const { generateCard } = await import("../server/cardGenerator.js");

beforeEach(() => {
  create.mockReset();
  process.env.ANTHROPIC_API_KEY = "test-key";
  delete process.env.DAWNHALO_ALLOW_FALLBACK;
  create.mockResolvedValue({
    content: [{ type: "text", text: JSON.stringify({ title: "A quiet line", body: "And a softer next step." }) }],
  });
});

// Build order #3 — card generation endpoint logic.
describe("generateCard", () => {
  it("returns a structured {title, body} card for a question", async () => {
    const card = await generateCard({ intent: "ask", input: "Should I take the offer?" });
    expect(card).toMatchObject({ title: "A quiet line", body: "And a softer next step.", intent: "ask", isCrisis: false });
    expect(create).toHaveBeenCalledOnce();
  });

  it("short-circuits crisis input WITHOUT calling the model", async () => {
    const card = await generateCard({ intent: "feel", input: "I want to die" });
    expect(card.isCrisis).toBe(true);
    expect(create).not.toHaveBeenCalled();
  });

  it("classifies intent when none is provided", async () => {
    const card = await generateCard({ input: "Should I move cities?" });
    expect(card.intent).toBe("ask");
  });

  it("treats a plain feeling share as 'feel'", async () => {
    const card = await generateCard({ input: "I feel invisible lately" });
    expect(card.intent).toBe("feel");
  });

  it("serves a fallback card when no key but fallback enabled", async () => {
    delete process.env.ANTHROPIC_API_KEY;
    process.env.DAWNHALO_ALLOW_FALLBACK = "1";
    const card = await generateCard({ intent: "daily" });
    expect(card.title).toBeTruthy();
    expect(card.fallback).toBe(true);
    expect(create).not.toHaveBeenCalled();
  });

  it("throws missing_api_key when no key and no fallback", async () => {
    delete process.env.ANTHROPIC_API_KEY;
    await expect(generateCard({ intent: "daily" })).rejects.toMatchObject({ code: "missing_api_key" });
  });

  it("re-flags crisis if the model output contains crisis language", async () => {
    create.mockResolvedValue({
      content: [{ type: "text", text: JSON.stringify({ title: "there is no reason to live", body: "x" }) }],
    });
    const card = await generateCard({ intent: "feel", input: "rough day" });
    expect(card.isCrisis).toBe(true);
  });
});
