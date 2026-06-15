import { useRef, useState } from "react";

// "What's on your mind?" composer (PRD §4.1, §4.3). Two explicit intents:
// "Share feeling" (feel) and "Draw a card" (ask). Voice note uses the Web Speech
// API and falls back gracefully if unsupported.
export default function Composer({ value, setValue, onDraw, remaining, busy }) {
  const [listening, setListening] = useState(false);
  const [voiceNote, setVoiceNote] = useState("");
  const recRef = useRef(null);

  function toggleVoice() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      setVoiceNote("Voice isn’t supported in this browser — type instead.");
      setTimeout(() => setVoiceNote(""), 2600);
      return;
    }
    if (listening) {
      recRef.current?.stop();
      return;
    }
    const rec = new SR();
    rec.lang = "en-US";
    rec.interimResults = false;
    rec.onresult = (e) => {
      const t = Array.from(e.results).map((r) => r[0].transcript).join(" ");
      setValue((prev) => (prev ? prev + " " : "") + t);
    };
    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);
    recRef.current = rec;
    setListening(true);
    rec.start();
  }

  const remainingLabel =
    remaining > 0 ? `${remaining} of 3 free cards remaining` : "Subscribe to draw unlimited cards";

  return (
    <div className="rounded-2xl border border-clay bg-white p-6 shadow-sm">
      <h3 className="mb-3 font-serif text-lg italic">What's on your mind?</h3>
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="h-24 w-full resize-none border-none bg-transparent p-0 text-sm font-light leading-relaxed placeholder:text-ink/30 focus:outline-none"
        placeholder="Ask a question, or simply say how you're feeling right now…"
      />
      <div className="mt-4 flex items-center justify-between border-t border-clay/60 pt-4">
        <button
          type="button"
          onClick={toggleVoice}
          className={`text-[10px] font-medium uppercase tracking-[0.18em] ${
            listening ? "text-gold" : "text-ink/40 hover:text-ink"
          }`}
        >
          {listening ? "● Listening…" : "Voice note"}
        </button>
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={busy}
            onClick={() => onDraw("feel")}
            className="rounded-full border border-ink/15 px-4 py-2 text-[11px] font-medium uppercase tracking-[0.08em] text-ink/80 hover:bg-ink/5 disabled:opacity-40"
          >
            Share feeling
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => onDraw("ask")}
            className="rounded-full bg-ink px-5 py-2 text-xs font-medium text-canvas hover:bg-gold hover:text-ink disabled:opacity-40"
          >
            {busy ? "Drawing…" : "Draw a card"}
          </button>
        </div>
      </div>
      <p className="mt-3 text-[10px] uppercase tracking-[0.18em] text-ink/35">
        {voiceNote || remainingLabel}
      </p>
    </div>
  );
}
