import Standings from "./components/Standings";
import "./App.css";
import PlayoffBracket from "./components/PlayoffBracket";
import Awards from "./components/Awards";
function App() {
  return (
    <>
      <PlayoffBracket />
      <Standings conference={"W"} />
      <Awards/>
    </>
  );
}

export default App;
