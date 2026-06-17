import React, { useState, useRef, useEffect } from "react";
import ReactDOM from "react-dom";
import { 
  LayoutDashboard, Search, FileBox, FilePlus2, Megaphone, 
  Bell, User, Settings, LifeBuoy, Phone, LogOut, PackageSearch, PackageCheck, ScrollText, Link2, Trophy,
  Sun, Moon, MoreHorizontal
} from "lucide-react";

export default function Sidebar({ role, currentPage, navigateTo, setUser, sidebarOpen, darkMode, setDarkMode }) {
  const [maxVisible, setMaxVisible] = useState(10);
  const [showMore, setShowMore] = useState(false);
  const [popoverPos, setPopoverPos] = useState({ bottom: 0, left: 0 });
  const listContainerRef = useRef(null);
  const popoverRef = useRef(null);
  const moreBtnRef = useRef(null);

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
    popoverBg: "#1e293b",
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
    popoverBg: "#FFFFFF",
  };

  const getSidebarItems = () => {
    if (role === "admin") {
      return [
        { label: "Dashboard", key: "admin-dashboard", icon: <LayoutDashboard size={20} /> },
        { label: "Browse Items", key: "browse", icon: <Search size={20} /> },
        { label: "Manage Reports", key: "admin-reports", icon: <ScrollText size={20} /> },
        { label: "Manage Users", key: "admin-users", icon: <User size={20} /> },
        { label: "Analytics", key: "admin-analytics", icon: <Settings size={20} /> }, 
      ];
    } else {
      return [
        { label: "Dashboard", key: "dashboard", icon: <LayoutDashboard size={20} /> },
        { label: "Browse Items", key: "browse", icon: <Search size={20} /> },
        { label: "Report Lost", key: "postlost", icon: <FilePlus2 size={20} /> },
        { label: "Report Found", key: "postfound", icon: <Megaphone size={20} /> },
        { label: "My Reports", key: "reports", icon: <ScrollText size={20} /> },
        { label: "Match Results", key: "matchresults", icon: <Link2 size={20} /> },
        { label: "Claim Item", key: "claim", icon: <PackageCheck size={20} /> },
        { label: "Return Item", key: "return", icon: <PackageSearch size={20} /> },
        { label: "Rewards & Badges", key: "rewards", icon: <Trophy size={20} /> },
        { label: "Settings", key: "settings", icon: <Settings size={20} /> },
        { label: "Help Center", key: "help", icon: <LifeBuoy size={20} /> },
        { label: "Contact Support", key: "contact", icon: <Phone size={20} /> },
      ];
    }
  };

  const items = getSidebarItems();

  // Dynamic height calculation
  useEffect(() => {
    if (!listContainerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const height = entry.contentRect.height;
        // Each item is approx 48px height (44px + 4px gap)
        const itemHeight = 48; 
        const possibleCount = Math.floor(height / itemHeight);
        
        if (possibleCount >= items.length) {
          setMaxVisible(items.length);
        } else {
          // Leave 1 slot for the "More" button
          setMaxVisible(Math.max(1, possibleCount - 1));
        }
      }
    });

    observer.observe(listContainerRef.current);
    return () => observer.disconnect();
  }, [items.length]);

  // Click outside to close popover
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target) && 
          moreBtnRef.current && !moreBtnRef.current.contains(event.target)) {
        setShowMore(false);
      }
    };
    if (showMore) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showMore]);

  const handleMoreClick = (e) => {
    e.stopPropagation();
    if (!showMore && moreBtnRef.current) {
      const rect = moreBtnRef.current.getBoundingClientRect();
      setPopoverPos({
        bottom: window.innerHeight - rect.bottom, // align bottom with the button
        left: rect.right + 12, // 12px gap
      });
    }
    setShowMore(!showMore);
  };

  if (items.length === 0) return null;

  const visibleItems = items.slice(0, maxVisible);
  const overflowItems = items.slice(maxVisible);

  return (
    <div style={{ width: sidebarOpen ? "260px" : "64px", flexShrink: 0, transition: "width 0.3s ease" }}>
      <aside style={{
        ...styles.sidebar,
        background: t.sidebar,
        width: sidebarOpen ? "260px" : "64px",
        padding: sidebarOpen ? "24px 16px" : "24px 8px",
      }}>
        {/* FOREGROUND CONTENT */}
        <div style={{ position: "relative", zIndex: 1, flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          
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

          {/* DYNAMIC LIST CONTAINER */}
          <div ref={listContainerRef} style={{ flex: 1, overflow: "hidden" }}>
            <ul style={styles.list}>
              {visibleItems.map((item) => {
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

              {/* MORE BUTTON */}
              {overflowItems.length > 0 && (
                <li 
                  ref={moreBtnRef}
                  title={!sidebarOpen ? "More" : undefined}
                  style={{
                    ...styles.item,
                    justifyContent: sidebarOpen ? "space-between" : "center",
                    backgroundColor: showMore ? t.activeBg : "transparent",
                    color: showMore ? t.activeColor : t.text,
                    fontWeight: showMore ? "700" : "500",
                    position: "relative",
                  }}
                  onClick={handleMoreClick}
                >
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <span style={{ ...styles.icon, marginRight: sidebarOpen ? "12px" : "0", color: showMore ? t.activeColor : t.muted }}>
                      <MoreHorizontal size={20} />
                    </span>
                    {sidebarOpen && <span style={{ color: showMore ? t.activeColor : t.text }}>More</span>}
                  </div>

                  {/* POPOVER MENU */}
                  {showMore && typeof document !== "undefined" && ReactDOM.createPortal(
                    <div ref={popoverRef} style={{
                      position: "fixed",
                      left: `${popoverPos.left}px`,
                      bottom: `${popoverPos.bottom}px`,
                      background: t.popoverBg,
                      border: `1px solid ${t.divider}`,
                      borderRadius: "16px",
                      padding: "12px",
                      display: "flex",
                      flexDirection: "column",
                      gap: "6px",
                      minWidth: "260px",
                      boxShadow: "0 12px 40px rgba(0,0,0,0.12)",
                      zIndex: 9999,
                      fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
                    }}>
                      {overflowItems.map((item) => {
                        const isActive = currentPage === item.key;
                        return (
                          <div 
                            key={item.label}
                            style={{
                              ...styles.item,
                              justifyContent: "space-between",
                              backgroundColor: isActive ? t.activeBg : "transparent",
                              color: isActive ? t.activeColor : t.text,
                              padding: "10px 14px",
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              navigateTo(item.key);
                              setShowMore(false);
                            }}
                          >
                            <div style={{ display: "flex", alignItems: "center" }}>
                              <span style={{ ...styles.icon, marginRight: "12px", color: isActive ? t.activeColor : t.muted }}>
                                {item.icon}
                              </span>
                              <span>{item.label}</span>
                            </div>
                            {item.badge && <span style={{...styles.badge, background: t.badge}}>{item.badge}</span>}
                          </div>
                        );
                      })}
                    </div>,
                    document.body
                  )}
                </li>
              )}
            </ul>
          </div>
        </div>

        {/* BOTTOM PINNED ITEMS */}
        <div style={{ position: "relative", zIndex: 1, marginTop: "16px" }}>
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
    </div>
  );
}

const styles = {
  sidebar: {
    background: "linear-gradient(180deg, #FFFFFF 0%, #f0f5fc 60%, #dce7f7 100%)",
    borderRight: "1px solid #d0d5dd",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    height: "100vh",
    fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
    boxSizing: "border-box",
    transition: "width 0.3s ease, padding 0.3s ease",
    overflow: "hidden", // Completely non-scrollable as requested
    flexShrink: 0,
    position: "fixed",
    top: 0,
    alignSelf: "flex-start",
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
