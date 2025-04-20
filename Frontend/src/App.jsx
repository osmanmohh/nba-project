import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import NavBar from "./components/NavBar";
import Home from "./pages/Home/Home";
import Search from "./pages/Search/Search";
import StandingsPage from "./pages/Standings/StandingsPage";
import Playoffs from "./pages/Playoffs/Playoffs";
import AwardsPage from "./pages/Awards/AwardsPage";
import "./App.css";
import StatsPage from "./pages/Stats/StatsPage";

function App() {
  return (
    <Router>
      <MainApp />
    </Router>
  );
}

function MainApp() {
  return (
    <>
      <NavBar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/search/:query?" element={<Search />} />

        {/*  Added route */}
        <Route path="/standings" element={<StandingsPage />} />
        <Route path="/playoffs" element={<Playoffs />} />
        <Route path="/awards" element={<AwardsPage />} />
        <Route path="/awards" element={<AwardsPage />} />
        <Route path="/stats" element={<StatsPage />} />
      </Routes>
    </>
  );
}

export default App;
