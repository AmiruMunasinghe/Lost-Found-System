import React from "react";
import { Bell, ChevronDown, Menu } from "lucide-react";

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
};

export default function Navbar({ user, currentPage, navigateTo, setUser, sidebarOpen, setSidebarOpen, darkMode }) {
  const isLoggedIn = !!user;
  const userRole = user ? user.role : "guest";

  // Dark mode tokens for Navbar
  const nb = darkMode ? {
    bg: "#1e293b",
    border: "#334155",
    titleColor: "#e2e8f0",
    iconColor: "#94a3b8",
    namColor: "#e2e8f0",
  } : {
    bg: "#FFFFFF",
    border: C.border,
    titleColor: C.primaryDk,
    iconColor: "#667085",
    namColor: C.body,
  };

  const handleSignOut = () => {
    setUser(null);
    navigateTo("/");
  };

  const getPageTitle = (key) => {
    const titles = {
      "dashboard": "Dashboard",
      "postlost": "Report Lost Item",
      "postfound": "Report Found Item",
      "reports": "My Reports",
      "matchresults": "Match Results",
      "claim": "Claim Item",
      "return": "Return Item",
      "notifications": "Notifications",
      "rewards": "Rewards & Badges",
      "profile": "My Profile",
      "settings": "Settings",
      "help": "Help Center",
      "contact": "Contact Support",
      "admin-dashboard": "Admin Dashboard",
      "admin-reports": "Manage Reports",
      "admin-users": "Manage Users",
      "admin-analytics": "Analytics & Statistics",
    };
    return titles[key] || "Dashboard";
  };

  if (isLoggedIn) {
    return (
      <header style={{ ...styles.headerAuth, background: nb.bg, borderBottom: `1px solid ${nb.border}` }}>
        {/* LEFT: PAGE TITLE AND MENU TOGGLE */}
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <button 
            style={styles.menuToggle} 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            title="Toggle Sidebar"
          >
            <Menu size={24} color={nb.iconColor} />
          </button>
          <div style={{ ...styles.pageTitle, color: nb.titleColor }}>
            {getPageTitle(currentPage)}
          </div>
        </div>

        {/* RIGHT: CONTROLS */}
        <div style={styles.actions}>
          <button 
            onClick={() => navigateTo("/notifications")}
            style={styles.bellBtn}
          >
            <Bell size={20} color={nb.iconColor} />
            <span style={styles.badgeCountAuth}>3</span>
          </button>

          <div style={styles.profileAuth} onClick={() => navigateTo("/profile")}>
            <div style={styles.avatarAuth}>
              {user.name ? user.name.split(" ").map(n => n[0]).join("") : "U"}
            </div>
            <div style={{ textAlign: "left" }}>
              <div style={{ ...styles.nameAuth, color: nb.namColor }}>{user.name || "User"}</div>
            </div>
            <ChevronDown size={16} color={nb.iconColor} />
          </div>
        </div>
      </header>
    );
  }

  // PUBLIC NAVBAR
  return (
    <header style={styles.headerPublic}>
      {/* BRAND LOGO */}
      <div style={styles.brand} onClick={() => navigateTo("/")}>
        <h2 style={styles.logoPublic}>UniLost & Found</h2>
        <span style={styles.logoSubPublic}>University of Moratuwa</span>
      </div>

      {/* DYNAMIC NAVIGATION LINKS */}
      <nav style={styles.nav}>
        <button 
          style={{...styles.navLinkPublic, color: currentPage === "home" ? C.primary : "white"}} 
          onClick={() => navigateTo("/")}
        >
          Home
        </button>
        <button 
          style={{...styles.navLinkPublic, color: currentPage === "browse" ? C.primary : "white"}} 
          onClick={() => navigateTo("/browse")}
        >
          Browse Items
        </button>
      </nav>

      {/* AUTH CONTROLS */}
      <div style={styles.actions}>
        <div style={{ display: "flex", gap: "12px" }}>
          <button style={styles.btnOutlinePublic} onClick={() => navigateTo("/login")}>
            Login
          </button>
          <button style={styles.btnSolidPublic} onClick={() => navigateTo("/register")}>
            Register
          </button>
        </div>
      </div>
    </header>
  );
}

const styles = {
  headerAuth: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "20px 32px",
    background: "#FFFFFF",
    borderBottom: `1px solid ${C.border}`,
    zIndex: 100,
    fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
  },
  pageTitle: {
    fontSize: "22px",
    fontWeight: "800",
    color: C.primaryDk,
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
    transition: "background-color 0.2s",
  },
  bellBtn: {
    background: "transparent",
    border: "none",
    cursor: "pointer",
    position: "relative",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginRight: "20px",
  },
  badgeCountAuth: {
    position: "absolute",
    top: "-4px",
    right: "-4px",
    background: C.primary,
    color: "white",
    fontSize: "10px",
    fontWeight: "bold",
    borderRadius: "50%",
    width: "16px",
    height: "16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "2px solid #fff",
  },
  profileAuth: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    cursor: "pointer",
    padding: "4px 8px",
    borderRadius: "8px",
    transition: "background-color 0.2s",
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
  },
  nameAuth: {
    fontSize: "14px",
    fontWeight: "600",
    color: C.body,
  },

  // PUBLIC STYLES
  headerPublic: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px 32px",
    background: C.primaryDk,
    color: "white",
    boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
    zIndex: 100,
    fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
  },
  brand: {
    cursor: "pointer",
  },
  logoPublic: {
    margin: 0,
    fontSize: "19px",
    fontWeight: 700,
    letterSpacing: "0.5px",
  },
  logoSubPublic: {
    fontSize: "11px",
    color: "rgba(255, 255, 255, 0.7)",
  },
  nav: {
    display: "flex",
    alignItems: "center",
    gap: "24px",
  },
  navLinkPublic: {
    background: "none",
    border: "none",
    fontSize: "15px",
    fontWeight: "600",
    cursor: "pointer",
    padding: "8px 12px",
    fontFamily: "inherit",
  },
  actions: {
    display: "flex",
    alignItems: "center",
  },
  btnOutlinePublic: {
    padding: "10px 20px",
    fontSize: "14px",
    fontWeight: "700",
    color: "#ffffff",
    border: "1.5px solid rgba(255, 255, 255, 0.4)",
    borderRadius: "10px",
    cursor: "pointer",
    background: "transparent",
    fontFamily: "inherit",
  },
  btnSolidPublic: {
    padding: "10px 20px",
    fontSize: "14px",
    fontWeight: "700",
    color: C.primaryDk,
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
    background: "#ffffff",
    fontFamily: "inherit",
  },
};
