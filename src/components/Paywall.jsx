// Paywall modal (PRD pricing), design preserved from the prototype.
export default function Paywall({ onClose, onSeePlans }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="dh-sheet w-full max-w-md rounded-t-3xl bg-canvas p-8 text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="text-[10px] uppercase tracking-[0.22em] text-ink/40">
          You've used your free draws
        </p>
        <h3 className="mt-3 font-serif text-3xl italic">Keep the ritual going.</h3>
        <p className="mx-auto mt-3 max-w-[26ch] text-sm font-light text-ink/60">
          Unlimited cards, personalized responses, and full history.
        </p>
        <button
          type="button"
          onClick={onSeePlans}
          className="mt-6 block w-full rounded-full bg-ink py-4 text-xs font-semibold uppercase tracking-[0.2em] text-canvas"
        >
          See plans
        </button>
        <button
          type="button"
          onClick={onClose}
          className="mt-4 text-[10px] font-medium uppercase tracking-[0.18em] text-ink/50"
        >
          Maybe later
        </button>
      </div>
    </div>
  );
}
