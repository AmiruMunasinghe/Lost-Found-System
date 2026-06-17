import React from "react";
import { 
  LayoutDashboard, Search, FileBox, FilePlus2, Megaphone, 
  Bell, User, Settings, LifeBuoy, Phone, LogOut, PackageSearch, PackageCheck, ScrollText, Link2, Trophy,
  Sun, Moon
} from "lucide-react";

export default function Sidebar({ role, currentPage, navigateTo, setUser, sidebarOpen, darkMode, setDarkMode }) {
  // Dark mode theme tokens
  const t = darkMode ? {
    sidebar: "linear-gradient(180deg, #0f172a 0%, #1e293b 60%, #1e2d45 100%)",
    text: "#e2e8f0",
    muted: "#94a3b8",
    logoTitle: "#e2e8f0",
    logoSub: "#64748b",
    activeBg: "rgba(59,130,246,0.2)",
    activeColor: "#60a5fa",
    hoverBg: "rgba(255,255,255,0.06)",
    divider: "#334155",
    logoutColor: "#f87171",
    badge: "#1d4ed8",
  } : {
    sidebar: "linear-gradient(180deg, #FFFFFF 0%, #f0f5fc 60%, #dce7f7 100%)",
    text: "#0b3470",
    muted: "#667085",
    logoTitle: "#0b3470",
    logoSub: "#667085",
    activeBg: "rgba(230,241,251,0.85)",
    activeColor: "#0F5FFF",
    hoverBg: "#F0F5FF",
    divider: "#d0d5dd",
    logoutColor: "#E24B4A",
    badge: "#0F5FFF",
  };
  const getSidebarItems = () => {
    if (role === "admin") {
      return [
        { label: "Dashboard", key: "admin-dashboard", icon: <LayoutDashboard size={20} /> },
        { label: "Manage Reports", key: "admin-reports", icon: <ScrollText size={20} /> },
        { label: "Manage Users", key: "admin-users", icon: <User size={20} /> },
        { label: "Analytics", key: "admin-analytics", icon: <Settings size={20} /> }, 
      ];
    } else {
      return [
        { label: "Dashboard", key: "dashboard", icon: <LayoutDashboard size={20} /> },
        { label: "Report Lost", key: "postlost", icon: <FilePlus2 size={20} /> },
        { label: "Report Found", key: "postfound", icon: <Megaphone size={20} /> },
        { label: "My Reports", key: "reports", icon: <ScrollText size={20} /> },
        { label: "Match Results", key: "matchresults", icon: <Link2 size={20} /> },
        { label: "Claim Item", key: "claim", icon: <PackageCheck size={20} /> },
        { label: "Return Item", key: "return", icon: <PackageSearch size={20} /> },
        { label: "Notifications", key: "notifications", icon: <Bell size={20} />, badge: 3 },
        { label: "Rewards & Badges", key: "rewards", icon: <Trophy size={20} /> },
        { label: "Profile", key: "profile", icon: <User size={20} /> },
        { label: "Settings", key: "settings", icon: <Settings size={20} /> },
        { label: "Help Center", key: "help", icon: <LifeBuoy size={20} /> },
        { label: "Contact Support", key: "contact", icon: <Phone size={20} /> },
      ];
    }
  };

  const items = getSidebarItems();

  if (items.length === 0) return null;

  return (
    <aside style={{
      ...styles.sidebar,
      background: t.sidebar,
      width: sidebarOpen ? "260px" : "64px",
      padding: sidebarOpen ? "24px 16px" : "24px 8px",
    }}>
      {/* FOREGROUND CONTENT */}
      <div style={{ position: "relative", zIndex: 1 }}>
        {/* LOGO */}
        <div style={{...styles.brand, justifyContent: sidebarOpen ? "flex-start" : "center"}} onClick={() => navigateTo("/")}>
          <div style={styles.logoBox}><FileBox color="white" size={20} /></div>
          {sidebarOpen && (
            <div>
              <div style={{...styles.logoTitle, color: t.logoTitle}}>Lost and Found</div>
              <div style={{...styles.logoSub, color: t.logoSub}}>Helping return what matters.</div>
            </div>
          )}
        </div>

        {/* LINKS */}
        <ul style={styles.list}>
          {items.map((item) => {
            const isActive = currentPage === item.key;
            return (
              <li 
                key={item.label} 
                title={!sidebarOpen ? item.label : undefined}
                style={{
                  ...styles.item,
                  justifyContent: sidebarOpen ? "space-between" : "center",
                  backgroundColor: isActive ? t.activeBg : "transparent",
                  color: isActive ? t.activeColor : t.text,
                  fontWeight: isActive ? "700" : "500",
                }}
                onClick={() => navigateTo(item.key)}
              >
                <div style={{ display: "flex", alignItems: "center" }}>
                  <span style={{ ...styles.icon, marginRight: sidebarOpen ? "12px" : "0", color: isActive ? t.activeColor : t.muted }}>
                    {item.icon}
                  </span>
                  {sidebarOpen && <span style={{ color: isActive ? t.activeColor : t.text }}>{item.label}</span>}
                </div>
                {sidebarOpen && item.badge && (
                  <span style={{...styles.badge, background: t.badge}}>{item.badge}</span>
                )}
              </li>
            );
          })}
        </ul>
      </div>

      <div style={{ position: "relative", zIndex: 1 }}>
        <div style={{...styles.divider, background: t.divider}} />

        {/* DARK MODE TOGGLE */}
        <div
          title={!sidebarOpen ? (darkMode ? "Switch to Light" : "Switch to Dark") : undefined}
          onClick={() => setDarkMode && setDarkMode(!darkMode)}
          style={{
            ...styles.logoutBtn,
            justifyContent: sidebarOpen ? "flex-start" : "center",
            color: t.muted,
            marginBottom: "4px",
          }}
        >
          {darkMode
            ? <Sun size={20} color="#facc15" />
            : <Moon size={20} color={t.muted} />
          }
          {sidebarOpen && <span style={{ color: t.text }}>{darkMode ? "Light Mode" : "Dark Mode"}</span>}
        </div>

        {/* LOGOUT BUTTON */}
        <div 
          style={{...styles.logoutBtn, justifyContent: sidebarOpen ? "flex-start" : "center", color: t.logoutColor}}
          title={!sidebarOpen ? "Logout" : undefined}
          onClick={() => {
            if (setUser) setUser(null);
            navigateTo("/");
          }}
        >
          <LogOut size={20} />
          {sidebarOpen && <span>Logout</span>}
        </div>
      </div>
    </aside>
  );
}

const styles = {
  sidebar: {
    background: "linear-gradient(180deg, #FFFFFF 0%, #f0f5fc 60%, #dce7f7 100%)",
    borderRight: "1px solid #d0d5dd",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    minHeight: "100vh",
    fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
    boxSizing: "border-box",
    transition: "width 0.3s ease, padding 0.3s ease",
    overflow: "hidden",
    flexShrink: 0,
    position: "relative",
  },
  brand: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "32px",
    cursor: "pointer",
    padding: "0 8px",
  },
  logoBox: {
    width: "40px",
    height: "40px",
    borderRadius: "10px",
    background: "linear-gradient(135deg, #0F5FFF, #4A8BFF)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  logoTitle: {
    fontSize: "17px",
    fontWeight: "800",
    color: "#0b3470",
    whiteSpace: "nowrap",
  },
  logoSub: {
    fontSize: "11px",
    color: "#667085",
    marginTop: "2px",
    whiteSpace: "nowrap",
  },
  list: {
    listStyleType: "none",
    padding: 0,
    margin: 0,
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  item: {
    display: "flex",
    alignItems: "center",
    padding: "12px 14px",
    borderRadius: "10px",
    cursor: "pointer",
    fontSize: "14px",
    transition: "background-color 0.2s, color 0.2s",
    whiteSpace: "nowrap",
  },
  icon: {
    display: "flex",
    alignItems: "center",
  },
  badge: {
    background: "#0F5FFF",
    color: "white",
    fontSize: "11px",
    fontWeight: "700",
    padding: "2px 8px",
    borderRadius: "12px",
  },
  divider: {
    height: "1px",
    background: "#d0d5dd",
    margin: "16px 0",
  },
  logoutBtn: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "12px 14px",
    color: "#E24B4A",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    borderRadius: "10px",
    transition: "background-color 0.2s",
  }
};
