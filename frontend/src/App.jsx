import React, { useState } from "react";
import Home from "./pages/Home";
import PostForm from "./components/PostForm";

function App() {
  const [page, setPage] = useState("home");

  const goToForm = () => setPage("form");
  const goHome = () => setPage("home");

  return (
    <div>
      {page === "home" && <Home goToForm={goToForm} />}
      {page === "form" && <PostForm goHome={goHome} />}
    </div>
  );
}

export default App;