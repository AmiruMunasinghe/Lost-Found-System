import { useState } from "react";

const C = {
  primary: "#185FA5",
  bg: "#F4F6FA",
  card: "#FFFFFF",
  text: "#1A1D2E",
  muted: "#6B7080",
  border: "#DDE1EA",
  fieldBg: "#F8F9FC",
  green: "#3B6D11",
};

const css = {
  page: {
    minHeight: "100vh",
    background: C.bg,
    fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
    padding: "24px 16px",
  },
  container: {
    width: "100%",
    maxWidth: 600,
    margin: "0 auto",
  },
  link: {
    background: "none",
    border: "none",
    color: C.primary,
    fontSize: 13,
    cursor: "pointer",
    marginBottom: 14,
    display: "flex",
    alignItems: "center",
    gap: 5,
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
        <button style={css.link} onClick={() => go("dashboard")}>← Back to Dashboard</button>

        <div style={{
          background: C.card,
          border: `1px solid ${C.border}`,
          borderRadius: 14,
          overflow: "hidden",
        }}>
          {/* Header */}
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "16px 20px",
            borderBottom: `1px solid ${C.border}`,
            background: C.fieldBg,
          }}>
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: C.text }}>
              Notifications {unreadCount > 0 && `(${unreadCount} new)`}
            </h2>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                style={{
                  background: "none",
                  border: "none",
                  color: C.primary,
                  fontSize: 12,
                  cursor: "pointer",
                }}
              >
                Mark all as read
              </button>
            )}
          </div>

          {/* Notifications list */}
          <div>
            {notifications.length === 0 ? (
              <div style={{ padding: "40px", textAlign: "center", color: C.muted }}>
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
                    gap: 12,
                    padding: "14px 20px",
                    borderBottom: `1px solid ${C.border}`,
                    background: notif.read ? C.card : "#F0F7FF",
                    cursor: "pointer",
                    transition: "background 0.2s",
                  }}
                >
                  <div style={{ fontSize: 18 }}>{getTypeIcon(notif.type)}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{
                      fontSize: 13,
                      color: C.text,
                      marginBottom: 4,
                      fontWeight: notif.read ? 400 : 600,
                    }}>
                      {notif.message}
                    </div>
                    <div style={{ fontSize: 11, color: C.muted }}>{notif.time}</div>
                  </div>
                  {!notif.read && (
                    <div style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: C.primary,
                      flexShrink: 0,
                      marginTop: 4,
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