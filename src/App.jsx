import Standings from "./components/Standings";
import "./App.css";
import PlayoffBracket from "./components/PlayoffBracket";
function App() {
  return (
    <>
      <PlayoffBracket />
      <Standings conference={"W"} />
    </>
  );
}

export default App;
