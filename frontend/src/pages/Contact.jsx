import React from "react";

function Contact({ darkMode }) {
  const bg = darkMode ? "#0f172a" : "#eef4fb";
  const text = darkMode ? "#e2e8f0" : "#0b3470";
  const muted = darkMode ? "#94a3b8" : "#667085";
  const card = darkMode ? "#1e293b" : "#ffffff";
  const border = darkMode ? "#334155" : "#d0d5dd";

  return (
    <div style={{ minHeight: "100vh", background: bg, padding: "80px 24px" }}>
      <div
        style={{
          maxWidth: "800px",
          margin: "0 auto",
          background: card,
          border: `1px solid ${border}`,
          borderRadius: "24px",
          padding: "40px",
          boxShadow: "0 8px 24px rgba(0,0,0,0.05)",
        }}
      >
        <h1 style={{ color: text, fontSize: "40px", marginBottom: "18px" }}>
          Contact Us
        </h1>

        <p style={{ color: muted, fontSize: "16px", lineHeight: 1.7 }}>
          For lost and found support, please contact the university administration
          or the responsible Lost and Found unit.
        </p>

        <div style={{ marginTop: "28px", color: muted, lineHeight: 1.8 }}>
          <p><strong style={{ color: text }}>Email:</strong> lostfound@uom.lk</p>
          <p><strong style={{ color: text }}>Location:</strong> University of Moratuwa</p>
          <p><strong style={{ color: text }}>Support Hours:</strong> Monday to Friday, 8.00 AM - 4.00 PM</p>
        </div>
      </div>
    </div>
  );
}

export default Contact;