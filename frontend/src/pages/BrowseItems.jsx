import React, { useEffect, useMemo, useState } from "react";
import { getAllItems } from "../api/items";

const C = {
  primary: "#0F5FFF",
  primaryDk: "#0b3470",
  green: "#10B981",
  greenBg: "#E6F4EA",
  red: "#EF4444",
  redBg: "#FCEBEB",
};

function theme(darkMode) {
  return darkMode ? {
    page: "#0f172a",
    card: "#1e293b",
    input: "#111827",
    text: "#e2e8f0",
    muted: "#94a3b8",
    border: "#334155",
    tab: "#111827",
    tabText: "#cbd5e1",
    badge: "#334155",
    shadow: "0 4px 20px rgba(0,0,0,0.25)",
  } : {
    page: "transparent",
    card: "#ffffff",
    input: "#ffffff",
    text: "#0b3470",
    muted: "#667085",
    border: "#d0d5dd",
    tab: "#ffffff",
    tabText: "#0b3470",
    badge: "#f3f4f6",
    shadow: "0 4px 20px rgba(0,0,0,0.03)",
  };
}

export default function BrowseItems({ navigateTo, darkMode, user }) {
  const T = theme(darkMode);
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [type, setType] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadItems() {
      try {
        setLoading(true);
        setError("");
        const data = await getAllItems();
        if (active) setItems(data);
      } catch (err) {
        if (active) setError(err.message || "Failed to load items from backend.");
      } finally {
        if (active) setLoading(false);
      }
    }

    loadItems();
    return () => { active = false; };
  }, []);

  const categories = useMemo(() => {
    const values = new Set(["All"]);
    items.forEach((item) => values.add(item.category || "Other"));
    return Array.from(values);
  }, [items]);

  const filteredItems = items.filter((item) => {
    const q = search.toLowerCase();
    const matchesSearch =
      item.title.toLowerCase().includes(q) ||
      item.desc.toLowerCase().includes(q) ||
      item.location.toLowerCase().includes(q);

    const matchesCategory = category === "All" || item.category === category;
    const matchesType = type === "All" || item.type === type;

    return matchesSearch && matchesCategory && matchesType;
  });

  const openMatches = (item) => {
    if (!user) {
      navigateTo && navigateTo("login", { next: "browse" });
      return;
    }

    navigateTo && navigateTo("matchresults", {
      itemId: item.id,
      type: item.type,
    });
  };

  return (
    <div style={{ ...styles.container, background: T.page }}>
      <div style={styles.header}>
        <h1 style={{ ...styles.title, color: T.text }}>Lost & Found Directory</h1>
        <p style={{ ...styles.subtitle, color: T.muted }}>
          Items are loaded from the Spring Boot backend.
        </p>
      </div>

      <div style={{ ...styles.controls, background: T.card, border: `1px solid ${T.border}`, boxShadow: T.shadow }}>
        <input
          style={{ ...styles.searchBar, background: T.input, color: T.text, border: `1px solid ${T.border}` }}
          placeholder="🔍 Search by name, description, or location..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <div style={styles.filtersRow}>
          <div style={styles.filterGroup}>
            <label style={{ ...styles.label, color: T.text }}>Category</label>
            <select
              style={{ ...styles.select, background: T.input, color: T.text, border: `1px solid ${T.border}` }}
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {categories.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>

          <div style={styles.filterGroup}>
            <label style={{ ...styles.label, color: T.text }}>Type</label>
            <div style={styles.btnGroup}>
              {[
                ["All", "All"],
                ["Lost", "lost"],
                ["Found", "found"],
              ].map(([label, value]) => {
                const active = type === value;
                return (
                  <button
                    key={label}
                    style={{
                      ...styles.btnGroupItem,
                      background: active ? C.primary : T.tab,
                      color: active ? "white" : T.tabText,
                      border: `1px solid ${active ? C.primary : T.border}`,
                    }}
                    onClick={() => setType(value)}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {loading && <div style={{ ...styles.infoBox, background: T.card, color: T.text, border: `1px solid ${T.border}` }}>Loading backend items...</div>}
      {error && <div style={{ ...styles.errorBox }}>{error}</div>}

      {!loading && !error && (
        <div style={styles.grid}>
          {filteredItems.length > 0 ? filteredItems.map((item) => (
            <div key={item.id} style={{ ...styles.card, background: T.card, border: `1px solid ${T.border}`, boxShadow: T.shadow }}>
              <div style={styles.cardHeader}>
                <span style={{ ...styles.badge, background: item.type === "lost" ? C.redBg : C.greenBg, color: item.type === "lost" ? C.red : C.green }}>
                  {item.type === "lost" ? "🔴 Lost" : "🟢 Found"}
                </span>
                <span style={{ ...styles.categoryBadge, background: T.badge, color: T.muted }}>{item.category}</span>
              </div>

              <h3 style={{ ...styles.cardTitle, color: T.text }}>{item.title}</h3>
              <p style={{ ...styles.cardDesc, color: T.muted }}>{item.desc}</p>

              <div style={{ ...styles.metaRow, borderTop: `1px solid ${T.border}` }}>
                <span style={{ ...styles.metaItem, color: T.muted }}>📍 {item.location || "No location"}</span>
                <span style={{ ...styles.metaItem, color: T.muted }}>📅 {item.date || "No date"}</span>
                <span style={{ ...styles.metaItem, color: T.muted }}>#ID: {item.id}</span>
              </div>

              <button style={styles.actionBtn} onClick={() => openMatches(item)}>
                View Matches
              </button>
            </div>
          )) : (
            <div style={{ ...styles.infoBox, background: T.card, color: T.text, border: `1px solid ${T.border}`, gridColumn: "1 / -1" }}>
              No matching items found.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const styles = {
  container: { maxWidth: "1200px", margin: "0 auto", padding: "10px 20px 40px", fontFamily: "'DM Sans', 'Segoe UI', sans-serif" },
  header: { textAlign: "center", marginBottom: "32px" },
  title: { fontSize: "36px", fontWeight: "800", margin: "0 0 10px" },
  subtitle: { fontSize: "16px", margin: 0 },
  controls: { borderRadius: "16px", padding: "20px", marginBottom: "30px", display: "flex", flexDirection: "column", gap: "16px" },
  searchBar: { width: "100%", padding: "16px 20px", fontSize: "16px", borderRadius: "12px", outline: "none", boxSizing: "border-box" },
  filtersRow: { display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" },
  filterGroup: { display: "flex", flexDirection: "column", gap: "6px" },
  label: { fontSize: "13px", fontWeight: "700" },
  select: { padding: "10px 16px", fontSize: "14px", borderRadius: "10px", minWidth: "180px", outline: "none" },
  btnGroup: { display: "flex", borderRadius: "10px", overflow: "hidden" },
  btnGroupItem: { padding: "10px 20px", fontSize: "14px", fontWeight: "700", cursor: "pointer", fontFamily: "inherit" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "24px" },
  card: { borderRadius: "18px", padding: "24px", display: "flex", flexDirection: "column" },
  cardHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" },
  badge: { padding: "4px 10px", borderRadius: "12px", fontSize: "12px", fontWeight: "700" },
  categoryBadge: { padding: "4px 10px", borderRadius: "12px", fontSize: "11px", fontWeight: "700" },
  cardTitle: { fontSize: "18px", fontWeight: "700", margin: "0 0 10px" },
  cardDesc: { fontSize: "14px", lineHeight: "1.5", margin: "0 0 18px", flex: 1, whiteSpace: "pre-wrap" },
  metaRow: { display: "flex", flexDirection: "column", gap: "6px", marginBottom: "20px", paddingTop: "12px" },
  metaItem: { fontSize: "13px", fontWeight: "500" },
  actionBtn: { width: "100%", padding: "12px", background: "linear-gradient(90deg, #0F5FFF, #4A8BFF)", color: "white", border: "none", borderRadius: "12px", fontWeight: "700", fontSize: "14px", cursor: "pointer", fontFamily: "inherit" },
  infoBox: { padding: "24px", borderRadius: "16px", textAlign: "center" },
  errorBox: { padding: "16px", borderRadius: "16px", background: "#fee2e2", color: "#991b1b", border: "1px solid #fecaca", marginBottom: "20px" },
};
