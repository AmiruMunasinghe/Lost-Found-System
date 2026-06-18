import React from "react";

function useDark(dm) {
  return dm ? {
    card: "#1e293b", border: "#334155", text: "#e2e8f0",
    muted: "#94a3b8", body: "#cbd5e1", fieldBg: "#0f172a", link: "#60a5fa",
  } : {
    card: "#FFFFFF", border: "#d0d5dd", text: "#0b3470",
    muted: "#667085", body: "#344054", fieldBg: "#f6f9ff", link: "#2563eb",
  };
}

function ClaimItem({ navigateTo, darkMode }) {
  const t = useDark(darkMode);

  const features = [
    { icon: "🔍", label: "Search matched items" },
    { icon: "📝", label: "Submit claim request" },
    { icon: "✅", label: "Verify ownership" },
  ];

  return (
    <div style={{ fontFamily: "'DM Sans','Segoe UI',sans-serif" }}>
      <div style={{ width: "100%", maxWidth: 560, margin: "0 auto" }}>
        <button
          style={{ background: "none", border: "none", color: t.link, fontSize: 14, fontWeight: 600, cursor: "pointer", marginBottom: 18, padding: 0, fontFamily: "inherit" }}
          onClick={() => navigateTo("dashboard")}
        >← Back to Dashboard</button>

        <div style={{
          background: t.card, border: `1px solid ${t.border}`, borderRadius: 22,
          padding: "36px 32px", boxShadow: "0 4px 16px rgba(0,0,0,0.04)", textAlign: "center",
          transition: "background 0.3s, border-color 0.3s",
        }}>
          <div style={{ width: 72, height: 72, borderRadius: 18, background: "linear-gradient(135deg,#FAEEDA,#FCF0D4)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", fontSize: 32 }}>📦</div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: t.text, marginBottom: 8 }}>Claim Item</h1>
          <p style={{ fontSize: 15, color: t.muted, marginBottom: 28, lineHeight: 1.5 }}>
            This page allows users to claim items they have lost.
          </p>

          <ul style={{ listStyle: "none", padding: 0, margin: "0 0 28px", textAlign: "left" }}>
            {features.map(f => (
              <li key={f.label} style={{
                display: "flex", alignItems: "center", gap: 12,
                padding: "12px 16px", background: t.fieldBg, borderRadius: 14,
                marginBottom: 10, border: `1px solid ${t.border}`,
                fontSize: 14, color: t.body, fontWeight: 500,
                transition: "background 0.3s",
              }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: "#E6F1FB", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>{f.icon}</div>
                {f.label}
              </li>
            ))}
          </ul>

          <button onClick={() => navigateTo("home")} style={{
            width: "100%", height: 56, borderRadius: 14, border: `2px solid #2563eb`,
            background: t.card, color: "#2563eb", fontSize: 16, fontWeight: 700,
            cursor: "pointer", fontFamily: "inherit", transition: "background 0.3s",
          }}>← Back to Home</button>
        </div>
      </div>
    </div>
  );
}

export default ClaimItem;