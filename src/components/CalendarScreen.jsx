import { getHistory, computeStreak, todayKey } from "../store.js";

const DOW = ["S", "M", "T", "W", "T", "F", "S"];

export default function CalendarScreen({ onOpenDay }) {
  const history = getHistory();
  const streak = computeStreak();
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const monthName = now.toLocaleDateString(undefined, { month: "long", year: "numeric" });

  const firstDow = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < firstDow; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const keyFor = (d) =>
    `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
  const tk = todayKey();

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
        <div style={{ fontWeight: 700, color: "var(--ink)", marginBottom: 10 }}>{monthName}</div>
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
