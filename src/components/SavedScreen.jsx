import { useMemo, useState } from "react";
import { Illustration } from "../illustrations/index.jsx";
import { getSaved, removeSaved } from "../store.js";
import { CloseIcon } from "./icons.jsx";

const KIND_LABEL = {
  daily: "Daily",
  guidance: "Question",
  validation: "Feeling",
  followup: "Follow-up",
};
const FILTERS = [
  { id: "all", label: "All" },
  { id: "daily", label: "Daily" },
  { id: "guidance", label: "Questions" },
  { id: "validation", label: "Feelings" },
];

export default function SavedScreen({ onOpen }) {
  const [items, setItems] = useState(getSaved());
  const [filter, setFilter] = useState("all");

  const shown = useMemo(
    () => (filter === "all" ? items : items.filter((c) => c.kind === filter)),
    [items, filter]
  );

  function remove(e, id) {
    e.stopPropagation();
    setItems(removeSaved(id));
  }

  return (
    <div className="screen">
      <div className="pad">
        <div className="eyebrow">Your collection</div>
        <h1 className="h1">Saved</h1>
        <p className="muted" style={{ marginTop: 4 }}>
          {items.length} {items.length === 1 ? "card" : "cards"} kept
        </p>
      </div>

      {items.length > 0 ? (
        <div className="pad" style={{ paddingTop: 0, paddingBottom: 4 }}>
          <div className="chips">
            {FILTERS.map((f) => (
              <button
                key={f.id}
                className={`chip ${filter === f.id ? "on" : ""}`}
                onClick={() => setFilter(f.id)}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      <div className="pad" style={{ paddingTop: 10, paddingBottom: 28 }}>
        {items.length === 0 ? (
          <div className="center-col">
            <div style={{ width: 90 }}>
              <div className="card-art" style={{ borderRadius: 16 }}>
                <Illustration theme="star" />
              </div>
            </div>
            <p className="muted" style={{ maxWidth: 240 }}>
              Cards you save will gather here — a little constellation of the moments that landed.
            </p>
          </div>
        ) : shown.length === 0 ? (
          <p className="muted" style={{ textAlign: "center", padding: "24px 0" }}>
            No {KIND_LABEL[filter]?.toLowerCase()} cards saved yet.
          </p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {shown.map((c) => (
              <button className="tile" key={c.id} onClick={() => onOpen(c)}>
                <div className="thumb">
                  <Illustration theme={c.theme} />
                </div>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <p className="tile-name">{c.cardName}</p>
                  <p className="tile-sub">{c.sourceInput ? `“${c.sourceInput}”` : c.message}</p>
                  <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 3 }}>
                    {c.kind && KIND_LABEL[c.kind] ? <span className="pill">{KIND_LABEL[c.kind]}</span> : null}
                    <span className="tile-sub" style={{ color: "var(--gold)", margin: 0 }}>
                      {new Date(c.savedAt || c.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <span
                  className="icon-btn mic"
                  style={{ width: 32, height: 32 }}
                  onClick={(e) => remove(e, c.id)}
                  role="button"
                  aria-label="Remove from saved"
                >
                  <CloseIcon width={15} height={15} />
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
