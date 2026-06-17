import React, { useState } from "react";

const C = {
  primary: "#0F5FFF",
  primaryDk: "#0b3470",
  bg: "#eef4fb",
  card: "#FFFFFF",
  text: "#0b3470",
  body: "#344054",
  muted: "#667085",
  border: "#d0d5dd",
  green: "#10B981",
  greenBg: "#E6F4EA",
  red: "#EF4444",
  redBg: "#FCEBEB",
};

const INITIAL_ITEMS = [
  { id: 1, title: "Black Dell Laptop", type: "lost", category: "Electronics", location: "Sumanadasa Building, L2", date: "2026-06-15", desc: "Latitude model with a Moratuwa sticker on the cover." },
  { id: 2, title: "Keys with Red Lanyard", type: "found", category: "Keys", location: "Civil Common Room", date: "2026-06-14", desc: "A bundle of 3 keys with an orange keychain." },
  { id: 3, title: "Leather Wallet", type: "lost", category: "Bags & Wallets", location: "Canteen Area", date: "2026-06-13", desc: "Brown leather wallet containing national identity card." },
  { id: 4, title: "Calculater fx-991ES Plus", type: "found", category: "Electronics", location: "EN classrooms", date: "2026-06-12", desc: "Scientific calculator with UOM student id sticker behind." },
  { id: 5, title: "Blue Water Bottle", type: "lost", category: "Other", location: "Gymnasium", date: "2026-06-10", desc: "Decathlon metallic water bottle with a small dent on top." },
  { id: 6, title: "Student Identity Card", type: "found", category: "Documents", location: "Library Entrance", date: "2026-06-09", desc: "Card belongs to student initials A.M." },
];

export default function BrowseItems({ navigateTo }) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [type, setType] = useState("All"); // All, lost, found

  const filteredItems = INITIAL_ITEMS.filter((item) => {
    const matchesSearch = item.title.toLowerCase().includes(search.toLowerCase()) || 
                          item.desc.toLowerCase().includes(search.toLowerCase()) || 
                          item.location.toLowerCase().includes(search.toLowerCase());
    
    const matchesCategory = category === "All" || item.category === category;
    const matchesType = type === "All" || item.type === type;
    
    return matchesSearch && matchesCategory && matchesType;
  });

  const categories = ["All", "Electronics", "Bags & Wallets", "Keys", "Documents", "Other"];

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Public Lost & Found Directory</h1>
        <p style={styles.subtitle}>
          Browse items reported lost or found at the University of Moratuwa.
        </p>
      </div>

      {/* FILTER CONTROLS PANEL */}
      <div style={styles.controls}>
        <input
          style={styles.searchBar}
          placeholder="🔍 Search by name, description, or location..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        
        <div style={styles.filtersRow}>
          {/* Category Filters */}
          <div style={styles.filterGroup}>
            <label style={styles.label}>Category</label>
            <select style={styles.select} value={category} onChange={(e) => setCategory(e.target.value)}>
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Type Filters */}
          <div style={styles.filterGroup}>
            <label style={styles.label}>Type</label>
            <div style={styles.btnGroup}>
              {["All", "Lost", "Found"].map((t) => (
                <button
                  key={t}
                  style={{
                    ...styles.btnGroupItem,
                    background: type === t.toLowerCase() || (t === "All" && type === "All") ? C.primary : "white",
                    color: type === t.toLowerCase() || (t === "All" && type === "All") ? "white" : C.text,
                    border: `1px solid ${type === t.toLowerCase() || (t === "All" && type === "All") ? C.primary : C.border}`,
                  }}
                  onClick={() => setType(t === "All" ? "All" : t.toLowerCase())}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ITEM GRID */}
      <div style={styles.grid}>
        {filteredItems.length > 0 ? (
          filteredItems.map((item) => (
            <div key={item.id} style={styles.card}>
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
                <span style={styles.categoryBadge}>{item.category}</span>
              </div>
              
              <h3 style={styles.cardTitle}>{item.title}</h3>
              <p style={styles.cardDesc}>{item.desc}</p>
              
              <div style={styles.metaRow}>
                <span style={styles.metaItem}>📍 {item.location}</span>
                <span style={styles.metaItem}>📅 {item.date}</span>
              </div>

              <button 
                style={styles.actionBtn}
                onClick={() => {
                  // If logged in, go to match/claim, else prompt login
                  navigateTo("/login");
                }}
              >
                {item.type === "lost" ? "I Found This" : "Claim Belongs to Me"}
              </button>
            </div>
          ))
        ) : (
          <div style={styles.noResults}>
            <h3>No matching items found</h3>
            <p>Try refining your search query or modifying the category filters.</p>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "10px 20px 40px",
    fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
  },
  header: {
    textAlign: "center",
    marginBottom: "32px",
  },
  title: {
    fontSize: "36px",
    fontWeight: "800",
    color: C.primaryDk,
    margin: "0 0 10px",
  },
  subtitle: {
    fontSize: "16px",
    color: C.muted,
    margin: 0,
  },
  controls: {
    background: "white",
    borderRadius: "16px",
    padding: "20px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.03)",
    border: `1px solid ${C.border}`,
    marginBottom: "30px",
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  searchBar: {
    width: "100%",
    padding: "16px 20px",
    fontSize: "16px",
    borderRadius: "12px",
    border: `1px solid ${C.border}`,
    outline: "none",
    boxSizing: "border-box",
    transition: "border-color 0.2s",
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
  },
  label: {
    fontSize: "13px",
    fontWeight: "700",
    color: C.text,
  },
  select: {
    padding: "10px 16px",
    fontSize: "14px",
    borderRadius: "10px",
    border: `1px solid ${C.border}`,
    background: "white",
    minWidth: "180px",
    outline: "none",
  },
  btnGroup: {
    display: "flex",
    borderRadius: "10px",
    overflow: "hidden",
  },
  btnGroupItem: {
    padding: "10px 20px",
    fontSize: "14px",
    fontWeight: "700",
    cursor: "pointer",
    border: `1px solid ${C.border}`,
    transition: "all 0.2s",
    fontFamily: "inherit",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
    gap: "24px",
  },
  card: {
    background: "white",
    borderRadius: "18px",
    border: `1px solid ${C.border}`,
    padding: "24px",
    display: "flex",
    flexDirection: "column",
    boxShadow: "0 4px 12px rgba(0,0,0,0.02)",
    transition: "transform 0.25s, box-shadow 0.25s",
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "16px",
  },
  badge: {
    padding: "4px 10px",
    borderRadius: "12px",
    fontSize: "12px",
    fontWeight: "700",
  },
  categoryBadge: {
    background: "#F3F4F6",
    color: "#4B5563",
    padding: "4px 10px",
    borderRadius: "12px",
    fontSize: "11px",
    fontWeight: "700",
  },
  cardTitle: {
    fontSize: "18px",
    fontWeight: "700",
    color: C.text,
    margin: "0 0 10px",
  },
  cardDesc: {
    fontSize: "14px",
    color: C.muted,
    lineHeight: "1.5",
    margin: "0 0 18px",
    flex: 1,
  },
  metaRow: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    marginBottom: "20px",
    borderTop: "1px solid #F3F4F6",
    paddingTop: "12px",
  },
  metaItem: {
    fontSize: "13px",
    color: "#6B7280",
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
    background: "white",
    borderRadius: "18px",
    border: `1px solid ${C.border}`,
    color: C.text,
  },
};
