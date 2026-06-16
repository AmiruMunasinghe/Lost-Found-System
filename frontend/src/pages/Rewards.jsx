const C = {
  primary: "#0F5FFF",
  primaryDk: "#0b3470",
  bg: "#eef4fb",
  card: "#FFFFFF",
  text: "#0b3470",
  body: "#344054",
  muted: "#667085",
  border: "#d0d5dd",
  link: "#2563eb",
};

const css = {
  page: {
    minHeight: "100vh",
    background: C.bg,
    fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
    padding: "30px 16px",
  },
  container: {
    width: "100%",
    maxWidth: 560,
    margin: "0 auto",
  },
  backLink: {
    background: "none",
    border: "none",
    color: C.link,
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
    marginBottom: 18,
    display: "flex",
    alignItems: "center",
    gap: 6,
    padding: 0,
    fontFamily: "inherit",
  },
};

export default function Rewards({ go }) {
  const badges = [
    { name: "First report", desc: "Earned Apr 01, 2026", bg: "#FAEEDA", emoji: "🏆" },
    { name: "Helper badge", desc: "Returned 3 items", bg: "#E6F1FB", emoji: "⭐" },
    { name: "Photo uploader", desc: "Added item photos", bg: "#EAF3DE", emoji: "📸" },
    { name: "Item finder", desc: "Found an item", bg: "#EEEDFE", emoji: "🔍" },
  ];

  return (
    <div style={css.page}>
      <div style={css.container}>
        <button style={css.backLink} onClick={() => go("dashboard")}>← Back to Dashboard</button>

        <div style={{
          background: "linear-gradient(135deg, #0F5FFF, #4A8BFF)",
          borderRadius: 22, padding: "36px 28px",
          textAlign: "center", marginBottom: 22,
          boxShadow: "0 12px 32px rgba(15,95,255,0.25)",
        }}>
          <div style={{ fontSize: 56, fontWeight: 800, color: "#fff", lineHeight: 1 }}>250</div>
          <div style={{ fontSize: 16, color: "rgba(255,255,255,0.85)", marginTop: 8, fontWeight: 500 }}>Total reward points</div>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.55)", marginTop: 5 }}>50 points away from your next badge</div>
        </div>

        <p style={{
          fontSize: 11, fontWeight: 700, letterSpacing: "0.8px",
          textTransform: "uppercase", color: C.muted, margin: "0 0 14px",
        }}>Achievement badges</p>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          {badges.map(b => (
            <div key={b.name} style={{
              background: C.card, border: `1px solid ${C.border}`,
              borderRadius: 18, padding: "18px 16px",
              display: "flex", alignItems: "center", gap: 14,
              boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
            }}>
              <div style={{
                width: 44, height: 44, borderRadius: 12,
                background: b.bg, display: "flex",
                alignItems: "center", justifyContent: "center", fontSize: 20,
              }}>{b.emoji}</div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14, color: C.text }}>{b.name}</div>
                <div style={{ fontSize: 12, color: C.muted, marginTop: 3 }}>{b.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}