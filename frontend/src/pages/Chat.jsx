import React, { useState } from "react";

export default function Chat({ navigateTo }) {
  const [message, setMessage] = useState("");

  const C = {
    primary: "#0F5FFF",
    bg: "#eef4fb",
    card: "#FFFFFF",
    text: "#0b3470",
    border: "#d0d5dd",
    muted: "#667085"
  };

  const messages = [
    { id: 1, sender: "other", text: "Hi, I think you found my Black Dell Laptop?", time: "10:30 AM" },
    { id: 2, sender: "me", text: "Hello! Yes, I handed it over to the Security Office.", time: "10:32 AM" },
    { id: 3, sender: "other", text: "Thank you so much! I'll go pick it up now.", time: "10:35 AM" }
  ];

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", height: "calc(100vh - 120px)", display: "flex", flexDirection: "column", background: C.card, borderRadius: "16px", border: `1px solid ${C.border}`, overflow: "hidden" }}>
      <div style={{ padding: "20px", borderBottom: `1px solid ${C.border}`, background: C.bg }}>
        <h2 style={{ margin: 0, color: C.text, fontSize: "18px" }}>Chat with User</h2>
        <p style={{ margin: "4px 0 0", color: C.muted, fontSize: "13px" }}>Regarding: Black Dell Laptop</p>
      </div>
      
      <div style={{ flex: 1, padding: "20px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "16px" }}>
        {messages.map(msg => (
          <div key={msg.id} style={{ display: "flex", justifyContent: msg.sender === "me" ? "flex-end" : "flex-start" }}>
            <div style={{ maxWidth: "70%", padding: "12px 16px", borderRadius: "16px", background: msg.sender === "me" ? C.primary : "#f3f4f6", color: msg.sender === "me" ? "white" : C.text }}>
              <div style={{ fontSize: "14px", lineHeight: "1.4" }}>{msg.text}</div>
              <div style={{ fontSize: "10px", marginTop: "6px", textAlign: "right", opacity: 0.7 }}>{msg.time}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ padding: "16px", borderTop: `1px solid ${C.border}`, display: "flex", gap: "12px" }}>
        <input 
          style={{ flex: 1, padding: "12px 16px", borderRadius: "24px", border: `1px solid ${C.border}`, outline: "none", fontSize: "14px" }}
          placeholder="Type a message..."
          value={message}
          onChange={e => setMessage(e.target.value)}
        />
        <button 
          style={{ padding: "0 24px", background: C.primary, color: "white", border: "none", borderRadius: "24px", fontWeight: "600", cursor: "pointer" }}
        >
          Send
        </button>
      </div>
    </div>
  );
}
