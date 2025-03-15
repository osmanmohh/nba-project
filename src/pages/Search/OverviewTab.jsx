import { useState, useMemo, useEffect } from "react";
import players from "/all_players.json";
import teams from "/teams.json";
import "./OverviewTab.css";
import PlayerStatistics from "./PlayerStatistics";
import PlayerGamesSection from "./PlayerGamesSection";
import TeamInfo from "./TeamInfo";
import Dropdown from "../../components/Dropdown/Dropdown";
import { teamColors } from "../../../public/teamColors";

export default function OverviewTab({ player, team }) {
  // ✅ Extract all unique seasons from `allPlayers`, not just `team`
  const seasons = useMemo(() => {
    if (!team || team.length === 0) return [];

    // Find all seasons for this team in allPlayers
    const teamSeasons = [...new Set(players
      .filter((p) => p.Tm === team[0]?.Tm)
      .map((p) => p.Year))];

    return teamSeasons
      .sort((a, b) => b - a) // Sort descending (latest first)
      .map((year) => ({
        label: `${year - 1}-${year}`,
        value: year.toString(),
      }));
  }, [team]);

  // ✅ Default season is 2024
  const [selectedSeason, setSelectedSeason] = useState("2024");
  const [roster, setRoster] = useState([]);

  useEffect(() => {
    if (team && team.length > 0) {
      // ✅ First, clear the roster to prevent old players from lingering
      setRoster([]);
  
      // ✅ Update roster with the new team's players
      const updatedRoster = players
        .filter((p) => p.Tm === team[0]?.Tm)
        .filter((p) => p.Year.toString() === selectedSeason);
  
      setRoster(updatedRoster);
    } else {
      setRoster([]); // ✅ Ensure the roster fully clears when no team is selected
    }
  }, [team, selectedSeason]); // ✅ Runs when team or season changes
  

  return (
    <div className="ctn">
      {player ? (
        // ✅ Player Overview (unchanged)
        <div className="overview-tab">
          <div className="ctn">
            <PlayerStatistics player={player} />
            <PlayerGamesSection player={player} />
          </div>
          <h2 className="team-title">
            More {player["Team"].split(" ").pop()} Info
          </h2>

          <div className="ctn">
            <TeamInfo
              team={players.filter((p) => p.Tm === player.Tm && p.Year === selectedSeason)}
              teams={teams}
              year={parseInt(selectedSeason)}
            />
          </div>
        </div>
      ) : team ? (
        // ✅ Team Overview with Season Dropdown
        <div className="overview-tab">
          {seasons.length > 0 && (
            <div className="season-dropdown-container">
              <Dropdown 
                options={seasons} 
                value={selectedSeason} 
                onChange={(newValue) => setSelectedSeason(newValue)} 
              />
            </div>
          )}

          <div className="ctn">
            <TeamInfo
              team={players.filter((p) => p.Tm === team[0]?.Tm && p.Year.toString() === selectedSeason)}
              teams={teams}
              year={parseInt(selectedSeason)}
            />
          </div>

          <h1 className="team-title">Roster</h1>

          <div className="ctn">
            <div className="roster">
              {roster.map((player) => {
                const playerImage = `/headshots/${player["Player_ID"]}.png`;
                return (
                  <div
                    className="roster-card"
                    key={player.Player_ID}
                    style={
                      player.Tm
                        ? { backgroundColor: teamColors[player.Tm]?.primary }
                        : {}
                    }
                  >
                    <img
                      src={playerImage}
                      alt={player.Name}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "/headshots/blank.png";
                      }}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        <p>No data available</p>
      )}
    </div>
  );
}