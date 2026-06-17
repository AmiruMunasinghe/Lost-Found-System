import React from "react";

function useDark(dm) {
  return dm ? {
    card: "#1e293b", border: "#334155", text: "#e2e8f0",
    muted: "#94a3b8", body: "#cbd5e1", fieldBg: "#0f172a",
    link: "#60a5fa", green: "#34d399",
  } : {
    card: "#FFFFFF", border: "#d0d5dd", text: "#0b3470",
    muted: "#667085", body: "#344054", fieldBg: "#f6f9ff",
    link: "#2563eb", green: "#16a34a",
  };
}

const isSame = (a, b) => a && b && a.toLowerCase() === b.toLowerCase();
const getMatchScore = (u, m) => (isSame(u.color, m.color) ? 1 : 0) + (isSame(u.venue, m.venue) ? 1 : 0);

function MatchResults({ navigateTo, darkMode }) {
  const t = useDark(darkMode);

  const matches = [
    {
      id: 1,
      userItem:    { title: "Black Wallet", desc: "Lost near library around 10 AM", color: "Black", venue: "Library",     time: "2026-05-06T10:00" },
      matchedItem: { title: "Wallet Found", desc: "Found at cafeteria counter",     color: "Black", venue: "Cafeteria",   time: "2026-05-06T10:30" },
      status: "Matched",
    },
    {
      id: 2,
      userItem:    { title: "iPhone 13",    desc: "Lost in lecture hall A", color: "Blue", venue: "Lecture Hall A", time: "2026-05-06T09:00" },
      matchedItem: { title: "No Match Yet", desc: "Still searching in system", color: "", venue: "", time: "" },
      status: "Pending",
    },
  ];

  return (
    <div style={{ fontFamily: "'DM Sans','Segoe UI',sans-serif" }}>
      <div style={{ width: "100%", maxWidth: 780, margin: "0 auto" }}>
        <button
          style={{ background: "none", border: "none", color: t.link, fontSize: 14, fontWeight: 600, cursor: "pointer", marginBottom: 18, padding: 0, fontFamily: "inherit" }}
          onClick={() => navigateTo("dashboard")}
        >← Back to Dashboard</button>

        <h2 style={{ margin: "0 0 6px", fontSize: 28, fontWeight: 800, color: t.text }}>Match Results</h2>
        <p style={{ margin: "0 0 22px", fontSize: 15, color: t.muted }}>View potential matches for your reported items</p>

        {matches.map((m) => (
          <div key={m.id} style={{
            background: t.card, padding: "24px", borderRadius: 22,
            border: `1px solid ${t.border}`, boxShadow: "0 4px 16px rgba(0,0,0,0.04)",
            marginBottom: 16, transition: "background 0.3s, border-color 0.3s",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 16 }}>
              {/* USER ITEM */}
              <div style={{ flex: 1, padding: 18, borderRadius: 16, background: t.fieldBg, border: `1px solid ${t.border}` }}>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.6px", textTransform: "uppercase", color: t.muted, marginBottom: 8 }}>🔴 Your Item</div>
                <div style={{ fontSize: 18, fontWeight: 800, color: t.text, marginBottom: 6 }}>{m.userItem.title}</div>
                <div style={{ fontSize: 13, color: t.muted, marginBottom: 12, lineHeight: 1.4 }}>{m.userItem.desc}</div>
                <p style={{ fontSize: 13, color: t.body, marginBottom: 4 }}><b>Color:</b> {m.userItem.color}</p>
                <p style={{ fontSize: 13, color: t.body, marginBottom: 4 }}><b>Venue:</b> {m.userItem.venue}</p>
                <p style={{ fontSize: 13, color: t.body, marginBottom: 4 }}><b>Time:</b> {m.userItem.time}</p>
              </div>

              {/* MATCHED ITEM */}
              <div style={{ flex: 1, padding: 18, borderRadius: 16, background: t.fieldBg, border: `1px solid ${t.border}` }}>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.6px", textTransform: "uppercase", color: t.muted, marginBottom: 8 }}>🟢 Matched Item</div>
                <div style={{ fontSize: 18, fontWeight: 800, color: t.text, marginBottom: 6 }}>{m.matchedItem.title}</div>
                <div style={{ fontSize: 13, color: t.muted, marginBottom: 12, lineHeight: 1.4 }}>{m.matchedItem.desc}</div>
                <p style={{ fontSize: 13, color: isSame(m.userItem.color, m.matchedItem.color) ? t.green : t.body, fontWeight: isSame(m.userItem.color, m.matchedItem.color) ? 700 : 400, marginBottom: 4 }}>
                  <b>Color:</b> {m.matchedItem.color || "—"}
                </p>
                <p style={{ fontSize: 13, color: isSame(m.userItem.venue, m.matchedItem.venue) ? t.green : t.body, fontWeight: isSame(m.userItem.venue, m.matchedItem.venue) ? 700 : 400, marginBottom: 4 }}>
                  <b>Venue:</b> {m.matchedItem.venue || "—"}
                </p>
                <p style={{ fontSize: 13, color: t.body, marginBottom: 4 }}><b>Time:</b> {m.matchedItem.time || "—"}</p>
              </div>
            </div>

            <p style={{ marginTop: 14, fontSize: 14, color: t.body, fontWeight: 600 }}>
              📊 Match Score: {getMatchScore(m.userItem, m.matchedItem)} / 2
            </p>
            <span style={{
              display: "inline-block", marginTop: 14, padding: "6px 16px",
              borderRadius: 22, fontSize: 13, fontWeight: 600,
              background: m.status === "Matched" ? "#E6F1FB" : "#FAEEDA",
              color: m.status === "Matched" ? "#0b3470" : "#633806",
            }}>{m.status}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default MatchResults;