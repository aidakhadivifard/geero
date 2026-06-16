const TABS = [
  { id: "today", label: "Today" },
  { id: "saved", label: "Saved" },
  { id: "calendar", label: "Calendar" },
  { id: "settings", label: "Settings" },
];

// Bottom navigation for the added screens (PRD §4.1 nav). Styled to match the
// canvas/ink aesthetic; the Today screen itself keeps the prototype layout.
export default function BottomNav({ tab, setTab }) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-clay bg-canvas/90 backdrop-blur">
      <div className="mx-auto grid w-full max-w-md grid-cols-4">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`flex flex-col items-center gap-1 py-3 text-[10px] font-medium uppercase tracking-[0.16em] ${
              tab === t.id ? "text-ink" : "text-ink/40 hover:text-ink/70"
            }`}
          >
            <span
              className={`size-1.5 rounded-full ${tab === t.id ? "bg-gold" : "bg-transparent"}`}
            />
            {t.label}
          </button>
        ))}
      </div>
    </nav>
  );
}
