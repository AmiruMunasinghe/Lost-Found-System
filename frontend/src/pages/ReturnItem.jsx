import React from "react";

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

function ReturnItem({ goHome }) {
  const styles = {
    page: {
      minHeight: "100vh",
      background: C.bg,
      fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
      padding: "30px 16px",
    },
    container: {
      width: "100%",
      maxWidth: 560,
      margin: "0 auto",
    },
    backLink: {
      background: "none",
      border: "none",
      color: C.link,
      fontSize: 14,
      fontWeight: 600,
      cursor: "pointer",
      marginBottom: 18,
      display: "flex",
      alignItems: "center",
      gap: 6,
      padding: 0,
      fontFamily: "inherit",
    },
    card: {
      background: C.card,
      border: `1px solid ${C.border}`,
      borderRadius: 22,
      padding: "36px 32px",
      boxShadow: "0 4px 16px rgba(0,0,0,0.04)",
      textAlign: "center",
    },
    iconBox: {
      width: 72,
      height: 72,
      borderRadius: 18,
      background: "linear-gradient(135deg, #EAF3DE, #D8EDCA)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      margin: "0 auto 20px",
    },
    heading: {
      fontSize: 28,
      fontWeight: 800,
      color: C.text,
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 15,
      color: C.muted,
      marginBottom: 28,
      lineHeight: 1.5,
    },
    featureList: {
      listStyle: "none",
      padding: 0,
      margin: "0 0 28px",
      textAlign: "left",
    },
    featureItem: {
      display: "flex",
      alignItems: "center",
      gap: 12,
      padding: "12px 16px",
      background: C.fieldBg,
      borderRadius: 14,
      marginBottom: 10,
      border: `1px solid ${C.border}`,
      fontSize: 14,
      color: C.body,
      fontWeight: 500,
    },
    featureIcon: {
      width: 32,
      height: 32,
      borderRadius: 8,
      background: "#EAF3DE",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: 16,
      flexShrink: 0,
    },
    backBtn: {
      width: "100%",
      height: 56,
      borderRadius: 14,
      border: "2px solid #2563eb",
      background: "#ffffff",
      color: "#2563eb",
      fontSize: 16,
      fontWeight: 700,
      cursor: "pointer",
      fontFamily: "inherit",
    },
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <button style={styles.backLink} onClick={goHome}>← Back to Dashboard</button>

        <div style={styles.card}>
          <div style={styles.iconBox}>
            <span style={{ fontSize: 32 }}>🔄</span>
          </div>

          <h1 style={styles.heading}>Return Item</h1>
          <p style={styles.subtitle}>
            This page allows users to return found items to their rightful owners.
          </p>

          <ul style={styles.featureList}>
            <li style={styles.featureItem}>
              <div style={styles.featureIcon}>📋</div>
              View items waiting to be returned
            </li>
            <li style={styles.featureItem}>
              <div style={styles.featureIcon}>👤</div>
              Verify owner details
            </li>
            <li style={styles.featureItem}>
              <div style={styles.featureIcon}>✅</div>
              Mark item as returned
            </li>
          </ul>

          <button onClick={goHome} style={styles.backBtn}>
            ← Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}

export default ReturnItem;