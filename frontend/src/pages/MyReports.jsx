import React, { useEffect, useState } from "react";
import { getUserItems } from "../api/items";

function useDark(dm) {
  return dm ? {
    card: "#1e293b", border: "#334155", text: "#e2e8f0",
    muted: "#94a3b8", body: "#cbd5e1", fieldBg: "#0f172a",
    link: "#60a5fa", unread: "#1a2d47",
  } : {
    card: "#FFFFFF", border: "#d0d5dd", text: "#0b3470",
    muted: "#667085", body: "#344054", fieldBg: "#f6f9ff",
    link: "#2563eb", unread: "#f0f5ff",
  };
}

function Badge({ children, color }) {
  const map = {
    blue:  { bg: "#E6F1FB", text: "#0b3470" },
    green: { bg: "#EAF3DE", text: "#27500A" },
    amber: { bg: "#FAEEDA", text: "#633806" },
    red:   { bg: "#FCEBEB", text: "#791F1F" },
  };
  const c = map[color] || map.blue;
  return (
    <span style={{
      background: c.bg, color: c.text,
      fontSize: 12, fontWeight: 600,
      padding: "4px 12px", borderRadius: 22,
      display: "inline-block",
    }}>{children}</span>
  );
}

export default function MyReports({ user, navigateTo, darkMode }) {
  const t = useDark(darkMode);
  const [tab, setTab] = useState(0);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  const statusColor = {
    OPEN: "amber",
    PENDING: "amber",
    PENDING_REVIEW: "amber",
    MATCHED: "blue",
    CLAIMED: "green",
    RESOLVED: "green",
    CLOSED: "green",
  };

  useEffect(() => {
    if (!user?.id) {
      setItems([]);
      return;
    }

    let active = true;
    setLoading(true);
    setApiError("");

    getUserItems(user.id)
      .then((data) => {
        if (!active) return;
        setItems(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        if (!active) return;
        setApiError(err.message || "Unable to load your reports.");
      })
      .finally(() => {
        if (!active) return;
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [user?.id]);

  const getItemReportType = (item) => {
    const raw = item.reportType || item.type || item?.reportType?.name || item?.type?.name || "";
    const text = String(raw).toUpperCase();
    if (text.includes("FOUND")) return "FOUND";
    if (text.includes("LOST")) return "LOST";
    return "LOST";
  };

  const filteredItems = items.filter((item) => {
    const type = getItemReportType(item);
    return tab === 0 ? type === "LOST" : type === "FOUND";
  });

  const getMatchValue = (item) => {
    if (item.matchScore || item.matchPercentage) {
      return `${item.matchScore || item.matchPercentage}%`;
    }
    if (item.matchStatus) {
      return item.matchStatus;
    }
    return "-";
  };

  return (
    <div style={{ fontFamily: "'DM Sans','Segoe UI',sans-serif" }}>
      <div style={{ width: "100%", maxWidth: 720, margin: "0 auto" }}>
        <button
          style={{ background: "none", border: "none", color: t.link, fontSize: 14, fontWeight: 600, cursor: "pointer", padding: 0, fontFamily: "inherit", marginBottom: 18 }}
          onClick={() => navigateTo("dashboard")}
        >← Back to Dashboard</button>

        <h2 style={{ margin: "0 0 6px", fontSize: 28, fontWeight: 800, color: t.text }}>My Reports</h2>
        <p style={{ margin: "0 0 22px", fontSize: 15, color: t.muted }}>Track the status of your lost and found reports</p>

        <div style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: 22, overflow: "hidden", boxShadow: "0 4px 16px rgba(0,0,0,0.04)", transition: "background 0.3s, border-color 0.3s" }}>
          {/* Tabs */}
          <div style={{ display: "flex", borderBottom: `1px solid ${t.border}` }}>
            {["Lost Items", "Found Items"].map((label, i) => (
              <button key={label} onClick={() => setTab(i)} style={{
                padding: "14px 24px", fontSize: 14, fontFamily: "inherit",
                border: "none", background: "none", cursor: "pointer",
                color: tab === i ? "#0F5FFF" : t.muted,
                fontWeight: tab === i ? 700 : 400,
                borderBottom: tab === i ? "2.5px solid #0F5FFF" : "2.5px solid transparent",
                marginBottom: -1, transition: "all .2s",
              }}>{label}</button>
            ))}
          </div>

          {/* Table */}
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
            <thead>
              <tr style={{ background: t.fieldBg }}>
                {["Item", "Category", "Date", "Status", "Match"].map(h => (
                  <th key={h} style={{
                    textAlign: "left", padding: "12px 18px",
                    fontSize: 11, fontWeight: 700, letterSpacing: "0.6px",
                    textTransform: "uppercase", color: t.muted,
                    borderBottom: `1px solid ${t.border}`,
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {apiError && (
                <tr>
                  <td colSpan={5} style={{ padding: "22px 18px", color: "#E02424", textAlign: "center" }}>{apiError}</td>
                </tr>
              )}
              {loading && !apiError && (
                <tr>
                  <td colSpan={5} style={{ padding: "22px 18px", color: t.muted, textAlign: "center" }}>Loading your reports…</td>
                </tr>
              )}
              {!loading && !apiError && filteredItems.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ padding: "40px 18px", textAlign: "center", color: t.muted, fontSize: 14 }}>
                    {tab === 0 ? "No lost item reports yet." : "No found item reports yet."}
                  </td>
                </tr>
              )}
              {!loading && !apiError && filteredItems.map((item, index) => (
                <tr key={item.id || index} style={{ borderBottom: `1px solid ${t.border}` }}>
                  <td style={{ padding: "14px 18px", color: t.text, fontWeight: 700 }}>{item.title}</td>
                  <td style={{ padding: "14px 18px", color: t.muted }}>{item.category || "Other"}</td>
                  <td style={{ padding: "14px 18px", color: t.muted }}>{item.date || item.createdAt?.slice(0, 10) || "-"}</td>
                  <td style={{ padding: "14px 18px" }}>
                    <Badge color={statusColor[item.status?.toUpperCase()] || "blue"}>{item.status || "OPEN"}</Badge>
                  </td>
                  <td style={{ padding: "14px 18px", color: t.text, fontWeight: 600 }}>{getMatchValue(item)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}