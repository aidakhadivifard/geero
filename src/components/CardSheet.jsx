import CardResult from "./CardResult.jsx";
import CrisisCard from "./CrisisCard.jsx";
import { CloseIcon } from "./icons.jsx";

// Read-only viewer used when opening a card from Saved or Calendar (doc §4.4/4.5).
// No new follow-up or re-draw; Save (toggle) and Send a Spark remain available.
export default function CardSheet({ title, cards, onClose, onSavedChange }) {
  return (
    <div className="sheet-scrim" onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <div className="sheet-handle" />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
          <div className="eyebrow">{title}</div>
          <button className="icon-btn mic" style={{ width: 34, height: 34 }} onClick={onClose}>
            <CloseIcon width={16} height={16} />
          </button>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          {cards.map((c, i) =>
            c.isCrisis ? (
              <CrisisCard key={i} card={c} />
            ) : (
              <CardResult key={c.id || i} card={c} readOnly onSavedChange={onSavedChange} />
            )
          )}
        </div>
      </div>
    </div>
  );
}
