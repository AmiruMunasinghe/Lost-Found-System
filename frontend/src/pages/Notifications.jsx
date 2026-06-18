import { useState } from "react";

function useDark(dm) {
  return dm ? {
    card: "#1e293b", border: "#334155", text: "#e2e8f0",
    muted: "#94a3b8", body: "#cbd5e1", fieldBg: "#0f172a",
    link: "#60a5fa", unread: "#1a2d47",
  } : {
    card: "#FFFFFF", border: "#d0d5dd", text: "#0b3470",
    muted: "#667085", body: "#344054", fieldBg: "#f6f9ff",
    link: "#2563eb", unread: "#f0f5ff",
  };
}

export default function Notifications({ navigateTo, darkMode }) {
  const t = useDark(darkMode);
  const [notifications, setNotifications] = useState([
    { id: 1, message: "🔔 Your lost laptop has a potential match! Click to view.", time: "2 minutes ago", read: false, type: "match" },
    { id: 2, message: "⭐ You earned 50 points for reporting a found item", time: "1 hour ago", read: false, type: "reward" },
    { id: 3, message: "✅ Your report for Water Bottle was resolved. Claim confirmed.", time: "Yesterday", read: true, type: "resolved" },
    { id: 4, message: "🏆 New badge unlocked: Photo Uploader", time: "2 days ago", read: true, type: "badge" },
    { id: 5, message: "🔔 Someone found your backpack! Check the match details.", time: "3 days ago", read: true, type: "match" },
    { id: 6, message: "⭐ You earned 25 points for uploading a photo", time: "5 days ago", read: true, type: "reward" },
  ]);

  const markAsRead = (id) => setNotifications(ns => ns.map(n => n.id === id ? { ...n, read: true } : n));
  const markAllAsRead = () => setNotifications(ns => ns.map(n => ({ ...n, read: true })));
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div style={{ fontFamily: "'DM Sans','Segoe UI',sans-serif" }}>
      <div style={{ width: "100%", maxWidth: 640, margin: "0 auto" }}>
        <button
          style={{ background: "none", border: "none", color: t.link, fontSize: 14, fontWeight: 600, cursor: "pointer", marginBottom: 18, display: "flex", alignItems: "center", gap: 6, padding: 0, fontFamily: "inherit" }}
          onClick={() => navigateTo("dashboard")}
        >← Back to Dashboard</button>

        <div style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: 22, overflow: "hidden", boxShadow: "0 4px 16px rgba(0,0,0,0.04)", transition: "background 0.3s, border-color 0.3s" }}>
          {/* Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "18px 24px", borderBottom: `1px solid ${t.border}`, background: t.fieldBg }}>
            <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: t.text }}>
              Notifications {unreadCount > 0 && `(${unreadCount} new)`}
            </h2>
            {unreadCount > 0 && (
              <button onClick={markAllAsRead} style={{ background: "none", border: "none", color: t.link, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                Mark all as read
              </button>
            )}
          </div>

          {/* List */}
          <div>
            {notifications.length === 0 ? (
              <div style={{ padding: "48px", textAlign: "center", color: t.muted, fontSize: 15 }}>🔕 No notifications yet</div>
            ) : notifications.map(notif => (
              <div
                key={notif.id}
                onClick={() => markAsRead(notif.id)}
                style={{
                  display: "flex", alignItems: "flex-start", gap: 14,
                  padding: "16px 24px",
                  borderBottom: `1px solid ${t.border}`,
                  background: notif.read ? t.card : t.unread,
                  cursor: "pointer", transition: "background 0.2s",
                }}
              >
                <div style={{ fontSize: 20, marginTop: 2 }}>
                  {{ match: "🔔", reward: "⭐", resolved: "✅", badge: "🏆" }[notif.type] || "📢"}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, color: t.body, marginBottom: 5, fontWeight: notif.read ? 400 : 700 }}>{notif.message}</div>
                  <div style={{ fontSize: 12, color: t.muted }}>{notif.time}</div>
                </div>
                {!notif.read && (
                  <div style={{ width: 9, height: 9, borderRadius: "50%", background: "#0F5FFF", flexShrink: 0, marginTop: 6 }} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}