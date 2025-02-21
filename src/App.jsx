import { useEffect, useState } from "react";
import PlayerCard from "./components/PlayerCard";
import "./App.css";

function App() {
  const [mvpPlayers, setMvpPlayers] = useState([]);
  const [dpoyPlayers, setDpoyPlayers] = useState([]);

  // Fetch MVP Candidates
  useEffect(() => {
    fetch("/predicted_mvp_2025_minimal.csv") // Fetch MVP data
      .then((response) => response.text())
      .then((csvText) => {
        const rows = csvText.split("\n").slice(1); // Skip header row
        const parsedPlayers = rows
          .map((row) => {
            const columns = row.split(",");
            if (columns.length < 2) return null; // Skip invalid rows

            return {
              playerId: columns[0].trim(), // Player_ID
              abbreviation: columns[1].trim(), // Team Abbreviation (Tm)
            };
          })
          .filter((player) => player && player.playerId); // Ensure valid data

        setMvpPlayers(parsedPlayers.slice(0, 3)); // Take top 3 MVP candidates
      })
      .catch((error) => console.error("Error fetching MVP data:", error));
  }, []);

  // Fetch DPOY Candidates
  useEffect(() => {
    fetch("/predicted_dpoy_2025_minimal.csv") // Fetch DPOY data
      .then((response) => response.text())
      .then((csvText) => {
        const rows = csvText.split("\n").slice(1); // Skip header row
        const parsedPlayers = rows
          .map((row) => {
            const columns = row.split(",");
            if (columns.length < 2) return null; // Skip invalid rows

            return {
              playerId: columns[0].trim(), // Player_ID
              abbreviation: columns[1].trim(), // Team Abbreviation (Tm)
            };
          })
          .filter((player) => player && player.playerId); // Ensure valid data

        setDpoyPlayers(parsedPlayers.slice(0, 3)); // Take top 3 DPOY candidates
      })
      .catch((error) => console.error("Error fetching DPOY data:", error));
  }, []);

  return (
    <div className="App">
      <h1>Top 3 Predicted MVP & DPOY Candidates</h1>
      <div className="ladders-container">
        {/* MVP Ladder */}
        <div className="ladder">
          <h2>MVP Ladder</h2>
          {mvpPlayers.map((player, index) => (
            <PlayerCard 
              key={player.playerId} 
              playerId={player.playerId} 
              abbreviation={player.abbreviation}
              rank={index + 1} 
            />
          ))}
        </div>

        {/* DPOY Ladder */}
        <div className="ladder">
          <h2>DPOY Ladder</h2>
          {dpoyPlayers.map((player, index) => (
            <PlayerCard 
              key={player.playerId} 
              playerId={player.playerId} 
              abbreviation={player.abbreviation}
              rank={index + 1} 
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;
