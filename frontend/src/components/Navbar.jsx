import React, { useEffect, useRef, useState } from "react";
import { Bell, CheckCircle2, ChevronDown, Menu, Moon, Sun, X } from "lucide-react";

const C = {
  primary: "#0F5FFF",
  primaryDk: "#0b3470",
  border: "#d0d5dd",
  body: "#344054",
};

function useClickOutside(ref, enabled, onOutsideClick) {
  useEffect(() => {
    if (!enabled) return undefined;

    const handleClick = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        onOutsideClick();
      }
    };

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [ref, enabled, onOutsideClick]);
}

export default function Navbar({
  user,
  currentPage,
  navigateTo,
  sidebarOpen,
  setSidebarOpen,
  darkMode,
  setDarkMode,
  isMobile = false,
}) {
  const isLoggedIn = !!user;
  const notificationRef = useRef(null);
  const publicMenuRef = useRef(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [publicMenuOpen, setPublicMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, message: "Your lost laptop has a potential match.", time: "2 minutes ago", read: false, type: "match" },
    { id: 2, message: "You earned 50 points for reporting a found item.", time: "1 hour ago", read: false, type: "reward" },
    { id: 3, message: "Your water bottle report was resolved.", time: "Yesterday", read: false, type: "resolved" },
    { id: 4, message: "New badge unlocked: Photo Uploader.", time: "2 days ago", read: true, type: "badge" },
  ]);

  useClickOutside(notificationRef, showNotifications, () => setShowNotifications(false));
  useClickOutside(publicMenuRef, publicMenuOpen, () => setPublicMenuOpen(false));

  const unreadCount = notifications.filter((n) => !n.read).length;

  const nb = darkMode
    ? {
        bg: "#1e293b",
        border: "#334155",
        titleColor: "#e2e8f0",
        iconColor: "#94a3b8",
        nameColor: "#e2e8f0",
        panelBg: "#0f172a",
        panelCard: "#1e293b",
        panelText: "#e2e8f0",
        panelMuted: "#94a3b8",
        unreadBg: "#172554",
      }
    : {
        bg: "#FFFFFF",
        border: C.border,
        titleColor: C.primaryDk,
        iconColor: "#667085",
        nameColor: C.body,
        panelBg: "#ffffff",
        panelCard: "#ffffff",
        panelText: "#0b3470",
        panelMuted: "#667085",
        unreadBg: "#f0f5ff",
      };

  const pb = darkMode
    ? {
        bg: "#0f172a",
        border: "#334155",
        text: "#e2e8f0",
        muted: "#94a3b8",
        drawerBg: "#111827",
        drawerBorder: "#334155",
        activeBg: "rgba(59, 130, 246, 0.18)",
        activeText: "#60a5fa",
        outlineBorder: "rgba(226, 232, 240, 0.35)",
        solidBg: "#e2e8f0",
        solidText: "#0f172a",
      }
    : {
        bg: C.primaryDk,
        border: "rgba(255, 255, 255, 0.12)",
        text: "#ffffff",
        muted: "rgba(255, 255, 255, 0.72)",
        drawerBg: "#ffffff",
        drawerBorder: "#d0d5dd",
        activeBg: "#f0f5ff",
        activeText: C.primary,
        outlineBorder: "rgba(255, 255, 255, 0.4)",
        solidBg: "#ffffff",
        solidText: C.primaryDk,
      };

  const getPageTitle = (key) => {
    const titles = {
      home: "Home",
      about: "About",
      contact: "Contact",
      browse: "Browse Items",
      dashboard: "Dashboard",
      postlost: "Report Lost Item",
      postfound: "Report Found Item",
      reports: "My Reports",
      matchresults: "Match Results",
      claim: "Claim Item",
      return: "Return Item",
      chat: "Chat",
      rewards: "Rewards & Badges",
      profile: "My Profile",
      settings: "Settings",
      "help-support": "Help & Support",
      "admin-dashboard": "Admin Dashboard",
      "admin-reports": "Manage Reports",
      "admin-users": "Manage Users",
      "admin-analytics": "Analytics & Statistics",
    };

    return titles[key] || "Dashboard";
  };

  const markAsRead = (id) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const openNotificationTarget = (notification) => {
    markAsRead(notification.id);

    if (notification.type === "match") {
      navigateTo("/matchresults");
    } else if (notification.type === "reward" || notification.type === "badge") {
      navigateTo("/rewards");
    } else {
      navigateTo("/reports");
    }

    setShowNotifications(false);
  };

  const handlePublicNavigate = (path) => {
    navigateTo(path);
    setPublicMenuOpen(false);
  };

  const publicLinks = [
    { label: "Home", path: "/", key: "home" },
    { label: "About", path: "/about", key: "about" },
    { label: "Contact", path: "/contact", key: "contact" },
  ];

  const DarkModeButton = ({ compact = false, mobileDrawer = false }) => (
    <button
      type="button"
      style={{
        ...styles.darkTogglePublic,
        ...(mobileDrawer ? styles.drawerDarkToggle : {}),
        color: mobileDrawer ? (darkMode ? "#e2e8f0" : C.primaryDk) : pb.text,
        borderColor: mobileDrawer ? pb.drawerBorder : pb.outlineBorder,
        background: mobileDrawer
          ? darkMode
            ? "#1e293b"
            : "#f8fafc"
          : "rgba(255, 255, 255, 0.08)",
        padding: compact ? "8px 10px" : "10px 12px",
      }}
      onClick={() => setDarkMode && setDarkMode(!darkMode)}
      title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
    >
      {darkMode ? <Sun size={18} color="#facc15" /> : <Moon size={18} color={mobileDrawer ? C.primaryDk : pb.text} />}
      {!compact && <span>{darkMode ? "Light Mode" : "Dark Mode"}</span>}
    </button>
  );

  if (isLoggedIn) {
    return (
      <header
        style={{
          ...styles.headerAuth,
          padding: isMobile ? "14px 16px" : "20px 32px",
          background: nb.bg,
          borderBottom: `1px solid ${nb.border}`,
        }}
      >
        <div style={styles.leftAuthArea}>
          <button
            style={styles.menuToggle}
            onClick={() => setSidebarOpen(!sidebarOpen)}
            title={isMobile ? "Open menu" : "Toggle Sidebar"}
          >
            <Menu size={isMobile ? 22 : 24} color={nb.iconColor} />
          </button>

          <div
            style={{
              ...styles.pageTitle,
              color: nb.titleColor,
              fontSize: isMobile ? "18px" : "22px",
            }}
          >
            {getPageTitle(currentPage)}
          </div>
        </div>

        <div style={styles.actions}>
          <div ref={notificationRef} style={styles.notificationWrapper}>
            <button
              onClick={() => setShowNotifications((prev) => !prev)}
              style={{ ...styles.bellBtn, marginRight: isMobile ? "8px" : "20px" }}
              title="Notifications"
            >
              <Bell size={20} color={nb.iconColor} />
              {unreadCount > 0 && <span style={styles.badgeCountAuth}>{unreadCount}</span>}
            </button>

            {showNotifications && (
              <div
                style={{
                  ...styles.notificationPanel,
                  right: isMobile ? "0" : "10px",
                  width: isMobile ? "calc(100vw - 32px)" : "360px",
                  background: nb.panelBg,
                  border: `1px solid ${nb.border}`,
                }}
              >
                <div style={{ ...styles.notificationHeader, borderBottom: `1px solid ${nb.border}` }}>
                  <div>
                    <h3 style={{ ...styles.notificationTitle, color: nb.panelText }}>Notifications</h3>
                    <p style={{ ...styles.notificationSub, color: nb.panelMuted }}>
                      {unreadCount > 0
                        ? `${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}`
                        : "No unread notifications"}
                    </p>
                  </div>

                  <button style={styles.closeBtn} onClick={() => setShowNotifications(false)} title="Close">
                    <X size={18} color={nb.iconColor} />
                  </button>
                </div>

                <div style={styles.notificationList}>
                  {notifications.map((notification) => (
                    <button
                      key={notification.id}
                      style={{
                        ...styles.notificationItem,
                        background: notification.read ? nb.panelCard : nb.unreadBg,
                        borderBottom: `1px solid ${nb.border}`,
                      }}
                      onClick={() => openNotificationTarget(notification)}
                    >
                      <span style={styles.notificationIcon}>
                        {{ match: "🔔", reward: "⭐", resolved: "✅", badge: "🏆" }[notification.type] || "📢"}
                      </span>

                      <span style={styles.notificationBody}>
                        <span
                          style={{
                            ...styles.notificationMessage,
                            color: nb.panelText,
                            fontWeight: notification.read ? 500 : 800,
                          }}
                        >
                          {notification.message}
                        </span>
                        <span style={{ ...styles.notificationTime, color: nb.panelMuted }}>{notification.time}</span>
                      </span>

                      {!notification.read && <span style={styles.unreadDot} />}
                    </button>
                  ))}
                </div>

                <div style={{ ...styles.notificationFooter, borderTop: `1px solid ${nb.border}` }}>
                  <button style={styles.markReadBtn} onClick={markAllAsRead}>
                    <CheckCircle2 size={15} /> Mark all as read
                  </button>
                </div>
              </div>
            )}
          </div>

          <button
            type="button"
            style={{ ...styles.profileAuth, padding: isMobile ? "4px" : "4px 8px" }}
            onClick={() => navigateTo("/profile")}
            title="Profile"
          >
            <div style={styles.avatarAuth}>
              {user.name ? user.name.split(" ").map((n) => n[0]).join("") : "U"}
            </div>
            {!isMobile && (
              <div style={{ textAlign: "left" }}>
                <div style={{ ...styles.nameAuth, color: nb.nameColor }}>{user.name || "User"}</div>
              </div>
            )}
            {!isMobile && <ChevronDown size={16} color={nb.iconColor} />}
          </button>
        </div>
      </header>
    );
  }

  return (
    <>
      <header
        style={{
          ...styles.headerPublic,
          padding: isMobile ? "14px 16px" : "14px 32px",
          background: pb.bg,
          borderBottom: `1px solid ${pb.border}`,
        }}
      >
        <div style={styles.brand} onClick={() => handlePublicNavigate("/")}> 
          <h2 style={{ ...styles.logoPublic, color: pb.text, fontSize: isMobile ? "17px" : "19px" }}>
            UniLost & Found
          </h2>
          <span style={{ ...styles.logoSubPublic, color: pb.muted }}>University of Moratuwa</span>
        </div>

        {!isMobile && (
          <nav style={styles.publicNavDesktop}>
            {publicLinks.map((link) => {
              const active = currentPage === link.key;
              return (
                <button
                  key={link.key}
                  style={{
                    ...styles.navLinkPublic,
                    color: active ? "#93c5fd" : pb.text,
                    background: active ? "rgba(255,255,255,0.08)" : "transparent",
                  }}
                  onClick={() => handlePublicNavigate(link.path)}
                >
                  {link.label}
                </button>
              );
            })}
          </nav>
        )}

        {!isMobile ? (
          <div style={styles.publicActions}>
            <DarkModeButton />
            <button
              style={{ ...styles.btnOutlinePublic, borderColor: pb.outlineBorder, color: pb.text }}
              onClick={() => handlePublicNavigate("/login")}
            >
              Login
            </button>
            <button
              style={{ ...styles.btnSolidPublic, background: pb.solidBg, color: pb.solidText }}
              onClick={() => handlePublicNavigate("/register")}
            >
              Register
            </button>
          </div>
        ) : (
          <div style={styles.mobilePublicActions}>
            <DarkModeButton compact />
            <button
              type="button"
              style={{ ...styles.publicMenuButton, color: pb.text, borderColor: pb.outlineBorder }}
              onClick={() => setPublicMenuOpen(true)}
              title="Open menu"
            >
              <Menu size={22} />
            </button>
          </div>
        )}
      </header>

      {!isLoggedIn && isMobile && publicMenuOpen && (
        <>
          <button
            aria-label="Close menu"
            style={styles.publicMenuBackdrop}
            onClick={() => setPublicMenuOpen(false)}
          />

          <aside
            ref={publicMenuRef}
            style={{
              ...styles.publicMobileDrawer,
              background: pb.drawerBg,
              borderLeft: `1px solid ${pb.drawerBorder}`,
              color: darkMode ? "#e2e8f0" : C.primaryDk,
            }}
          >
            <div style={styles.drawerHeader}>
              <div>
                <h3 style={{ ...styles.drawerTitle, color: darkMode ? "#e2e8f0" : C.primaryDk }}>
                  UniLost & Found
                </h3>
                <p style={{ ...styles.drawerSub, color: darkMode ? "#94a3b8" : "#667085" }}>
                  University of Moratuwa
                </p>
              </div>

              <button
                type="button"
                style={styles.drawerCloseBtn}
                onClick={() => setPublicMenuOpen(false)}
                title="Close menu"
              >
                <X size={22} color={darkMode ? "#e2e8f0" : C.primaryDk} />
              </button>
            </div>

            <nav style={styles.drawerNav}>
              {publicLinks.map((link) => {
                const active = currentPage === link.key;
                return (
                  <button
                    key={link.key}
                    type="button"
                    style={{
                      ...styles.drawerNavItem,
                      color: active ? pb.activeText : darkMode ? "#e2e8f0" : C.primaryDk,
                      background: active ? pb.activeBg : "transparent",
                    }}
                    onClick={() => handlePublicNavigate(link.path)}
                  >
                    {link.label}
                  </button>
                );
              })}
            </nav>

            <div style={{ ...styles.drawerDivider, background: pb.drawerBorder }} />

            <DarkModeButton mobileDrawer />

            <div style={styles.drawerAuthActions}>
              <button
                style={{
                  ...styles.drawerAuthBtn,
                  color: darkMode ? "#e2e8f0" : C.primaryDk,
                  borderColor: pb.drawerBorder,
                  background: "transparent",
                }}
                onClick={() => handlePublicNavigate("/login")}
              >
                Login
              </button>
              <button
                style={{ ...styles.drawerAuthBtn, background: C.primary, color: "white", borderColor: C.primary }}
                onClick={() => handlePublicNavigate("/register")}
              >
                Register
              </button>
            </div>
          </aside>
        </>
      )}
    </>
  );
}

const styles = {
  headerAuth: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    background: "#FFFFFF",
    zIndex: 100,
    fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
    position: "sticky",
    top: 0,
    minWidth: 0,
  },
  leftAuthArea: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    minWidth: 0,
  },
  pageTitle: {
    fontWeight: "800",
    color: C.primaryDk,
    minWidth: 0,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  menuToggle: {
    background: "transparent",
    border: "none",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "4px",
    borderRadius: "8px",
    flexShrink: 0,
  },
  actions: {
    display: "flex",
    alignItems: "center",
    flexShrink: 0,
  },
  notificationWrapper: {
    position: "relative",
  },
  bellBtn: {
    background: "transparent",
    border: "none",
    cursor: "pointer",
    position: "relative",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "6px",
  },
  badgeCountAuth: {
    position: "absolute",
    top: "-2px",
    right: "-2px",
    background: C.primary,
    color: "white",
    fontSize: "10px",
    fontWeight: "bold",
    borderRadius: "50%",
    width: "17px",
    height: "17px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "2px solid #fff",
  },
  notificationPanel: {
    position: "absolute",
    top: "42px",
    maxWidth: "calc(100vw - 32px)",
    borderRadius: "18px",
    overflow: "hidden",
    boxShadow: "0 18px 45px rgba(15, 23, 42, 0.22)",
    zIndex: 1000,
  },
  notificationHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px 18px",
  },
  notificationTitle: {
    margin: 0,
    fontSize: "18px",
    fontWeight: 800,
  },
  notificationSub: {
    margin: "4px 0 0",
    fontSize: "12px",
  },
  closeBtn: {
    background: "transparent",
    border: "none",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  notificationList: {
    maxHeight: "320px",
    overflowY: "auto",
  },
  notificationItem: {
    width: "100%",
    border: "none",
    display: "flex",
    alignItems: "flex-start",
    gap: "12px",
    padding: "14px 18px",
    textAlign: "left",
    cursor: "pointer",
    fontFamily: "inherit",
  },
  notificationIcon: {
    fontSize: "19px",
    marginTop: "2px",
  },
  notificationBody: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  notificationMessage: {
    fontSize: "13px",
    lineHeight: 1.45,
  },
  notificationTime: {
    fontSize: "11px",
  },
  unreadDot: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    background: C.primary,
    marginTop: "6px",
    flexShrink: 0,
  },
  notificationFooter: {
    padding: "10px 18px",
    display: "flex",
    justifyContent: "flex-end",
  },
  markReadBtn: {
    background: "transparent",
    border: "none",
    color: C.primary,
    fontSize: "12px",
    fontWeight: 700,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "6px",
    fontFamily: "inherit",
  },
  profileAuth: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    cursor: "pointer",
    borderRadius: "8px",
    background: "transparent",
    border: "none",
    fontFamily: "inherit",
  },
  avatarAuth: {
    width: "36px",
    height: "36px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #0F5FFF, #4A8BFF)",
    color: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "700",
    fontSize: "13px",
    flexShrink: 0,
  },
  nameAuth: {
    fontSize: "14px",
    fontWeight: "600",
    color: C.body,
  },
  headerPublic: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "20px",
    color: "white",
    boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
    zIndex: 100,
    fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
    position: "sticky",
    top: 0,
    minWidth: 0,
  },
  brand: {
    cursor: "pointer",
    minWidth: 0,
    flexShrink: 0,
  },
  logoPublic: {
    margin: 0,
    fontWeight: 700,
    letterSpacing: "0.5px",
    whiteSpace: "nowrap",
  },
  logoSubPublic: {
    fontSize: "11px",
    whiteSpace: "nowrap",
  },
  publicNavDesktop: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "6px",
    flex: 1,
    minWidth: 0,
  },
  navLinkPublic: {
    border: "none",
    fontSize: "15px",
    fontWeight: "600",
    cursor: "pointer",
    padding: "9px 12px",
    borderRadius: "10px",
    fontFamily: "inherit",
    whiteSpace: "nowrap",
    flexShrink: 0,
  },
  publicActions: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    flexShrink: 0,
  },
  mobilePublicActions: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    flexShrink: 0,
  },
  darkTogglePublic: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    border: "1.5px solid",
    borderRadius: "10px",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "700",
    fontFamily: "inherit",
    whiteSpace: "nowrap",
  },
  btnOutlinePublic: {
    padding: "10px 20px",
    fontSize: "14px",
    fontWeight: "700",
    border: "1.5px solid",
    borderRadius: "10px",
    cursor: "pointer",
    background: "transparent",
    fontFamily: "inherit",
    whiteSpace: "nowrap",
  },
  btnSolidPublic: {
    padding: "10px 20px",
    fontSize: "14px",
    fontWeight: "700",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
    fontFamily: "inherit",
    whiteSpace: "nowrap",
  },
  publicMenuButton: {
    width: "40px",
    height: "40px",
    border: "1.5px solid",
    borderRadius: "10px",
    background: "rgba(255, 255, 255, 0.08)",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  publicMenuBackdrop: {
    position: "fixed",
    inset: 0,
    background: "rgba(15, 23, 42, 0.45)",
    border: "none",
    padding: 0,
    margin: 0,
    zIndex: 1100,
  },
  publicMobileDrawer: {
    position: "fixed",
    top: 0,
    right: 0,
    width: "min(320px, 86vw)",
    height: "100dvh",
    padding: "20px",
    boxSizing: "border-box",
    zIndex: 1101,
    boxShadow: "-18px 0 45px rgba(15, 23, 42, 0.25)",
    display: "flex",
    flexDirection: "column",
    fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
  },
  drawerHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "12px",
    marginBottom: "24px",
  },
  drawerTitle: {
    margin: 0,
    fontSize: "20px",
    fontWeight: 800,
  },
  drawerSub: {
    margin: "4px 0 0",
    fontSize: "12px",
  },
  drawerCloseBtn: {
    border: "none",
    background: "transparent",
    cursor: "pointer",
    padding: "4px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  drawerNav: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  drawerNavItem: {
    width: "100%",
    border: "none",
    borderRadius: "12px",
    padding: "13px 14px",
    textAlign: "left",
    fontSize: "15px",
    fontWeight: 700,
    cursor: "pointer",
    fontFamily: "inherit",
  },
  drawerDivider: {
    height: "1px",
    margin: "18px 0",
  },
  drawerDarkToggle: {
    width: "100%",
    justifyContent: "flex-start",
    padding: "13px 14px",
    marginBottom: "14px",
  },
  drawerAuthActions: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "10px",
    marginTop: "auto",
  },
  drawerAuthBtn: {
    padding: "12px 14px",
    border: "1.5px solid",
    borderRadius: "12px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: 800,
    fontFamily: "inherit",
  },
};
