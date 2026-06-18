import React, { useEffect, useState } from "react";
import { confirmMatch, getMatches, rejectMatch, runMatchingForLostItem } from "../api/matches";

function useDark(dm) {
  return dm ? {
    card: "#1e293b",
    fieldBg: "#0f172a",
    border: "#334155",
    text: "#e2e8f0",
    body: "#cbd5e1",
    muted: "#94a3b8",
    green: "#22c55e",
    red: "#f87171",
  } : {
    card: "#ffffff",
    fieldBg: "#f8fafc",
    border: "#d0d5dd",
    text: "#0b3470",
    body: "#344054",
    muted: "#667085",
    green: "#16a34a",
    red: "#dc2626",
  };
}

function itemTitle(item) {
  return item?.title || item?.name || "Untitled item";
}

function itemDesc(item) {
  return item?.description || item?.desc || "No description available";
}

function itemType(item) {
  return String(item?.reportType || item?.type || "").toUpperCase();
}

function normalizeScore(score) {
  if (score === null || score === undefined || score === "") return "—";
  const num = Number(score);
  if (Number.isNaN(num)) return String(score);
  if (num <= 1) return `${Math.round(num * 100)}%`;
  return `${Math.round(num)}%`;
}

export default function MatchResults({ pageParams, navigateTo, darkMode }) {
  const t = useDark(darkMode);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(null);
  const [running, setRunning] = useState(false);

  const itemId = pageParams?.itemId;
  const type = pageParams?.type;
  const isLostContext = type === "lost";

  async function loadMatches() {
    setLoading(true);
    setError("");
    try {
      const filters = {};
      if (itemId) {
        if (type === "lost") filters.lostItemId = itemId;
        else if (type === "found") filters.foundItemId = itemId;
        else filters.itemId = itemId;
      }

      const data = await getMatches(filters);
      setMatches(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Failed to load matches.");
    } finally {
      setLoading(false);
    }
  }

  async function handleRunMatching() {
    if (!itemId) {
      alert("Open Match Results from a LOST item to run matching.");
      return;
    }

    if (!isLostContext) {
      alert("The fixed backend runs matching using a LOST item ID. Open a lost item and click Run Matching.");
      return;
    }

    try {
      setRunning(true);
      setError("");
      const created = await runMatchingForLostItem(itemId);
      await loadMatches();
      alert(`Matching completed. Matches returned: ${created.length}`);
    } catch (err) {
      setError(err.message || "Failed to run matching.");
    } finally {
      setRunning(false);
    }
  }

  useEffect(() => {
    async function init() {
      if (pageParams?.autoRun && isLostContext && itemId) {
        await handleRunMatching();
      } else {
        await loadMatches();
      }
    }

    init();
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
    <div style={{ fontFamily: "'DM Sans','Segoe UI',sans-serif" }}>
      <div style={{ width: "100%", maxWidth: 860, margin: "0 auto" }}>
        <button
          style={{ background: "none", border: "none", color: t.link, fontSize: 14, fontWeight: 600, cursor: "pointer", marginBottom: 18, padding: 0, fontFamily: "inherit" }}
          onClick={() => navigateTo("dashboard")}
        >Back to Dashboard</button>

        <h2 style={{ margin: "0 0 6px", fontSize: 28, fontWeight: 800, color: t.text }}>Match Results</h2>
        <p style={{ margin: "0 0 22px", fontSize: 15, color: t.muted }}>Potential matches from admin-filtered lost item reports</p>

      <div style={{ ...styles.toolbar, background: t.card, border: `1px solid ${t.border}` }}>
        <div>
          <div style={{ color: t.text, fontWeight: 800 }}>Backend matching status</div>
          <p style={{ color: t.muted, margin: "4px 0 0", fontSize: 14 }}>
            The fixed backend creates matches only after calling <b>POST /matches/run?lostItemId=...</b>.
          </p>
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button onClick={loadMatches} style={{ ...styles.toolbarBtn, background: "#64748b" }}>Refresh</button>
          <button
            onClick={handleRunMatching}
            disabled={running || !itemId || !isLostContext}
            style={{ ...styles.toolbarBtn, background: isLostContext ? "#0F5FFF" : "#94a3b8", cursor: isLostContext ? "pointer" : "not-allowed" }}
            title={!isLostContext ? "Run matching is available only for LOST items." : undefined}
          >
            {running ? "Running..." : "Run Matching"}
          </button>
        </div>
      </div>

      {loading && <div style={{ ...styles.info, background: t.card, border: `1px solid ${t.border}`, color: t.text }}>Loading matches...</div>}

      {!loading && error && (
        <div style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: 8, padding: 22, color: t.red }}>
          {error}
        </div>
      )}

      {!loading && !error && matches.length === 0 && (
        <div style={{ ...styles.info, background: t.card, border: `1px solid ${t.border}`, color: t.text }}>
          <h3 style={{ marginTop: 0 }}>No matches found yet</h3>
          <p style={{ color: t.muted, marginBottom: 0 }}>
            Create one LOST item and one similar FOUND item. Then open the lost item and click <b>Run Matching</b>.
          </p>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {matches.map((match) => {
          const lostItem = match.lostItem || match.lost || {};
          const foundItem = match.foundItem || match.found || {};
          const matchId = match.id || match.matchId;
          const score = normalizeScore(match.confidenceScore ?? match.score);
          const status = match.status || "SUGGESTED";

          return (
            <div key={matchId} style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: 22, padding: 24, boxShadow: "0 4px 16px rgba(0,0,0,0.06)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap", marginBottom: 18 }}>
                <div>
                  <div style={{ color: t.muted, fontSize: 13, fontWeight: 700 }}>MATCH #{matchId}</div>
                  <h2 style={{ color: t.text, margin: "4px 0 0", fontSize: 22 }}>Confidence: {score}</h2>
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
                  <p style={{ color: t.body, margin: "6px 0" }}><b>Category:</b> {lostItem.category || "—"}</p>
                  <p style={{ color: t.body, margin: "6px 0" }}><b>Location:</b> {lostItem.location || "—"}</p>
                </div>

                <div style={{ background: t.fieldBg, border: `1px solid ${t.border}`, borderRadius: 16, padding: 18 }}>
                  <div style={{ color: t.green, fontSize: 12, fontWeight: 800, marginBottom: 8 }}>🟢 FOUND ITEM</div>
                  <h3 style={{ color: t.text, margin: "0 0 8px" }}>{itemTitle(foundItem)}</h3>
                  <p style={{ color: t.muted, whiteSpace: "pre-wrap", lineHeight: 1.5 }}>{itemDesc(foundItem)}</p>
                  <p style={{ color: t.body, margin: "6px 0" }}><b>ID:</b> {foundItem.id || "—"}</p>
                  <p style={{ color: t.body, margin: "6px 0" }}><b>Type:</b> {itemType(foundItem) || "FOUND"}</p>
                  <p style={{ color: t.body, margin: "6px 0" }}><b>Category:</b> {foundItem.category || "—"}</p>
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

              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap", marginTop: 14 }}>
                <p style={{ margin: 0, fontSize: 14, color: t.body, fontWeight: 600 }}>
                  Match Score: {normalizeScore(match.confidenceScore ?? match.score)}
                </p>
                <span style={{
                  display: "inline-block", padding: "6px 16px",
                  borderRadius: 8, fontSize: 13, fontWeight: 600,
                  background: match.status === "SUGGESTED" ? "#E6F1FB" : "#FAEEDA",
                  color: match.status === "SUGGESTED" ? "#0b3470" : "#633806",
                }}>{match.status}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const styles = {
  toolbar: { padding: 18, borderRadius: 18, marginBottom: 20, display: "flex", justifyContent: "space-between", gap: 14, flexWrap: "wrap", alignItems: "center" },
  toolbarBtn: { border: "none", color: "white", borderRadius: 12, padding: "11px 16px", fontWeight: 800, cursor: "pointer" },
  info: { padding: 28, borderRadius: 18, textAlign: "center", marginBottom: 18 },
  error: { padding: 16, borderRadius: 14, background: "#fee2e2", border: "1px solid #fecaca", color: "#991b1b", marginBottom: 18 },
  action: { border: "none", color: "white", borderRadius: 12, padding: "11px 16px", fontWeight: 800, cursor: "pointer" },
};
