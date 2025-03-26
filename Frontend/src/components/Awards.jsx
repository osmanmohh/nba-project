import { useEffect, useState } from "react";
import Ladder from "./Ladder.jsx";
import "./Awards.css";

function Awards() {
  const [mvpPlayers, setMvpPlayers] = useState([]);
  const [dpoyPlayers, setDpoyPlayers] = useState([]);

  // Function to fetch and parse CSV data
  const fetchPlayers = (filePath, setPlayers) => {
    fetch(filePath)
      .then((response) => response.text())
      .then((csvText) => {
        const rows = csvText.split("\n").slice(1); // Skip header row
        const parsedPlayers = rows
          .map((row) => {
            const columns = row.split(",");
            if (columns.length < 2) return null;

            return {
              playerId: columns[0].trim(),
              abbreviation: columns[1].trim(),
            };
          })
          .filter((player) => player && player.playerId);

        setPlayers(parsedPlayers.slice(0, 3)); // Take top 3 players
      })
      .catch((error) => console.error(`Error fetching ${filePath}:`, error));
  };

  // Fetch MVP & DPOY candidates
  useEffect(() => {
    fetchPlayers("/predicted_mvp_2025_minimal.csv", setMvpPlayers);
    fetchPlayers("/predicted_dpoy_2025_minimal.csv", setDpoyPlayers);
  }, []);

  return (
    <div className="ladders-container">
      <Ladder title="MVP" players={mvpPlayers} />
      <Ladder title="DPOY" players={dpoyPlayers} />
    </div>
  );
}

export default Awards;
