import OracleCard from "./components/OracleCard.jsx";
import { SparkIcon } from "./components/icons.jsx";
import { decodeSpark } from "./store.js";

// Recipient-facing web view (doc §4.6): a separate, lightweight surface. No login,
// no full app — just the card, beautifully presented, and a "Draw your own card"
// CTA. The card travels entirely in the URL (?d=...), so no backend is needed.
export default function SparkPage() {
  const params = new URLSearchParams(location.search);
  const card = decodeSpark(params.get("d") || "");

  if (!card) {
    return (
      <div className="spark-page">
        <div className="spark-tag">This spark couldn’t be opened.</div>
        <a className="btn btn-gold" href="/">
          Open Dawnhalo
        </a>
      </div>
    );
  }

  return (
    <div className="spark-page">
      <div className="spark-tag">Someone thought of you today ✦</div>
      <div className="spark-frame">
        <OracleCard card={card} animate />
      </div>
      <p className="spark-cta">A little light from a friend, via Dawnhalo.</p>
      <a className="btn btn-gold" href="/" style={{ textDecoration: "none" }}>
        <SparkIcon width={18} height={18} />
        Draw your own card
      </a>
    </div>
  );
}
