import React, { useState } from "react";

const C = {
  primary: "#0F5FFF",
  primaryDk: "#0b3470",
  green: "#10B981",
  greenBg: "#E6F4EA",
  red: "#EF4444",
  redBg: "#FCEBEB",
};

const INITIAL_ITEMS = [
  {
    id: 1,
    title: "Black Dell Laptop",
    type: "lost",
    category: "Electronics",
    location: "Sumanadasa Building, L2",
    date: "2026-06-15",
    desc: "Latitude model with a Moratuwa sticker on the cover.",
  },
  {
    id: 2,
    title: "Keys with Red Lanyard",
    type: "found",
    category: "Keys",
    location: "Civil Common Room",
    date: "2026-06-14",
    desc: "A bundle of 3 keys with an orange keychain.",
  },
  {
    id: 3,
    title: "Leather Wallet",
    type: "lost",
    category: "Bags & Wallets",
    location: "Canteen Area",
    date: "2026-06-13",
    desc: "Brown leather wallet containing national identity card.",
  },
  {
    id: 4,
    title: "Calculator fx-991ES Plus",
    type: "found",
    category: "Electronics",
    location: "EN classrooms",
    date: "2026-06-12",
    desc: "Scientific calculator with UOM student id sticker behind.",
  },
  {
    id: 5,
    title: "Blue Water Bottle",
    type: "lost",
    category: "Other",
    location: "Gymnasium",
    date: "2026-06-10",
    desc: "Decathlon metallic water bottle with a small dent on top.",
  },
  {
    id: 6,
    title: "Student Identity Card",
    type: "found",
    category: "Documents",
    location: "Library Entrance",
    date: "2026-06-09",
    desc: "Card belongs to student initials A.M.",
  },
];

export default function BrowseItems({ navigateTo, darkMode, user }) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [type, setType] = useState("All");

  const T = {
    page: darkMode ? "#0f172a" : "transparent",
    card: darkMode ? "#1e293b" : "#ffffff",
    input: darkMode ? "#111827" : "#ffffff",
    text: darkMode ? "#e2e8f0" : "#0b3470",
    body: darkMode ? "#cbd5e1" : "#344054",
    muted: darkMode ? "#94a3b8" : "#667085",
    border: darkMode ? "#334155" : "#d0d5dd",
    softBorder: darkMode ? "#334155" : "#f3f4f6",
    inactiveTab: darkMode ? "#111827" : "#ffffff",
    inactiveTabText: darkMode ? "#cbd5e1" : "#0b3470",
    categoryBg: darkMode ? "#334155" : "#f3f4f6",
    categoryText: darkMode ? "#cbd5e1" : "#4b5563",
    shadow: darkMode
      ? "0 4px 20px rgba(0,0,0,0.25)"
      : "0 4px 20px rgba(0,0,0,0.03)",
  };

  const filteredItems = INITIAL_ITEMS.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.desc.toLowerCase().includes(search.toLowerCase()) ||
      item.location.toLowerCase().includes(search.toLowerCase());

    const matchesCategory = category === "All" || item.category === category;
    const matchesType = type === "All" || item.type === type;

    return matchesSearch && matchesCategory && matchesType;
  });

  const categories = ["All", "Electronics", "Bags & Wallets", "Keys", "Documents", "Other"];

  const isActiveType = (tab) => type === tab.toLowerCase() || (tab === "All" && type === "All");

  const handleItemAction = (item) => {
    if (!user) {
      navigateTo("/login", {
        next: item.type === "lost" ? "return" : "claim",
        nextParams: { itemId: item.id },
      });
      return;
    }

    navigateTo(item.type === "lost" ? "/return" : "/claim", { itemId: item.id });
  };

  return (
    <div style={{ ...styles.container, background: T.page }}>
      <div style={styles.header}>
        <h1 style={{ ...styles.title, color: T.text }}>Public Lost & Found Directory</h1>
        <p style={{ ...styles.subtitle, color: T.muted }}>
          Browse items reported lost or found at the University of Moratuwa.
        </p>
      </div>

      <div
        style={{
          ...styles.controls,
          background: T.card,
          border: `1px solid ${T.border}`,
          boxShadow: T.shadow,
        }}
      >
        <input
          style={{
            ...styles.searchBar,
            background: T.input,
            color: T.text,
            border: `1px solid ${T.border}`,
          }}
          placeholder="🔍 Search by name, description, or location..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <div style={styles.filtersRow}>
          <div style={styles.filterGroup}>
            <label style={{ ...styles.label, color: T.text }}>Category</label>
            <select
              style={{
                ...styles.select,
                background: T.input,
                color: T.text,
                border: `1px solid ${T.border}`,
              }}
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div style={styles.filterGroup}>
            <label style={{ ...styles.label, color: T.text }}>Type</label>

            <div style={styles.btnGroup}>
              {["All", "Lost", "Found"].map((tab) => {
                const active = isActiveType(tab);

                return (
                  <button
                    key={tab}
                    style={{
                      ...styles.btnGroupItem,
                      background: active ? C.primary : T.inactiveTab,
                      color: active ? "#ffffff" : T.inactiveTabText,
                      border: `1px solid ${active ? C.primary : T.border}`,
                    }}
                    onClick={() => setType(tab === "All" ? "All" : tab.toLowerCase())}
                  >
                    {tab}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div style={styles.grid}>
        {filteredItems.length > 0 ? (
          filteredItems.map((item) => (
            <div
              key={item.id}
              style={{
                ...styles.card,
                background: T.card,
                border: `1px solid ${T.border}`,
                boxShadow: T.shadow,
              }}
            >
              <div style={styles.cardHeader}>
                <span
                  style={{
                    ...styles.badge,
                    background: item.type === "lost" ? C.redBg : C.greenBg,
                    color: item.type === "lost" ? C.red : C.green,
                  }}
                >
                  {item.type === "lost" ? "🔴 Lost" : "🟢 Found"}
                </span>

                <span style={{ ...styles.categoryBadge, background: T.categoryBg, color: T.categoryText }}>
                  {item.category}
                </span>
              </div>

              <h3 style={{ ...styles.cardTitle, color: T.text }}>{item.title}</h3>

              <p style={{ ...styles.cardDesc, color: T.muted }}>{item.desc}</p>

              <div style={{ ...styles.metaRow, borderTop: `1px solid ${T.softBorder}` }}>
                <span style={{ ...styles.metaItem, color: T.muted }}>📍 {item.location}</span>
                <span style={{ ...styles.metaItem, color: T.muted }}>📅 {item.date}</span>
              </div>

              <button style={styles.actionBtn} onClick={() => handleItemAction(item)}>
                {item.type === "lost" ? "I Found This" : "Claim Belongs to Me"}
              </button>
            </div>
          ))
        ) : (
          <div
            style={{
              ...styles.noResults,
              background: T.card,
              border: `1px solid ${T.border}`,
              color: T.text,
            }}
          >
            <h3>No matching items found</h3>
            <p style={{ color: T.muted }}>Try refining your search query or modifying the category filters.</p>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: "1200px",
    width: "100%",
    margin: "0 auto",
    padding: "10px 0 40px",
    fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
    transition: "background-color 0.3s ease, color 0.3s ease",
    boxSizing: "border-box",
  },
  header: {
    textAlign: "center",
    marginBottom: "32px",
  },
  title: {
    fontSize: "36px",
    fontWeight: "800",
    margin: "0 0 10px",
  },
  subtitle: {
    fontSize: "16px",
    margin: 0,
  },
  controls: {
    borderRadius: "16px",
    padding: "20px",
    marginBottom: "30px",
    display: "flex",
    flexDirection: "column",
    gap: "16px",
    transition: "background-color 0.3s ease, border-color 0.3s ease",
    boxSizing: "border-box",
  },
  searchBar: {
    width: "100%",
    padding: "16px 20px",
    fontSize: "16px",
    borderRadius: "12px",
    outline: "none",
    boxSizing: "border-box",
    transition: "background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease",
  },
  filtersRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "16px",
  },
  filterGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    flex: "1 1 220px",
  },
  label: {
    fontSize: "13px",
    fontWeight: "700",
  },
  select: {
    width: "100%",
    padding: "10px 16px",
    fontSize: "14px",
    borderRadius: "10px",
    minWidth: 0,
    outline: "none",
    transition: "background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease",
  },
  btnGroup: {
    display: "flex",
    borderRadius: "10px",
    overflow: "hidden",
    width: "100%",
  },
  btnGroupItem: {
    flex: 1,
    padding: "10px 14px",
    fontSize: "14px",
    fontWeight: "700",
    cursor: "pointer",
    transition: "all 0.2s ease",
    fontFamily: "inherit",
    whiteSpace: "nowrap",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 320px), 1fr))",
    gap: "24px",
  },
  card: {
    borderRadius: "18px",
    padding: "24px",
    display: "flex",
    flexDirection: "column",
    transition: "background-color 0.3s ease, border-color 0.3s ease, transform 0.25s, box-shadow 0.25s",
    minWidth: 0,
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "8px",
    marginBottom: "16px",
    flexWrap: "wrap",
  },
  badge: {
    padding: "4px 10px",
    borderRadius: "12px",
    fontSize: "12px",
    fontWeight: "700",
  },
  categoryBadge: {
    padding: "4px 10px",
    borderRadius: "12px",
    fontSize: "11px",
    fontWeight: "700",
  },
  cardTitle: {
    fontSize: "18px",
    fontWeight: "700",
    margin: "0 0 10px",
  },
  cardDesc: {
    fontSize: "14px",
    lineHeight: "1.5",
    margin: "0 0 18px",
    flex: 1,
  },
  metaRow: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    marginBottom: "20px",
    paddingTop: "12px",
  },
  metaItem: {
    fontSize: "13px",
    fontWeight: "500",
  },
  actionBtn: {
    width: "100%",
    padding: "12px",
    background: "linear-gradient(90deg, #0F5FFF, #4A8BFF)",
    color: "white",
    border: "none",
    borderRadius: "12px",
    fontWeight: "700",
    fontSize: "14px",
    cursor: "pointer",
    fontFamily: "inherit",
    boxShadow: "0 4px 12px rgba(15, 95, 255, 0.15)",
    transition: "all 0.2s",
  },
  noResults: {
    gridColumn: "1 / -1",
    textAlign: "center",
    padding: "60px 20px",
    borderRadius: "18px",
  },
};
