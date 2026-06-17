import React, { useState } from "react";
import { createItem } from "../api/items";

function useDark(dm) {
  return dm ? {
    card: "#1e293b", border: "#334155", text: "#e2e8f0",
    muted: "#94a3b8", body: "#cbd5e1", inputBg: "#0f172a",
    inputBorder: "#475569", link: "#60a5fa",
  } : {
    card: "#FFFFFF", border: "#d0d5dd", text: "#0b3470",
    muted: "#667085", body: "#344054", inputBg: "#ffffff",
    inputBorder: "#d0d5dd", link: "#2563eb",
  };
}

function PostFoundForm({ navigateTo, darkMode, user }) {
  const t = useDark(darkMode);
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [color, setColor] = useState("");
  const [venue, setVenue] = useState("");
  const [time, setTime] = useState("");
  const [errors, setErrors] = useState({});

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!title.trim()) newErrors.title = "Item Title is required.";
    if (!desc.trim()) newErrors.desc = "Description is required.";
    if (!venue.trim()) newErrors.venue = "Venue/Location is required.";
    if (!time) newErrors.time = "Time is required.";
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }
    createItem({
      title,
      description: desc,
      category: color || "Other",
      location: venue,
      reportType: "FOUND",
    }, user?.token);
    alert("Found item posted!");
    setTitle(""); setDesc(""); setColor(""); setVenue(""); setTime(""); setErrors({});
  };

  const inputStyle = (err) => ({
    width: "100%", height: "54px", borderRadius: "14px",
    border: `1px solid ${err ? "#E24B4A" : t.inputBorder}`,
    padding: "0 18px", fontSize: "15px", boxSizing: "border-box",
    outline: "none", fontFamily: "inherit",
    background: t.inputBg,
    color: t.text,
    colorScheme: darkMode ? "dark" : "light",
    WebkitTextFillColor: t.text,
    boxShadow: `inset 0 0 0 1000px ${t.inputBg}`,
  });

  const textareaStyle = (err) => ({
    width: "100%", borderRadius: "14px",
    border: `1px solid ${err ? "#E24B4A" : t.inputBorder}`,
    padding: "14px 18px", fontSize: "15px", minHeight: "110px",
    boxSizing: "border-box", outline: "none", resize: "none", fontFamily: "inherit",
    background: t.inputBg,
    color: t.text,
    WebkitTextFillColor: t.text,
    boxShadow: `inset 0 0 0 1000px ${t.inputBg}`,
  });

  const labelStyle = {
    display: "block", marginBottom: 10,
    color: t.body, fontWeight: 600, fontSize: 15,
  };

  const fieldWrap = { marginBottom: 16 };

  return (
    <>
      <style>{`
        .found-form input::placeholder, .found-form textarea::placeholder { color: ${t.muted}; }
        .found-form input::-webkit-calendar-picker-indicator { filter: ${darkMode ? "invert(1)" : "none"}; }
      `}</style>

      <div className="found-form" style={{ fontFamily: "'DM Sans','Segoe UI',sans-serif", display: "flex", justifyContent: "center", padding: "8px 0" }}>
        <div style={{ width: "100%", maxWidth: "540px" }}>
          <button
            style={{ background: "none", border: "none", color: t.link, fontSize: 14, fontWeight: 600, cursor: "pointer", padding: 0, fontFamily: "inherit", marginBottom: 20 }}
            onClick={() => navigateTo("dashboard")}
          >← Back to Dashboard</button>

          <div style={{
            background: t.card, borderRadius: "22px", padding: "36px 32px",
            boxShadow: "0 4px 16px rgba(0,0,0,0.06)", border: `1px solid ${t.border}`,
            transition: "background 0.3s, border-color 0.3s",
          }}>
            <div style={{ marginBottom: "24px", textAlign: "center" }}>
              <h2 style={{ fontSize: 26, fontWeight: 800, color: t.text, margin: "0 0 6px" }}>Report Found Item 🟢</h2>
              <p style={{ fontSize: 15, color: t.muted, margin: 0 }}>Help others by reporting a found item</p>
            </div>

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <div style={fieldWrap}>
                <label style={labelStyle}>Item Title</label>
                <input placeholder="e.g. Black Wallet, iPhone 13" value={title}
                  onChange={(e) => { setTitle(e.target.value); setErrors({ ...errors, title: null }); }}
                  style={inputStyle(errors.title)} />
                {errors.title && <span style={{ color: "#E24B4A", fontSize: 13, marginTop: 6, display: "block" }}>{errors.title}</span>}
              </div>

              <div style={fieldWrap}>
                <label style={labelStyle}>Color (If applicable)</label>
                <input placeholder="e.g. Black, Red" value={color}
                  onChange={(e) => setColor(e.target.value)}
                  style={inputStyle(false)} />
              </div>

              <div style={fieldWrap}>
                <label style={labelStyle}>Venue / Location</label>
                <input placeholder="e.g. Library, Bus stop" value={venue}
                  onChange={(e) => { setVenue(e.target.value); setErrors({ ...errors, venue: null }); }}
                  style={inputStyle(errors.venue)} />
                {errors.venue && <span style={{ color: "#E24B4A", fontSize: 13, marginTop: 6, display: "block" }}>{errors.venue}</span>}
              </div>

              <div style={fieldWrap}>
                <label style={labelStyle}>Description</label>
                <textarea placeholder="Add details like location, time, color..." value={desc}
                  onChange={(e) => { setDesc(e.target.value); setErrors({ ...errors, desc: null }); }}
                  style={textareaStyle(errors.desc)} />
                {errors.desc && <span style={{ color: "#E24B4A", fontSize: 13, marginTop: 6, display: "block" }}>{errors.desc}</span>}
              </div>

              <div style={fieldWrap}>
                <label style={labelStyle}>Time</label>
                <input type="datetime-local" value={time}
                  onChange={(e) => { setTime(e.target.value); setErrors({ ...errors, time: null }); }}
                  style={inputStyle(errors.time)} />
                {errors.time && <span style={{ color: "#E24B4A", fontSize: 13, marginTop: 6, display: "block" }}>{errors.time}</span>}
              </div>

              <button type="submit" style={{
                width: "100%", height: "60px", border: "none", borderRadius: "14px",
                background: "linear-gradient(90deg,#16a34a,#22c55e)", color: "#fff",
                fontSize: "17px", fontWeight: "700", cursor: "pointer", fontFamily: "inherit", marginTop: 8,
              }}>Submit Report</button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}

export default PostFoundForm;