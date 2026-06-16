import React, { useState } from "react";
import { createItem } from "../api/items";

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
};

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
      type: "Found",
      title,
      desc,
      color,
      venue,
      time,
    };
    console.log("FORM DATA:", formData);
    createItem(formData); // ✅ SAVE TO LOCALSTORAGE

    // console.log(formData); // useful for backend later

    alert(`Found item posted!`);

    setTitle("");
    setDesc("");
    setType("");
    setColor("");
    setVenue("");
    setTime("");
  };

  const styles = {
    page: {
      minHeight: "100vh",
      background: C.bg,
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
      padding: "30px 16px",
    },
    card: {
      width: "100%",
      maxWidth: "540px",
      background: C.card,
      borderRadius: "22px",
      padding: "36px 32px",
      boxShadow: "0 4px 16px rgba(0,0,0,0.04)",
      border: `1px solid ${C.border}`,
    },
    backLink: {
      background: "none",
      border: "none",
      color: C.link,
      fontSize: 14,
      fontWeight: 600,
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      gap: 6,
      padding: 0,
      fontFamily: "inherit",
      marginBottom: 20,
    },
    header: {
      marginBottom: "24px",
      textAlign: "center",
    },
    title: {
      fontSize: 26,
      fontWeight: 800,
      color: C.text,
      marginBottom: 6,
      margin: "0 0 6px",
    },
    subtitle: {
      fontSize: 15,
      color: C.muted,
      margin: 0,
    },
    form: {
      display: "flex",
      flexDirection: "column",
      gap: "6px",
    },
    fieldGap: {
      marginBottom: 16,
    },
    label: {
      display: "block",
      marginBottom: 10,
      color: C.body,
      fontWeight: 600,
      fontSize: 15,
    },
    input: {
      width: "100%",
      height: "54px",
      borderRadius: "14px",
      border: `1px solid ${C.border}`,
      padding: "0 18px",
      fontSize: "15px",
      boxSizing: "border-box",
      outline: "none",
      fontFamily: "inherit",
    },
    textarea: {
      width: "100%",
      borderRadius: "14px",
      border: `1px solid ${C.border}`,
      padding: "14px 18px",
      fontSize: "15px",
      minHeight: "110px",
      boxSizing: "border-box",
      outline: "none",
      resize: "none",
      fontFamily: "inherit",
    },
    submitBtn: {
      width: "100%",
      height: "60px",
      border: "none",
      borderRadius: "14px",
      background: "linear-gradient(90deg, #0F5FFF, #4A8BFF)",
      color: "#fff",
      fontSize: "17px",
      fontWeight: "700",
      cursor: "pointer",
      fontFamily: "inherit",
      marginTop: 8,
    },
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <button style={styles.backLink} onClick={goHome}>
          ← Back to Dashboard
        </button>

        {/* HEADER */}
        <div style={styles.header}>
          <h2 style={styles.title}>Report Found Item 🟢</h2>
          <p style={styles.subtitle}>
            Help others by reporting a found item
          </p>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.fieldGap}>
            <label style={styles.label}>Item Title</label>
            <input
              placeholder="e.g. Black Wallet, iPhone 13"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={styles.input}
            />
          </div>

          <div style={styles.fieldGap}>
            <label style={styles.label}>Description</label>
            <textarea
              placeholder="Add details like location, time, color..."
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              style={styles.textarea}
            />
          </div>

          <div style={styles.fieldGap}>
            <label style={styles.label}>Color (If applicable)</label>
            <input
              placeholder="e.g. Black, Red"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              style={styles.input}
            />
          </div>

          <div style={styles.fieldGap}>
            <label style={styles.label}>Venue / Location</label>
            <input
              placeholder="e.g. Library, Bus stop"
              value={venue}
              onChange={(e) => setVenue(e.target.value)}
              style={styles.input}
            />
          </div>

          <div style={styles.fieldGap}>
            <label style={styles.label}>Time</label>
            <input
              type="datetime-local"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              style={styles.input}
            />
          </div>

          <button type="submit" style={styles.submitBtn}>
            Submit Report
          </button>
        </form>
      </div>
    </div>
  );
}

export default PostForm;