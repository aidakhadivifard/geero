import { washClass } from "../store.js";

const EYEBROWS = {
  daily: "Your morning perspective",
  ask: "A response to your question",
  feel: "A response to what you're holding",
  follow: "A little more",
};

// The visual card object (PRD §4.2), markup matched to the prototype.
export default function CardView({ card, animate = false }) {
  const wash = card.wash || washClass(card.id || card.title);
  const eyebrow = card.eyebrow || EYEBROWS[card.intent] || EYEBROWS.daily;
  return (
    <article
      className={`relative aspect-[3/4] w-full overflow-hidden rounded-2xl shadow-2xl shadow-clay/50 ${wash}`}
    >
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-canvas/30 p-8 text-center backdrop-blur-[2px]">
        <div className="mb-6 h-10 w-px bg-gold/50" />
        <p className="mb-5 text-[10px] uppercase tracking-[0.22em] text-ink/50">{eyebrow}</p>
        <h2
          className={`font-serif text-[1.7rem] italic leading-[1.15] text-ink text-balance ${animate ? "dh-rise" : ""}`}
        >
          {`“${card.title}”`}
        </h2>
        {card.body ? (
          <p className="mt-5 max-w-[22ch] text-sm font-light leading-relaxed text-ink/65">
            {card.body}
          </p>
        ) : null}
        <div className="mt-6 h-10 w-px bg-gold/50" />
      </div>
    </article>
  );
}
