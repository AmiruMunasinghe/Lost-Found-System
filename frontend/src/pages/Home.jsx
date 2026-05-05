import React from "react";

function Home({ goToForm }) {
  return (
    <div style={styles.page}>
      {/* NAVBAR */}
      <div style={styles.nav}>
        <div>
          <h2 style={styles.logo}>University of Moratuwa</h2>
          <p style={styles.navSub}>Lost & Found Item System</p>
        </div>

        <button style={styles.button} onClick={goToForm}>
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

        <button style={styles.primaryButton} onClick={goToForm}>
          ➕ Submit a Report
        </button>
      </div>

      {/* INFO SECTION */}
      <div style={styles.cardContainer}>
        <div style={styles.card}>
          <h3>🎓 University System</h3>
          <p>Designed for students, lecturers, and staff members.</p>
        </div>

        <div style={styles.card}>
          <h3>🔒 Secure Reporting</h3>
          <p>Keep track of lost and found items safely and reliably.</p>
        </div>

        <div style={styles.card}>
          <h3>⚡ Fast Recovery</h3>
          <p>Quickly connect owners with found belongings.</p>
        </div>
      </div>

      {/* FOOTER */}
      <div style={styles.footer}>
        © 2026 University of Moratuwa | Faculty of Information Technology
      </div>
    </div>
  );
}

const styles = {
  page: {
    fontFamily: "Arial",
    minHeight: "100vh",
    background: "#f5f7fb",
  },

  /* NAVBAR */
  nav: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "20px 40px",
    background: "#0f172a",
    color: "white",
  },
  logo: {
    margin: 0,
    fontSize: "18px",
  },
  navSub: {
    margin: 0,
    fontSize: "13px",
    color: "#cbd5e1",
  },
  button: {
    background: "#ffffff",
    color: "#0f172a",
    border: "none",
    padding: "10px 16px",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "bold",
  },

  /* HERO */
  hero: {
    textAlign: "center",
    padding: "90px 20px 60px",
  },
  title: {
    fontSize: "40px",
    color: "#0f172a",
    marginBottom: "15px",
  },
  subtitle: {
    fontSize: "16px",
    color: "#555",
    maxWidth: "650px",
    margin: "0 auto 25px",
    lineHeight: "1.6",
  },
  primaryButton: {
    padding: "14px 24px",
    background: "#0f172a",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "15px",
    cursor: "pointer",
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
    width: "260px",
    padding: "20px",
    borderRadius: "12px",
    boxShadow: "0 6px 18px rgba(0,0,0,0.08)",
    textAlign: "center",
  },

  /* FOOTER */
  footer: {
    textAlign: "center",
    padding: "20px",
    fontSize: "13px",
    color: "#666",
    marginTop: "40px",
  },
};

export default Home;