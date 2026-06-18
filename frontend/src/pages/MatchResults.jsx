import React from "react";
import { getMyMatches } from "../api/matches";

function useDark(dm) {
  return dm ? {
    card: "#1e293b", border: "#334155", text: "#e2e8f0",
    muted: "#94a3b8", body: "#cbd5e1", fieldBg: "#0f172a",
    link: "#60a5fa", green: "#34d399", danger: "#f87171",
  } : {
    card: "#FFFFFF", border: "#d0d5dd", text: "#0b3470",
    muted: "#667085", body: "#344054", fieldBg: "#f6f9ff",
    link: "#2563eb", green: "#16a34a", danger: "#b42318",
  };
}

const formatDate = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "-" : date.toLocaleString();
};

const formatScore = (value) => {
  const score = Number(value);
  return Number.isNaN(score) ? "-" : `${Math.round(score * 100)}%`;
};

function ItemPanel({ label, item, tone, theme }) {
  return (
    <div style={{ flex: 1, padding: 18, borderRadius: 8, background: theme.fieldBg, border: `1px solid ${theme.border}` }}>
      <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: theme.muted, marginBottom: 8 }}>{label}</div>
      <div style={{ fontSize: 18, fontWeight: 800, color: theme.text, marginBottom: 6 }}>{item?.title || "Untitled item"}</div>
      <div style={{ fontSize: 13, color: theme.muted, marginBottom: 12, lineHeight: 1.4 }}>{item?.description || "No description provided"}</div>
      <p style={{ fontSize: 13, color: theme.body, marginBottom: 4 }}><b>Category:</b> {item?.category || "-"}</p>
      <p style={{ fontSize: 13, color: tone || theme.body, marginBottom: 4 }}><b>Location:</b> {item?.location || "-"}</p>
      <p style={{ fontSize: 13, color: theme.body, marginBottom: 4 }}><b>Status:</b> {item?.status || "-"}</p>
      <p style={{ fontSize: 13, color: theme.body, marginBottom: 4 }}><b>Reported:</b> {formatDate(item?.createdAt)}</p>
    </div>
  );
}

function MatchResults({ navigateTo, darkMode, user }) {
  const t = useDark(darkMode);
  const [matches, setMatches] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    let active = true;

    setLoading(true);
    setError("");
    getMyMatches(user?.token)
      .then((data) => {
        if (active) setMatches(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        if (active) setError(err.message || "Unable to load matches");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [user?.token]);

  return (
    <div style={{ fontFamily: "'DM Sans','Segoe UI',sans-serif" }}>
      <div style={{ width: "100%", maxWidth: 860, margin: "0 auto" }}>
        <button
          style={{ background: "none", border: "none", color: t.link, fontSize: 14, fontWeight: 600, cursor: "pointer", marginBottom: 18, padding: 0, fontFamily: "inherit" }}
          onClick={() => navigateTo("dashboard")}
        >Back to Dashboard</button>

        <h2 style={{ margin: "0 0 6px", fontSize: 28, fontWeight: 800, color: t.text }}>Match Results</h2>
        <p style={{ margin: "0 0 22px", fontSize: 15, color: t.muted }}>Potential matches from admin-filtered lost item reports</p>

        {loading && (
          <div style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: 8, padding: 22, color: t.body }}>
            Loading matches...
          </div>
        )}

        {!loading && error && (
          <div style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: 8, padding: 22, color: t.danger }}>
            {error}
          </div>
        )}

        {!loading && !error && matches.length === 0 && (
          <div style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: 8, padding: 22 }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: t.text, marginBottom: 6 }}>No matches yet</div>
            <div style={{ fontSize: 14, color: t.muted }}>When admin-filtered lost items match found reports, they will appear here.</div>
          </div>
        )}

        {!loading && !error && matches.map((match) => (
          <div key={match.id} style={{
            background: t.card, padding: "24px", borderRadius: 8,
            border: `1px solid ${t.border}`, boxShadow: "0 4px 16px rgba(0,0,0,0.04)",
            marginBottom: 16, transition: "background 0.3s, border-color 0.3s",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
              <ItemPanel label="Lost Item" item={match.lostItem} theme={t} />
              <ItemPanel label="Found Item" item={match.foundItem} theme={t} tone={t.green} />
            </div>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap", marginTop: 14 }}>
              <p style={{ margin: 0, fontSize: 14, color: t.body, fontWeight: 600 }}>
                Match Score: {formatScore(match.confidenceScore)}
              </p>
              <span style={{
                display: "inline-block", padding: "6px 16px",
                borderRadius: 8, fontSize: 13, fontWeight: 600,
                background: match.status === "SUGGESTED" ? "#E6F1FB" : "#FAEEDA",
                color: match.status === "SUGGESTED" ? "#0b3470" : "#633806",
              }}>{match.status}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default MatchResults;
