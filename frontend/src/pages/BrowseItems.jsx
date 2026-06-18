import React, { useEffect, useMemo, useState } from "react";
import { getMyItems } from "../api/items";

const C = {
  primary: "#0F5FFF",
  green: "#10B981",
  greenBg: "#E6F4EA",
  red: "#EF4444",
  redBg: "#FCEBEB",
  yellow: "#f59e0b",
  yellowBg: "#fffbeb",
};

function theme(darkMode) {
  return darkMode ? {
    page: "#0f172a", card: "#1e293b", input: "#111827", text: "#e2e8f0",
    muted: "#94a3b8", border: "#334155", tab: "#111827", tabText: "#cbd5e1",
    badge: "#334155", shadow: "0 4px 20px rgba(0,0,0,0.25)",
  } : {
    page: "transparent", card: "#ffffff", input: "#ffffff", text: "#0b3470",
    muted: "#667085", border: "#d0d5dd", tab: "#ffffff", tabText: "#0b3470",
    badge: "#f3f4f6", shadow: "0 4px 20px rgba(0,0,0,0.03)",
  };
}

function getType(item) {
  return String(item.reportType || item.type || "").toUpperCase();
}

function statusInfo(status) {
  const s = String(status || "PENDING_REVIEW").toUpperCase();
  if (s === "PENDING_REVIEW") return { label: "Pending admin approval", bg: C.yellowBg, color: C.yellow };
  if (s === "OPEN") return { label: "Approved", bg: C.greenBg, color: C.green };
  if (s === "MATCHED") return { label: "Matched", bg: "#e0f2fe", color: "#0369a1" };
  if (s === "CLOSED") return { label: "Closed / Rejected", bg: C.redBg, color: C.red };
  return { label: s.replaceAll("_", " "), bg: "#f3f4f6", color: "#475569" };
}

function text(value) {
  return String(value || "");
}

export default function BrowseItems({ navigateTo, darkMode, user }) {
  const T = theme(darkMode);
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [type, setType] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadItems() {
    if (!user?.id) {
      setItems([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");
      const data = await getMyItems(user.id);
      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Failed to load your items from backend.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const categories = useMemo(() => {
    const values = new Set(["All"]);
    items.forEach((item) => values.add(item.category || "Other"));
    return Array.from(values);
  }, [items]);

  const filteredItems = items.filter((item) => {
    const q = search.toLowerCase();
    const searchableText = [item.title, item.description, item.location, item.category, item.status]
      .map(text)
      .join(" ")
      .toLowerCase();

    const matchesSearch = searchableText.includes(q);
    const matchesCategory = category === "All" || item.category === category;
    const reportType = getType(item);
    const matchesType = type === "All" || (type === "lost" && reportType === "LOST") || (type === "found" && reportType === "FOUND");
    return matchesSearch && matchesCategory && matchesType;
  });

  const openMatches = (item) => {
    navigateTo && navigateTo("matchresults", { itemId: item.id, type: getType(item).toLowerCase() });
  };

  return (
    <div style={{ ...styles.container, background: T.page }}>
      <div style={styles.header}>
        <h1 style={{ ...styles.title, color: T.text }}>My Items</h1>
        <p style={{ ...styles.subtitle, color: T.muted }}>
          Only reports submitted by you are shown here. New reports stay pending until an admin approves them.
        </p>
      </div>

      <div style={{ ...styles.controls, background: T.card, border: `1px solid ${T.border}`, boxShadow: T.shadow }}>
        <input
          style={{ ...styles.searchBar, background: T.input, color: T.text, border: `1px solid ${T.border}` }}
          placeholder="🔍 Search your reports..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <div style={styles.filtersRow}>
          <div style={styles.filterGroup}>
            <label style={{ ...styles.label, color: T.text }}>Category</label>
            <select style={{ ...styles.select, background: T.input, color: T.text, border: `1px solid ${T.border}` }} value={category} onChange={(e) => setCategory(e.target.value)}>
              {categories.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>

          <div style={styles.filterGroup}>
            <label style={{ ...styles.label, color: T.text }}>Type</label>
            <div style={styles.btnGroup}>
              {[["All", "All"], ["Lost", "lost"], ["Found", "found"]].map(([label, value]) => {
                const active = type === value;
                return (
                  <button key={label} style={{ ...styles.btnGroupItem, background: active ? C.primary : T.tab, color: active ? "white" : T.tabText, border: `1px solid ${active ? C.primary : T.border}` }} onClick={() => setType(value)}>
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <button type="button" onClick={loadItems} style={styles.refreshBtn}>Refresh My Items</button>
      </div>

      {loading && <div style={{ ...styles.infoBox, background: T.card, color: T.text, border: `1px solid ${T.border}` }}>Loading your reports...</div>}
      {error && <div style={styles.errorBox}>{error}</div>}

      {!loading && !error && (
        <div style={styles.grid}>
          {filteredItems.length > 0 ? filteredItems.map((item) => {
            const reportType = getType(item);
            const lost = reportType === "LOST";
            const description = item.description || item.desc || "No description";
            const status = statusInfo(item.status);

            return (
              <div key={item.id} style={{ ...styles.card, background: T.card, border: `1px solid ${T.border}`, boxShadow: T.shadow }}>
                <div style={styles.cardHeader}>
                  <span style={{ ...styles.badge, background: lost ? C.redBg : C.greenBg, color: lost ? C.red : C.green }}>{lost ? "🔴 Lost" : "🟢 Found"}</span>
                  <span style={{ ...styles.categoryBadge, background: T.badge, color: T.muted }}>{item.category}</span>
                </div>

                <h3 style={{ ...styles.cardTitle, color: T.text }}>{item.title}</h3>
                <p style={{ ...styles.cardDesc, color: T.muted }}>{description}</p>

                <div style={{ ...styles.metaRow, borderTop: `1px solid ${T.border}` }}>
                  <span style={{ ...styles.metaItem, color: T.muted }}>📍 {item.location || "No location"}</span>
                  <span style={{ ...styles.metaItem, color: T.muted }}>📅 {item.date || "No date"}</span>
                  <span style={{ ...styles.statusPill, background: status.bg, color: status.color }}>{status.label}</span>
                  <span style={{ ...styles.metaItem, color: T.muted }}>#ID: {item.id}</span>
                </div>

                <div style={styles.cardActions}>
                  <button style={styles.actionBtn} onClick={() => openMatches(item)}>
                    View Match Results
                  </button>
                </div>
              </div>
            );
          }) : (
            <div style={{ ...styles.infoBox, background: T.card, color: T.text, border: `1px solid ${T.border}`, gridColumn: "1 / -1" }}>
              You have not submitted any reports yet.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const styles = {
  container: { minHeight: "100%", fontFamily: "'DM Sans','Segoe UI',sans-serif" },
  header: { marginBottom: 24 },
  title: { fontSize: 32, fontWeight: 800, margin: "0 0 8px" },
  subtitle: { fontSize: 15, margin: 0, maxWidth: 720, lineHeight: 1.5 },
  controls: { padding: 20, borderRadius: 18, marginBottom: 24 },
  searchBar: { width: "100%", height: 48, borderRadius: 12, padding: "0 16px", fontSize: 15, boxSizing: "border-box", outline: "none", marginBottom: 16 },
  filtersRow: { display: "flex", gap: 18, flexWrap: "wrap", alignItems: "end" },
  filterGroup: { display: "grid", gap: 8 },
  label: { fontSize: 13, fontWeight: 800 },
  select: { height: 42, borderRadius: 10, padding: "0 12px", minWidth: 180 },
  btnGroup: { display: "flex", gap: 8, flexWrap: "wrap" },
  btnGroupItem: { borderRadius: 10, padding: "10px 14px", cursor: "pointer", fontWeight: 800 },
  refreshBtn: { marginTop: 16, border: "none", borderRadius: 10, background: C.primary, color: "white", fontWeight: 800, padding: "11px 16px", cursor: "pointer" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 18 },
  card: { borderRadius: 18, padding: 20 },
  cardHeader: { display: "flex", justifyContent: "space-between", gap: 10, marginBottom: 14 },
  badge: { borderRadius: 999, padding: "6px 10px", fontSize: 12, fontWeight: 800 },
  categoryBadge: { borderRadius: 999, padding: "6px 10px", fontSize: 12, fontWeight: 700 },
  statusPill: { borderRadius: 999, padding: "6px 10px", fontSize: 12, fontWeight: 800 },
  cardTitle: { margin: "0 0 10px", fontSize: 20, fontWeight: 800 },
  cardDesc: { margin: "0 0 16px", lineHeight: 1.5, minHeight: 48, whiteSpace: "pre-wrap" },
  metaRow: { display: "flex", flexWrap: "wrap", gap: 10, paddingTop: 14 },
  metaItem: { fontSize: 13 },
  cardActions: { display: "flex", gap: 10, marginTop: 18 },
  actionBtn: { border: "none", borderRadius: 10, background: C.primary, color: "white", padding: "10px 14px", fontWeight: 800, cursor: "pointer" },
  infoBox: { padding: 20, borderRadius: 14 },
  errorBox: { background: "#fee2e2", color: "#991b1b", padding: 16, borderRadius: 14, marginBottom: 16 },
};
