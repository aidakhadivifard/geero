import { useEffect, useRef, useState } from "react";
import CardResult from "./CardResult.jsx";
import CrisisCard from "./CrisisCard.jsx";
import { MicIcon, SendIcon } from "./icons.jsx";
import { drawCard, health } from "../api.js";
import {
  uid,
  getCachedDaily,
  cacheDaily,
  recordHistory,
} from "../store.js";

function decorate(raw, sourceInput) {
  if (raw.isCrisis) return raw;
  return { ...raw, id: uid(), createdAt: Date.now(), sourceInput };
}

const niceDate = () =>
  new Date().toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

export default function TodayScreen({ onActivity }) {
  const [daily, setDaily] = useState(null);
  const [result, setResult] = useState(null); // currently displayed card
  const [source, setSource] = useState({ mode: "daily" });
  const [loading, setLoading] = useState(true);
  const [drawing, setDrawing] = useState(false);
  const [text, setText] = useState("");
  const [err, setErr] = useState("");
  const [info, setInfo] = useState(null);
  const [listening, setListening] = useState(false);
  const recRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const h = await health();
      if (!cancelled) setInfo(h);
      const cached = getCachedDaily();
      if (cached) {
        if (!cancelled) {
          setDaily(cached);
          setResult(cached);
          setLoading(false);
        }
        return;
      }
      try {
        const raw = await drawCard({ mode: "daily" });
        const card = decorate(raw, null);
        cacheDaily(card);
        recordHistory(card);
        if (!cancelled) {
          setDaily(card);
          setResult(card);
        }
      } catch (e) {
        if (!cancelled) setErr(e.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function submit() {
    const input = text.trim();
    if (!input || drawing) return;
    setDrawing(true);
    setErr("");
    try {
      const raw = await drawCard({ mode: "input", input });
      const card = decorate(raw, input);
      setResult(card);
      setSource({ mode: "input", input });
      recordHistory(card);
      onActivity?.();
      setText("");
    } catch (e) {
      setErr(e.message);
    } finally {
      setDrawing(false);
    }
  }

  function onReplace(raw) {
    const card = decorate(raw, source.input ?? null);
    setResult(card);
    recordHistory(card);
    onActivity?.();
  }

  function backToDaily() {
    setResult(daily);
    setSource({ mode: "daily" });
  }

  function toggleMic() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      // Prototype fallback (doc §4.3: voice can be mocked).
      setText((t) => (t ? t : "I'm feeling a little overwhelmed today"));
      return;
    }
    if (listening) {
      recRef.current?.stop();
      return;
    }
    const rec = new SR();
    rec.lang = "en-US";
    rec.interimResults = false;
    rec.onresult = (e) => {
      const t = Array.from(e.results).map((r) => r[0].transcript).join(" ");
      setText((prev) => (prev ? prev + " " : "") + t);
    };
    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);
    recRef.current = rec;
    setListening(true);
    rec.start();
  }

  const showingDaily = result && daily && result.id === daily.id;

  return (
    <div className="screen">
      <div className="pad">
        <div className="eyebrow">{niceDate()}</div>
        <h1 className="h1">{showingDaily ? "Today’s card" : "For you"}</h1>
      </div>

      <div style={{ padding: "10px 18px 0" }}>
        {info && info.ok && !info.apiKey && !info.fallback ? (
          <div className="notice" style={{ marginBottom: 14 }}>
            No API key configured yet. Add <b>ANTHROPIC_API_KEY</b> to <b>.env</b> and restart the
            server to generate real cards (or set <b>DAWNHALO_ALLOW_FALLBACK=1</b> for demo cards).
          </div>
        ) : null}

        {loading ? (
          <div className="center-col">
            <div className="spin" />
            <div className="muted">Drawing today’s card…</div>
          </div>
        ) : err && !result ? (
          <div className="notice">{err}</div>
        ) : result && result.isCrisis ? (
          <CrisisCard card={result} onClose={backToDaily} />
        ) : result ? (
          <>
            {!showingDaily && (
              <button
                className="btn btn-line"
                style={{ marginBottom: 10 }}
                onClick={backToDaily}
              >
                ← Today’s card
              </button>
            )}
            <CardResult
              key={result.id}
              card={result}
              source={source}
              onReplace={onReplace}
              onSavedChange={onActivity}
            />
          </>
        ) : null}
      </div>

      {/* open input — feeds both "Ask the deck" and "How are you feeling" (doc §4.1/4.3) */}
      <div className="pad" style={{ paddingTop: 18 }}>
        <div className="eyebrow dim">Have something on your mind?</div>
        <div className="input-wrap">
          <textarea
            rows={1}
            placeholder="Ask the deck, or share how you’re feeling…"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                submit();
              }
            }}
          />
          <button
            className={`icon-btn mic ${listening ? "live" : ""}`}
            onClick={toggleMic}
            aria-label="Voice input"
          >
            <MicIcon width={18} height={18} />
          </button>
          <button className="icon-btn send" onClick={submit} aria-label="Send" disabled={drawing}>
            <SendIcon width={18} height={18} />
          </button>
        </div>
      </div>

      {/* Reminders for today (doc §4.1) */}
      {daily?.reminders?.length ? (
        <div className="pad" style={{ paddingTop: 8, paddingBottom: 24 }}>
          <div className="eyebrow dim" style={{ marginBottom: 8 }}>
            Reminders for today
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {daily.reminders.map((r, i) => (
              <div className="reminder" key={i}>
                <span style={{ color: "var(--peach)" }}>✦</span>
                <span>{r}</span>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
