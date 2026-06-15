import { useEffect, useState } from "react";
import CardResult from "./CardResult.jsx";
import Composer from "./Composer.jsx";
import CrisisPanel from "./CrisisPanel.jsx";
import Paywall from "./Paywall.jsx";
import Plans from "./Plans.jsx";
import { drawCard, health } from "../api.js";
import { detectCrisis } from "../../shared/crisis.js";
import {
  uid,
  todayKey,
  freeRemaining,
  consumeFree,
  getCachedDaily,
  cacheDaily,
  recordCard,
} from "../store.js";

function decorate(raw, intent, input) {
  if (raw.isCrisis) return raw;
  return {
    ...raw,
    id: `${intent}-${todayKey()}-${uid()}`,
    intent,
    date: todayKey(),
    prompt: input || null,
    createdAt: Date.now(),
  };
}

const niceDate = () =>
  new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" });

export default function TodayScreen({ onActivity }) {
  const [daily, setDaily] = useState(null);
  const [current, setCurrent] = useState(null);
  const [followUsed, setFollowUsed] = useState(false);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [crisis, setCrisis] = useState(false);
  const [paywall, setPaywall] = useState(false);
  const [remaining, setRemaining] = useState(freeRemaining());
  const [err, setErr] = useState("");
  const [info, setInfo] = useState(null);

  useEffect(() => {
    let off = false;
    (async () => {
      const h = await health();
      if (!off) setInfo(h);
      const cached = getCachedDaily();
      if (cached) {
        if (!off) {
          setDaily(cached);
          setCurrent(cached);
          setLoading(false);
        }
        return;
      }
      try {
        const raw = await drawCard({ intent: "daily" });
        const card = decorate(raw, "daily", "");
        cacheDaily(card);
        recordCard(card);
        if (!off) {
          setDaily(card);
          setCurrent(card);
          onActivity?.();
        }
      } catch (e) {
        if (!off) setErr(e.message);
      } finally {
        if (!off) setLoading(false);
      }
    })();
    return () => {
      off = true;
    };
  }, []);

  async function draw(intent) {
    const input = text.trim();
    if (!input || busy) return;
    setErr("");
    if (detectCrisis(input)) {
      setCrisis(true);
      return;
    }
    if (freeRemaining() <= 0) {
      setPaywall(true);
      return;
    }
    setBusy(true);
    try {
      const raw = await drawCard({ intent, input });
      if (raw.isCrisis) {
        setCrisis(true);
        return;
      }
      const card = decorate(raw, intent, input);
      setCurrent(card);
      setFollowUsed(false);
      setRemaining(consumeFree());
      recordCard(card);
      setText("");
      onActivity?.();
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (e) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  }

  async function followUp(question) {
    const raw = await drawCard({ intent: "follow", input: question, previous: current });
    if (raw.isCrisis) {
      setCrisis(true);
      return;
    }
    const card = decorate(raw, "follow", question);
    setCurrent(card);
    setFollowUsed(true);
    recordCard(card);
    onActivity?.();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function resetToToday() {
    setCurrent(daily);
    setFollowUsed(false);
  }
  function seePlans() {
    setPaywall(false);
    document.getElementById("plans")?.scrollIntoView({ behavior: "smooth" });
  }

  const showReset = current && daily && current.id !== daily.id;

  return (
    <main className="mx-auto w-full max-w-md px-6 pb-32">
      <section className="mb-10 pt-2">
        <p className="mb-1 text-center text-[10px] uppercase tracking-[0.22em] text-ink/40">
          {niceDate()}
        </p>
        <p className="mb-5 text-center text-[10px] uppercase tracking-[0.22em] text-ink/40">
          {showReset ? "Drawn for you" : "Your morning perspective"}
        </p>

        {info && info.ok && !info.apiKey && !info.fallback ? (
          <div className="mb-5 rounded-xl border border-gold/40 bg-gold/10 p-3 text-[11px] leading-relaxed text-ink/70">
            No API key set. Add <b>ANTHROPIC_API_KEY</b> to <b>.env</b> and restart, or set{" "}
            <b>DAWNHALO_ALLOW_FALLBACK=1</b> for offline demo cards.
          </div>
        ) : null}

        {loading ? (
          <div className="flex flex-col items-center gap-3 py-16">
            <span className="dh-spin" />
            <p className="text-[11px] uppercase tracking-[0.18em] text-ink/40">
              Drawing today’s card…
            </p>
          </div>
        ) : current ? (
          <CardResult
            key={current.id}
            card={current}
            animate
            onReset={showReset ? resetToToday : null}
            canFollowUp={!followUsed}
            onFollowUp={followUp}
            onSavedChange={onActivity}
          />
        ) : err ? (
          <div className="rounded-2xl border border-clay bg-white p-6 text-sm text-ink/70">{err}</div>
        ) : null}
      </section>

      <section className="space-y-6">
        {crisis ? (
          <CrisisPanel onClose={() => setCrisis(false)} />
        ) : (
          <>
            <Composer
              value={text}
              setValue={setText}
              onDraw={draw}
              remaining={remaining}
              busy={busy}
            />
            {err && current ? (
              <p className="text-center text-[11px] text-ink/50">{err}</p>
            ) : null}
          </>
        )}
      </section>

      <Plans onSeePlans={seePlans} />

      {paywall ? <Paywall onClose={() => setPaywall(false)} onSeePlans={seePlans} /> : null}
    </main>
  );
}
