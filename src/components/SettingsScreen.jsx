import { useState } from "react";
import { getSettings, saveSettings, getSaved, getOpens, clearAllData } from "../store.js";

// Settings (PRD §4.7): reminder time + notification toggle, plus functional
// notification test and a local-data reset.
export default function SettingsScreen({ onReset }) {
  const [s, setS] = useState(getSettings());
  const [notif, setNotif] = useState(
    typeof Notification !== "undefined" ? Notification.permission : "unsupported"
  );
  const [confirming, setConfirming] = useState(false);
  const savedCount = getSaved().length;
  const dayCount = getOpens().length;

  function update(patch) {
    const next = { ...s, ...patch };
    setS(next);
    saveSettings(next);
  }
  async function testReminder() {
    if (typeof Notification === "undefined") return;
    let p = Notification.permission;
    if (p === "default") p = await Notification.requestPermission();
    setNotif(p);
    if (p === "granted")
      new Notification("Dawnhalo", { body: "A quiet moment is waiting for you. ✦" });
  }

  return (
    <main className="mx-auto w-full max-w-md px-6 pb-32 pt-4">
      <p className="text-[10px] uppercase tracking-[0.22em] text-ink/40">Make it yours</p>
      <h2 className="mb-6 font-serif text-3xl italic">Settings</h2>

      <div className="space-y-3">
        <div className="flex items-center justify-between rounded-2xl border border-clay bg-white p-5">
          <div>
            <p className="text-sm">Daily reminder</p>
            <p className="text-[11px] text-ink/45">When your card &amp; reminders arrive</p>
          </div>
          <input
            type="time"
            value={s.reminderTime}
            onChange={(e) => update({ reminderTime: e.target.value })}
            className="rounded-lg border border-clay px-3 py-1.5 text-sm"
          />
        </div>

        <div className="flex items-center justify-between rounded-2xl border border-clay bg-white p-5">
          <div>
            <p className="text-sm">Reminder notifications</p>
            <p className="text-[11px] text-ink/45">Short affirming nudges</p>
          </div>
          <button
            type="button"
            onClick={() => update({ remindersOn: !s.remindersOn })}
            className={`relative h-7 w-12 rounded-full transition-colors ${s.remindersOn ? "bg-gold" : "bg-clay"}`}
          >
            <span
              className={`absolute top-1 size-5 rounded-full bg-white shadow transition-all ${s.remindersOn ? "left-6" : "left-1"}`}
            />
          </button>
        </div>

        <div className="flex items-center justify-between rounded-2xl border border-clay bg-white p-5">
          <div>
            <p className="text-sm">Notifications</p>
            <p className="text-[11px] text-ink/45">
              {notif === "granted"
                ? "Enabled — tap to preview"
                : notif === "denied"
                ? "Blocked in browser settings"
                : notif === "unsupported"
                ? "Not supported here"
                : "Tap to enable"}
            </p>
          </div>
          <button
            type="button"
            onClick={testReminder}
            disabled={notif === "denied" || notif === "unsupported"}
            className="rounded-full border border-ink/15 px-4 py-2 text-[11px] font-medium uppercase tracking-[0.08em] hover:bg-ink/5 disabled:opacity-40"
          >
            {notif === "granted" ? "Send test" : "Enable"}
          </button>
        </div>

        <div className="flex items-center justify-between rounded-2xl border border-clay bg-white p-5">
          <div>
            <p className="text-sm">On this device</p>
            <p className="text-[11px] text-ink/45">
              {savedCount} saved · {dayCount} {dayCount === 1 ? "day" : "days"} visited
            </p>
          </div>
          {confirming ? (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setConfirming(false)}
                className="rounded-full border border-ink/15 px-3 py-2 text-[11px] uppercase tracking-[0.08em]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  clearAllData();
                  setConfirming(false);
                  onReset?.();
                }}
                className="rounded-full bg-ink px-3 py-2 text-[11px] uppercase tracking-[0.08em] text-canvas"
              >
                Reset
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirming(true)}
              className="rounded-full border border-ink/15 px-4 py-2 text-[11px] font-medium uppercase tracking-[0.08em] hover:bg-ink/5"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      <p className="mt-8 text-center text-[10px] uppercase tracking-[0.18em] text-ink/30">
        Dawnhalo · English (US/UK) · data stays on this device
      </p>
    </main>
  );
}
