import React from "react";

function About({ darkMode }) {
  const bg = darkMode ? "#0f172a" : "#eef4fb";
  const text = darkMode ? "#e2e8f0" : "#0b3470";
  const muted = darkMode ? "#94a3b8" : "#667085";
  const card = darkMode ? "#1e293b" : "#ffffff";
  const border = darkMode ? "#334155" : "#d0d5dd";

  return (
    <div style={{ minHeight: "100vh", background: bg, padding: "80px 24px" }}>
      <div
        style={{
          maxWidth: "900px",
          margin: "0 auto",
          background: card,
          border: `1px solid ${border}`,
          borderRadius: "24px",
          padding: "40px",
          boxShadow: "0 8px 24px rgba(0,0,0,0.05)",
        }}
      >
        <h1 style={{ color: text, fontSize: "40px", marginBottom: "18px" }}>
          About UniLost & Found
        </h1>

        <p style={{ color: muted, fontSize: "16px", lineHeight: 1.7 }}>
          UniLost & Found is a centralized platform designed for students and staff
          of the University of Moratuwa to report lost items, submit found items,
          and recover belongings more efficiently.
        </p>

        <p style={{ color: muted, fontSize: "16px", lineHeight: 1.7, marginTop: "16px" }}>
          The system helps reduce confusion by keeping lost and found reports in
          one place and allowing users to track item status through a simple web interface.
        </p>
      </div>
    </div>
  );
}

export default About;