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

function PostForm({ user, navigateTo, darkMode }) {
  const t = useDark(darkMode);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Electronics");
  const [location, setLocation] = useState("");
  const [reportType, setReportType] = useState("LOST");
  const [imageUrlInput, setImageUrlInput] = useState("");
  const [imageUrls, setImageUrls] = useState([]);
  const [errors, setErrors] = useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!title.trim()) newErrors.title = "Item Title is required.";
    if (!description.trim()) newErrors.description = "Description is required.";
    if (!location.trim()) newErrors.location = "Location is required.";
    if (!category.trim()) newErrors.category = "Category is required.";
    if (!reportType.trim()) newErrors.reportType = "Report Type is required.";
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }

    try {
      await createItem({
        title,
        description,
        category,
        location,
        reportType,
        imageUrls
      }, user?.token);
      alert("Lost item report submitted successfully!");
      setTitle("");
      setDescription("");
      setCategory("Electronics");
      setLocation("");
      setImageUrls([]);
      setImageUrlInput("");
      setErrors({});
    } catch (err) {
      console.error("Failed to post lost item:", err);
      alert("Failed to submit report. Please check if the backend is running.");
    }
  };

  // Force browser input dark mode using inline style + colorScheme
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

  const categories = ["Electronics", "Bags & Wallets", "Keys", "Documents", "Other"];

  return (
    <>
      {/* Global style to force input caret & placeholder colors */}
      <style>{`
        .lost-form input::placeholder, .lost-form textarea::placeholder { color: ${t.muted}; }
        .lost-form input::-webkit-calendar-picker-indicator { filter: ${darkMode ? "invert(1)" : "none"}; }
      `}</style>

      <div className="lost-form" style={{ fontFamily: "'DM Sans','Segoe UI',sans-serif", display: "flex", justifyContent: "center", padding: "8px 0" }}>
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
              <h2 style={{ fontSize: 26, fontWeight: 800, color: t.text, margin: "0 0 6px" }}>Report Lost Item 🔴</h2>
              <p style={{ fontSize: 15, color: t.muted, margin: 0 }}>Help others by reporting a lost item</p>
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
                <label style={labelStyle}>Category</label>
                <select value={category}
                  onChange={(e) => { setCategory(e.target.value); setErrors({ ...errors, category: null }); }}
                  style={inputStyle(errors.category)}>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                {errors.category && <span style={{ color: "#E24B4A", fontSize: 13, marginTop: 6, display: "block" }}>{errors.category}</span>}
              </div>

              <div style={fieldWrap}>
                <label style={labelStyle}>Location</label>
                <input placeholder="e.g. Library, Sumanadasa Building L2" value={location}
                  onChange={(e) => { setLocation(e.target.value); setErrors({ ...errors, location: null }); }}
                  style={inputStyle(errors.location)} />
                {errors.location && <span style={{ color: "#E24B4A", fontSize: 13, marginTop: 6, display: "block" }}>{errors.location}</span>}
              </div>

              <div style={fieldWrap}>
                <label style={labelStyle}>Description</label>
                <textarea placeholder="Add details like unique marks, brand, serial number..." value={description}
                  onChange={(e) => { setDescription(e.target.value); setErrors({ ...errors, description: null }); }}
                  style={textareaStyle(errors.description)} />
                {errors.description && <span style={{ color: "#E24B4A", fontSize: 13, marginTop: 6, display: "block" }}>{errors.description}</span>}
              </div>

              <div style={fieldWrap}>
                <label style={labelStyle}>Report Type</label>
                <select value={reportType}
                  onChange={(e) => { setReportType(e.target.value); setErrors({ ...errors, reportType: null }); }}
                  style={inputStyle(errors.reportType)}>
                  <option value="LOST">Lost</option>
                  <option value="FOUND">Found</option>
                </select>
                {errors.reportType && <span style={{ color: "#E24B4A", fontSize: 13, marginTop: 6, display: "block" }}>{errors.reportType}</span>}
              </div>

              <div style={fieldWrap}>
                <label style={labelStyle}>Image URLs</label>
                <div style={{ display: "flex", gap: "10px" }}>
                  <input placeholder="e.g. https://images.unsplash.com/photo..." value={imageUrlInput}
                    onChange={(e) => setImageUrlInput(e.target.value)}
                    style={{ ...inputStyle(false), flex: 1 }} />
                  <button type="button"
                    onClick={() => {
                      if (imageUrlInput.trim()) {
                        setImageUrls([...imageUrls, imageUrlInput.trim()]);
                        setImageUrlInput("");
                      }
                    }}
                    style={{
                      background: "linear-gradient(90deg,#0F5FFF,#4A8BFF)", color: "#fff", border: "none",
                      borderRadius: "14px", padding: "0 22px", fontWeight: "700", cursor: "pointer", fontFamily: "inherit"
                    }}>Add</button>
                </div>
                {imageUrls.length > 0 && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "12px" }}>
                    {imageUrls.map((url, idx) => (
                      <div key={idx} style={{
                        background: darkMode ? "#334155" : "#E6F1FB",
                        color: t.text, padding: "6px 12px", borderRadius: "10px",
                        display: "flex", alignItems: "center", gap: "8px", fontSize: "13px",
                        border: `1px solid ${t.border}`
                      }}>
                        <span style={{ maxWidth: "160px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{url}</span>
                        <button type="button" onClick={() => setImageUrls(imageUrls.filter((_, i) => i !== idx))}
                          style={{ background: "none", border: "none", color: "#E24B4A", fontWeight: "700", cursor: "pointer", padding: "0 2px" }}>×</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button type="submit" style={{
                width: "100%", height: "60px", border: "none", borderRadius: "14px",
                background: "linear-gradient(90deg,#0F5FFF,#4A8BFF)", color: "#fff",
                fontSize: "17px", fontWeight: "700", cursor: "pointer", fontFamily: "inherit", marginTop: 8,
              }}>Submit Report</button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}

export default PostForm;