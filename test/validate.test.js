import { describe, it, expect } from "vitest";
import { validateCardRequest, MAX_INPUT } from "../server/validate.js";

describe("validateCardRequest (security / input handling)", () => {
  it("accepts a daily request with no input", () => {
    expect(validateCardRequest({ intent: "daily" })).toMatchObject({ ok: true });
  });

  it("rejects an unknown intent", () => {
    expect(validateCardRequest({ intent: "hack", input: "x" })).toMatchObject({
      ok: false,
      error: "invalid_intent",
    });
  });

  it("rejects a non-string input", () => {
    expect(validateCardRequest({ intent: "feel", input: { evil: 1 } })).toMatchObject({
      ok: false,
      error: "invalid_input",
    });
  });

  it("requires input for ask/feel/follow", () => {
    expect(validateCardRequest({ intent: "feel", input: "   " })).toMatchObject({
      ok: false,
      error: "missing_input",
    });
  });

  it("caps oversized input rather than passing it through", () => {
    const huge = "a".repeat(5000);
    const r = validateCardRequest({ intent: "feel", input: huge });
    expect(r.ok).toBe(true);
    expect(r.value.input.length).toBeLessThanOrEqual(MAX_INPUT);
  });

  it("sanitizes previous down to capped title/body strings", () => {
    const r = validateCardRequest({
      intent: "follow",
      input: "tell me more",
      previous: { title: "t", body: "b", secret: "x", huge: "z".repeat(9999) },
    });
    expect(r.ok).toBe(true);
    expect(Object.keys(r.value.previous).sort()).toEqual(["body", "title"]);
  });

  it("rejects a non-object body", () => {
    expect(validateCardRequest(null)).toMatchObject({ ok: false });
    expect(validateCardRequest("nope")).toMatchObject({ ok: false });
  });
});
