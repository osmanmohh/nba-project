import React, { useEffect, useState } from "react";
import Papa from "papaparse";
import AllNBACard from "../AllNBACard";
import "./index.css";

const allNBACsvFilePath = "/all_nba_predictions.csv";
const allDefenseCsvFilePath = "/all_defense_predictions.csv";

function AllNBATeam({ teamType, isDefense }) {
  const [teamData, setTeamData] = useState([]);

  useEffect(() => {
    const csvFilePath = isDefense ? allDefenseCsvFilePath : allNBACsvFilePath;

    fetch(csvFilePath)
      .then((response) => {
        if (!response.ok)
          throw new Error(`Failed to fetch CSV: ${response.status}`);
        return response.text();
      })
      .then((csvText) => {
        Papa.parse(csvText, {
          header: true,
          skipEmptyLines: true,
          dynamicTyping: true,
          complete: (result) => {
            setTeamData(result.data);
          },
        });
      })
      .catch((error) => console.error("Error loading CSV:", error));
  }, [isDefense]);

  // Convert numeric teamType (1, 2, 3) to matching string ("1T", "2T", "3T")
  const selectionType = teamType;

  // Filter players based on teamType
  const filteredPlayers = teamData.filter(
    (row) => row.Selection === selectionType
  );

  return (
    <div className="all-nba-container">
      <div className="ladder-title">
        2024-25 {isDefense ? "ALL-DEFENSIVE" : "ALL NBA"}{" "}
        {teamType === 1 ? "FIRST" : teamType === 2 ? "SECOND" : "THIRD"} TEAM
      </div>

      <div className="all-nba-card-container">
        {filteredPlayers.length > 0 ? (
          filteredPlayers.map((row, index) => (
            <AllNBACard
              key={row.playerID || index} // Use Player_ID or fallback index
              playerId={row.playerID} // Pass Player ID
              tm={row.Tm}
              selection={row.Selection} // Pass selection (1T, 2T, 3T)
            />
          ))
        ) : (
          <p>
            No players found for {isDefense ? "All-Defensive" : "All-NBA"}{" "}
            {teamType} Team
          </p>
        )}
      </div>
    </div>
  );
}

export default AllNBATeam;
