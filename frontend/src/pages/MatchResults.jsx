import React from "react";

function MatchResults({ goHome }) {
  const matches = [
    {
      id: 1,
      item: "Black Wallet",
      status: "Matched",
      location: "Library",
      date: "2026-05-01",
    },
    {
      id: 2,
      item: "iPhone 13",
      status: "Pending",
      location: "Cafeteria",
      date: "2026-05-03",
    },
    {
      id: 3,
      item: "Water Bottle",
      status: "Returned",
      location: "Lecture Hall",
      date: "2026-05-05",
    },
  ];

  return (
    <div style={styles.page}>
      {/* HEADER */}
      <div style={styles.header}>
        <button style={styles.backBtn} onClick={goHome}>
          ← Home
        </button>
        <h2>Match Results</h2>
        <p>Recent matching status of lost & found items</p>
      </div>

      {/* TABLE */}
      <div style={styles.container}>
        {matches.map((m) => (
          <div key={m.id} style={styles.card}>
            <h3>📦 {m.item}</h3>
            <p>📍 {m.location}</p>
            <p>📅 {m.date}</p>

            <span
              style={{
                ...styles.status,
                background:
                  m.status === "Matched"
                    ? "#d1fae5"
                    : m.status === "Pending"
                    ? "#fef3c7"
                    : "#dbeafe",
                color:
                  m.status === "Matched"
                    ? "#065f46"
                    : m.status === "Pending"
                    ? "#92400e"
                    : "#1e40af",
              }}
            >
              {m.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  page: {
    fontFamily: "Arial",
    background: "#f5f7fb",
    minHeight: "100vh",
    padding: "20px",
  },

  header: {
    textAlign: "center",
    marginBottom: "30px",
  },

  backBtn: {
    position: "absolute",
    left: "20px",
    top: "20px",
    padding: "8px 12px",
    border: "1px solid #ddd",
    borderRadius: "8px",
    background: "white",
    cursor: "pointer",
  },

  container: {
    display: "flex",
    flexWrap: "wrap",
    gap: "15px",
    justifyContent: "center",
  },

  card: {
    width: "250px",
    background: "white",
    padding: "15px",
    borderRadius: "12px",
    boxShadow: "0 5px 15px rgba(0,0,0,0.08)",
  },

  status: {
    display: "inline-block",
    padding: "5px 10px",
    borderRadius: "20px",
    fontSize: "12px",
    marginTop: "8px",
  },
};

export default MatchResults;