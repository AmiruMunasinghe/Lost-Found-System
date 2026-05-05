import React, { useState } from "react";
import Home from "./pages/Home";
import PostForm from "./components/PostForm";
import MatchResults from "./pages/MatchResults";

function App() {
  const [page, setPage] = useState("home");

  return (
    <div>
      {page === "home" && (
        <Home
          goToForm={() => setPage("form")}
          goToResults={() => setPage("results")}
        />
      )}

      {page === "form" && (
        <PostForm goHome={() => setPage("home")} />
      )}

      {page === "results" && (
        <MatchResults goHome={() => setPage("home")} />
      )}
    </div>
  );
}

export default App;