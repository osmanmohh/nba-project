import React, { useEffect, useState } from "react";
import Papa from "papaparse";
import AllNBACard from "./AllNBACard";
import "./AllNBATeam.css";

const csvFilePath = "/all_nba_predictions_2025.csv"; // Ensure the file is in the public folder

function AllNBATeam({ teamType }) {
  const [allNBATeam, setAllNBATeam] = useState([]);

  useEffect(() => {
    fetch(csvFilePath)
      .then((response) => {
        if (!response.ok) throw new Error(`Failed to fetch CSV: ${response.status}`);
        return response.text();
      })
      .then((csvText) => {
        Papa.parse(csvText, {
          header: true,
          skipEmptyLines: true,
          dynamicTyping: true,
          complete: (result) => {
            console.log("Parsed CSV Data:", result.data); // Debugging log
            setAllNBATeam(result.data);
          },
        });
      })
      .catch((error) => console.error("Error loading CSV:", error));
  }, []);

  // Convert numeric teamType (1, 2, 3) to matching string ("1T", "2T", "3T")
  const selectionType = `${teamType}T`;

  // Filter players based on teamType
  const filteredPlayers = allNBATeam.filter((row) => row.Selection === selectionType);

  return (
    <div className="all-nba-container">
      {filteredPlayers.length > 0 ? (
        filteredPlayers.map((row, index) => (
          <AllNBACard 
            key={row.Player_ID || index} // Use Player_ID or fallback index
            playerId={row.Player_ID} // Pass Player ID
            team={row.Tm} // Pass team abbreviation
            position={row.Pos} // Pass player position
            selection={row.Selection} // Pass All-NBA selection (1T, 2T, 3T)
          />
        ))
      ) : (
        <p>No players found for All-NBA {teamType} Team</p>
      )}
    </div>
  );
}

export default AllNBATeam;
