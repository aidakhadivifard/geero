import { Illustration } from "../illustrations/index.jsx";
import { getSaved } from "../store.js";

export default function SavedScreen({ onOpen }) {
  const saved = getSaved();
  return (
    <div className="screen">
      <div className="pad">
        <div className="eyebrow">Your collection</div>
        <h1 className="h1">Saved</h1>
      </div>
      <div className="pad" style={{ paddingTop: 8, paddingBottom: 28 }}>
        {saved.length === 0 ? (
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
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {saved.map((c) => (
              <button className="tile" key={c.id} onClick={() => onOpen(c)}>
                <div className="thumb">
                  <Illustration theme={c.theme} />
                </div>
                <div style={{ minWidth: 0 }}>
                  <p className="tile-name">{c.cardName}</p>
                  <p className="tile-sub">{c.sourceInput ? `“${c.sourceInput}”` : c.message}</p>
                  <p className="tile-sub" style={{ color: "var(--gold)", WebkitLineClamp: 1 }}>
                    {new Date(c.savedAt || c.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
