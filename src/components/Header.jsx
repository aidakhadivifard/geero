// App header — logo, streak counter (PRD §4.5), and avatar — from the prototype.
export default function Header({ streak }) {
  return (
    <header className="mx-auto flex w-full max-w-md items-center justify-between px-6 pt-8 pb-2">
      <div className="flex items-center gap-2">
        <span className="size-2 animate-pulse rounded-full bg-gold" />
        <span className="font-serif text-xl italic tracking-wide">Dawnhalo</span>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5 text-ink/60">
          <span className="text-[10px] uppercase tracking-[0.18em]">Streak</span>
          <span className="text-sm font-medium tabular-nums">{streak}</span>
        </div>
        <div className="flex size-8 items-center justify-center rounded-full border border-ink/10 text-[11px] font-medium">
          M
        </div>
      </div>
    </header>
  );
}
