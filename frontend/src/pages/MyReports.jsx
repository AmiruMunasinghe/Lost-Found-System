import { useState } from "react";

const C = {
  primary:    "#185FA5",
  bg:         "#F4F6FA",
  card:       "#FFFFFF",
  text:       "#1A1D2E",
  muted:      "#6B7080",
  border:     "#DDE1EA",
  fieldBg:    "#F8F9FC",
};

const css = {
  page: {
    minHeight: "100vh",
    background: C.bg,
    fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
    padding: "24px 16px",
  },
  link: {
    background: "none",
    border: "none",
    color: C.primary,
    fontSize: 13,
    cursor: "pointer",
    padding: 0,
    fontFamily: "inherit",
    display: "flex",
    alignItems: "center",
    gap: 5,
    marginBottom: 14,
  },
  wideCard: {
    background: C.card,
    border: `1px solid ${C.border}`,
    borderRadius: 14,
    width: "100%",
    boxSizing: "border-box",
    overflow: "hidden",
  },
};

function Badge({ children, color }) {
  const map = {
    blue:   { bg: "#E6F1FB", text: "#0C447C" },
    green:  { bg: "#EAF3DE", text: "#27500A" },
    amber:  { bg: "#FAEEDA", text: "#633806" },
    red:    { bg: "#FCEBEB", text: "#791F1F" },
  };
  const t = map[color] || map.blue;
  return (
    <span style={{
      background: t.bg, color: t.text,
      fontSize: 11, fontWeight: 600,
      padding: "3px 9px", borderRadius: 20,
      display: "inline-block",
    }}>{children}</span>
  );
}

function BackBtn({ label, onClick }) {
  return (
    <button style={css.link} onClick={onClick}>
      ← {label}
    </button>
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
      <div style={{ width: "100%", maxWidth: 660, margin: "0 auto" }}>
        <BackBtn label="Back to Dashboard" onClick={() => go("dashboard")} />
        <h2 style={{ margin: "0 0 4px", fontSize: 22, fontWeight: 700, color: C.text }}>My Reports</h2>
        <p style={{ margin: "0 0 18px", fontSize: 13, color: C.muted }}>Track the status of your lost and found reports</p>

        <div style={css.wideCard}>
          {/* Tabs */}
          <div style={{ display: "flex", borderBottom: `1px solid ${C.border}` }}>
            {["Lost Items", "Found Items"].map((t, i) => (
              <button key={t} onClick={() => setTab(i)} style={{
                padding: "11px 20px", fontSize: 13, fontFamily: "inherit",
                border: "none", background: "none", cursor: "pointer",
                color: tab === i ? C.primary : C.muted,
                fontWeight: tab === i ? 600 : 400,
                borderBottom: tab === i ? `2px solid ${C.primary}` : "2px solid transparent",
                marginBottom: -1,
              }}>{t}</button>
            ))}
          </div>

          {/* Table */}
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ background: C.fieldBg }}>
                {["Item", "Category", "Date", "Status", "Match"].map(h => (
                  <th key={h} style={{
                    textAlign: "left", padding: "10px 16px",
                    fontSize: 10, fontWeight: 600, letterSpacing: "0.5px",
                    textTransform: "uppercase", color: C.muted,
                    borderBottom: `1px solid ${C.border}`,
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tab === 0 ? rows.map((r, i) => (
                <tr key={i} style={{ borderBottom: `1px solid ${C.border}` }}>
                  <td style={{ padding: "12px 16px", color: C.text, fontWeight: 600 }}>{r.item}</td>
                  <td style={{ padding: "12px 16px", color: C.muted }}>{r.cat}</td>
                  <td style={{ padding: "12px 16px", color: C.muted }}>{r.date}</td>
                  <td style={{ padding: "12px 16px" }}><Badge color={statusColor[r.status]}>{r.status}</Badge></td>
                  <td style={{ padding: "12px 16px", color: C.text }}>{r.match}</td>
                </tr>
              )) : (
                <tr><td colSpan={5} style={{ padding: "32px 16px", textAlign: "center", color: C.muted, fontSize: 13 }}>No found item reports yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}