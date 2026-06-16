// Crisis support (PRD §4.3 Case C). Copy and numbers kept verbatim from the
// prototype. Shown instead of a card — overrides all other logic.
export default function CrisisPanel({ onClose }) {
  return (
    <div className="rounded-2xl border border-ink/15 bg-white p-6 dh-rise">
      <p className="font-serif text-xl italic">I want to pause here with you.</p>
      <p className="mt-3 text-sm leading-relaxed text-ink/75">
        What you wrote sounds like more than a hard day. A card isn't the right thing to offer right
        now — a real person is. In the US, call or text{" "}
        <a
          href="tel:988"
          className="font-medium text-ink underline underline-offset-4 hover:text-gold"
        >
          988
        </a>
        . In the UK, call{" "}
        <a
          href="tel:116123"
          className="font-medium text-ink underline underline-offset-4 hover:text-gold"
        >
          116 123
        </a>{" "}
        for the Samaritans. They're free, confidential, and available any hour.
      </p>
      <div className="mt-5 flex justify-end">
        <button
          type="button"
          onClick={onClose}
          className="text-[10px] font-medium uppercase tracking-[0.18em] text-ink/60 hover:text-ink"
        >
          Close
        </button>
      </div>
    </div>
  );
}
