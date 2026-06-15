// Upsell block + pricing (PRD pricing structure preserved from the prototype:
// $4.99/mo billed yearly, $9.99/mo monthly).
export default function Plans({ onSeePlans }) {
  return (
    <>
      <div className="mt-16 rounded-3xl bg-ink p-8 text-center text-canvas">
        <p className="mb-4 font-serif text-2xl italic">Deeper reflection awaits.</p>
        <p className="mx-auto mb-8 max-w-[22ch] text-xs font-light leading-relaxed opacity-60">
          Unlock unlimited cards, personalized responses, and your full archive.
        </p>
        <button
          type="button"
          onClick={onSeePlans}
          className="block w-full rounded-full bg-gold py-4 text-xs font-semibold uppercase tracking-[0.2em] text-ink"
        >
          See plans
        </button>
        <p className="mt-3 text-[10px] opacity-40">Cancel anytime.</p>
      </div>

      <section id="plans" className="mt-16">
        <h3 className="mb-6 text-center font-serif text-2xl italic">Keep the ritual going.</h3>
        <div className="space-y-3">
          <div className="w-full rounded-2xl border border-ink bg-white p-5">
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-gold">
              Best value · save 50%
            </p>
            <div className="flex items-baseline justify-between">
              <div>
                <p className="font-serif text-xl italic">Yearly</p>
                <p className="mt-1 text-[11px] text-ink/50">Billed once a year at $59.99</p>
              </div>
              <div className="text-right">
                <p className="font-serif text-3xl italic">$4.99</p>
                <p className="text-[10px] uppercase tracking-[0.15em] text-ink/40">/ month</p>
              </div>
            </div>
          </div>
          <div className="w-full rounded-2xl border border-clay bg-white/60 p-5">
            <div className="flex items-baseline justify-between">
              <div>
                <p className="font-serif text-xl italic">Monthly</p>
                <p className="mt-1 text-[11px] text-ink/50">Billed monthly. Cancel anytime.</p>
              </div>
              <div className="text-right">
                <p className="font-serif text-3xl italic">$9.99</p>
                <p className="text-[10px] uppercase tracking-[0.15em] text-ink/40">/ month</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
