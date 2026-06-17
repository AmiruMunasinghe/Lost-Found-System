import React from "react";

export default function AdminDashboard({ navigateTo }) {
  const C = {
    primary: "#0F5FFF",
    bg: "#eef4fb",
    card: "#FFFFFF",
    text: "#0b3470",
    border: "#d0d5dd",
    muted: "#667085",
    danger: "#E24B4A"
  };

  const stats = [
    { label: "Pending Reports", value: "12", color: "#BA7517" },
    { label: "Active Users", value: "485", color: "#10B981" },
    { label: "Items Recovered", value: "124", color: C.primary },
    { label: "Flags/Disputes", value: "2", color: C.danger }
  ];

  return (
    <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
      <h1 style={{ color: C.text, marginBottom: "8px" }}>Admin Dashboard</h1>
      <p style={{ color: C.muted, marginBottom: "32px" }}>Overview of system activity and pending administrative tasks.</p>
      
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "20px", marginBottom: "40px" }}>
        {stats.map(stat => (
          <div key={stat.label} style={{ background: C.card, padding: "24px", borderRadius: "16px", border: `1px solid ${C.border}`, boxShadow: "0 4px 12px rgba(0,0,0,0.03)" }}>
            <div style={{ fontSize: "32px", fontWeight: "800", color: stat.color, marginBottom: "8px" }}>{stat.value}</div>
            <div style={{ fontSize: "14px", color: C.muted, fontWeight: "600" }}>{stat.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
        <div style={{ background: C.card, padding: "24px", borderRadius: "16px", border: `1px solid ${C.border}` }}>
          <h3 style={{ marginTop: 0, color: C.text, marginBottom: "16px" }}>Recent Reports to Review</h3>
          <div style={{ color: C.muted, fontSize: "14px" }}>List of reports requiring moderation would appear here.</div>
          <button style={{ marginTop: "16px", padding: "8px 16px", background: C.bg, border: `1px solid ${C.border}`, borderRadius: "8px", cursor: "pointer", fontWeight: "600", color: C.text }} onClick={() => navigateTo("admin-reports")}>View All Reports</button>
        </div>
        
        <div style={{ background: C.card, padding: "24px", borderRadius: "16px", border: `1px solid ${C.border}` }}>
          <h3 style={{ marginTop: 0, color: C.text, marginBottom: "16px" }}>System Alerts</h3>
          <div style={{ color: C.muted, fontSize: "14px" }}>Any system alerts or user reports would appear here.</div>
        </div>
      </div>
    </div>
  );
}
