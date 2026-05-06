import React, { useState } from "react";
import { createItem } from "../api/items";

function PostForm({ goHome }) {
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [type, setType] = useState("Lost");
  const [color, setColor] = useState("");
  const [venue, setVenue] = useState("");
  const [time, setTime] = useState("");

 const handleSubmit = (e) => {
  e.preventDefault();

  if (!title.trim()) return;

  const formData = {
    type : "Lost",
    title,
    desc,
    color,
    venue,
    time,
  };

  createItem(formData); // ✅ SAVE TO LOCALSTORAGE

  // console.log(formData); // useful for backend later

  alert(`Lost item posted!`);

  setTitle("");
  setDesc("");
  setType("");
  setColor("");
  setVenue("");
  setTime("");
};

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        {/* HEADER */}
        <div style={styles.header}>
          <button style={styles.backBtn} onClick={goHome}>
            ← Back
          </button>
          <h2 style={styles.title}>Report an Item</h2>
          <p style={styles.subtitle}>
            Help others by reporting a lost or found item
          </p>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit} style={styles.form}>
         

          {/* TITLE */}
          <label style={styles.label}>Item Title</label>
          <input
            placeholder="e.g. Black Wallet, iPhone 13"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={styles.input}
          />

          {/* DESCRIPTION */}
          <label style={styles.label}>Description</label>
          <textarea
            placeholder="Add details like location, time, color..."
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            style={styles.textarea}
          />

          {/* COLOR */}
          <label style={styles.label}>Color (If applicable)</label>
          <input
            placeholder="e.g. Black, Red"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            style={styles.input}
          />

          {/* VENUE */}
          <label style={styles.label}>Venue / Location</label>
          <input
            placeholder="e.g. Library, Bus stop"
            value={venue}
            onChange={(e) => setVenue(e.target.value)}
            style={styles.input}
          />

          {/* TIME */}
          <label style={styles.label}>Time</label>
          <input
            type="datetime-local"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            style={styles.input}
          />

          {/* BUTTON */}
          <button type="submit" style={styles.button}>
             Submit Report
          </button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#f5f7fb",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontFamily: "Arial",
    padding: "20px",
  },

  card: {
    width: "100%",
    maxWidth: "500px",
    background: "white",
    borderRadius: "14px",
    padding: "25px",
    boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
  },

  header: {
    marginBottom: "20px",
    textAlign: "center",
  },

  backBtn: {
    position: "absolute",
    marginTop: "-10px",
    marginLeft: "-10px",
    background: "transparent",
    border: "none",
    fontSize: "14px",
    cursor: "pointer",
    color: "#555",
  },

  title: {
    marginBottom: "5px",
    color: "#111",
  },

  subtitle: {
    fontSize: "14px",
    color: "#666",
  },

  form: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },

  label: {
    fontSize: "13px",
    fontWeight: "bold",
    color: "#333",
    marginTop: "10px",
  },

  input: {
    padding: "12px",
    borderRadius: "8px",
    border: "1px solid #ddd",
    outline: "none",
    transition: "0.2s",
  },

  textarea: {
    padding: "12px",
    borderRadius: "8px",
    border: "1px solid #ddd",
    minHeight: "100px",
    outline: "none",
    resize: "none",
  },

  select: {
    padding: "12px",
    borderRadius: "8px",
    border: "1px solid #ddd",
    outline: "none",
  },

backBtn: {
  display: "inline-flex",
  alignItems: "center",
  gap: "6px",
  background: "transparent",
  border: "1px solid #e5e7eb",
  padding: "8px 12px",
  borderRadius: "8px",
  fontSize: "14px",
  cursor: "pointer",
  color: "#374151",
  transition: "all 0.2s ease",
},
};

export default PostForm;