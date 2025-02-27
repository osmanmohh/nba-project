import Standings from "./components/Standings";
import "./App.css";
import PlayoffBracket from "./components/PlayoffBracket";
import Awards from "./components/Awards";
import AllNBACard from "./components/AllNBACard";

function App() {
  return (
    <div
      style={{
        display: "flex",
      }}
    >
      <AllNBACard playerId={4278073} />
      <AllNBACard playerId={3945274} />
      <AllNBACard playerId={3112335} />
      <AllNBACard playerId={3032977} />
      <AllNBACard playerId={4065648} />
    </div>
  );
}

export default App;
