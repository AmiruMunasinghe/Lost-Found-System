import { useState } from "react";

const C = {
  primary: "#185FA5",
  primaryDk: "#0C447C",
  bg: "#F4F6FA",
  card: "#FFFFFF",
  text: "#1A1D2E",
  muted: "#6B7080",
  border: "#DDE1EA",
  danger: "#E24B4A",
  green: "#3B6D11",
  amber: "#BA7517",
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
    maxWidth: 660,
    margin: "0 auto",
  },
};

function Avatar({ initials, size = 40 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: C.primary, color: "#fff",
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
        background: hov ? "#F8FAFF" : C.card,
        border: `1px solid ${hov ? C.primary : C.border}`,
        borderRadius: 12, padding: "16px",
        cursor: "pointer", transition: "all .15s",
        display: wide ? "flex" : "block", alignItems: wide ? "center" : undefined, gap: wide ? 14 : undefined,
      }}
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
    >
      <div style={{
        width: 34, height: 34, borderRadius: 9,
        background: iconBg, display: "flex", alignItems: "center",
        justifyContent: "center", fontSize: 16, marginBottom: wide ? 0 : 10,
      }}>{icon}</div>
      <div>
        <div style={{ fontWeight: 600, fontSize: 13, color: C.text, marginBottom: 2 }}>{title}</div>
        <div style={{ fontSize: 11, color: C.muted, lineHeight: 1.4 }}>{desc}</div>
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
      top: 60,
      right: 20,
      width: 320,
      background: C.card,
      border: `1px solid ${C.border}`,
      borderRadius: 12,
      boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
      zIndex: 1000,
      overflow: "hidden",
    }}>
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "12px 16px",
        borderBottom: `1px solid ${C.border}`,
        background: C.fieldBg,
      }}>
        <span style={{ fontWeight: 600, fontSize: 14, color: C.text }}>
          Notifications {unreadCount > 0 && `(${unreadCount})`}
        </span>
        <div style={{ display: "flex", gap: 12 }}>
          <button
            onClick={onViewAll}
            style={{
              background: "none",
              border: "none",
              color: C.primary,
              fontSize: 11,
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
              fontSize: 16,
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
              padding: "12px 16px",
              borderBottom: `1px solid ${C.border}`,
              background: notif.read ? C.card : "#F0F7FF",
              cursor: "pointer",
            }}
          >
            <div style={{ fontSize: 13, color: C.text, marginBottom: 4 }}>
              {notif.message}
            </div>
            <div style={{ fontSize: 10, color: C.muted }}>{notif.time}</div>
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
    {title: "Match results",       desc:"Display match results", iconBg:"#22da22", icon:"👤", nav: "matchresults" },
  ];

  return (
    <div style={css.page}>
      <div style={css.container}>
        {/* Top bar */}
        <div style={{
          background: C.card, border: `1px solid ${C.border}`,
          borderRadius: 14, padding: "14px 20px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          marginBottom: 14,
          position: "relative",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Avatar initials="KS" size={40} />
            <div>
              <div style={{ fontWeight: 700, fontSize: 14, color: C.text }}>Kumar Sangakkara</div>
              <div style={{ fontSize: 11, color: C.muted }}>Student · 230224V</div>
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
                  fontSize: 20,
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
                  padding: "2px 4px",
                  minWidth: 14,
                  textAlign: "center",
                }}>3</span>
              </button>
            </div>
            <button
              style={{
                fontSize: 12, color: C.danger, cursor: "pointer",
                border: `1px solid #F09595`, borderRadius: 20,
                padding: "5px 14px", background: C.card,
              }}
              onClick={() => setPage("login")}
            >
              Sign out
            </button>
          </div>
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

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 18 }}>
          {stats.map(s => (
            <div key={s.label} style={{
              background: "#EEF1F8", borderRadius: 10, padding: "14px 12px", textAlign: "center",
            }}>
              <div style={{ fontSize: 24, fontWeight: 700, color: s.color }}>{s.num}</div>
              <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>

        <p style={{
          fontSize: 10, fontWeight: 600, letterSpacing: "0.6px",
          textTransform: "uppercase", color: C.muted, margin: "0 0 10px",
        }}>Quick actions</p>

        {/* Action grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
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