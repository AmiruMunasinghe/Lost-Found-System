import { useState, useEffect, useCallback } from "react";
import {
  getAllNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  getCurrentUserId,
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

function typeFromNotification(n) {
  const t = String(n.type || "").toLowerCase();
  if (t.includes("match")) return "match";
  if (t.includes("reward") || t.includes("badge")) return "reward";
  if (t.includes("resolv") || t.includes("claim")) return "resolved";
  return "info";
}

function formatTime(dateStr) {
  if (!dateStr) return "";
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins} minute${mins > 1 ? "s" : ""} ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hour${hrs > 1 ? "s" : ""} ago`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return "Yesterday";
  return `${days} days ago`;
}

export default function Notifications({ navigateTo, darkMode, user }) {
  const t = useDark(darkMode);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const userId = user?.id ?? getCurrentUserId();

  const fetchNotifications = useCallback(async () => {
    if (!userId) { setLoading(false); return; }
    try {
      const data = await getAllNotifications(userId);
      setNotifications(Array.isArray(data) ? data : []);
    } catch (err) {
      setError("Failed to load notifications.");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => { fetchNotifications(); }, [fetchNotifications]);

  const markAsRead = async (id) => {
    setNotifications(ns => ns.map(n => n.id === id ? { ...n, isRead: true } : n));
    try {
      await markNotificationAsRead(id, userId);
    } catch {
      // revert on failure
      fetchNotifications();
    }
  };

  const markAllAsRead = async () => {
    setNotifications(ns => ns.map(n => ({ ...n, isRead: true })));
    try {
      await markAllNotificationsAsRead(userId);
    } catch {
      fetchNotifications();
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const typeIcon = { match: "🔔", reward: "⭐", resolved: "✅", badge: "🏆", info: "📢" };

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
            {loading ? (
              <div style={{ padding: "48px", textAlign: "center", color: t.muted, fontSize: 15 }}>Loading notifications…</div>
            ) : error ? (
              <div style={{ padding: "48px", textAlign: "center", color: "#ef4444", fontSize: 15 }}>{error}</div>
            ) : notifications.length === 0 ? (
              <div style={{ padding: "48px", textAlign: "center", color: t.muted, fontSize: 15 }}>🔕 No notifications yet</div>
            ) : notifications.map(notif => {
              const kind = typeFromNotification(notif);
              return (
                <div
                  key={notif.id}
                  onClick={() => markAsRead(notif.id)}
                  style={{
                    display: "flex", alignItems: "flex-start", gap: 14,
                    padding: "16px 24px",
                    borderBottom: `1px solid ${t.border}`,
                    background: notif.isRead ? t.card : t.unread,
                    cursor: "pointer", transition: "background 0.2s",
                  }}
                >
                  <div style={{ fontSize: 20, marginTop: 2 }}>{typeIcon[kind] || "📢"}</div>
                  <div style={{ flex: 1 }}>
                    {notif.title && (
                      <div style={{ fontSize: 13, color: t.muted, fontWeight: 600, marginBottom: 2 }}>{notif.title}</div>
                    )}
                    <div style={{ fontSize: 14, color: t.body, marginBottom: 5, fontWeight: notif.isRead ? 400 : 700 }}>{notif.message}</div>
                    <div style={{ fontSize: 12, color: t.muted }}>{formatTime(notif.createdAt)}</div>
                  </div>
                  {!notif.isRead && (
                    <div style={{ width: 9, height: 9, borderRadius: "50%", background: "#0F5FFF", flexShrink: 0, marginTop: 6 }} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}