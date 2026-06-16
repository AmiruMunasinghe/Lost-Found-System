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
  danger: "#E24B4A",
  green: "#3B6D11",
  amber: "#BA7517",
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
    maxWidth: 720,
    margin: "0 auto",
  },
};

function Avatar({ initials, size = 44 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: "linear-gradient(135deg, #0F5FFF, #4A8BFF)",
      color: "#fff",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontWeight: 700, fontSize: size * 0.35,
    }}>{initials}</div>
  );
}

function ActionCard({ title, desc, iconBg, icon, onClick, wide }) {
  const [hov, setHov] = useState(false);
  return (
    <div
      style={{
        background: hov ? "#f6f9ff" : C.card,
        border: `1px solid ${hov ? C.primary : C.border}`,
        borderRadius: 18, padding: "18px 20px",
        cursor: "pointer", transition: "all .2s ease",
        display: wide ? "flex" : "block",
        alignItems: wide ? "center" : undefined,
        gap: wide ? 16 : undefined,
        boxShadow: hov ? "0 8px 24px rgba(15,95,255,0.1)" : "none",
      }}
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
    >
      <div style={{
        width: 40, height: 40, borderRadius: 12,
        background: iconBg, display: "flex", alignItems: "center",
        justifyContent: "center", fontSize: 18, marginBottom: wide ? 0 : 12,
      }}>{icon}</div>
      <div>
        <div style={{ fontWeight: 700, fontSize: 14, color: C.text, marginBottom: 3 }}>{title}</div>
        <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.4 }}>{desc}</div>
      </div>
    </div>
  );
}

// Notification Popup Component
function NotificationPopup({ onClose, onViewAll }) {
  const notifications = [
    { id: 1, message: "🔔 Your lost laptop has a potential match!", time: "2 minutes ago", read: false },
    { id: 2, message: "⭐ You earned 50 points for reporting a found item", time: "1 hour ago", read: false },
    { id: 3, message: "✅ Your report for Water Bottle was resolved", time: "Yesterday", read: true },
    { id: 4, message: "🏆 New badge unlocked: Photo Uploader", time: "2 days ago", read: true },
  ];

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div style={{
      position: "absolute",
      top: 65,
      right: 0,
      width: 360,
      background: C.card,
      border: `1px solid ${C.border}`,
      borderRadius: 18,
      boxShadow: "0 12px 40px rgba(0,0,0,0.12)",
      zIndex: 1000,
      overflow: "hidden",
    }}>
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "14px 20px",
        borderBottom: `1px solid ${C.border}`,
        background: C.fieldBg,
      }}>
        <span style={{ fontWeight: 700, fontSize: 15, color: C.text }}>
          Notifications {unreadCount > 0 && `(${unreadCount})`}
        </span>
        <div style={{ display: "flex", gap: 12 }}>
          <button
            onClick={onViewAll}
            style={{
              background: "none",
              border: "none",
              color: C.link,
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            View all
          </button>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              color: C.muted,
              fontSize: 18,
              cursor: "pointer",
              lineHeight: 1,
            }}
          >
            ×
          </button>
        </div>
      </div>
      <div style={{ maxHeight: 400, overflowY: "auto" }}>
        {notifications.map(notif => (
          <div
            key={notif.id}
            style={{
              padding: "14px 20px",
              borderBottom: `1px solid ${C.border}`,
              background: notif.read ? C.card : "#f0f5ff",
              cursor: "pointer",
              transition: "background .15s",
            }}
          >
            <div style={{ fontSize: 14, color: C.body, marginBottom: 4, fontWeight: notif.read ? 400 : 600 }}>
              {notif.message}
            </div>
            <div style={{ fontSize: 11, color: C.muted }}>{notif.time}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Dashboard({ setPage }) {
  const [showNotifications, setShowNotifications] = useState(false);

  const stats = [
    { num: "3", label: "Active reports", color: C.primary },
    { num: "1", label: "Matches found",  color: C.green },
    { num: "250", label: "Reward points", color: C.amber },
  ];

  const actions = [
    { title: "Report lost item",  desc: "Lost something? File a report", iconBg: "#FCEBEB", icon: "🔴", nav: "postlost" },
    { title: "Report found item", desc: "Found something? Help reunite it", iconBg: "#EAF3DE", icon: "🟢", nav: "postfound" },
    { title: "My reports",        desc: "View & manage your submitted reports", iconBg: "#E6F1FB", icon: "📄", nav: "reports" },
    { title: "My profile",        desc: "Update your info & settings", iconBg: "#EEEDFE", icon: "👤", nav: "profile" },
    { title: "Match results",     desc: "Display match results", iconBg: "#E6F1FB", icon: "🔗", nav: "matchresults" },
  ];

  return (
    <div style={css.page}>
      <div style={css.container}>
        {/* Top bar */}
        <div style={{
          background: C.card, border: `1px solid ${C.border}`,
          borderRadius: 22, padding: "16px 24px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          marginBottom: 18,
          position: "relative",
          boxShadow: "0 4px 16px rgba(0,0,0,0.04)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <Avatar initials="KS" size={44} />
            <div>
              <div style={{ fontWeight: 700, fontSize: 16, color: C.text }}>Kumar Sangakkara</div>
              <div style={{ fontSize: 12, color: C.muted }}>Student · 230224V</div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            {/* Notification Bell Icon */}
            <div style={{ position: "relative" }}>
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: 22,
                  cursor: "pointer",
                  position: "relative",
                }}
              >
                🔔
                <span style={{
                  position: "absolute",
                  top: -5,
                  right: -5,
                  background: C.danger,
                  color: "white",
                  fontSize: 9,
                  fontWeight: "bold",
                  borderRadius: "50%",
                  padding: "2px 5px",
                  minWidth: 14,
                  textAlign: "center",
                }}>3</span>
              </button>
            </div>
            <button
              style={{
                fontSize: 13, color: C.danger, cursor: "pointer",
                border: `1.5px solid #F09595`, borderRadius: 22,
                padding: "7px 18px", background: C.card,
                fontWeight: 600, fontFamily: "inherit",
              }}
              onClick={() => setPage("login")}
            >
              Sign out
            </button>
          </div>

          {/* Notification Popup */}
          {showNotifications && (
            <NotificationPopup
              onClose={() => setShowNotifications(false)}
              onViewAll={() => {
                setShowNotifications(false);
                setPage("notifications");
              }}
            />
          )}
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14, marginBottom: 22 }}>
          {stats.map(s => (
            <div key={s.label} style={{
              background: C.card, borderRadius: 18, padding: "20px 16px", textAlign: "center",
              border: `1px solid ${C.border}`,
              boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
            }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: s.color }}>{s.num}</div>
              <div style={{ fontSize: 12, color: C.muted, marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>

        <p style={{
          fontSize: 11, fontWeight: 700, letterSpacing: "0.8px",
          textTransform: "uppercase", color: C.muted, margin: "0 0 12px",
        }}>Quick actions</p>

        {/* Action grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
          {actions.map(a => (
            <ActionCard key={a.title} {...a} onClick={() => a.nav && setPage(a.nav)} />
          ))}
        </div>

        {/* Rewards card */}
        <ActionCard
          title="My rewards"
          desc="View your points, badges & achievements"
          iconBg="#FAEEDA"
          icon="⭐"
          wide
          onClick={() => setPage("rewards")}
        />
      </div>
    </div>
  );
}