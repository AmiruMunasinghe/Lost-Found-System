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
  green: "#16a34a",
};

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

  const styles = {
    page: {
      fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
      background: C.bg,
      minHeight: "100vh",
      padding: "30px 16px",
    },
    container: {
      width: "100%",
      maxWidth: 780,
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
      padding: "24px",
      borderRadius: 22,
      border: `1px solid ${C.border}`,
      boxShadow: "0 4px 16px rgba(0,0,0,0.04)",
      marginBottom: 16,
    },
    row: {
      display: "flex",
      justifyContent: "space-between",
      gap: 16,
    },
    box: {
      flex: 1,
      padding: "18px",
      borderRadius: 16,
      background: C.fieldBg,
      border: `1px solid ${C.border}`,
    },
    boxTitle: {
      fontSize: 11,
      fontWeight: 700,
      letterSpacing: "0.6px",
      textTransform: "uppercase",
      color: C.muted,
      marginBottom: 8,
    },
    boxItemTitle: {
      fontSize: 18,
      fontWeight: 800,
      color: C.text,
      marginBottom: 6,
    },
    boxDesc: {
      fontSize: 13,
      color: C.muted,
      marginBottom: 12,
      lineHeight: 1.4,
    },
    detailRow: {
      fontSize: 13,
      color: C.body,
      marginBottom: 4,
    },
    status: {
      display: "inline-block",
      marginTop: 14,
      padding: "6px 16px",
      borderRadius: 22,
      fontSize: 13,
      fontWeight: 600,
    },
    matchScore: {
      marginTop: 14,
      fontSize: 14,
      color: C.body,
      fontWeight: 600,
    },
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <button style={styles.backLink} onClick={goHome}>← Back to Dashboard</button>

        <h2 style={{ margin: "0 0 6px", fontSize: 28, fontWeight: 800, color: C.text }}>Match Results</h2>
        <p style={{ margin: "0 0 22px", fontSize: 15, color: C.muted }}>View potential matches for your reported items</p>

        {matches.map((m) => (
          <div key={m.id} style={styles.card}>
            <div style={styles.row}>
              {/* USER ITEM */}
              <div style={styles.box}>
                <div style={styles.boxTitle}>🔴 Your Item</div>
                <div style={styles.boxItemTitle}>{m.userItem.title}</div>
                <div style={styles.boxDesc}>{m.userItem.desc}</div>
                <p style={styles.detailRow}><b>Color:</b> {m.userItem.color}</p>
                <p style={styles.detailRow}><b>Venue:</b> {m.userItem.venue}</p>
                <p style={styles.detailRow}><b>Time:</b> {m.userItem.time}</p>
              </div>

              {/* MATCHED ITEM */}
              <div style={styles.box}>
                <div style={styles.boxTitle}>🟢 Matched Item</div>
                <div style={styles.boxItemTitle}>{m.matchedItem.title}</div>
                <div style={styles.boxDesc}>{m.matchedItem.desc}</div>
                <p style={{
                  ...styles.detailRow,
                  color: isSame(m.userItem.color, m.matchedItem.color) ? C.green : C.body,
                  fontWeight: isSame(m.userItem.color, m.matchedItem.color) ? 700 : 400,
                }}>
                  <b>Color:</b> {m.matchedItem.color || "—"}
                </p>
                <p style={{
                  ...styles.detailRow,
                  color: isSame(m.userItem.venue, m.matchedItem.venue) ? C.green : C.body,
                  fontWeight: isSame(m.userItem.venue, m.matchedItem.venue) ? 700 : 400,
                }}>
                  <b>Venue:</b> {m.matchedItem.venue || "—"}
                </p>
                <p style={styles.detailRow}>
                  <b>Time:</b> {m.matchedItem.time || "—"}
                </p>
              </div>
            </div>

            {/* MATCH SCORE */}
            <p style={styles.matchScore}>
              📊 Match Score: {getMatchScore(m.userItem, m.matchedItem)} / 2
            </p>

            {/* STATUS */}
            <span
              style={{
                ...styles.status,
                background: m.status === "Matched" ? "#E6F1FB" : "#FAEEDA",
                color: m.status === "Matched" ? "#0b3470" : "#633806",
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

export default MatchResults;