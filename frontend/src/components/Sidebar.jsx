import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";
import {
  LayoutDashboard,
  Search,
  FileBox,
  FilePlus2,
  Megaphone,
  User,
  Settings,
  LifeBuoy,
  LogOut,
  PackageSearch,
  PackageCheck,
  ScrollText,
  Link2,
  Trophy,
  Sun,
  Moon,
  MoreHorizontal,
} from "lucide-react";

const ITEM_HEIGHT = 48;
const POPOVER_WIDTH = 270;

export default function Sidebar({
  role,
  currentPage,
  navigateTo,
  setUser,
  sidebarOpen,
  darkMode,
  setDarkMode,
  isMobile = false,
  onNavigate,
}) {
  const [maxVisible, setMaxVisible] = useState(99);
  const [showMore, setShowMore] = useState(false);
  const [popoverPos, setPopoverPos] = useState({ top: 0, left: 0 });

  const listContainerRef = useRef(null);
  const popoverRef = useRef(null);
  const moreBtnRef = useRef(null);

  const t = darkMode
    ? {
        sidebar: "linear-gradient(180deg, #0f172a 0%, #1e293b 60%, #1e2d45 100%)",
        text: "#e2e8f0",
        muted: "#94a3b8",
        logoTitle: "#e2e8f0",
        logoSub: "#64748b",
        activeBg: "rgba(59,130,246,0.2)",
        activeColor: "#60a5fa",
        divider: "#334155",
        logoutColor: "#f87171",
        badge: "#1d4ed8",
        popoverBg: "#1e293b",
        popoverShadow: "0 12px 40px rgba(0,0,0,0.35)",
      }
    : {
        sidebar: "linear-gradient(180deg, #FFFFFF 0%, #f0f5fc 60%, #dce7f7 100%)",
        text: "#0b3470",
        muted: "#667085",
        logoTitle: "#0b3470",
        logoSub: "#667085",
        activeBg: "rgba(230,241,251,0.85)",
        activeColor: "#0F5FFF",
        divider: "#d0d5dd",
        logoutColor: "#E24B4A",
        badge: "#0F5FFF",
        popoverBg: "#FFFFFF",
        popoverShadow: "0 12px 40px rgba(0,0,0,0.12)",
      };

  const getSidebarItems = () => {
    if (role === "admin") {
      return [
        { label: "Dashboard", key: "admin-dashboard", icon: <LayoutDashboard size={20} /> },
        { label: "Manage Reports", key: "admin-reports", icon: <ScrollText size={20} /> },
        { label: "Manage Users", key: "admin-users", icon: <User size={20} /> },
        { label: "Analytics", key: "admin-analytics", icon: <LayoutDashboard size={20} /> },
        { label: "Settings", key: "settings", icon: <Settings size={20} /> },
        { label: "Help & Support", key: "help-support", icon: <LifeBuoy size={20} /> },
      ];
    }

    return [
      { label: "Dashboard", key: "dashboard", icon: <LayoutDashboard size={20} /> },
      { label: "Report Lost", key: "postlost", icon: <FilePlus2 size={20} /> },
      { label: "Report Found", key: "postfound", icon: <Megaphone size={20} /> },
      { label: "My Reports", key: "reports", icon: <ScrollText size={20} /> },
      { label: "Match Results", key: "matchresults", icon: <Link2 size={20} /> },
      { label: "Settings", key: "settings", icon: <Settings size={20} /> },
      { label: "Help & Support", key: "help-support", icon: <LifeBuoy size={20} /> },
    ];
  };

  const items = getSidebarItems();

  const recalculateVisibleItems = React.useCallback(() => {
    const container = listContainerRef.current;
    if (!container) return;

    const availableHeight = container.clientHeight;
    const possibleSlots = Math.max(0, Math.floor(availableHeight / ITEM_HEIGHT));

    // If all items fit, show all. If not, reserve one visible slot for the More button.
    const nextMaxVisible =
      possibleSlots >= items.length
        ? items.length
        : Math.max(0, possibleSlots - 1);

    setMaxVisible(nextMaxVisible);
  }, [items.length]);

  useLayoutEffect(() => {
    recalculateVisibleItems();
  }, [recalculateVisibleItems, sidebarOpen, isMobile, role]);

  useEffect(() => {
    const container = listContainerRef.current;
    if (!container) return undefined;

    const resizeObserver = new ResizeObserver(() => recalculateVisibleItems());
    resizeObserver.observe(container);

    window.addEventListener("resize", recalculateVisibleItems);
    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", recalculateVisibleItems);
    };
  }, [recalculateVisibleItems]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(event.target) &&
        moreBtnRef.current &&
        !moreBtnRef.current.contains(event.target)
      ) {
        setShowMore(false);
      }
    };

    if (showMore) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showMore]);

  useEffect(() => {
    setShowMore(false);
  }, [currentPage, sidebarOpen, isMobile]);

  const positionMorePopover = () => {
    if (!moreBtnRef.current) return;

    const rect = moreBtnRef.current.getBoundingClientRect();
    const preferredLeft = rect.right + 12;
    const left = Math.max(12, Math.min(preferredLeft, window.innerWidth - POPOVER_WIDTH - 12));
    const top = Math.max(12, Math.min(rect.top, window.innerHeight - 300));

    setPopoverPos({ top, left });
  };

  const handleMoreClick = (e) => {
    e.stopPropagation();
    if (!showMore) positionMorePopover();
    setShowMore((prev) => !prev);
  };

  const goToPage = (key) => {
    navigateTo(key);
    setShowMore(false);
    if (onNavigate) onNavigate();
  };

  const handleLogout = () => {
    if (setUser) setUser(null);
    navigateTo("/");
    setShowMore(false);
    if (onNavigate) onNavigate();
  };

  if (items.length === 0) return null;

  const visibleItems = items.slice(0, maxVisible);
  const overflowItems = items.slice(maxVisible);
  const isMoreActive = overflowItems.some((item) => item.key === currentPage);
  const compact = !sidebarOpen && !isMobile;

  const renderMenuItem = (item, options = {}) => {
    const isActive = currentPage === item.key;
    const itemCompact = options.compact ?? compact;
    const asPopover = options.popover ?? false;

    const content = (
      <>
        <div style={{ display: "flex", alignItems: "center", minWidth: 0 }}>
          <span
            style={{
              ...styles.icon,
              marginRight: itemCompact ? "0" : "12px",
              color: isActive ? t.activeColor : t.muted,
            }}
          >
            {item.icon}
          </span>
          {!itemCompact && <span style={styles.itemText}>{item.label}</span>}
        </div>

        {!itemCompact && item.badge && (
          <span style={{ ...styles.badge, background: t.badge }}>{item.badge}</span>
        )}
      </>
    );

    if (asPopover) {
      return (
        <button
          key={item.label}
          type="button"
          style={{
            ...styles.item,
            ...styles.itemButtonReset,
            justifyContent: "space-between",
            backgroundColor: isActive ? t.activeBg : "transparent",
            color: isActive ? t.activeColor : t.text,
            fontWeight: isActive ? "700" : "500",
            padding: "10px 14px",
            width: "100%",
          }}
          onClick={() => goToPage(item.key)}
        >
          {content}
        </button>
      );
    }

    return (
      <li key={item.label} style={{ listStyle: "none" }}>
        <button
          type="button"
          title={itemCompact ? item.label : undefined}
          style={{
            ...styles.item,
            ...styles.itemButtonReset,
            justifyContent: itemCompact ? "center" : "space-between",
            backgroundColor: isActive ? t.activeBg : "transparent",
            color: isActive ? t.activeColor : t.text,
            fontWeight: isActive ? "700" : "500",
            width: "100%",
          }}
          onClick={() => goToPage(item.key)}
        >
          {content}
        </button>
      </li>
    );
  };

  return (
    <aside
      style={{
        ...styles.sidebar,
        ...(isMobile ? styles.sidebarMobile : styles.sidebarDesktop),
        background: t.sidebar,
        borderRight: `1px solid ${t.divider}`,
        width: isMobile ? "min(82vw, 300px)" : sidebarOpen ? "260px" : "64px",
        padding: isMobile ? "20px 14px" : sidebarOpen ? "24px 16px" : "24px 8px",
        transform: isMobile && !sidebarOpen ? "translateX(-110%)" : "translateX(0)",
      }}
    >
      <div style={styles.foregroundContent}>
        <button
          type="button"
          style={{
            ...styles.brand,
            ...styles.itemButtonReset,
            justifyContent: compact ? "center" : "flex-start",
          }}
          onClick={() => goToPage(role === "admin" ? "admin-dashboard" : "browse")}
        >
          <div style={styles.logoBox}>
            <FileBox color="white" size={20} />
          </div>

          {!compact && (
            <div style={{ overflow: "hidden", textAlign: "left" }}>
              <div style={{ ...styles.logoTitle, color: t.logoTitle }}>Lost and Found</div>
              <div style={{ ...styles.logoSub, color: t.logoSub }}>Helping return what matters.</div>
            </div>
          )}
        </button>

        <div ref={listContainerRef} style={styles.dynamicListContainer}>
          <ul style={styles.list}>
            {visibleItems.map((item) => renderMenuItem(item))}

            {overflowItems.length > 0 && (
              <li style={{ listStyle: "none" }}>
                <button
                  ref={moreBtnRef}
                  type="button"
                  title={compact ? "More" : undefined}
                  style={{
                    ...styles.item,
                    ...styles.itemButtonReset,
                    justifyContent: compact ? "center" : "space-between",
                    backgroundColor: showMore || isMoreActive ? t.activeBg : "transparent",
                    color: showMore || isMoreActive ? t.activeColor : t.text,
                    fontWeight: showMore || isMoreActive ? "700" : "500",
                    width: "100%",
                  }}
                  onClick={handleMoreClick}
                >
                  <div style={{ display: "flex", alignItems: "center", minWidth: 0 }}>
                    <span
                      style={{
                        ...styles.icon,
                        marginRight: compact ? "0" : "12px",
                        color: showMore || isMoreActive ? t.activeColor : t.muted,
                      }}
                    >
                      <MoreHorizontal size={20} />
                    </span>
                    {!compact && <span style={styles.itemText}>More</span>}
                  </div>
                </button>
              </li>
            )}
          </ul>
        </div>
      </div>

      <div style={styles.bottomArea}>
        <div style={{ ...styles.divider, background: t.divider }} />

        <button
          type="button"
          title={compact ? (darkMode ? "Switch to Light" : "Switch to Dark") : undefined}
          onClick={() => setDarkMode && setDarkMode(!darkMode)}
          style={{
            ...styles.logoutBtn,
            ...styles.itemButtonReset,
            justifyContent: compact ? "center" : "flex-start",
            color: t.muted,
            width: "100%",
            marginBottom: "4px",
          }}
        >
          {darkMode ? <Sun size={20} color="#facc15" /> : <Moon size={20} color={t.muted} />}
          {!compact && <span style={{ color: t.text }}>{darkMode ? "Light Mode" : "Dark Mode"}</span>}
        </button>

        <button
          type="button"
          title={compact ? "Logout" : undefined}
          style={{
            ...styles.logoutBtn,
            ...styles.itemButtonReset,
            justifyContent: compact ? "center" : "flex-start",
            color: t.logoutColor,
            width: "100%",
          }}
          onClick={handleLogout}
        >
          <LogOut size={20} />
          {!compact && <span>Logout</span>}
        </button>
      </div>

      {showMore &&
        overflowItems.length > 0 &&
        typeof document !== "undefined" &&
        ReactDOM.createPortal(
          <div
            ref={popoverRef}
            style={{
              position: "fixed",
              left: `${popoverPos.left}px`,
              top: `${popoverPos.top}px`,
              background: t.popoverBg,
              border: `1px solid ${t.divider}`,
              borderRadius: "16px",
              padding: "12px",
              display: "flex",
              flexDirection: "column",
              gap: "6px",
              width: `${POPOVER_WIDTH}px`,
              maxWidth: "calc(100vw - 24px)",
              maxHeight: "calc(100vh - 24px)",
              overflowY: "auto",
              boxShadow: t.popoverShadow,
              zIndex: 9999,
              fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
              boxSizing: "border-box",
            }}
          >
            {overflowItems.map((item) => renderMenuItem(item, { popover: true, compact: false }))}
          </div>,
          document.body
        )}
    </aside>
  );
}

const styles = {
  sidebar: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    height: "100vh",
    fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
    boxSizing: "border-box",
    transition: "width 0.3s ease, padding 0.3s ease, transform 0.3s ease",
    overflow: "hidden",
    flexShrink: 0,
  },
  sidebarDesktop: {
    position: "sticky",
    top: 0,
    alignSelf: "flex-start",
    zIndex: 90,
  },
  sidebarMobile: {
    position: "fixed",
    top: 0,
    left: 0,
    zIndex: 900,
    boxShadow: "18px 0 55px rgba(15, 23, 42, 0.25)",
  },
  foregroundContent: {
    position: "relative",
    zIndex: 1,
    flex: 1,
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    minHeight: 0,
  },
  brand: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "24px",
    padding: "0 8px",
    flexShrink: 0,
    width: "100%",
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
    whiteSpace: "nowrap",
  },
  logoSub: {
    fontSize: "11px",
    marginTop: "2px",
    whiteSpace: "nowrap",
  },
  dynamicListContainer: {
    flex: 1,
    overflow: "hidden",
    minHeight: 0,
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
    minHeight: "44px",
    display: "flex",
    alignItems: "center",
    padding: "10px 14px",
    borderRadius: "10px",
    fontSize: "14px",
    transition: "background-color 0.2s, color 0.2s",
    whiteSpace: "nowrap",
    userSelect: "none",
    boxSizing: "border-box",
  },
  itemButtonReset: {
    background: "transparent",
    border: "none",
    cursor: "pointer",
    fontFamily: "inherit",
    textAlign: "left",
  },
  itemText: {
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  icon: {
    display: "flex",
    alignItems: "center",
    flexShrink: 0,
  },
  badge: {
    color: "white",
    fontSize: "11px",
    fontWeight: "700",
    padding: "2px 8px",
    borderRadius: "12px",
    flexShrink: 0,
  },
  bottomArea: {
    position: "relative",
    zIndex: 1,
    marginTop: "12px",
    flexShrink: 0,
  },
  divider: {
    height: "1px",
    margin: "12px 0",
  },
  logoutBtn: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "10px 14px",
    minHeight: "44px",
    fontSize: "14px",
    fontWeight: "600",
    borderRadius: "10px",
    transition: "background-color 0.2s",
    userSelect: "none",
    boxSizing: "border-box",
  },
};
