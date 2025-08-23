import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import NavBar from "./components/NavBar/index";
import Home from "./pages/Home/Home/index";
import Search from "./pages/Search/Search/index";
import StandingsPage from "./pages/Standings/StandingsPage/index";
import Playoffs from "./pages/Playoffs/Playoffs/index";
import AwardsPage from "./pages/Awards/AwardsPage/index";
import "./App.css";
import StatsPage from "./pages/Stats/StatsPage/index";

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
        <Route path="/standings" element={<StandingsPage />} />
        <Route path="/playoffs" element={<Playoffs />} />
        <Route path="/awards" element={<AwardsPage />} />
        <Route path="/stats" element={<StatsPage />} />
      </Routes>
    </>
  );
}

export default App;
