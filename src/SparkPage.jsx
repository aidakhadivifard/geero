import CardView from "./components/CardView.jsx";
import { decodeSpark } from "./store.js";

// Recipient-facing web view (PRD §4.6): lightweight, no app, no login. The card
// (and an optional personal note) travel in the URL (?d=...). Layout mirrors the
// Lovable share page.
export default function SparkPage() {
  const card = decodeSpark(new URLSearchParams(location.search).get("d") || "");

  return (
    <div className="flex min-h-screen flex-col">
      <header className="mx-auto flex w-full max-w-md items-center justify-between px-6 pt-8 pb-2">
        <div className="flex items-center gap-2">
          <span className="size-2 animate-pulse rounded-full bg-gold" />
          <span className="font-serif text-xl italic tracking-wide">Dawnhalo</span>
        </div>
        <a
          href="/"
          className="text-[10px] font-medium uppercase tracking-[0.18em] text-ink/50 hover:text-ink"
        >
          Open app
        </a>
      </header>

      <main className="mx-auto flex w-full max-w-md flex-1 flex-col px-6 pb-16">
        {card ? (
          <>
            <p className="mt-6 text-center text-[10px] uppercase tracking-[0.22em] text-ink/40">
              For you
            </p>
            <h1 className="mb-8 mt-1 text-center font-serif text-3xl italic leading-tight text-balance">
              Someone was thinking of you today ✦
            </h1>

            <CardView card={{ ...card, eyebrow: "A card, sent your way" }} animate />

            {card.note ? (
              <div className="mt-5 rounded-2xl border border-clay bg-white p-5">
                <p className="font-serif text-[13px] italic text-gold">A note</p>
                <p className="mt-1 text-sm font-light italic leading-relaxed text-ink/75">
                  “{card.note}”
                </p>
              </div>
            ) : null}

            <a
              href="/"
              className="mt-8 block rounded-full bg-ink py-4 text-center text-xs font-semibold uppercase tracking-[0.2em] text-canvas hover:bg-gold hover:text-ink"
            >
              Draw your own card
            </a>
            <p className="mt-3 text-center text-[10px] uppercase tracking-[0.18em] text-ink/35">
              A daily moment of perspective
            </p>
          </>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center text-center">
            <p className="font-serif text-2xl italic">This spark couldn’t be opened.</p>
            <a
              href="/"
              className="mt-6 inline-block rounded-full bg-ink px-8 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-canvas"
            >
              Open Dawnhalo
            </a>
          </div>
        )}
      </main>
    </div>
  );
}
