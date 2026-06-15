import { useState } from "react";
import { getSaved, removeSaved, washClass } from "../store.js";

// Saved cards (PRD §4.4): grid with name + message + date. Tap reopens the card
// result read-only (Send a Spark still available).
export default function SavedScreen({ onOpen }) {
  const [items, setItems] = useState(getSaved());

  return (
    <main className="mx-auto w-full max-w-md px-6 pb-32 pt-4">
      <p className="text-[10px] uppercase tracking-[0.22em] text-ink/40">Your archive</p>
      <h2 className="mb-1 font-serif text-3xl italic">Saved</h2>
      <p className="mb-6 text-xs text-ink/50">
        {items.length} {items.length === 1 ? "card" : "cards"} collected
      </p>

      {items.length === 0 ? (
        <div className="rounded-2xl border border-clay bg-white p-8 text-center">
          <div className={`mx-auto mb-4 size-16 rounded-xl ${washClass("empty")}`} />
          <p className="text-sm font-light leading-relaxed text-ink/55">
            Cards you collect will rest here — a quiet archive of the moments that met you.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {items.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => onOpen(c)}
              className="overflow-hidden rounded-2xl border border-clay bg-white text-left"
            >
              <div className={`relative aspect-[4/3] ${washClass(c.id || c.title)}`}>
                <div className="absolute inset-0 flex items-center justify-center bg-canvas/20 p-3 backdrop-blur-[1px]">
                  <p className="line-clamp-3 text-center font-serif text-[13px] italic leading-tight text-ink">
                    “{c.title}”
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between px-3 py-2">
                <span className="text-[10px] uppercase tracking-[0.12em] text-ink/40">
                  {new Date(c.savedAt || c.createdAt).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                  })}
                </span>
                <span
                  role="button"
                  aria-label="Remove"
                  onClick={(e) => {
                    e.stopPropagation();
                    setItems(removeSaved(c.id));
                  }}
                  className="text-[12px] text-ink/30 hover:text-ink"
                >
                  ×
                </span>
              </div>
            </button>
          ))}
        </div>
      )}
    </main>
  );
}
