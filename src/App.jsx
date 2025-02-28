import Standings from "./components/Standings";
import NavBar from "./components/NavBar";
import Home from "./pages/Home";

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import "./App.css";
import PlayoffBracket from "./components/PlayoffBracket";
import Awards from "./components/Awards";
import AllNBACard from "./components/AllNBACard";
import AllNBATeam from "./components/AllNBATeam";

function App() {
  return (
    <Router>
      <NavBar />
      <Routes>
      <Route path="/" element={<Home />} />
      </Routes>
    </Router>
  );
}


export default App;
