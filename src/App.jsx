import { useEffect, useState } from "react";
import BottomNav from "./components/BottomNav.jsx";
import TodayScreen from "./components/TodayScreen.jsx";
import SavedScreen from "./components/SavedScreen.jsx";
import CalendarScreen from "./components/CalendarScreen.jsx";
import SettingsScreen from "./components/SettingsScreen.jsx";
import CardSheet from "./components/CardSheet.jsx";
import { registerOpen } from "./store.js";

export default function App() {
  const [tab, setTab] = useState("today");
  const [viewer, setViewer] = useState(null); // { title, cards }
  const [tick, setTick] = useState(0); // bump to force Saved/Calendar re-read

  useEffect(() => {
    registerOpen(); // counts toward the streak (doc §4.5)
  }, []);

  const refresh = () => setTick((t) => t + 1);

  return (
    <div className="stage">
      <div className="phone">
        {tab === "today" && <TodayScreen onActivity={refresh} />}
        {tab === "saved" && (
          <SavedScreen
            key={`saved-${tick}`}
            onOpen={(card) => setViewer({ title: "Saved card", cards: [card] })}
          />
        )}
        {tab === "calendar" && (
          <CalendarScreen
            key={`cal-${tick}`}
            onOpenDay={(cards, k) => setViewer({ title: k, cards })}
          />
        )}
        {tab === "settings" && <SettingsScreen />}

        <BottomNav tab={tab} setTab={setTab} />

        {viewer ? (
          <CardSheet
            title={viewer.title}
            cards={viewer.cards}
            onClose={() => {
              setViewer(null);
              refresh();
            }}
            onSavedChange={refresh}
          />
        ) : null}
      </div>
    </div>
  );
}
