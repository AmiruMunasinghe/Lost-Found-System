import React from "react";

export default function AdminReports() {
  return (
    <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
      <h2>Manage Reports</h2>
      <p style={{ color: "#667085" }}>Approve, reject, or archive user reports.</p>
      <div style={{ background: "#fff", padding: "40px", borderRadius: "16px", border: "1px solid #d0d5dd", textAlign: "center", marginTop: "24px", color: "#667085" }}>
        Table of reports will be rendered here.
      </div>
    </div>
  );
}
