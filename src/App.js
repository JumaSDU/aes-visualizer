import React, { useEffect, useState } from "react";
import "./index.css";
import { api } from "./api";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import Practice from "./pages/Practice";
import Flashcards from "./pages/Flashcards";
import Videos from "./pages/Videos";
import Tests from "./pages/Tests";
import Results from "./pages/Results";

export default function App() {
  const [route, setRoute] = useState("home");
  const [data, setData] = useState(null);

  useEffect(() => {
    api.dashboard().then(setData).catch(console.error);
  }, []);

  return (
    <div className="app-shell">
      <Sidebar
        user={data?.user}
        tip={data?.tip}
        route={route}
        setRoute={setRoute}
      />
      <main className="main">
        {route === "home" && <Dashboard data={data} setRoute={setRoute} />}
        {route === "practice" && <Practice />}
        {route === "flashcards" && <Flashcards />}
        {route === "videos" && <Videos />}
        {route === "tests" && <Tests />}
        {route === "results" && <Results data={data} />}
      </main>
    </div>
  );
}
