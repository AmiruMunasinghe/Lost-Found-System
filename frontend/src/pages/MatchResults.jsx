import React, { useEffect, useMemo, useState } from "react";
import { getMyMatches } from "../api/matches";

function useDark(dm) {
  return dm ? {
    card: "#1e293b", fieldBg: "#0f172a", border: "#334155", text: "#e2e8f0",
    body: "#cbd5e1", muted: "#94a3b8", green: "#22c55e", red: "#f87171",
  } : {
    card: "#ffffff", fieldBg: "#f8fafc", border: "#d0d5dd", text: "#0b3470",
    body: "#344054", muted: "#667085", green: "#16a34a", red: "#dc2626",
  };
}

function itemTitle(item) { return item?.title || item?.name || "Untitled item"; }
function itemDesc(item) { return item?.description || item?.desc || "No description available"; }
function itemType(item) { return String(item?.reportType || item?.type || "").toUpperCase(); }

function normalizeScore(score) {
  if (score === null || score === undefined || score === "") return "—";
  const num = Number(score);
  if (Number.isNaN(num)) return String(score);
  return `${Math.round(num * 100)}%`;
}

function visibleStatus(status) {
  const s = String(status || "SUGGESTED").toUpperCase();
  if (s === "SUGGESTED") return "Suggested by system";
  if (s === "ACCEPTED") return "Accepted / Confirmed";
  return s.replaceAll("_", " ");
}

export default function MatchResults({ darkMode, pageParams, navigateTo, user }) {
  const t = useDark(darkMode);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadMatches() {
    try {
      setLoading(true);
      setError("");
      const data = await getMyMatches();
      setMatches(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Failed to load your match results.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadMatches(); }, []);

  const filteredMatches = useMemo(() => {
    const itemId = pageParams?.itemId;
    const visible = matches.filter((match) => ["SUGGESTED", "ACCEPTED"].includes(String(match.status || "").toUpperCase()));
    if (!itemId) return visible;
    return visible.filter((match) => String(match.lostItem?.id) === String(itemId) || String(match.foundItem?.id) === String(itemId));
  }, [matches, pageParams?.itemId]);

  const contactAdmin = (match) => {
    const subject = encodeURIComponent(`Lost & Found match support - Match #${match.id}`);
    const body = encodeURIComponent(`Hello Admin,\n\nI need help with match #${match.id}.\nLost item: ${itemTitle(match.lostItem)}\nFound item: ${itemTitle(match.foundItem)}\n\nMy username: ${user?.username || ""}\n`);
    window.location.href = `mailto:admin@uom.lk?subject=${subject}&body=${body}`;
  };

  const fieldStyle = {
    background: t.fieldBg, border: `1px solid ${t.border}`, borderRadius: 14, padding: 16,
  };

  return (
    <div style={{ fontFamily: "'DM Sans','Segoe UI',sans-serif" }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ color: t.text, fontSize: 32, margin: "0 0 8px", fontWeight: 800 }}>My Match Results</h1>
        <p style={{ color: t.muted, margin: 0, lineHeight: 1.5 }}>
          Only matches related to your own approved reports are shown here. You will also receive a notification when a possible match becomes visible.
        </p>
      </div>

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 20 }}>
        <button onClick={loadMatches} style={styles.primaryBtn}>Refresh Matches</button>
        <button onClick={() => navigateTo && navigateTo("browse")} style={styles.secondaryBtn}>Back to My Items</button>
      </div>

      {loading && <div style={{ ...fieldStyle, color: t.body }}>Loading your match results...</div>}
      {error && <div style={{ background: "#fee2e2", color: "#991b1b", padding: 16, borderRadius: 14 }}>{error}</div>}

      {!loading && !error && filteredMatches.length === 0 && (
        <div style={{ ...fieldStyle, color: t.body }}>
          No visible matches yet. If your report is still pending, wait for admin approval first.
        </div>
      )}

      {!loading && !error && filteredMatches.length > 0 && (
        <div style={{ display: "grid", gap: 18 }}>
          {filteredMatches.map((match) => (
            <div key={match.id} style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: 20, padding: 22, boxShadow: darkMode ? "0 10px 30px rgba(0,0,0,.25)" : "0 10px 30px rgba(15,95,255,.08)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", marginBottom: 18 }}>
                <div>
                  <h2 style={{ color: t.text, margin: "0 0 4px", fontSize: 22 }}>Possible Match #{match.id}</h2>
                  <p style={{ color: t.muted, margin: 0 }}>Confidence: <strong>{normalizeScore(match.confidenceScore)}</strong></p>
                </div>
                <span style={{ alignSelf: "start", borderRadius: 999, padding: "8px 12px", fontWeight: 800, background: "#e0f2fe", color: "#0369a1" }}>{visibleStatus(match.status)}</span>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16 }}>
                {[match.lostItem, match.foundItem].map((item, index) => {
                  const lost = itemType(item) === "LOST" || index === 0;
                  return (
                    <div key={lost ? "lost" : "found"} style={fieldStyle}>
                      <span style={{ color: lost ? t.red : t.green, fontWeight: 900 }}>{lost ? "LOST REPORT" : "FOUND REPORT"}</span>
                      <h3 style={{ color: t.text, margin: "10px 0 8px" }}>{itemTitle(item)}</h3>
                      <p style={{ color: t.body, whiteSpace: "pre-wrap", lineHeight: 1.5 }}>{itemDesc(item)}</p>
                      <p style={{ color: t.muted, margin: "8px 0 0" }}>📍 {item?.location || "No location"}</p>
                      <p style={{ color: t.muted, margin: "4px 0 0" }}>🏷️ {item?.category || "Other"}</p>
                    </div>
                  );
                })}
              </div>

              <div style={{ marginTop: 18, display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
                <button onClick={() => contactAdmin(match)} style={styles.primaryBtn}>Contact Admin</button>
                <span style={{ color: t.muted, fontSize: 14 }}>Admin will help verify ownership and arrange return/pickup.</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const styles = {
  primaryBtn: { border: "none", borderRadius: 12, background: "#0F5FFF", color: "white", padding: "11px 16px", fontWeight: 800, cursor: "pointer" },
  secondaryBtn: { border: "1px solid #d0d5dd", borderRadius: 12, background: "white", color: "#0b3470", padding: "10px 16px", fontWeight: 800, cursor: "pointer" },
};
