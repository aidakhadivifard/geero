import { useState } from "react";
import CardView from "./CardView.jsx";
import { isSaved, toggleSave, encodeSpark } from "../store.js";

// Card + actions, reused by Today (full) and Saved/Calendar (read-only).
// Actions: Collect (save), Share (Send a Spark), Today (reset), and — when
// allowed — exactly ONE follow-up (PRD §4.2).
export default function CardResult({
  card,
  readOnly = false,
  onReset = null,
  canFollowUp = false,
  onFollowUp = null,
  onSavedChange,
  animate = false,
}) {
  const [saved, setSaved] = useState(isSaved(card.id));
  const [sparkOpen, setSparkOpen] = useState(false);
  const [note, setNote] = useState("");
  const [followOpen, setFollowOpen] = useState(false);
  const [followText, setFollowText] = useState("");
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);

  function collect() {
    toggleSave(card);
    setSaved((s) => !s);
    onSavedChange?.();
  }

  async function submitFollow() {
    const q = followText.trim();
    if (!q || busy) return;
    setBusy(true);
    try {
      await onFollowUp?.(q);
      setFollowText("");
      setFollowOpen(false);
    } finally {
      setBusy(false);
    }
  }

  const sparkUrl = `${location.origin}/spark?d=${encodeSpark(card, note)}`;
  const sparkText = note.trim() || "Someone was thinking of you today ✦";
  async function share() {
    if (navigator.share) {
      try {
        await navigator.share({ title: "Dawnhalo", text: sparkText, url: sparkUrl });
        setSparkOpen(false);
        return;
      } catch {
        /* cancelled — show copy fallback */
      }
    }
    copy();
  }
  function copy() {
    navigator.clipboard?.writeText(sparkUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  }

  return (
    <div>
      <CardView card={card} animate={animate} />

      <div className="mt-7 flex items-center justify-center gap-8">
        <button type="button" className="flex flex-col items-center gap-2" onClick={collect}>
          <span
            className={`flex size-7 items-center justify-center rounded-sm border text-[13px] ${
              saved ? "border-gold bg-gold/15 text-gold" : "border-ink/40 text-ink/60"
            }`}
          >
            {saved ? "✓" : ""}
          </span>
          <span className="text-[10px] font-medium uppercase tracking-[0.12em] text-ink/60">
            {saved ? "Collected" : "Collect"}
          </span>
        </button>

        <button
          type="button"
          className="flex flex-col items-center gap-2 opacity-70 hover:opacity-100"
          onClick={() => setSparkOpen(true)}
        >
          <span className="flex size-7 items-center justify-center rounded-full border border-ink/40 text-[12px] text-ink/60">
            ✦
          </span>
          <span className="text-[10px] font-medium uppercase tracking-[0.12em] text-ink/60">
            Send a Spark
          </span>
        </button>

        {onReset && !readOnly ? (
          <button
            type="button"
            className="flex flex-col items-center gap-2 opacity-70 hover:opacity-100"
            onClick={onReset}
          >
            <span className="flex size-7 items-center justify-center rounded-sm border border-ink/40 text-[12px] text-ink/60">
              ↺
            </span>
            <span className="text-[10px] font-medium uppercase tracking-[0.12em] text-ink/60">
              Today
            </span>
          </button>
        ) : null}
      </div>

      {/* One follow-up per card (PRD §4.2) */}
      {!readOnly && canFollowUp ? (
        <div className="mt-6 rounded-2xl border border-clay bg-white p-4">
          {!followOpen ? (
            <button
              type="button"
              className="w-full text-left text-[11px] font-medium uppercase tracking-[0.14em] text-ink/45 hover:text-ink"
              onClick={() => setFollowOpen(true)}
            >
              + Ask something about this card
            </button>
          ) : (
            <div>
              <textarea
                autoFocus
                rows={2}
                value={followText}
                onChange={(e) => setFollowText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    submitFollow();
                  }
                }}
                placeholder="What does this mean for me right now?"
                className="w-full resize-none border-none bg-transparent p-0 text-sm font-light leading-relaxed placeholder:text-ink/30 focus:outline-none"
              />
              <div className="mt-3 flex items-center justify-end gap-3 border-t border-clay/60 pt-3">
                <button
                  type="button"
                  className="text-[10px] font-medium uppercase tracking-[0.16em] text-ink/40 hover:text-ink"
                  onClick={() => {
                    setFollowOpen(false);
                    setFollowText("");
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={busy || !followText.trim()}
                  onClick={submitFollow}
                  className="rounded-full bg-ink px-4 py-2 text-[11px] font-medium text-canvas hover:bg-gold hover:text-ink disabled:opacity-40"
                >
                  {busy ? "Drawing…" : "Ask"}
                </button>
              </div>
            </div>
          )}
        </div>
      ) : null}

      {/* Send a Spark sheet (PRD §4.6) */}
      {sparkOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 backdrop-blur-sm"
          onClick={() => setSparkOpen(false)}
        >
          <div
            className="dh-sheet w-full max-w-md rounded-t-3xl bg-canvas p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-center text-[10px] uppercase tracking-[0.22em] text-ink/40">
              Send a Spark
            </p>
            <h3 className="mt-2 text-center font-serif text-2xl italic">Pass the light on.</h3>
            <p className="mx-auto mt-2 max-w-[28ch] text-center text-sm font-light text-ink/60">
              Share this card with someone. They’ll open a little page — no app needed — with a
              nudge to draw their own.
            </p>
            <div className="mx-auto mt-5 w-2/3">
              <CardView card={card} />
            </div>
            <div className="mt-5 rounded-2xl border border-clay bg-white p-4">
              <p className="font-serif text-[13px] italic text-gold">Add a note (optional)</p>
              <textarea
                rows={2}
                value={note}
                maxLength={240}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Saw this and thought of you. Take a breath. xx"
                className="mt-1 w-full resize-none border-none bg-transparent p-0 text-sm font-light leading-relaxed placeholder:text-ink/30 focus:outline-none"
              />
            </div>
            <button
              type="button"
              onClick={share}
              className="mt-5 block w-full rounded-full bg-ink py-4 text-xs font-semibold uppercase tracking-[0.2em] text-canvas hover:bg-gold hover:text-ink"
            >
              Share “{sparkText}”
            </button>
            <button
              type="button"
              onClick={copy}
              className="mt-3 block w-full text-[11px] font-medium uppercase tracking-[0.16em] text-ink/50 hover:text-ink"
            >
              {copied ? "Link copied ✓" : "Copy link instead"}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
