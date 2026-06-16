import express from "express";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import fs from "node:fs";
import { generateCard, hasApiKey } from "./cardGenerator.js";
import { validateCardRequest } from "./validate.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Minimal .env loader (no extra dependency). Only sets vars not already present.
const envPath = join(__dirname, "..", ".env");
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && process.env[m[1]] === undefined) {
      process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
    }
  }
}

export const app = express();

// Security headers + a CSP that allows the Google Fonts the design uses while
// locking everything else to same-origin.
app.use(
  helmet({
    crossOriginEmbedderPolicy: false,
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com", "data:"],
        imgSrc: ["'self'", "data:"],
        connectSrc: ["'self'"],
        objectSrc: ["'none'"],
        baseUri: ["'self'"],
        frameAncestors: ["'self'"],
      },
    },
  })
);

app.use(express.json({ limit: "16kb" }));

// Per-IP rate limit on the (paid, model-calling) endpoint — the primary cost /
// abuse control for a public launch. Tunable via RATE_LIMIT_MAX.
const cardLimiter = rateLimit({
  windowMs: 60_000,
  max: Number(process.env.RATE_LIMIT_MAX || 40),
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "rate_limited", message: "A little too fast — take a breath and try again in a moment." },
});

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, apiKey: hasApiKey(), fallback: process.env.DAWNHALO_ALLOW_FALLBACK === "1" });
});

app.post("/api/card", cardLimiter, async (req, res) => {
  const v = validateCardRequest(req.body);
  if (!v.ok) return res.status(400).json({ error: v.error, message: v.message });
  try {
    const card = await generateCard(v.value);
    res.json(card);
  } catch (err) {
    if (err.code === "missing_api_key") {
      return res.status(503).json({
        error: "missing_api_key",
        message:
          "No ANTHROPIC_API_KEY configured. Add it to .env (see .env.example) and restart, or set DAWNHALO_ALLOW_FALLBACK=1 for offline demo cards.",
      });
    }
    // Never leak internals to the client.
    console.error("[/api/card]", err.code || err.message);
    res.status(500).json({ error: "generation_failed", message: "Could not draw a card right now. Please try again." });
  }
});

if (process.env.NODE_ENV === "production") {
  const dist = join(__dirname, "..", "dist");
  app.use(express.static(dist));
  app.get("*", (_req, res) => res.sendFile(join(dist, "index.html")));
}

// Don't bind a port under test (supertest drives the app object directly).
if (process.env.NODE_ENV !== "test") {
  const PORT = process.env.PORT || 8787;
  app.listen(PORT, () => console.log(`Dawnhalo server on http://localhost:${PORT}  (apiKey: ${hasApiKey()})`));
}
