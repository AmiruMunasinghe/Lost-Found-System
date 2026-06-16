import { useState } from "react";

const C = {
  primary: "#0F5FFF",
  primaryDk: "#0b3470",
  bg: "#eef4fb",
  card: "#FFFFFF",
  text: "#0b3470",
  body: "#344054",
  muted: "#667085",
  border: "#d0d5dd",
  fieldBg: "#f6f9ff",
  link: "#2563eb",
};

const css = {
  page: {
    minHeight: "100vh",
    background: C.bg,
    fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
    padding: "30px 16px",
  },
  backLink: {
    background: "none",
    border: "none",
    color: C.link,
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
    padding: 0,
    fontFamily: "inherit",
    display: "flex",
    alignItems: "center",
    gap: 6,
    marginBottom: 18,
  },
  wideCard: {
    background: C.card,
    border: `1px solid ${C.border}`,
    borderRadius: 22,
    width: "100%",
    boxSizing: "border-box",
    overflow: "hidden",
    boxShadow: "0 4px 16px rgba(0,0,0,0.04)",
  },
};

function Badge({ children, color }) {
  const map = {
    blue:   { bg: "#E6F1FB", text: "#0b3470" },
    green:  { bg: "#EAF3DE", text: "#27500A" },
    amber:  { bg: "#FAEEDA", text: "#633806" },
    red:    { bg: "#FCEBEB", text: "#791F1F" },
  };
  const t = map[color] || map.blue;
  return (
    <span style={{
      background: t.bg, color: t.text,
      fontSize: 12, fontWeight: 600,
      padding: "4px 12px", borderRadius: 22,
      display: "inline-block",
    }}>{children}</span>
  );
}

export default function MyReports({ go }) {
  const [tab, setTab] = useState(0);
  const rows = [
    { item: "Laptop",       cat: "Electronics", date: "Apr 01, 2026", status: "Pending",  match: "85%" },
    { item: "Water Bottle", cat: "Accessories", date: "Mar 28, 2026", status: "Resolved", match: "100%" },
    { item: "Backpack",     cat: "Bags",        date: "Mar 25, 2026", status: "Matched",  match: "90%" },
  ];
  const statusColor = { Pending: "amber", Resolved: "green", Matched: "blue" };

  return (
    <div style={css.page}>
      <div style={{ width: "100%", maxWidth: 720, margin: "0 auto" }}>
        <button style={css.backLink} onClick={() => go("dashboard")}>
          ← Back to Dashboard
        </button>
        <h2 style={{ margin: "0 0 6px", fontSize: 28, fontWeight: 800, color: C.text }}>My Reports</h2>
        <p style={{ margin: "0 0 22px", fontSize: 15, color: C.muted }}>Track the status of your lost and found reports</p>

        <div style={css.wideCard}>
          {/* Tabs */}
          <div style={{ display: "flex", borderBottom: `1px solid ${C.border}` }}>
            {["Lost Items", "Found Items"].map((t, i) => (
              <button key={t} onClick={() => setTab(i)} style={{
                padding: "14px 24px", fontSize: 14, fontFamily: "inherit",
                border: "none", background: "none", cursor: "pointer",
                color: tab === i ? C.primary : C.muted,
                fontWeight: tab === i ? 700 : 400,
                borderBottom: tab === i ? `2.5px solid ${C.primary}` : "2.5px solid transparent",
                marginBottom: -1,
                transition: "all .2s",
              }}>{t}</button>
            ))}
          </div>

          {/* Table */}
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
            <thead>
              <tr style={{ background: C.fieldBg }}>
                {["Item", "Category", "Date", "Status", "Match"].map(h => (
                  <th key={h} style={{
                    textAlign: "left", padding: "12px 18px",
                    fontSize: 11, fontWeight: 700, letterSpacing: "0.6px",
                    textTransform: "uppercase", color: C.muted,
                    borderBottom: `1px solid ${C.border}`,
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tab === 0 ? rows.map((r, i) => (
                <tr key={i} style={{ borderBottom: `1px solid ${C.border}` }}>
                  <td style={{ padding: "14px 18px", color: C.text, fontWeight: 700 }}>{r.item}</td>
                  <td style={{ padding: "14px 18px", color: C.muted }}>{r.cat}</td>
                  <td style={{ padding: "14px 18px", color: C.muted }}>{r.date}</td>
                  <td style={{ padding: "14px 18px" }}><Badge color={statusColor[r.status]}>{r.status}</Badge></td>
                  <td style={{ padding: "14px 18px", color: C.text, fontWeight: 600 }}>{r.match}</td>
                </tr>
              )) : (
                <tr><td colSpan={5} style={{ padding: "40px 18px", textAlign: "center", color: C.muted, fontSize: 14 }}>No found item reports yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}