import React, { useState } from "react";
import Home from "./pages/Home";
import PostForm from "./components/PostForm";
import MatchResults from "./pages/MatchResults";
import ReturnItem from "./pages/ReturnItem";
import ClaimItem from "./pages/ClaimItem";

function App() {
  const [page, setPage] = useState("home");

  return (
    <div>
      {page === "home" && (
        <Home
          goToForm={() => setPage("form")}
          goToResults={() => setPage("results")}
          goToReturnItem={() => setPage("returnitem")}
          goToClaimItem={() => setPage("claimitem")}
        />
      )}

      {page === "form" && (
        <PostForm goHome={() => setPage("home")} />
      )}

      {page === "results" && (
        <MatchResults goHome={() => setPage("home")} />
      )}

      {page === "returnitem" && (
        <ReturnItem goHome={() => setPage("home")} />
      )}

      {page === "claimitem" && (
        <ReturnItem goHome={() => setPage("home")} />
      )}



      
      
    </div>
  );
}

export default App;