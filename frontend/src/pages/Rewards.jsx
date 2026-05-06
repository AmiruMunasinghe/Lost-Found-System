const C = {
  primary: "#185FA5",
  primaryDk: "#0C447C",
  bg: "#F4F6FA",
  card: "#FFFFFF",
  text: "#1A1D2E",
  muted: "#6B7080",
  border: "#DDE1EA",
};

const css = {
  page: {
    minHeight: "100vh",
    background: C.bg,
    fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
    padding: "24px 16px",
  },
  container: {
    width: "100%",
    maxWidth: 500,
    margin: "0 auto",
  },
  link: {
    background: "none",
    border: "none",
    color: C.primary,
    fontSize: 13,
    cursor: "pointer",
    marginBottom: 14,
    display: "flex",
    alignItems: "center",
    gap: 5,
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
        <button style={css.link} onClick={() => go("dashboard")}>← Back to Dashboard</button>

        <div style={{
          background: `linear-gradient(135deg, ${C.primary}, ${C.primaryDk})`,
          borderRadius: 14, padding: "30px 24px",
          textAlign: "center", marginBottom: 18,
        }}>
          <div style={{ fontSize: 52, fontWeight: 700, color: "#fff", lineHeight: 1 }}>250</div>
          <div style={{ fontSize: 14, color: "rgba(255,255,255,0.8)", marginTop: 6 }}>Total reward points</div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.55)", marginTop: 4 }}>50 points away from your next badge</div>
        </div>

        <p style={{
          fontSize: 10, fontWeight: 600, letterSpacing: "0.6px",
          textTransform: "uppercase", color: C.muted, margin: "0 0 10px",
        }}>Achievement badges</p>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {badges.map(b => (
            <div key={b.name} style={{
              background: C.card, border: `1px solid ${C.border}`,
              borderRadius: 12, padding: "16px 14px",
              display: "flex", alignItems: "center", gap: 12,
            }}>
              <div style={{
                width: 40, height: 40, borderRadius: 10,
                background: b.bg, display: "flex",
                alignItems: "center", justifyContent: "center", fontSize: 18,
              }}>{b.emoji}</div>
              <div>
                <div style={{ fontWeight: 600, fontSize: 13, color: C.text }}>{b.name}</div>
                <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{b.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}