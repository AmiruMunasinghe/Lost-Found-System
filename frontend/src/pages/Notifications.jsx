import { useEffect, useState } from "react";
import {
  getAllNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "../api/notifications";

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

function formatTime(value) {
  if (!value) return "Just now";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Just now";

  const diffMs = Date.now() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin} min ago`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
  return date.toLocaleDateString();
}

function normalizeNotification(notification) {
  return {
    id: notification.id,
    title: notification.title || "Notification",
    message: notification.message || notification.title || "You have a new notification.",
    time: formatTime(notification.createdAt),
    read: Boolean(notification.read),
    type: String(notification.type || "GENERAL").toLowerCase(),
    referenceItemId: notification.referenceItemId,
  };
}

export default function Notifications({ user, navigateTo, darkMode }) {
  const t = useDark(darkMode);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const userId = user?.id || user?.user?.id;

  async function loadNotifications() {
    if (!userId) {
      setNotifications([]);
      setError("Login user ID was not found.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      const data = await getAllNotifications(userId);
      setNotifications(Array.isArray(data) ? data.map(normalizeNotification) : []);
    } catch (err) {
      setError(err.message || "Failed to load notifications.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadNotifications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const markAsRead = async (id) => {
    setNotifications((ns) => ns.map((n) => (n.id === id ? { ...n, read: true } : n)));
    if (!userId) return;
    try {
      await markNotificationAsRead(id, userId);
    } catch (err) {
      console.warn("Failed to mark notification as read", err);
    }
  };

  const markAllAsRead = async () => {
    setNotifications((ns) => ns.map((n) => ({ ...n, read: true })));
    if (!userId) return;
    try {
      await markAllNotificationsAsRead(userId);
    } catch (err) {
      console.warn("Failed to mark all notifications as read", err);
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div style={{ fontFamily: "'DM Sans','Segoe UI',sans-serif" }}>
      <div style={{ width: "100%", maxWidth: 700, margin: "0 auto" }}>
        <button
          style={{ background: "none", border: "none", color: t.link, fontSize: 14, fontWeight: 600, cursor: "pointer", marginBottom: 18, display: "flex", alignItems: "center", gap: 6, padding: 0, fontFamily: "inherit" }}
          onClick={() => navigateTo("dashboard")}
        >← Back to Dashboard</button>

        <div style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: 22, overflow: "hidden", boxShadow: "0 4px 16px rgba(0,0,0,0.04)", transition: "background 0.3s, border-color 0.3s" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, padding: "18px 24px", borderBottom: `1px solid ${t.border}`, background: t.fieldBg }}>
            <div>
              <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: t.text }}>
                Notifications {unreadCount > 0 && `(${unreadCount} new)`}
              </h2>
              {error && <p style={{ margin: "6px 0 0", color: "#ef4444", fontSize: 13 }}>{error}</p>}
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={loadNotifications} style={{ background: "none", border: "none", color: t.link, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                Refresh
              </button>
              {unreadCount > 0 && (
                <button onClick={markAllAsRead} style={{ background: "none", border: "none", color: t.link, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                  Mark all as read
                </button>
              )}
            </div>
          </div>

          <div>
            {loading ? (
              <div style={{ padding: "48px", textAlign: "center", color: t.muted, fontSize: 15 }}>Loading notifications...</div>
            ) : notifications.length === 0 ? (
              <div style={{ padding: "48px", textAlign: "center", color: t.muted, fontSize: 15 }}>🔕 No notifications yet</div>
            ) : notifications.map((notif) => (
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
                  {{ match: "🔔", item_matched: "🔔", reward: "⭐", resolved: "✅", claim_update: "✅", badge: "🏆", general: "📢" }[notif.type] || "📢"}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, color: t.muted, marginBottom: 3, fontWeight: 700 }}>{notif.title}</div>
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
