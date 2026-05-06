import React, { useState } from "react";
import Home from "./pages/Home";
import PostLostForm from "./components/PostLostForm";
import PostFoundForm from "./components/PostFoundtForm"
import MatchResults from "./pages/MatchResults";
import ReturnItem from "./pages/ReturnItem";
import ClaimItem from "./pages/ClaimItem";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard"; // ✅ IMPORTANT
import Registration from"./pages/Registration";
import ForgotPassword from "./pages/ForgotPassword";
import Profile from "./pages/Profile";
import Rewards from "./pages/Rewards";
import MyReports from "./pages/MyReports";

function App() {
  const [page, setPage] = useState("login");

  return (
    <>
      {/* LOGIN */}
      {page === "login" && <Login setPage={setPage} />}

      {/* DASHBOARD */}
      {page === "dashboard" && <Dashboard setPage={setPage} />}

      {/* REGISTER */}
      {page === "register" && <Registration go={setPage} />}

      {/* ForgotPassword */}
      {page === "forgot" && <ForgotPassword go={setPage} />}

      {page ==="reports" && (
      <MyReports go={setPage}/>
      )}


      {page ==="rewards" && (
      <Rewards go={setPage}/>
      )}

      {page === "profile" && (
       <Profile go={setPage} />
      )}

      {page === "postlost" && (
       <PostLostForm goHome={() => setPage("dashboard")} />
      )}

      {page === "postfound" && (
       <PostFoundForm goHome={() => setPage("dashboard")} />
      )}

      {/* MATCH RESULTS */}
      {page === "matchresults" && (
        <MatchResults goHome={() => setPage("dashboard")} />
      )}

      {/* RETURN ITEM */}
      {page === "return" && (
        <ReturnItem goHome={() => setPage("dashboard")} />
      )}

      {/* CLAIM ITEM */}
      {page === "claim" && (
        <ClaimItem goHome={() => setPage("dashboard")} />
      )}
      
    </>
  );
}

export default App;