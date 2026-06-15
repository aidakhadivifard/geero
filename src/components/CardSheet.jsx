import CardResult from "./CardResult.jsx";

// Read-only viewer for cards opened from Saved/Calendar (PRD §4.4/§4.5).
// No follow-up or re-draw; Collect (toggle) and Send a Spark remain.
export default function CardSheet({ title, cards, onClose, onSavedChange }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="dh-sheet no-scrollbar max-h-[88vh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-canvas p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <span className="text-[10px] uppercase tracking-[0.22em] text-ink/40">{title}</span>
          <button
            type="button"
            onClick={onClose}
            className="text-[10px] font-medium uppercase tracking-[0.16em] text-ink/50 hover:text-ink"
          >
            Close
          </button>
        </div>
        <div className="space-y-8">
          {cards.map((c, i) => (
            <CardResult key={c.id || i} card={c} readOnly onSavedChange={onSavedChange} />
          ))}
        </div>
      </div>
    </div>
  );
}
