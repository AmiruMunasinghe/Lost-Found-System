import React from "react";

function useDark(dm) {
  return dm ? {
    bg: "#0f172a", card: "#1e293b", border: "#334155",
    text: "#e2e8f0", muted: "#94a3b8", body: "#cbd5e1",
    link: "#60a5fa", fieldBg: "#0f172a", cardIcon: "#1a2d47",
  } : {
    bg: "#eef4fb", card: "#FFFFFF", border: "#d0d5dd",
    text: "#0b3470", muted: "#667085", body: "#344054",
    link: "#2563eb", fieldBg: "#f6f9ff", cardIcon: "#E6F1FB",
  };
}

function Home({ navigateTo, darkMode }) {
  const t = useDark(darkMode);

  return (
    <div style={{ fontFamily: "'DM Sans','Segoe UI',sans-serif", minHeight: "100vh", background: t.bg, transition: "background 0.3s" }}>
      {/* HERO */}
      <div style={{ textAlign: "center", padding: "80px 20px 60px" }}>
        <h1 style={{ fontSize: "44px", fontWeight: 800, color: t.text, marginBottom: "16px", lineHeight: 1.15 }}>
          Lost &amp; Found Item Management System
        </h1>
        <p style={{ fontSize: "17px", color: t.muted, maxWidth: "650px", margin: "0 auto 32px", lineHeight: "1.6" }}>
          A centralized platform for students and staff of the University of
          Moratuwa to report, track, and recover lost or found items efficiently.
        </p>
        <div style={{ display: "flex", gap: "16px", justifyContent: "center", flexWrap: "wrap" }}>
          {[
            { label: "➕ Submit a Report", nav: "postlost" },
            { label: "🔗 Match Results",   nav: "matchresults" },
            { label: "🔄 Return Item",     nav: "return" },
            { label: "📦 Claim Item",      nav: "claim" },
          ].map(b => (
            <button key={b.nav} onClick={() => navigateTo(b.nav)} style={{
              padding: "14px 28px", fontSize: "16px", fontWeight: "700",
              color: "white", border: "none", borderRadius: "14px", cursor: "pointer",
              background: "linear-gradient(90deg, #0F5FFF, #4A8BFF)",
              boxShadow: "0 8px 24px rgba(15,95,255,0.25)",
              fontFamily: "inherit", transition: "all 0.3s ease",
            }}>{b.label}</button>
          ))}
        </div>
      </div>

      {/* CARDS */}
      <div style={{ display: "flex", justifyContent: "center", gap: "20px", padding: "40px", flexWrap: "wrap" }}>
        {[
          { icon: "🎓", title: "University System", desc: "Designed for students, lecturers, and staff members." },
          { icon: "🔒", title: "Secure Reporting",  desc: "Keep track of lost and found items safely and reliably." },
          { icon: "⚡", title: "Fast Recovery",     desc: "Quickly connect owners with found belongings." },
        ].map(c => (
          <div key={c.title} style={{
            background: t.card, width: "280px", padding: "28px 24px",
            borderRadius: "22px", boxShadow: "0 4px 16px rgba(0,0,0,0.04)",
            border: `1px solid ${t.border}`, textAlign: "center",
            transition: "background 0.3s, border-color 0.3s",
          }}>
            <div style={{ width: 52, height: 52, borderRadius: 14, background: t.cardIcon, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, margin: "0 auto 14px" }}>{c.icon}</div>
            <h3 style={{ fontSize: "16px", fontWeight: 700, color: t.text, margin: "0 0 8px" }}>{c.title}</h3>
            <p style={{ fontSize: "14px", color: t.muted, lineHeight: 1.5, margin: 0 }}>{c.desc}</p>
          </div>
        ))}
      </div>

      {/* FOOTER */}
      <div style={{ textAlign: "center", padding: "24px", fontSize: "13px", color: t.muted, marginTop: "40px" }}>
        © 2026 University of Moratuwa | Faculty of Engineering
      </div>
    </div>
  );
}

export default Home;