import React, { useState } from "react";
import { NavigationContext } from "./router-mock";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";

// Pages
import Home from "./pages/Home";
import Login from "./pages/Login";
import Registration from "./pages/Registration";
import ForgotPassword from "./pages/ForgotPassword";
import BrowseItems from "./pages/BrowseItems";
import About from "./pages/About";
import Contact from "./pages/Contact";

import ResetPassword from "./pages/ResetPassword";

import Dashboard from "./pages/Dashboard";
import PostLostForm from "./components/PostLostForm";
import PostFoundForm from "./components/PostFoundtForm";
import MyReports from "./pages/MyReports";
import MatchResults from "./pages/MatchResults";
import ClaimItem from "./pages/ClaimItem";
import ReturnItem from "./pages/ReturnItem";
import Chat from "./pages/Chat";
import Rewards from "./pages/Rewards";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import HelpSupport from "./pages/HelpSupport";

import AdminDashboard from "./pages/AdminDashboard";
import AdminReports from "./pages/AdminReports";
import AdminUsers from "./pages/AdminUsers";
import AdminAnalytics from "./pages/AdminAnalytics";
import Notifications from "./pages/Notifications";

const PAGES = {
  // Public
  home: { component: Home, authRequired: false, allowedRoles: ["guest", "student", "admin"] },
  about: { component: About, authRequired: false, allowedRoles: ["guest", "student", "admin"] },
  contact: { component: Contact, authRequired: false, allowedRoles: ["guest", "student", "admin"] },
  login: { component: Login, authRequired: false, guestOnly: true, allowedRoles: ["guest"] },
  register: { component: Registration, authRequired: false, guestOnly: true, allowedRoles: ["guest"] },
  forgot: { component: ForgotPassword, authRequired: false, guestOnly: true, allowedRoles: ["guest"] },
  reset: { component: ResetPassword, authRequired: false, guestOnly: true, allowedRoles: ["guest"] },
  "reset-password": { component: ResetPassword, authRequired: false, guestOnly: true, allowedRoles: ["guest"] },
  browse: { component: BrowseItems, authRequired: false, allowedRoles: ["guest", "student", "admin"] },

  // Authenticated Student/Staff
  dashboard: { component: Dashboard, authRequired: true, allowedRoles: ["student", "admin"] },
  postlost: { component: PostLostForm, authRequired: true, allowedRoles: ["student"] },
  postfound: { component: PostFoundForm, authRequired: true, allowedRoles: ["student"] },
  reports: { component: MyReports, authRequired: true, allowedRoles: ["student"] },
  matchresults: { component: MatchResults, authRequired: true, allowedRoles: ["student"] },
  claim: { component: ClaimItem, authRequired: true, allowedRoles: ["student"] },
  return: { component: ReturnItem, authRequired: true, allowedRoles: ["student"] },
  chat: { component: Chat, authRequired: true, allowedRoles: ["student"] },
  rewards: { component: Rewards, authRequired: true, allowedRoles: ["student"] },
  profile: { component: Profile, authRequired: true, allowedRoles: ["student", "admin"] },
  settings: { component: Settings, authRequired: true, allowedRoles: ["student", "admin"] },
  "help-support": { component: HelpSupport, authRequired: true, allowedRoles: ["student", "admin"] },

  // Admin
  "admin-dashboard": { component: AdminDashboard, authRequired: true, allowedRoles: ["admin"] },
  "admin-reports": { component: AdminReports, authRequired: true, allowedRoles: ["admin"] },
  "admin-users": { component: AdminUsers, authRequired: true, allowedRoles: ["admin"] },
  "admin-analytics": { component: AdminAnalytics, authRequired: true, allowedRoles: ["admin"] },
  notifications: { component: Notifications, authRequired: true, allowedRoles: ["student", "admin"] },
};

function getStoredUser() {
  try {
    const savedUser = localStorage.getItem("lost_found_user");
    return savedUser ? JSON.parse(savedUser) : null;
  } catch (error) {
    localStorage.removeItem("lost_found_user");
    return null;
  }
}

function getPageFromUrl() {
  const path = window.location.pathname.replace(/^\//, "");
  const page = path === "" ? "home" : path;
  return PAGES[page] ? page : "home";
}

function getInitialIsMobile() {
  if (typeof window === "undefined") return false;
  return window.innerWidth <= 768;
}

function App() {
  const [currentPage, setCurrentPage] = useState(getPageFromUrl);
  const [userState, setUserState] = useState(getStoredUser);
  const userRef = React.useRef(userState);
  const [pageParams, setPageParams] = useState({});
  const [isMobile, setIsMobile] = useState(getInitialIsMobile);
  const [sidebarOpen, setSidebarOpen] = useState(() => !getInitialIsMobile());
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem("lostFoundDarkMode") === "true");

  const setUser = React.useCallback((newUser) => {
    userRef.current = newUser;
    setUserState(newUser);

    if (newUser) {
      localStorage.setItem("lost_found_user", JSON.stringify(newUser));
    } else {
      localStorage.removeItem("lost_found_user");
    }
  }, []);

  const navigateTo = React.useCallback((pathOrKey, params = {}, replace = false) => {
    let pageKey = pathOrKey.replace(/^\//, "");
    if (pageKey === "") pageKey = "home";

    const pageConfig = PAGES[pageKey];
    let targetPage = pageKey;
    let nextParams = params;

    if (!pageConfig) {
      targetPage = "home";
      nextParams = {};
    } else {
      const currentUser = userRef.current;
      const isLoggedIn = !!currentUser;

      if (pageConfig.authRequired && !isLoggedIn) {
        targetPage = "login";
        nextParams = { next: pageKey, nextParams: params };
      } else if (pageConfig.guestOnly && isLoggedIn) {
        const r = currentUser.role?.toLowerCase();
        targetPage = r === "admin" ? "admin-dashboard" : "browse";
        nextParams = {};
      } else {
        let r = currentUser ? currentUser.role?.toLowerCase() : "guest";
        if (r === "user") r = "student";
        if (!pageConfig.allowedRoles.includes(r)) {
          targetPage = currentUser ? (r === "admin" ? "admin-dashboard" : "browse") : "home";
          nextParams = {};
        }
      }
    }

    setCurrentPage(targetPage);
    setPageParams(nextParams);

    const url = `/${targetPage === "home" ? "" : targetPage}`;
    if (replace || window.location.pathname === url) {
      window.history.replaceState({ params: nextParams }, "", url);
    } else {
      window.history.pushState({ params: nextParams }, "", url);
    }
  }, []);

  React.useEffect(() => {
    userRef.current = userState;
  }, [userState]);

  React.useEffect(() => {
    localStorage.setItem("lostFoundDarkMode", darkMode ? "true" : "false");
  }, [darkMode]);

  React.useEffect(() => {
    const updateViewport = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      setSidebarOpen((previous) => {
        if (mobile) return false;
        if (!mobile && previous === false) return true;
        return previous;
      });
    };

    updateViewport();
    window.addEventListener("resize", updateViewport);
    return () => window.removeEventListener("resize", updateViewport);
  }, []);

  React.useEffect(() => {
    window.history.replaceState({ params: pageParams }, "", window.location.pathname);

    const handlePopState = (event) => {
      const path = window.location.pathname.replace(/^\//, "");
      const page = path === "" ? "home" : path;
      setCurrentPage(PAGES[page] ? page : "home");
      setPageParams(event.state?.params || {});
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  React.useEffect(() => {
    const pageConfig = PAGES[currentPage];

    if (!pageConfig) {
      navigateTo("/", {}, true);
      return;
    }

    const isLoggedIn = !!userState;
    let role = userState?.role ? userState.role.toLowerCase() : "guest";
    if (role === "user") role = "student";

    if (pageConfig.authRequired && !isLoggedIn) {
      navigateTo("/login", { next: currentPage, nextParams: pageParams }, true);
      return;
    }

    if (pageConfig.guestOnly && isLoggedIn) {
      navigateTo(role === "admin" ? "/admin-dashboard" : "/browse", {}, true);
      return;
    }

    if (!pageConfig.allowedRoles.includes(role)) {
      navigateTo(isLoggedIn ? (role === "admin" ? "/admin-dashboard" : "/browse") : "/", {}, true);
    }
  }, [currentPage, userState, navigateTo]);

  const PageComponent = PAGES[currentPage]?.component || PAGES.home.component;
  const user = userState;
  let userRole = user?.role ? user.role.toLowerCase() : "guest";
  if (userRole === "user") userRole = "student";
  const dm = darkMode;

  const floatAnimation = `
    @keyframes float {
      0% { transform: translateY(0px); }
      50% { transform: translateY(-30px); }
      100% { transform: translateY(0px); }
    }
  `;

  const shellResponsiveCss = `
    @media (max-width: 768px) {
      input, textarea, select, button { font-size: 16px; }
    }
  `;

  const darkTransition = "background-color 0.3s ease, color 0.3s ease";

  return (
    <NavigationContext.Provider value={{ navigate: navigateTo, currentPage, pageParams }}>
      <style>{floatAnimation}</style>
      <style>{shellResponsiveCss}</style>

      <div
        style={{
          ...styles.appContainer,
          backgroundColor: dm ? "#0f172a" : "#eef4fb",
          transition: darkTransition,
        }}
      >
        {user && isMobile && sidebarOpen && (
          <button
            aria-label="Close sidebar"
            style={styles.mobileBackdrop}
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {user && (
          <Sidebar
            role={userRole}
            currentPage={currentPage}
            navigateTo={navigateTo}
            setUser={setUser}
            sidebarOpen={sidebarOpen}
            darkMode={darkMode}
            setDarkMode={setDarkMode}
            isMobile={isMobile}
            onNavigate={() => {
              if (isMobile) setSidebarOpen(false);
            }}
          />
        )}

        <div style={styles.mainWrapper}>
          <Navbar
            user={user}
            currentPage={currentPage}
            navigateTo={navigateTo}
            setUser={setUser}
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
            darkMode={darkMode}
            setDarkMode={setDarkMode}
            isMobile={isMobile}
          />

          <main
            style={{
              ...styles.contentArea,
              padding: isMobile ? "16px" : "24px 32px",
              backgroundColor: dm ? "#0f172a" : "transparent",
              transition: darkTransition,
            }}
          >
            {!dm && !isMobile && (
              <>
                <div style={{ ...styles.blob, width: 400, height: 400, background: "rgba(15,95,255,0.08)", top: "-50px", left: "-50px", animationDelay: "0s" }} />
                <div style={{ ...styles.blob, width: 300, height: 300, background: "rgba(99,102,241,0.08)", top: "-20px", right: "10%", animationDelay: "2s" }} />
                <div style={{ ...styles.blob, width: 350, height: 350, background: "rgba(16,185,129,0.06)", bottom: "-50px", left: "30%", animationDelay: "4s" }} />
              </>
            )}

            <div style={{ position: "relative", zIndex: 1, width: "100%" }}>
              <PageComponent
                user={user}
                setUser={setUser}
                navigateTo={navigateTo}
                pageParams={pageParams}
                darkMode={darkMode}
                setDarkMode={setDarkMode}
              />
            </div>
          </main>
        </div>
      </div>
    </NavigationContext.Provider>
  );
}

const styles = {
  appContainer: {
    display: "flex",
    height: "100dvh",
    width: "100%",
    minWidth: 0,
    overflow: "hidden",
    backgroundColor: "#eef4fb",
    fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
  },
  mainWrapper: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    minWidth: 0,
    width: "100%",
    height: "100dvh",
    overflow: "hidden",
  },
  contentArea: {
    flex: 1,
    minHeight: 0,
    overflowY: "auto",
    overflowX: "hidden",
    position: "relative",
    width: "100%",
    minWidth: 0,
    boxSizing: "border-box",
    WebkitOverflowScrolling: "touch",
  },
  mobileBackdrop: {
    position: "fixed",
    inset: 0,
    background: "rgba(15, 23, 42, 0.45)",
    border: "none",
    padding: 0,
    margin: 0,
    zIndex: 899,
  },
  blob: {
    position: "absolute",
    borderRadius: "50%",
    filter: "blur(80px)",
    pointerEvents: "none",
    animation: "float 12s ease-in-out infinite",
    zIndex: 0,
  },
};

export default App;