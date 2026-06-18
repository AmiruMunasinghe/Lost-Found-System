import React, { useState } from "react";
import { createItem } from "../api/items";

const categories = ["Wallet", "Electronics", "Documents", "Keys", "Bags & Wallets", "Books", "Other"];

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

export default function PostLostForm({ navigateTo, darkMode }) {
  const t = useDark(darkMode);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Wallet");
  const [color, setColor] = useState("");
  const [location, setLocation] = useState("");
  const [time, setTime] = useState("");
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState("");

  const validate = () => {
    const next = {};
    if (!title.trim()) next.title = "Item title is required.";
    if (!description.trim()) next.description = "Description is required.";
    if (!category.trim()) next.category = "Category is required.";
    if (!location.trim()) next.location = "Location is required.";
    return next;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError("");
    const nextErrors = validate();
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    try {
      setSubmitting(true);
      const savedItem = await createItem({
        title,
        description,
        category,
        color,
        location,
        time,
        reportType: "LOST",
        imageUrls: [],
      });

      alert(`Report Lost Item submitted successfully. It is now pending admin approval. Item ID: ${savedItem.id}`);
      setTitle(""); setDescription(""); setCategory("Wallet"); setColor(""); setLocation(""); setTime(""); setErrors({});
      if (navigateTo) navigateTo("browse");
    } catch (err) {
      setApiError(err.message || "Failed to save item. Please check backend and token.");
    } finally {
      setSubmitting(false);
    }
  };

  const inputStyle = (err) => ({
    width: "100%", height: "54px", borderRadius: "14px",
    border: `1px solid ${err ? "#E24B4A" : t.inputBorder}`,
    padding: "0 18px", fontSize: "15px", boxSizing: "border-box",
    outline: "none", fontFamily: "inherit", background: t.inputBg,
    color: t.text, colorScheme: darkMode ? "dark" : "light",
  });

  const textareaStyle = (err) => ({ ...inputStyle(err), height: "auto", minHeight: "110px", padding: "14px 18px", resize: "vertical" });
  const labelStyle = { display: "block", marginBottom: 10, color: t.body, fontWeight: 600, fontSize: 15 };
  const fieldWrap = { marginBottom: 16 };

  return (
    <>
      <style>{`
        .report-form input::placeholder, .report-form textarea::placeholder { color: ${t.muted}; }
        .report-form input::-webkit-calendar-picker-indicator { filter: ${darkMode ? "invert(1)" : "none"}; }
      `}</style>

      <div className="report-form" style={{ fontFamily: "'DM Sans','Segoe UI',sans-serif", display: "flex", justifyContent: "center", padding: "8px 0" }}>
        <div style={{ width: "100%", maxWidth: "560px" }}>
          <button type="button" style={{ background: "none", border: "none", color: t.link, fontSize: 14, fontWeight: 600, cursor: "pointer", padding: 0, fontFamily: "inherit", marginBottom: 20 }} onClick={() => navigateTo && navigateTo("dashboard")}>← Back to Dashboard</button>

          <div style={{ background: t.card, borderRadius: "22px", padding: "36px 32px", boxShadow: "0 4px 16px rgba(0,0,0,0.06)", border: `1px solid ${t.border}` }}>
            <div style={{ marginBottom: "24px", textAlign: "center" }}>
              <h2 style={{ fontSize: 26, fontWeight: 800, color: t.text, margin: "0 0 6px" }}>Report Lost Item 🔴</h2>
              <p style={{ fontSize: 15, color: t.muted, margin: 0 }}>Your report will be saved as pending until admin approval.</p>
            </div>

            {apiError && <div style={{ background: "#fee2e2", color: "#991b1b", padding: 12, borderRadius: 12, marginBottom: 16, fontSize: 14 }}>{apiError}</div>}

            <form onSubmit={handleSubmit}>
              <div style={fieldWrap}><label style={labelStyle}>Item Title</label><input placeholder="e.g. Black Wallet" value={title} onChange={(e) => { setTitle(e.target.value); setErrors({ ...errors, title: null }); }} style={inputStyle(errors.title)} />{errors.title && <span style={{ color: "#E24B4A", fontSize: 13 }}>{errors.title}</span>}</div>
              <div style={fieldWrap}><label style={labelStyle}>Category</label><select value={category} onChange={(e) => setCategory(e.target.value)} style={inputStyle(errors.category)}>{categories.map((cat) => <option key={cat} value={cat}>{cat}</option>)}</select></div>
              <div style={fieldWrap}><label style={labelStyle}>Location Lost</label><input placeholder="e.g. Library" value={location} onChange={(e) => { setLocation(e.target.value); setErrors({ ...errors, location: null }); }} style={inputStyle(errors.location)} />{errors.location && <span style={{ color: "#E24B4A", fontSize: 13 }}>{errors.location}</span>}</div>
              <div style={fieldWrap}><label style={labelStyle}>Color / Identifying Detail</label><input placeholder="e.g. Black, red strap" value={color} onChange={(e) => setColor(e.target.value)} style={inputStyle(false)} /></div>
              <div style={fieldWrap}><label style={labelStyle}>Description</label><textarea placeholder="Add details that can help matching..." value={description} onChange={(e) => { setDescription(e.target.value); setErrors({ ...errors, description: null }); }} style={textareaStyle(errors.description)} />{errors.description && <span style={{ color: "#E24B4A", fontSize: 13 }}>{errors.description}</span>}</div>
              <div style={fieldWrap}><label style={labelStyle}>Approximate Time Lost</label><input type="datetime-local" value={time} onChange={(e) => setTime(e.target.value)} style={inputStyle(false)} /></div>
              <button type="submit" disabled={submitting} style={{ width: "100%", height: "60px", border: "none", borderRadius: "14px", background: submitting ? "#94a3b8" : "linear-gradient(90deg,#0F5FFF,#4A8BFF)", color: "#fff", fontSize: "17px", fontWeight: "700", cursor: submitting ? "not-allowed" : "pointer", fontFamily: "inherit", marginTop: 8 }}>{submitting ? "Submitting for approval..." : "Submit for Admin Approval"}</button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
