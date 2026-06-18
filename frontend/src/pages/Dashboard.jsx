import { useState, useEffect } from "react";
import { getMyMatches } from "../api/matches";

// Dark mode helper — call useDark(darkMode) to get theme tokens
function useDark(dm) {
  return dm ? {
    bg: "#0f172a",
    card: "#1e293b",
    border: "#334155",
    text: "#e2e8f0",
    muted: "#94a3b8",
    body: "#cbd5e1",
    fieldBg: "#0f172a",
    link: "#60a5fa",
    hover: "#273449",
  } : {
    bg: "#eef4fb",
    card: "#FFFFFF",
    border: "#d0d5dd",
    text: "#0b3470",
    muted: "#667085",
    body: "#344054",
    fieldBg: "#f6f9ff",
    link: "#2563eb",
    hover: "#f6f9ff",
  };
}

function ActionCard({ title, desc, iconBg, icon, onClick, wide, darkMode }) {
  const [hov, setHov] = useState(false);
  const t = useDark(darkMode);
  return (
    <div
      style={{
        background: hov ? t.hover : t.card,
        border: `1px solid ${hov ? "#0F5FFF" : t.border}`,
        borderRadius: 18, padding: "18px 20px",
        cursor: "pointer", transition: "all .2s ease",
        display: wide ? "flex" : "block",
        alignItems: wide ? "center" : undefined,
        gap: wide ? 16 : undefined,
        boxShadow: hov ? "0 8px 24px rgba(15,95,255,0.1)" : "none",
      }}
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
    >
      <div style={{
        width: 40, height: 40, borderRadius: 12,
        background: iconBg, display: "flex", alignItems: "center",
        justifyContent: "center", fontSize: 18, marginBottom: wide ? 0 : 12,
        flexShrink: 0,
      }}>{icon}</div>
      <div>
        <div style={{ fontWeight: 700, fontSize: 14, color: t.text, marginBottom: 3 }}>{title}</div>
        <div style={{ fontSize: 12, color: t.muted, lineHeight: 1.4 }}>{desc}</div>
      </div>
    </div>
  );
}

export default function Dashboard({ navigateTo, darkMode, user }) {
  const t = useDark(darkMode);

  const [matchesCount, setMatchesCount] = useState(0);

  useEffect(() => {
    let mounted = true;
    async function loadMatches() {
      try {
        const data = await getMyMatches();
        if (!mounted) return;
        setMatchesCount(Array.isArray(data) ? data.length : 0);
      } catch (err) {
        console.debug("Failed to load my matches:", err);
      }
    }

    if (user) loadMatches();
    return () => { mounted = false; };
  }, [user]);

  const stats = [
    { num: "3", label: "Active reports", color: "#0F5FFF" },
    { num: String(matchesCount || 0), label: "Matches found", color: "#3B6D11" },
    { num: "250", label: "Reward points", color: "#BA7517" },
  ];

  const actions = [
    { title: "Report lost item", desc: "Lost something? File a report", iconBg: "#FCEBEB", icon: "🔴", nav: "postlost" },
    { title: "Report found item", desc: "Found something? Help reunite it", iconBg: "#EAF3DE", icon: "🟢", nav: "postfound" },
    { title: "My reports", desc: "View & manage your submitted reports", iconBg: "#E6F1FB", icon: "📄", nav: "reports" },
    { title: "My profile", desc: "Update your info & settings", iconBg: "#EEEDFE", icon: "👤", nav: "profile" },
    { title: "Match results", desc: "Display match results", iconBg: "#E6F1FB", icon: "🔗", nav: "matchresults" },
  ];

  return (
    <div style={{ fontFamily: "'DM Sans', 'Segoe UI', sans-serif", padding: "8px 0" }}>
      <div style={{ width: "100%", maxWidth: 720, margin: "0 auto" }}>

        {/* Stats Row */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14, marginBottom: 22 }}>
          {stats.map(s => (
            <div key={s.label} style={{
              background: t.card,
              borderRadius: 18, padding: "20px 16px", textAlign: "center",
              border: `1px solid ${t.border}`,
              boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
              transition: "background 0.3s, border-color 0.3s",
            }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: s.color }}>{s.num}</div>
              <div style={{ fontSize: 12, color: t.muted, marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>

        <p style={{
          fontSize: 11, fontWeight: 700, letterSpacing: "0.8px",
          textTransform: "uppercase", color: t.muted, margin: "0 0 12px",
        }}>Quick actions</p>

        {/* Action Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
          {actions.map(a => (
            <ActionCard key={a.title} {...a} darkMode={darkMode} onClick={() => navigateTo(a.nav)} />
          ))}
        </div>

        {/* Rewards wide card */}
        <ActionCard
          title="My rewards"
          desc="View your points, badges & achievements"
          iconBg="#FAEEDA"
          icon="⭐"
          wide
          darkMode={darkMode}
          onClick={() => navigateTo("rewards")}
        />
      </div>
    </div>
  );
}