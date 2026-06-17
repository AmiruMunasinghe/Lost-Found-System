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

import Dashboard from "./pages/Dashboard";
import PostLostForm from "./components/PostLostForm";
import PostFoundForm from "./components/PostFoundtForm";
import MyReports from "./pages/MyReports";
import MatchResults from "./pages/MatchResults";
import ClaimItem from "./pages/ClaimItem";
import ReturnItem from "./pages/ReturnItem";
import Chat from "./pages/Chat";
import Notifications from "./pages/Notifications";
import Rewards from "./pages/Rewards";
import Profile from "./pages/Profile";

import AdminDashboard from "./pages/AdminDashboard";
import AdminReports from "./pages/AdminReports";
import AdminUsers from "./pages/AdminUsers";
import AdminAnalytics from "./pages/AdminAnalytics";

const PAGES = {
  // Public
  "home": { component: Home, authRequired: false, allowedRoles: ["guest", "student", "admin"] },
  "login": { component: Login, authRequired: false, guestOnly: true, allowedRoles: ["guest"] },
  "register": { component: Registration, authRequired: false, guestOnly: true, allowedRoles: ["guest"] },
  "forgot": { component: ForgotPassword, authRequired: false, guestOnly: true, allowedRoles: ["guest"] },
  "browse": { component: BrowseItems, authRequired: true, allowedRoles: ["student", "admin"] },

  // Authenticated Student/Staff
  "dashboard": { component: Dashboard, authRequired: true, allowedRoles: ["student", "admin"] },
  "postlost": { component: PostLostForm, authRequired: true, allowedRoles: ["student"] },
  "postfound": { component: PostFoundForm, authRequired: true, allowedRoles: ["student"] },
  "reports": { component: MyReports, authRequired: true, allowedRoles: ["student"] },
  "matchresults": { component: MatchResults, authRequired: true, allowedRoles: ["student"] },
  "claim": { component: ClaimItem, authRequired: true, allowedRoles: ["student"] },
  "return": { component: ReturnItem, authRequired: true, allowedRoles: ["student"] },
  "chat": { component: Chat, authRequired: true, allowedRoles: ["student"] },
  "notifications": { component: Notifications, authRequired: true, allowedRoles: ["student"] },
  "rewards": { component: Rewards, authRequired: true, allowedRoles: ["student"] },
  "profile": { component: Profile, authRequired: true, allowedRoles: ["student", "admin"] },

  // Admin
  "admin-dashboard": { component: AdminDashboard, authRequired: true, allowedRoles: ["admin"] },
  "admin-reports": { component: AdminReports, authRequired: true, allowedRoles: ["admin"] },
  "admin-users": { component: AdminUsers, authRequired: true, allowedRoles: ["admin"] },
  "admin-analytics": { component: AdminAnalytics, authRequired: true, allowedRoles: ["admin"] },
};

function App() {
  const [currentPage, setCurrentPage] = useState(() => {
    const path = window.location.pathname.replace(/^\//, "");
    return path === "" ? "home" : path;
  });

  const [userState, setUserState] = useState(null);
  const userRef = React.useRef(userState);
  
  const setUser = React.useCallback((newUser) => {
    userRef.current = newUser;
    setUserState(newUser);
  }, []);

  const user = userState;

  const [pageParams, setPageParams] = useState({});

  React.useEffect(() => {
    // Record initial state
    window.history.replaceState({ params: {} }, "", window.location.pathname);

    const handlePopState = (event) => {
      const path = window.location.pathname.replace(/^\//, "");
      setCurrentPage(path === "" ? "home" : path);
      if (event.state?.params) {
        setPageParams(event.state.params);
      } else {
        setPageParams({});
      }
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const navigateTo = (pathOrKey, params = {}, replace = false) => {
    let pageKey = pathOrKey.replace(/^\//, "");
    if (pageKey === "") pageKey = "home";

    const pageConfig = PAGES[pageKey];
    let targetPage = pageKey;

    if (!pageConfig) {
      targetPage = "home";
      params = {};
    } else {
      const currentUser = userRef.current;
      const isLoggedIn = !!currentUser;
      if (pageConfig.authRequired && !isLoggedIn) {
        targetPage = "login";
        params = { next: pageKey, nextParams: params };
      } else if (pageConfig.guestOnly && isLoggedIn) {
        targetPage = currentUser.role === "admin" ? "admin-dashboard" : "home";
        params = {};
      } else if (!pageConfig.allowedRoles.includes(currentUser ? currentUser.role : "guest")) {
        targetPage = currentUser ? (currentUser.role === "admin" ? "admin-dashboard" : "home") : "home";
        params = {};
      }
    }

    setCurrentPage(targetPage);
    setPageParams(params);

    const url = `/${targetPage === "home" ? "" : targetPage}`;
    if (replace || window.location.pathname === url) {
      window.history.replaceState({ params }, "", url);
    } else {
      window.history.pushState({ params }, "", url);
    }
  };

  const PageComponent = PAGES[currentPage]?.component || PAGES["home"].component;
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const userRole = user ? user.role : "guest";

  const floatAnimation = `
    @keyframes float {
      0% { transform: translateY(0px); }
      50% { transform: translateY(-30px); }
      100% { transform: translateY(0px); }
    }
  `;

  const dm = darkMode;
  const darkTransition = "background-color 0.3s ease, color 0.3s ease";

  return (
    <NavigationContext.Provider value={{ navigate: navigateTo, currentPage, pageParams }}>
      <style>{floatAnimation}</style>
      <div style={{ ...styles.appContainer, backgroundColor: dm ? "#0f172a" : "#eef4fb", transition: darkTransition }}>
        {user && (
          <Sidebar 
            role={userRole} 
            currentPage={currentPage} 
            navigateTo={navigateTo} 
            setUser={setUser}
            sidebarOpen={sidebarOpen}
            darkMode={darkMode}
            setDarkMode={setDarkMode}
          />
        )}
        <div style={styles.mainWrapper}>
          <Navbar 
            user={user} 
            currentPage={currentPage} 
            navigateTo={navigateTo} 
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
            darkMode={darkMode}
          />
          <main style={{ ...styles.contentArea, backgroundColor: dm ? "#0f172a" : "transparent", transition: darkTransition }}>
            {/* BACKGROUND BLOBS — only visible in light mode */}
            {!dm && <>
              <div style={{ ...styles.blob, width: 400, height: 400, background: "rgba(15,95,255,0.08)", top: "-50px", left: "-50px", animationDelay: "0s" }} />
              <div style={{ ...styles.blob, width: 300, height: 300, background: "rgba(99,102,241,0.08)", top: "-20px", right: "10%", animationDelay: "2s" }} />
              <div style={{ ...styles.blob, width: 350, height: 350, background: "rgba(16,185,129,0.06)", bottom: "-50px", left: "30%", animationDelay: "4s" }} />
            </>}

            {/* MAIN CONTENT */}
            <div style={{ position: "relative", zIndex: 1 }}>
              <PageComponent 
                user={user} 
                setUser={setUser} 
                navigateTo={navigateTo} 
                pageParams={pageParams}
                darkMode={darkMode}
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
    minHeight: "100vh",
    backgroundColor: "#eef4fb",
    fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
  },
  mainWrapper: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    minWidth: 0, // Fixes flex child overflow
  },
  contentArea: {
    flex: 1,
    padding: "24px 32px",
    position: "relative",
  },
  blob: {
    position: "absolute",
    borderRadius: "50%",
    filter: "blur(80px)",
    pointerEvents: "none",
    animation: "float 12s ease-in-out infinite",
    zIndex: 0,
  }
};

export default App;