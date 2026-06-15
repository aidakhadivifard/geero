import { useState } from "react";
import { getHistory, getOpens, computeStreak, todayKey, washClass } from "../store.js";

const DOW = ["S", "M", "T", "W", "T", "F", "S"];

// Monthly calendar + streak (PRD §4.5). Days the user opened the app (or received
// a card) get a colored dot; tapping a day with cards opens them.
export default function CalendarScreen({ onOpenDay }) {
  const history = getHistory();
  const opens = new Set(getOpens());
  const streak = computeStreak();
  const now = new Date();
  const [view, setView] = useState({ y: now.getFullYear(), m: now.getMonth() });

  const monthName = new Date(view.y, view.m, 1).toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });
  const firstDow = new Date(view.y, view.m, 1).getDay();
  const days = new Date(view.y, view.m + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < firstDow; i++) cells.push(null);
  for (let d = 1; d <= days; d++) cells.push(d);

  const keyFor = (d) => `${view.y}-${String(view.m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
  const tk = todayKey();
  const isCurrent = view.y === now.getFullYear() && view.m === now.getMonth();
  const shift = (delta) => {
    const d = new Date(view.y, view.m + delta, 1);
    setView({ y: d.getFullYear(), m: d.getMonth() });
  };

  return (
    <main className="mx-auto w-full max-w-md px-6 pb-32 pt-4">
      <p className="text-[10px] uppercase tracking-[0.22em] text-ink/40">Your rhythm</p>
      <h2 className="mb-5 font-serif text-3xl italic">Calendar</h2>

      <div className="mb-6 flex items-center gap-4 rounded-2xl bg-ink p-5 text-canvas">
        <span className="font-serif text-4xl italic text-gold tabular-nums">{streak}</span>
        <div>
          <p className="text-sm font-medium">{streak === 1 ? "day" : "days"} in a row</p>
          <p className="text-[11px] opacity-60">
            {streak > 0 ? "Keep the ritual going." : "Open the app daily to begin a streak."}
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-clay bg-white p-5">
        <div className="mb-4 flex items-center justify-between">
          <button type="button" onClick={() => shift(-1)} className="px-2 text-lg text-ink/50 hover:text-ink">
            ‹
          </button>
          <span className="text-sm font-medium">{monthName}</span>
          <button
            type="button"
            onClick={() => !isCurrent && shift(1)}
            disabled={isCurrent}
            className={`px-2 text-lg ${isCurrent ? "text-ink/20" : "text-ink/50 hover:text-ink"}`}
          >
            ›
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1.5 text-center">
          {DOW.map((d, i) => (
            <div key={i} className="text-[9px] font-semibold uppercase tracking-wide text-ink/30">
              {d}
            </div>
          ))}
          {cells.map((d, i) => {
            if (d === null) return <div key={`e${i}`} />;
            const k = keyFor(d);
            const cards = history[k];
            const has = cards && cards.length > 0;
            const opened = opens.has(k);
            return (
              <button
                key={k}
                type="button"
                disabled={!has}
                onClick={() => has && onOpenDay(cards, k)}
                className={`relative flex aspect-square items-center justify-center rounded-lg text-[12px] ${
                  k === tk ? "ring-1 ring-gold" : ""
                } ${has ? "font-medium text-ink" : "text-ink/45"}`}
              >
                {has ? (
                  <span className={`absolute inset-1 rounded-md ${washClass(cards[0].id || cards[0].title)}`} />
                ) : null}
                <span className="relative">{d}</span>
                {!has && opened ? (
                  <span className="absolute bottom-1 size-1 rounded-full bg-gold/70" />
                ) : null}
              </button>
            );
          })}
        </div>
        <p className="mt-4 text-[11px] leading-relaxed text-ink/45">
          Tinted days hold a card — tap to revisit. A small dot marks a day you simply showed up.
        </p>
      </div>
    </main>
  );
}
