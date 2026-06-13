import { useState } from "react";
import { getHistory, computeStreak, todayKey } from "../store.js";

const DOW = ["S", "M", "T", "W", "T", "F", "S"];

export default function CalendarScreen({ onOpenDay }) {
  const history = getHistory();
  const streak = computeStreak();
  const now = new Date();
  const [view, setView] = useState({ year: now.getFullYear(), month: now.getMonth() });

  const monthName = new Date(view.year, view.month, 1).toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });
  const firstDow = new Date(view.year, view.month, 1).getDay();
  const daysInMonth = new Date(view.year, view.month + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < firstDow; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const keyFor = (d) =>
    `${view.year}-${String(view.month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
  const tk = todayKey();
  const isCurrentMonth = view.year === now.getFullYear() && view.month === now.getMonth();

  function shift(delta) {
    const d = new Date(view.year, view.month + delta, 1);
    setView({ year: d.getFullYear(), month: d.getMonth() });
  }

  return (
    <div className="screen">
      <div className="pad">
        <div className="eyebrow">Your rhythm</div>
        <h1 className="h1">Calendar</h1>
      </div>

      <div className="pad" style={{ paddingTop: 8 }}>
        <div className="streak">
          <span style={{ fontSize: 26 }}>✦</span>
          <div>
            <div className="num">
              {streak} {streak === 1 ? "day" : "days"}
            </div>
            <div style={{ fontSize: 13, color: "rgba(251,246,238,0.7)" }}>
              {streak > 0 ? "in a row — keep your light going" : "open the app daily to start a streak"}
            </div>
          </div>
        </div>
      </div>

      <div className="pad" style={{ paddingTop: 16, paddingBottom: 28 }}>
        <div className="month-head">
          <button className="icon-btn mic" style={{ width: 34, height: 34 }} onClick={() => shift(-1)} aria-label="Previous month">
            ‹
          </button>
          <div style={{ fontWeight: 700, color: "var(--ink)" }}>{monthName}</div>
          <button
            className="icon-btn mic"
            style={{ width: 34, height: 34, opacity: isCurrentMonth ? 0.4 : 1 }}
            onClick={() => !isCurrentMonth && shift(1)}
            disabled={isCurrentMonth}
            aria-label="Next month"
          >
            ›
          </button>
        </div>

        <div className="cal-grid">
          {DOW.map((d, i) => (
            <div className="cal-dow" key={i}>
              {d}
            </div>
          ))}
          {cells.map((d, i) => {
            if (d === null) return <div className="cal-cell empty" key={`e${i}`} />;
            const k = keyFor(d);
            const cards = history[k];
            const has = cards && cards.length > 0;
            return (
              <div
                key={k}
                className={`cal-cell ${has ? "has" : ""} ${k === tk ? "today" : ""}`}
                style={
                  has
                    ? { background: "linear-gradient(150deg, var(--gold) 0%, var(--peach) 100%)" }
                    : undefined
                }
                onClick={() => has && onOpenDay(cards, k)}
                role={has ? "button" : undefined}
              >
                {d}
                {has && cards.length > 1 ? <span className="cal-count">{cards.length}</span> : null}
              </div>
            );
          })}
        </div>
        <p className="muted" style={{ marginTop: 14 }}>
          Glowing days are days you received a card. Tap one to revisit it.
        </p>
      </div>
    </div>
  );
}
