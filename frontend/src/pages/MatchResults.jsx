import React from "react";

function MatchResults({ goHome }) {

  const matches = [
    {
      id: 1,
      userItem: {
        title: "Black Wallet",
        desc: "Lost near library around 10 AM",
        color: "Black",
        venue: "Library",
        time: "2026-05-06T10:00",
      },
      matchedItem: {
        title: "Wallet Found",
        desc: "Found at cafeteria counter",
        color: "Black",
        venue: "Cafeteria",
        time: "2026-05-06T10:30",
      },
      status: "Matched",
    },
    {
      id: 2,
      userItem: {
        title: "iPhone 13",
        desc: "Lost in lecture hall A",
        color: "Blue",
        venue: "Lecture Hall A",
        time: "2026-05-06T09:00",
      },
      matchedItem: {
        title: "No Match Yet",
        desc: "Still searching in system",
        color: "",
        venue: "",
        time: "",
      },
      status: "Pending",
    },
  ];

  // 🔍 Compare helper
  const isSame = (a, b) =>
    a && b && a.toLowerCase() === b.toLowerCase();

  // 📊 Match score
  const getMatchScore = (u, m) => {
    let score = 0;
    if (isSame(u.color, m.color)) score++;
    if (isSame(u.venue, m.venue)) score++;
    return score;
  };

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
                <h4> User Item</h4>
                <h3>{m.userItem.title}</h3>
                <p>{m.userItem.desc}</p>

                <p><b>Color:</b> {m.userItem.color}</p>
                <p><b>Venue:</b> {m.userItem.venue}</p>
                <p><b>Time:</b> {m.userItem.time}</p>
              </div>

              {/* MATCHED ITEM */}
              <div style={styles.box}>
                <h4> Matched Item</h4>
                <h3>{m.matchedItem.title}</h3>
                <p>{m.matchedItem.desc}</p>

                <p style={{
                  color: isSame(m.userItem.color, m.matchedItem.color) ? "green" : "black"
                }}>
                  <b>Color:</b> {m.matchedItem.color || "-"}
                </p>

                <p style={{
                  color: isSame(m.userItem.venue, m.matchedItem.venue) ? "green" : "black"
                }}>
                  <b>Venue:</b> {m.matchedItem.venue || "-"}
                </p>

                <p>
                  <b>Time:</b> {m.matchedItem.time || "-"}
                </p>
              </div>

            </div>

            {/* MATCH SCORE */}
            <p style={{ marginTop: "10px", fontSize: "14px" }}>
               Match Score: {getMatchScore(m.userItem, m.matchedItem)} / 2
            </p>

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