import React from "react";

function Home({ goToForm,goToResults,goToReturnItem, goToClaimItem }) {
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
        <div style={{ display: "flex", gap: "20px", justifyContent: "center", alignItems: "center", }}>
        <button style={styles.Button} onClick={goToForm}>
          ➕ Submit a Report
        </button>
        <button style={styles.Button} onClick={goToResults}>
              ➕Match Results
        </button>
          <button style={styles.Button} onClick={goToReturnItem}>
              ➕Return Item
        </button>

          <button style={styles.Button} onClick={goToClaimItem}>
              ➕Claim Item
        </button>
        </div>
        
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
        © 2026 University of Moratuwa | Faculty of Engineering
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
  background: "#6d28d9", // purple
  color: "white",
  boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
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
Button: {
  padding: "14px 28px",
  fontSize: "16px",
  fontWeight: "600",
  color: "white",
  border: "none",
  borderRadius: "12px",
  cursor: "pointer",
  background: "linear-gradient(135deg, #7F00FF, #E100FF)",
  boxShadow: "0 8px 20px rgba(127, 0, 255, 0.3)",
  transition: "all 0.3s ease",
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
  formButton: {
    padding: "14px 24px",
    background: "#0f172a",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "15px",
    cursor: "pointer",
  },
  resultsButton: {
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