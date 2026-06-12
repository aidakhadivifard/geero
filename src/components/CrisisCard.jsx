// Crisis response (doc §4.3 Case C): never an oracle card — a gentle message and
// real support resources. Rendered instead of CardResult when card.isCrisis.
export default function CrisisCard({ card, onClose }) {
  return (
    <div className="crisis">
      <div className="eyebrow dim">A gentle pause</div>
      <h2>{card.cardName}</h2>
      <p className="muted" style={{ marginTop: 8, lineHeight: 1.5 }}>
        {card.message}
      </p>
      <p style={{ marginTop: 10, fontSize: 14, color: "var(--ink)" }}>{card.context}</p>
      <div style={{ marginTop: 14 }}>
        {card.resources?.map((r) => (
          <div className="resource" key={r.name}>
            <div className="rg">{r.region}</div>
            <div className="rn">{r.name}</div>
            <div className="rc">{r.contact}</div>
          </div>
        ))}
      </div>
      {onClose ? (
        <button className="btn btn-line btn-block" style={{ marginTop: 16 }} onClick={onClose}>
          Close
        </button>
      ) : null}
    </div>
  );
}
