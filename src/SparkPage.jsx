import CardView from "./components/CardView.jsx";
import { decodeSpark } from "./store.js";

// Recipient-facing web view (PRD §4.6): lightweight, no app, no login. The card
// travels in the URL (?d=...). CTA links back to draw your own.
export default function SparkPage() {
  const card = decodeSpark(new URLSearchParams(location.search).get("d") || "");

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 py-12">
      <div className="flex items-center gap-2 pb-6">
        <span className="size-2 animate-pulse rounded-full bg-gold" />
        <span className="font-serif text-xl italic tracking-wide">Dawnhalo</span>
      </div>

      {card ? (
        <>
          <p className="mb-4 text-center text-[10px] uppercase tracking-[0.22em] text-ink/40">
            Someone thought of you today ✦
          </p>
          <div className="w-full max-w-sm">
            <CardView card={{ ...card, eyebrow: "A card, sent to you" }} animate />
          </div>
          <a
            href="/"
            className="mt-8 block rounded-full bg-ink px-8 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-canvas hover:bg-gold hover:text-ink"
          >
            Draw your own card
          </a>
          <p className="mt-3 text-[10px] uppercase tracking-[0.18em] text-ink/35">
            A daily moment of perspective
          </p>
        </>
      ) : (
        <div className="text-center">
          <p className="font-serif text-2xl italic">This spark couldn’t be opened.</p>
          <a
            href="/"
            className="mt-6 inline-block rounded-full bg-ink px-8 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-canvas"
          >
            Open Dawnhalo
          </a>
        </div>
      )}
    </div>
  );
}
