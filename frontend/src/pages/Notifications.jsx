import { useState } from "react";

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

const css = {
  page: {
    minHeight: "100vh",
    background: C.bg,
    fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
    padding: "30px 16px",
  },
  container: {
    width: "100%",
    maxWidth: 640,
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
};

export default function Notifications({ go }) {
  const [notifications, setNotifications] = useState([
    { id: 1, message: "🔔 Your lost laptop has a potential match! Click to view.", time: "2 minutes ago", read: false, type: "match" },
    { id: 2, message: "⭐ You earned 50 points for reporting a found item", time: "1 hour ago", read: false, type: "reward" },
    { id: 3, message: "✅ Your report for Water Bottle was resolved. Claim confirmed.", time: "Yesterday", read: true, type: "resolved" },
    { id: 4, message: "🏆 New badge unlocked: Photo Uploader", time: "2 days ago", read: true, type: "badge" },
    { id: 5, message: "🔔 Someone found your backpack! Check the match details.", time: "3 days ago", read: true, type: "match" },
    { id: 6, message: "⭐ You earned 25 points for uploading a photo", time: "5 days ago", read: true, type: "reward" },
  ]);

  const markAsRead = (id) => {
    setNotifications(notifications.map(n =>
      n.id === id ? { ...n, read: true } : n
    ));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const getTypeIcon = (type) => {
    switch(type) {
      case "match": return "🔔";
      case "reward": return "⭐";
      case "resolved": return "✅";
      case "badge": return "🏆";
      default: return "📢";
    }
  };

  return (
    <div style={css.page}>
      <div style={css.container}>
        <button style={css.backLink} onClick={() => go("dashboard")}>← Back to Dashboard</button>

        <div style={{
          background: C.card,
          border: `1px solid ${C.border}`,
          borderRadius: 22,
          overflow: "hidden",
          boxShadow: "0 4px 16px rgba(0,0,0,0.04)",
        }}>
          {/* Header */}
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "18px 24px",
            borderBottom: `1px solid ${C.border}`,
            background: C.fieldBg,
          }}>
            <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: C.text }}>
              Notifications {unreadCount > 0 && `(${unreadCount} new)`}
            </h2>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                style={{
                  background: "none",
                  border: "none",
                  color: C.link,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                Mark all as read
              </button>
            )}
          </div>

          {/* Notifications list */}
          <div>
            {notifications.length === 0 ? (
              <div style={{ padding: "48px", textAlign: "center", color: C.muted, fontSize: 15 }}>
                🔕 No notifications yet
              </div>
            ) : (
              notifications.map(notif => (
                <div
                  key={notif.id}
                  onClick={() => markAsRead(notif.id)}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 14,
                    padding: "16px 24px",
                    borderBottom: `1px solid ${C.border}`,
                    background: notif.read ? C.card : "#f0f5ff",
                    cursor: "pointer",
                    transition: "background 0.2s",
                  }}
                >
                  <div style={{ fontSize: 20, marginTop: 2 }}>{getTypeIcon(notif.type)}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{
                      fontSize: 14,
                      color: C.body,
                      marginBottom: 5,
                      fontWeight: notif.read ? 400 : 700,
                    }}>
                      {notif.message}
                    </div>
                    <div style={{ fontSize: 12, color: C.muted }}>{notif.time}</div>
                  </div>
                  {!notif.read && (
                    <div style={{
                      width: 9,
                      height: 9,
                      borderRadius: "50%",
                      background: C.primary,
                      flexShrink: 0,
                      marginTop: 6,
                    }} />
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}