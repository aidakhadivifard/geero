import express from "express";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import fs from "node:fs";
import { generateCard, hasApiKey } from "./cardGenerator.js";

// Minimal .env loader (no extra dependency). Only sets vars not already present.
const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = join(__dirname, "..", ".env");
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && process.env[m[1]] === undefined) {
      process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
    }
  }
}

const app = express();
app.use(express.json({ limit: "32kb" }));

app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    apiKey: hasApiKey(),
    fallback: process.env.DAWNHALO_ALLOW_FALLBACK === "1",
  });
});

app.post("/api/card", async (req, res) => {
  const { intent, input, previous } = req.body || {};
  try {
    const card = await generateCard({ intent, input, previous });
    res.json(card);
  } catch (err) {
    if (err.code === "missing_api_key") {
      return res.status(503).json({
        error: "missing_api_key",
        message:
          "No ANTHROPIC_API_KEY configured. Add it to .env (see .env.example) and restart, or set DAWNHALO_ALLOW_FALLBACK=1 for offline demo cards.",
      });
    }
    console.error("[/api/card]", err);
    res.status(500).json({ error: err.code || "generation_failed", message: "Could not draw a card right now. Please try again." });
  }
});

if (process.env.NODE_ENV === "production") {
  const dist = join(__dirname, "..", "dist");
  app.use(express.static(dist));
  app.get("*", (_req, res) => res.sendFile(join(dist, "index.html")));
}

const PORT = process.env.PORT || 8787;
app.listen(PORT, () => {
  console.log(`Dawnhalo server on http://localhost:${PORT}  (apiKey: ${hasApiKey()})`);
});
