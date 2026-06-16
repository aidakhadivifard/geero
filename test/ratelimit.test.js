import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";

// Isolated file: each Vitest test file gets a fresh module graph, so this app
// instance has its own rate-limit counter. Low max so we can trip it cheaply.
process.env.RATE_LIMIT_MAX = "2";
delete process.env.ANTHROPIC_API_KEY;

let app;
beforeAll(async () => {
  ({ app } = await import("../server/index.js"));
});

describe("rate limiting (cost / abuse control)", () => {
  it("returns 429 after the per-window limit is exceeded", async () => {
    // Crisis input short-circuits the model, so these are cheap but still counted.
    const body = { intent: "feel", input: "I want to die" };
    const s1 = (await request(app).post("/api/card").send(body)).status;
    const s2 = (await request(app).post("/api/card").send(body)).status;
    const s3 = await request(app).post("/api/card").send(body);
    expect(s1).toBe(200);
    expect(s2).toBe(200);
    expect(s3.status).toBe(429);
    expect(s3.body.error).toBe("rate_limited");
  });
});
