import { useRef, useState } from "react";
import OracleCard from "./OracleCard.jsx";
import { drawCard } from "../api.js";
import { isSaved, toggleSave, encodeSpark } from "../store.js";
import { renderCardPng, downloadBlob } from "../cardImage.js";
import {
  BookmarkIcon,
  RefreshIcon,
  ChatIcon,
  SparkIcon,
  SendIcon,
  CheckIcon,
  CopyIcon,
  CloseIcon,
  DownloadIcon,
} from "./icons.jsx";

// Shared result view (doc §4.2). Reused by Today (inline) and by Saved/Calendar
// (read-only, in a sheet). Owns its own draw/follow-up API calls so the parent
// just needs to react to onReplace().
export default function CardResult({
  card,
  source, // { mode, input } — how to "draw a different card" for the same input
  readOnly = false,
  onReplace,
  onSavedChange,
  onClose,
}) {
  const [saved, setSaved] = useState(isSaved(card.id));
  const [busy, setBusy] = useState(false);
  const [followOpen, setFollowOpen] = useState(false);
  const [followText, setFollowText] = useState("");
  const [followUsed, setFollowUsed] = useState(false);
  const [spark, setSpark] = useState(false);
  const [copied, setCopied] = useState(false);
  const [imgBusy, setImgBusy] = useState(false);
  const [err, setErr] = useState("");
  const previewRef = useRef(null);

  function onSave() {
    toggleSave(card);
    setSaved((s) => !s);
    onSavedChange?.();
  }

  async function drawDifferent() {
    if (!source) return;
    setBusy(true);
    setErr("");
    try {
      const next = await drawCard(source);
      onReplace?.(next);
    } catch (e) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  }

  async function submitFollowup() {
    const q = followText.trim();
    if (!q) return;
    setBusy(true);
    setErr("");
    try {
      const next = await drawCard({ mode: "follow_up", input: q, previousCard: card });
      next.sourceInput = q;
      onReplace?.(next);
      setFollowUsed(true);
      setFollowOpen(false);
      setFollowText("");
    } catch (e) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  }

  const sparkUrl = `${location.origin}/spark?d=${encodeSpark(card)}`;
  const sparkMsg = "Someone thought of you today \u{1F4AB}";

  const slug = (card.cardName || "dawnhalo").toLowerCase().replace(/[^a-z0-9]+/g, "-");

  // Share the card as an image via the native share sheet, with the link in the
  // text so the recipient can open the live page. Falls back to downloading.
  async function shareImage() {
    setImgBusy(true);
    setErr("");
    try {
      const blob = await renderCardPng(previewRef.current, card);
      const file = new File([blob], `${slug}.png`, { type: "image/png" });
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], text: `${sparkMsg}  ${sparkUrl}` });
      } else {
        downloadBlob(blob, `${slug}.png`);
      }
    } catch (e) {
      if (e?.name !== "AbortError") setErr("Couldn’t make the image. You can copy the link instead.");
    } finally {
      setImgBusy(false);
    }
  }

  async function saveImage() {
    setImgBusy(true);
    try {
      const blob = await renderCardPng(previewRef.current, card);
      downloadBlob(blob, `${slug}.png`);
    } catch {
      setErr("Couldn’t save the image.");
    } finally {
      setImgBusy(false);
    }
  }

  function copyLink() {
    navigator.clipboard?.writeText(sparkUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  }

  return (
    <div>
      <OracleCard card={card} animate />

      {err ? <div className="notice" style={{ marginTop: 12 }}>{err}</div> : null}

      <div className="actions">
        <button className="btn btn-gold" onClick={onSave}>
          {saved ? <CheckIcon width={17} height={17} /> : <BookmarkIcon width={17} height={17} />}
          {saved ? "Saved" : "Save this card"}
        </button>

        {!readOnly && (
          <button className="btn btn-line" onClick={drawDifferent} disabled={busy}>
            <RefreshIcon width={17} height={17} />
            {followUsed ? "Draw a new card" : "Draw a different card"}
          </button>
        )}

        {!readOnly && !followUsed && (
          <button className="btn btn-line" onClick={() => setFollowOpen((v) => !v)} disabled={busy}>
            <ChatIcon width={17} height={17} />
            Ask a follow-up
          </button>
        )}

        <button className="btn btn-line" onClick={() => setSpark(true)}>
          <SparkIcon width={17} height={17} />
          Send a Spark
        </button>
      </div>

      {busy ? (
        <div className="center-col" style={{ padding: "18px" }}>
          <div className="spin" />
          <div className="muted">Drawing your card…</div>
        </div>
      ) : null}

      {followOpen && !followUsed ? (
        <div className="input-wrap" style={{ marginTop: 12 }}>
          <textarea
            rows={1}
            autoFocus
            placeholder="One follow-up… e.g. “What does this mean for Thursday?”"
            value={followText}
            onChange={(e) => setFollowText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                submitFollowup();
              }
            }}
          />
          <button className="icon-btn send" onClick={submitFollowup} aria-label="Send follow-up">
            <SendIcon width={18} height={18} />
          </button>
        </div>
      ) : null}

      {onClose ? (
        <button className="btn btn-line btn-block" style={{ marginTop: 14 }} onClick={onClose}>
          Close
        </button>
      ) : null}

      {/* Send a Spark sheet (doc §4.6) */}
      {spark ? (
        <div className="sheet-scrim" onClick={() => setSpark(false)}>
          <div className="sheet" onClick={(e) => e.stopPropagation()}>
            <div className="sheet-handle" />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div className="eyebrow">Send a Spark</div>
              <button className="icon-btn mic" style={{ width: 34, height: 34 }} onClick={() => setSpark(false)}>
                <CloseIcon width={16} height={16} />
              </button>
            </div>
            <p className="muted" style={{ margin: "8px 0 14px" }}>
              Share this card with someone. They’ll see it on a simple page — no app needed — with a
              gentle nudge to draw their own.
            </p>
            <div ref={previewRef} style={{ maxWidth: 240, margin: "0 auto 16px" }}>
              <OracleCard card={card} />
            </div>
            <button className="btn btn-gold btn-block" onClick={shareImage} disabled={imgBusy}>
              <SparkIcon width={18} height={18} />
              {imgBusy ? "Preparing…" : "Share this card"}
            </button>
            <div className="actions" style={{ marginTop: 8 }}>
              <button className="btn btn-line" style={{ flex: 1, justifyContent: "center" }} onClick={saveImage} disabled={imgBusy}>
                <DownloadIcon width={17} height={17} />
                Save image
              </button>
              <button className="btn btn-line" style={{ flex: 1, justifyContent: "center" }} onClick={copyLink}>
                {copied ? <CheckIcon width={17} height={17} /> : <CopyIcon width={17} height={17} />}
                {copied ? "Link copied" : "Copy link"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
