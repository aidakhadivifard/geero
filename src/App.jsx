import { useEffect, useState } from "react";
import Header from "./components/Header.jsx";
import BottomNav from "./components/BottomNav.jsx";
import TodayScreen from "./components/TodayScreen.jsx";
import SavedScreen from "./components/SavedScreen.jsx";
import CalendarScreen from "./components/CalendarScreen.jsx";
import SettingsScreen from "./components/SettingsScreen.jsx";
import CardSheet from "./components/CardSheet.jsx";
import { registerOpen, computeStreak } from "./store.js";

export default function App() {
  const [tab, setTab] = useState("today");
  const [streak, setStreak] = useState(0);
  const [viewer, setViewer] = useState(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    setStreak(registerOpen()); // counts toward the streak (PRD §4.5)
  }, []);

  const refresh = () => {
    setStreak(computeStreak());
    setTick((t) => t + 1);
  };

  return (
    <div className="min-h-screen">
      <Header streak={streak} />

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
      {tab === "settings" && (
        <SettingsScreen
          key={`set-${tick}`}
          onReset={() => {
            refresh();
            setTab("today");
          }}
        />
      )}

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
  );
}
