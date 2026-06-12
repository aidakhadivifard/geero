import { useState } from "react";
import { getSettings, saveSettings } from "../store.js";

export default function SettingsScreen() {
  const [s, setS] = useState(getSettings());

  function update(patch) {
    const next = { ...s, ...patch };
    setS(next);
    saveSettings(next);
  }

  return (
    <div className="screen">
      <div className="pad">
        <div className="eyebrow">Make it yours</div>
        <h1 className="h1">Settings</h1>
      </div>

      <div className="pad" style={{ paddingTop: 8, display: "flex", flexDirection: "column", gap: 10 }}>
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

        <div className="notice" style={{ marginTop: 6 }}>
          A home-screen widget showing today’s card is planned for a later version. The card art is
          already designed to read well at small sizes.
        </div>

        <p className="muted" style={{ textAlign: "center", marginTop: 10 }}>
          Dawnhalo · prototype · English (US/UK)
        </p>
      </div>
    </div>
  );
}
