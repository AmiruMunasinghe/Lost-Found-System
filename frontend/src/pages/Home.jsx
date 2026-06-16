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
  link: "#2563eb",
};

function Home({ goToForm, goToResults, goToReturnItem, goToClaimItem }) {
  return (
    <div style={styles.page}>
      {/* NAVBAR */}
      <div style={styles.nav}>
        <div>
          <h2 style={styles.logo}>University of Moratuwa</h2>
          <p style={styles.navSub}>Lost & Found Item System</p>
        </div>

        <button style={styles.navBtn} onClick={goToForm}>
          Report Item
        </button>
      </div>

      {/* HERO SECTION */}
      <div style={styles.hero}>
        <h1 style={styles.title}>
          Lost & Found Item Management System
        </h1>

        <p style={styles.subtitle}>
          A centralized platform for students and staff of the University of
          Moratuwa to report, track, and recover lost or found items efficiently.
        </p>
        <div style={{ display: "flex", gap: "16px", justifyContent: "center", alignItems: "center", flexWrap: "wrap" }}>
          <button style={styles.actionBtn} onClick={goToForm}>
            ➕ Submit a Report
          </button>
          <button style={styles.actionBtn} onClick={goToResults}>
            🔗 Match Results
          </button>
          <button style={styles.actionBtn} onClick={goToReturnItem}>
            🔄 Return Item
          </button>
          <button style={styles.actionBtn} onClick={goToClaimItem}>
            📦 Claim Item
          </button>
        </div>
      </div>

      {/* INFO SECTION */}
      <div style={styles.cardContainer}>
        <div style={styles.card}>
          <div style={styles.cardIcon}>🎓</div>
          <h3 style={styles.cardTitle}>University System</h3>
          <p style={styles.cardDesc}>Designed for students, lecturers, and staff members.</p>
        </div>

        <div style={styles.card}>
          <div style={styles.cardIcon}>🔒</div>
          <h3 style={styles.cardTitle}>Secure Reporting</h3>
          <p style={styles.cardDesc}>Keep track of lost and found items safely and reliably.</p>
        </div>

        <div style={styles.card}>
          <div style={styles.cardIcon}>⚡</div>
          <h3 style={styles.cardTitle}>Fast Recovery</h3>
          <p style={styles.cardDesc}>Quickly connect owners with found belongings.</p>
        </div>
      </div>

      {/* FOOTER */}
      <div style={styles.footer}>
        © 2026 University of Moratuwa | Faculty of Engineering
      </div>
    </div>
  );
}

const styles = {
  page: {
    fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
    minHeight: "100vh",
    background: C.bg,
  },

  /* NAVBAR */
  nav: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "20px 48px",
    background: C.primaryDk,
    color: "white",
    boxShadow: "0 4px 20px rgba(11,52,112,0.2)",
  },
  logo: {
    margin: 0,
    fontSize: "18px",
    fontWeight: 700,
  },
  navSub: {
    margin: 0,
    fontSize: "13px",
    color: "rgba(255,255,255,0.65)",
  },
  navBtn: {
    padding: "12px 24px",
    fontSize: "15px",
    fontWeight: "700",
    color: C.primaryDk,
    border: "none",
    borderRadius: "14px",
    cursor: "pointer",
    background: "#ffffff",
    fontFamily: "inherit",
    transition: "all 0.2s ease",
  },

  /* HERO */
  hero: {
    textAlign: "center",
    padding: "80px 20px 60px",
  },
  title: {
    fontSize: "44px",
    fontWeight: 800,
    color: C.primaryDk,
    marginBottom: "16px",
    lineHeight: 1.15,
  },
  subtitle: {
    fontSize: "17px",
    color: C.muted,
    maxWidth: "650px",
    margin: "0 auto 32px",
    lineHeight: "1.6",
  },
  actionBtn: {
    padding: "14px 28px",
    fontSize: "16px",
    fontWeight: "700",
    color: "white",
    border: "none",
    borderRadius: "14px",
    cursor: "pointer",
    background: "linear-gradient(90deg, #0F5FFF, #4A8BFF)",
    boxShadow: "0 8px 24px rgba(15, 95, 255, 0.25)",
    transition: "all 0.3s ease",
    fontFamily: "inherit",
  },

  /* CARDS */
  cardContainer: {
    display: "flex",
    justifyContent: "center",
    gap: "20px",
    padding: "40px",
    flexWrap: "wrap",
  },
  card: {
    background: "white",
    width: "280px",
    padding: "28px 24px",
    borderRadius: "22px",
    boxShadow: "0 4px 16px rgba(0,0,0,0.04)",
    border: `1px solid ${C.border}`,
    textAlign: "center",
  },
  cardIcon: {
    width: 52,
    height: 52,
    borderRadius: 14,
    background: "#E6F1FB",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 24,
    margin: "0 auto 14px",
  },
  cardTitle: {
    fontSize: "16px",
    fontWeight: 700,
    color: C.primaryDk,
    margin: "0 0 8px",
  },
  cardDesc: {
    fontSize: "14px",
    color: C.muted,
    lineHeight: 1.5,
    margin: 0,
  },

  /* FOOTER */
  footer: {
    textAlign: "center",
    padding: "24px",
    fontSize: "13px",
    color: C.muted,
    marginTop: "40px",
  },
};

export default Home;