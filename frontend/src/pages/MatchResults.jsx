import React, { useEffect, useState } from "react";
import { confirmMatch, getMatches, rejectMatch } from "../api/matches";

function useDark(dm) {
  return dm ? {
    card: "#1e293b", border: "#334155", text: "#e2e8f0",
    muted: "#94a3b8", body: "#cbd5e1", fieldBg: "#0f172a",
    green: "#22c55e", red: "#f87171",
  } : {
    card: "#FFFFFF", border: "#d0d5dd", text: "#0b3470",
    muted: "#667085", body: "#344054", fieldBg: "#f8fafc",
    green: "#16a34a", red: "#dc2626",
  };
}

function itemTitle(item) {
  return item?.title || `Item #${item?.id || "—"}`;
}

function itemDesc(item) {
  return item?.description || item?.desc || "No description available";
}

function itemType(item) {
  return String(item?.reportType || item?.type || "").toUpperCase();
}

export default function MatchResults({ pageParams, navigateTo, darkMode }) {
  const t = useDark(darkMode);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(null);

  const itemId = pageParams?.itemId;
  const type = pageParams?.type;

  async function loadMatches() {
    try {
      setLoading(true);
      setError("");

      const filters = {};
      if (itemId) {
        if (type === "lost") filters.lostItemId = itemId;
        else if (type === "found") filters.foundItemId = itemId;
        else filters.itemId = itemId;
      }

      const data = await getMatches(filters);
      setMatches(data);
    } catch (err) {
      setError(err.message || "Failed to load matches.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMatches();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itemId, type]);

  const handleConfirm = async (matchId) => {
    try {
      setActionLoading(matchId);
      await confirmMatch(matchId);
      await loadMatches();
    } catch (err) {
      alert(err.message || "Failed to confirm match.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (matchId) => {
    try {
      setActionLoading(matchId);
      await rejectMatch(matchId);
      await loadMatches();
    } catch (err) {
      alert(err.message || "Failed to reject match.");
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "10px 20px 40px", fontFamily: "'DM Sans','Segoe UI',sans-serif" }}>
      <button
        type="button"
        onClick={() => navigateTo && navigateTo("browse")}
        style={{ background: "none", border: "none", color: "#2563eb", fontWeight: 700, cursor: "pointer", marginBottom: 20 }}
      >← Back to Browse Items</button>

      <div style={{ textAlign: "center", marginBottom: 28 }}>
        <h1 style={{ color: t.text, fontSize: 36, margin: "0 0 8px", fontWeight: 800 }}>Match Results</h1>
        <p style={{ color: t.muted, margin: 0 }}>
          {itemId ? `Showing backend matches for item ID ${itemId}.` : "Showing all backend matches."}
        </p>
      </div>

      {loading && <div style={{ ...styles.info, background: t.card, border: `1px solid ${t.border}`, color: t.text }}>Loading matches...</div>}

      {error && <div style={styles.error}>{error}</div>}

      {!loading && !error && matches.length === 0 && (
        <div style={{ ...styles.info, background: t.card, border: `1px solid ${t.border}`, color: t.text }}>
          <h3 style={{ marginTop: 0 }}>No matches found yet</h3>
          <p style={{ color: t.muted, marginBottom: 0 }}>
            Create one LOST item and one similar FOUND item using the forms. Then come back here.
          </p>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {matches.map((match) => {
          const lostItem = match.lostItem || match.lost || {};
          const foundItem = match.foundItem || match.found || {};
          const matchId = match.id || match.matchId;
          const score = match.confidenceScore ?? match.score ?? "—";
          const status = match.status || "SUGGESTED";

          return (
            <div key={matchId} style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: 22, padding: 24, boxShadow: "0 4px 16px rgba(0,0,0,0.06)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap", marginBottom: 18 }}>
                <div>
                  <div style={{ color: t.muted, fontSize: 13, fontWeight: 700 }}>MATCH #{matchId}</div>
                  <h2 style={{ color: t.text, margin: "4px 0 0", fontSize: 22 }}>Score: {score}</h2>
                </div>
                <span style={{ alignSelf: "flex-start", padding: "6px 14px", borderRadius: 999, background: "#dbeafe", color: "#1d4ed8", fontWeight: 800, fontSize: 13 }}>
                  {status}
                </span>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16 }}>
                <div style={{ background: t.fieldBg, border: `1px solid ${t.border}`, borderRadius: 16, padding: 18 }}>
                  <div style={{ color: t.red, fontSize: 12, fontWeight: 800, marginBottom: 8 }}>🔴 LOST ITEM</div>
                  <h3 style={{ color: t.text, margin: "0 0 8px" }}>{itemTitle(lostItem)}</h3>
                  <p style={{ color: t.muted, whiteSpace: "pre-wrap", lineHeight: 1.5 }}>{itemDesc(lostItem)}</p>
                  <p style={{ color: t.body, margin: "6px 0" }}><b>ID:</b> {lostItem.id || "—"}</p>
                  <p style={{ color: t.body, margin: "6px 0" }}><b>Type:</b> {itemType(lostItem) || "LOST"}</p>
                  <p style={{ color: t.body, margin: "6px 0" }}><b>Location:</b> {lostItem.location || "—"}</p>
                </div>

                <div style={{ background: t.fieldBg, border: `1px solid ${t.border}`, borderRadius: 16, padding: 18 }}>
                  <div style={{ color: t.green, fontSize: 12, fontWeight: 800, marginBottom: 8 }}>🟢 FOUND ITEM</div>
                  <h3 style={{ color: t.text, margin: "0 0 8px" }}>{itemTitle(foundItem)}</h3>
                  <p style={{ color: t.muted, whiteSpace: "pre-wrap", lineHeight: 1.5 }}>{itemDesc(foundItem)}</p>
                  <p style={{ color: t.body, margin: "6px 0" }}><b>ID:</b> {foundItem.id || "—"}</p>
                  <p style={{ color: t.body, margin: "6px 0" }}><b>Type:</b> {itemType(foundItem) || "FOUND"}</p>
                  <p style={{ color: t.body, margin: "6px 0" }}><b>Location:</b> {foundItem.location || "—"}</p>
                </div>
              </div>

              <div style={{ display: "flex", gap: 12, marginTop: 18, flexWrap: "wrap" }}>
                <button disabled={actionLoading === matchId} onClick={() => handleConfirm(matchId)} style={{ ...styles.action, background: "#16a34a" }}>
                  Confirm Match
                </button>
                <button disabled={actionLoading === matchId} onClick={() => handleReject(matchId)} style={{ ...styles.action, background: "#dc2626" }}>
                  Reject Match
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const styles = {
  info: { padding: 28, borderRadius: 18, textAlign: "center" },
  error: { padding: 16, borderRadius: 14, background: "#fee2e2", border: "1px solid #fecaca", color: "#991b1b", marginBottom: 18 },
  action: { border: "none", color: "white", borderRadius: 12, padding: "11px 16px", fontWeight: 800, cursor: "pointer" },
};
