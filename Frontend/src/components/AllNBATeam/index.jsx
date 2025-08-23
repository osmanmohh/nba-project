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

    console.log(
      `🔍 [AllNBATeam] Loading ${isDefense ? "All-Defense" : "All-NBA"} data from: ${csvFilePath}`
    );
    console.log(`🔍 [AllNBATeam] Team Type: ${teamType}`);

    fetch(csvFilePath)
      .then((response) => {
        if (!response.ok)
          throw new Error(`Failed to fetch CSV: ${response.status}`);
        return response.text();
      })
      .then((csvText) => {
        console.log(`📄 [AllNBATeam] Raw CSV content:`, csvText);

        Papa.parse(csvText, {
          header: true,
          skipEmptyLines: true,
          dynamicTyping: true,
          complete: (result) => {
            console.log(`✅ [AllNBATeam] Parsed CSV data:`, result.data);
            console.log(
              `📊 [AllNBATeam] Total rows parsed:`,
              result.data.length
            );
            setTeamData(result.data);
          },
          error: (error) => {
            console.error(`❌ [AllNBATeam] CSV parsing error:`, error);
          },
        });
      })
      .catch((error) =>
        console.error("❌ [AllNBATeam] Error loading CSV:", error)
      );
  }, [isDefense, teamType]);

  // Convert numeric teamType (1, 2, 3) to matching string values
  const getSelectionType = () => {
    if (isDefense) {
      return teamType === 1 ? "1st" : "2nd";
    } else {
      return teamType === 1 ? "1T" : teamType === 2 ? "2T" : "3T";
    }
  };

  const selectionType = getSelectionType();
  console.log(`🎯 [AllNBATeam] Looking for selection type: "${selectionType}"`);

  // Filter players based on teamType
  const filteredPlayers = teamData.filter(
    (row) => row.Selection === selectionType
  );

  console.log(`🔍 [AllNBATeam] All team data:`, teamData);
  console.log(`🔍 [AllNBATeam] Available Selection values:`, [
    ...new Set(teamData.map((row) => row.Selection)),
  ]);
  console.log(
    `✅ [AllNBATeam] Filtered players for "${selectionType}":`,
    filteredPlayers
  );
  console.log(
    `📊 [AllNBATeam] Found ${filteredPlayers.length} players for ${isDefense ? "All-Defense" : "All-NBA"} ${teamType} Team`
  );

  return (
    <div className="all-nba-container">
      <div className="ladder-title">
        2024-25 {isDefense ? "ALL-DEFENSIVE" : "ALL NBA"}{" "}
        {teamType === 1 ? "FIRST" : teamType === 2 ? "SECOND" : "THIRD"} TEAM
      </div>

      <div className="all-nba-card-container">
        {filteredPlayers.length > 0 ? (
          filteredPlayers.map((row, index) => {
            console.log(`🎮 [AllNBATeam] Rendering player ${index + 1}:`, row);
            return (
              <AllNBACard
                key={row.playerID || index} // Use Player_ID or fallback index
                playerId={row.playerID} // Pass Player ID
                tm={row.Tm}
                selection={row.Selection} // Pass selection (1T, 2T, 3T)
              />
            );
          })
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
