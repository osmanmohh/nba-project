import NavBar from "./components/NavBar";
import Home from "./pages/Home/Home";
import Search from "./pages/Search/Search";
import StandingsPage from "./pages/Standings/StandingsPage";
import StandingsCard from "./pages/Standings/StandingsCard/StandingsCard";

import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";
import "./App.css";

function App() {
  return (
    <Router>
      <MainApp />
    </Router>
  );
}

function MainApp() {
  const location = useLocation();

  useEffect(() => {
    // Set background color based on route
    switch (location.pathname) {
      case "/":
        document.body.style.backgroundColor = "#3c7dff"; // Blue for Home
        break;
      case "/search":
        document.body.style.backgroundColor = "#ffffff"; // Green for Search
        break;
        case "/standings":
        document.body.style.backgroundColor = "#191A1D"; // Green for Search
        break;
      default:
        document.body.style.backgroundColor = "#ffffff"; // Default White
    }

    return () => {
      document.body.style.backgroundColor = ""; // Reset when component unmounts
    };
  }, [location.pathname]);

  return (
    <>
      <NavBar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/search" element={<Search />} />
        <Route path="/standings" element={<StandingsPage />} />

      </Routes>
    </>
  );
}

export default App;
