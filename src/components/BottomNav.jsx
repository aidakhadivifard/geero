import { SunIcon, BookmarkIcon, CalendarIcon, GearIcon } from "./icons.jsx";

const TABS = [
  { id: "today", label: "Today", Icon: SunIcon },
  { id: "saved", label: "Saved", Icon: BookmarkIcon },
  { id: "calendar", label: "Calendar", Icon: CalendarIcon },
  { id: "settings", label: "Settings", Icon: GearIcon },
];

export default function BottomNav({ tab, setTab }) {
  return (
    <nav className="nav">
      {TABS.map(({ id, label, Icon }) => (
        <button
          key={id}
          className={tab === id ? "active" : ""}
          onClick={() => setTab(id)}
        >
          <span className="dot">
            <Icon width={22} height={22} />
          </span>
          {label}
        </button>
      ))}
    </nav>
  );
}
