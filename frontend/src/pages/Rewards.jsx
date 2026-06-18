import React from "react";

function useDark(dm) {
  return dm ? {
    card: "#1e293b", border: "#334155", text: "#e2e8f0",
    muted: "#94a3b8", link: "#60a5fa",
  } : {
    card: "#FFFFFF", border: "#d0d5dd", text: "#0b3470",
    muted: "#667085", link: "#2563eb",
  };
}

export default function Rewards({ navigateTo, darkMode }) {
  const t = useDark(darkMode);
  const badges = [
    { name: "First report",   desc: "Earned Apr 01, 2026", bg: "#FAEEDA", emoji: "🏆" },
    { name: "Helper badge",   desc: "Returned 3 items",    bg: "#E6F1FB", emoji: "⭐" },
    { name: "Photo uploader", desc: "Added item photos",   bg: "#EAF3DE", emoji: "📸" },
    { name: "Item finder",    desc: "Found an item",        bg: "#EEEDFE", emoji: "🔍" },
  ];

  return (
    <div style={{ fontFamily: "'DM Sans','Segoe UI',sans-serif" }}>
      <div style={{ width: "100%", maxWidth: 560, margin: "0 auto" }}>
        <button
          style={{ background: "none", border: "none", color: t.link, fontSize: 14, fontWeight: 600, cursor: "pointer", marginBottom: 18, padding: 0, fontFamily: "inherit" }}
          onClick={() => navigateTo("dashboard")}
        >← Back to Dashboard</button>

        {/* Points banner — always gradient, always looks good */}
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

        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.8px", textTransform: "uppercase", color: t.muted, margin: "0 0 14px" }}>Achievement badges</p>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          {badges.map(b => (
            <div key={b.name} style={{
              background: t.card, border: `1px solid ${t.border}`,
              borderRadius: 18, padding: "18px 16px",
              display: "flex", alignItems: "center", gap: 14,
              boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
              transition: "background 0.3s, border-color 0.3s",
            }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: b.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>{b.emoji}</div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14, color: t.text }}>{b.name}</div>
                <div style={{ fontSize: 12, color: t.muted, marginTop: 3 }}>{b.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}