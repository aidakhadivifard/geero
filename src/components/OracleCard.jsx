import { Illustration } from "../illustrations/index.jsx";

// The reusable visual "card object" (doc §4.2): illustration + name + message,
// plus the short context line. Used on Today, in the result sheet, and on the
// recipient Spark page.
export default function OracleCard({ card, compact = false, animate = false }) {
  return (
    <div className={`card ${compact ? "compact" : ""} ${animate ? "card-enter" : ""}`}>
      <div className="card-art">
        <Illustration theme={card.theme} />
      </div>
      <h2 className="card-name">{card.cardName}</h2>
      <p className="card-msg">{card.message}</p>
      {card.context ? <p className="card-ctx">{card.context}</p> : null}
    </div>
  );
}
