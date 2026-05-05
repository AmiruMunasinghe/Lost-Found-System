import React from "react";

function MatchResults({ goHome }) {
  const matches = [
    {
      id: 1,
      userItem: {
        title: "Black Wallet",
        desc: "Lost near library around 10 AM",
      },
      matchedItem: {
        title: "Black Wallet Found",
        desc: "Found at student cafeteria counter",
      },
      status: "Matched",
    },
    {
      id: 2,
      userItem: {
        title: "iPhone 13",
        desc: "Lost in lecture hall A",
      },
      matchedItem: {
        title: "No Match Yet",
        desc: "Still searching in system",
      },
      status: "Pending",
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
      </div>

      {/* RESULTS */}
      <div style={styles.container}>
        {matches.map((m) => (
          <div key={m.id} style={styles.card}>
            
            {/* SIDE BY SIDE */}
            <div style={styles.row}>
              
              {/* USER ITEM */}
              <div style={styles.box}>
                <h4>🧍 User Item</h4>
                <h3>{m.userItem.title}</h3>
                <p>{m.userItem.desc}</p>
              </div>

              {/* MATCHED ITEM */}
              <div style={styles.box}>
                <h4>🎯 Matched Item</h4>
                <h3>{m.matchedItem.title}</h3>
                <p>{m.matchedItem.desc}</p>
              </div>

            </div>

            {/* STATUS */}
            <span
              style={{
                ...styles.status,
                background:
                  m.status === "Matched"
                    ? "#d1fae5"
                    : "#fef3c7",
                color:
                  m.status === "Matched"
                    ? "#065f46"
                    : "#92400e",
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
    marginBottom: "20px",
  },

  backBtn: {
    position: "absolute",
    left: "20px",
    top: "20px",
    padding: "8px 12px",
    borderRadius: "8px",
    border: "1px solid #ddd",
    background: "white",
    cursor: "pointer",
  },

  container: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
    alignItems: "center",
  },

  card: {
    width: "700px",
    background: "white",
    padding: "20px",
    borderRadius: "12px",
    boxShadow: "0 6px 18px rgba(0,0,0,0.08)",
  },

  row: {
    display: "flex",
    justifyContent: "space-between",
    gap: "20px",
  },

  box: {
    flex: 1,
    padding: "15px",
    borderRadius: "10px",
    background: "#f9fafb",
  },

  status: {
    display: "inline-block",
    marginTop: "15px",
    padding: "6px 12px",
    borderRadius: "20px",
    fontSize: "12px",
  },
};

export default MatchResults;