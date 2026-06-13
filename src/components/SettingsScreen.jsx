import { useState } from "react";
import { getSettings, saveSettings, getSaved, getHistory, clearAllData } from "../store.js";

export default function SettingsScreen({ onReset }) {
  const [s, setS] = useState(getSettings());
  const [notif, setNotif] = useState(
    typeof Notification !== "undefined" ? Notification.permission : "unsupported"
  );
  const [confirming, setConfirming] = useState(false);

  const savedCount = getSaved().length;
  const dayCount = Object.keys(getHistory()).length;

  function update(patch) {
    const next = { ...s, ...patch };
    setS(next);
    saveSettings(next);
  }

  async function testReminder() {
    if (typeof Notification === "undefined") return;
    let perm = Notification.permission;
    if (perm === "default") perm = await Notification.requestPermission();
    setNotif(perm);
    if (perm === "granted") {
      new Notification("Dawnhalo", {
        body: "You're doing better than you think. ✦",
      });
    }
  }

  function reset() {
    clearAllData();
    setConfirming(false);
    onReset?.();
  }

  return (
    <div className="screen">
      <div className="pad">
        <div className="eyebrow">Make it yours</div>
        <h1 className="h1">Settings</h1>
      </div>

      <div className="pad" style={{ paddingTop: 8, display: "flex", flexDirection: "column", gap: 10 }}>
        <div className="eyebrow dim">Daily ritual</div>
        <div className="row">
          <div>
            <div className="label">Daily reminder time</div>
            <div className="desc">When your daily card &amp; reminders arrive</div>
          </div>
          <input
            type="time"
            value={s.reminderTime}
            onChange={(e) => update({ reminderTime: e.target.value })}
          />
        </div>

        <div className="row">
          <div>
            <div className="label">“Reminders for today” notifications</div>
            <div className="desc">Short affirming nudges through the day</div>
          </div>
          <button
            className={`toggle ${s.remindersOn ? "on" : ""}`}
            onClick={() => update({ remindersOn: !s.remindersOn })}
            aria-label="Toggle reminders"
          />
        </div>

        <div className="row">
          <div>
            <div className="label">Notifications</div>
            <div className="desc">
              {notif === "granted"
                ? "Enabled — tap to send a test"
                : notif === "denied"
                ? "Blocked in your browser settings"
                : notif === "unsupported"
                ? "Not supported in this browser"
                : "Tap to enable & preview"}
            </div>
          </div>
          <button
            className="btn btn-line"
            onClick={testReminder}
            disabled={notif === "denied" || notif === "unsupported"}
          >
            {notif === "granted" ? "Send test" : "Enable"}
          </button>
        </div>

        <div className="eyebrow dim" style={{ marginTop: 8 }}>
          Your data
        </div>
        <div className="row">
          <div>
            <div className="label">Stored on this device</div>
            <div className="desc">
              {savedCount} saved · {dayCount} {dayCount === 1 ? "day" : "days"} of history
            </div>
          </div>
          {confirming ? (
            <div style={{ display: "flex", gap: 6 }}>
              <button className="btn btn-line" onClick={() => setConfirming(false)}>
                Cancel
              </button>
              <button className="btn btn-gold" onClick={reset}>
                Reset
              </button>
            </div>
          ) : (
            <button className="btn btn-line" onClick={() => setConfirming(true)}>
              Reset
            </button>
          )}
        </div>

        <div className="notice" style={{ marginTop: 6 }}>
          A home-screen widget showing today’s card is planned for a later version. The card art is
          already designed to read well at small sizes.
        </div>

        <p className="muted" style={{ textAlign: "center", marginTop: 10 }}>
          Dawnhalo · prototype · English (US/UK) · data stays on this device
        </p>
      </div>
    </div>
  );
}
