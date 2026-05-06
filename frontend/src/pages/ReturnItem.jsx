import React from "react";

function ReturnItem({ goHome }) {
  return (
    <div style={styles.page}>
      <h1>🔄 Return Item Page</h1>

      <p>
        This page allows users to return found items to their rightful owners.
      </p>

      <ul>
        <li>✔ View items waiting to be returned</li>
        <li>✔ Verify owner details</li>
        <li>✔ Mark item as returned</li>
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
    background: "#22c55e",
    color: "white",
    cursor: "pointer",
  },
};

export default ReturnItem;