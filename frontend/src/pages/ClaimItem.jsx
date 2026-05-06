import React from "react";

function ClaimItem({ goHome }) {
  return (
    <div style={styles.page}>
      <h1>📦 Claim Item Page</h1>

      <p>
        This page allows users to claim items they have lost.
      </p>

      <ul>
        <li>✔ Search matched items</li>
        <li>✔ Submit claim request</li>
        <li>✔ Verify ownership</li>
      </ul>

      <button onClick={goHome} style={styles.btn}>
        ← Back to Home
      </button>
    </div>
  );
}

const styles = {
  page: {
    padding: "40px",
    fontFamily: "Arial",
    textAlign: "center",
  },
  btn: {
    marginTop: "20px",
    padding: "10px 15px",
    borderRadius: "8px",
    border: "none",
    background: "#f97316",
    color: "white",
    cursor: "pointer",
  },
};

export default ClaimItem;