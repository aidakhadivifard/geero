import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";

// High limit so these functional tests don't trip the rate limiter
// (rate limiting itself is covered in ratelimit.test.js, isolated per file).
process.env.RATE_LIMIT_MAX = "1000";
delete process.env.ANTHROPIC_API_KEY;
delete process.env.DAWNHALO_ALLOW_FALLBACK;

let app;
beforeAll(async () => {
  ({ app } = await import("../server/index.js"));
});

describe("POST /api/card — endpoint security & behavior", () => {
  it("health check responds", async () => {
    const res = await request(app).get("/api/health");
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
  });

  it("crisis input returns support WITHOUT needing a key or model", async () => {
    const res = await request(app).post("/api/card").send({ intent: "feel", input: "I want to die" });
    expect(res.status).toBe(200);
    expect(res.body.isCrisis).toBe(true);
  });

  it("rejects an unknown intent with 400", async () => {
    const res = await request(app).post("/api/card").send({ intent: "exec", input: "x" });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("invalid_intent");
  });

  it("rejects an over-limit request body (413 body-size guard)", async () => {
    const res = await request(app).post("/api/card").send({ intent: "feel", input: "a".repeat(50000) });
    expect(res.status).toBe(413);
  });

  it("returns 503 (not 500, no key leak) when no key is configured", async () => {
    const res = await request(app).post("/api/card").send({ intent: "feel", input: "I'm tired" });
    expect(res.status).toBe(503);
    expect(res.body.error).toBe("missing_api_key");
  });

  it("sets security headers (helmet)", async () => {
    const res = await request(app).get("/api/health");
    expect(res.headers["x-content-type-options"]).toBe("nosniff");
    expect(res.headers["content-security-policy"]).toBeTruthy();
  });
});
