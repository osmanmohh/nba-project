// OverviewTab.jsx
import { useState, useEffect } from "react";
import players from "/all_players.json";
import teams from "/teams.json";
import "./OverviewTab.css";
import PlayerStatistics from "./PlayerStatistics";
import PlayerGamesSection from "./PlayerGamesSection";
import TeamInfo from "./TeamInfo";
import Dropdown from "../../components/Dropdown/Dropdown";
import { teamColors } from "../../../public/teamColors";
import { getHeadshot } from "../../../public/getHeadshot";

export default function OverviewTab({
  player,
  team,
  newPlayer,
  games,
  playerHeadshot,
  teams,
  allTeams,
  newRoster,
  teamStats,
}) {
  const [selectedSeason, setSelectedSeason] = useState("2024");
  const [roster, setRoster] = useState([]);
  const [headshots, setHeadshots] = useState({});

  const seasons =
    team && team.length > 0
      ? [
          ...new Set(
            players.filter((p) => p.Tm === team[0]?.Tm).map((p) => p.Year)
          ),
        ]
          .sort((a, b) => b - a)
          .map((year) => ({
            label: `${year - 1}-${year}`,
            value: year.toString(),
          }))
      : [];

  useEffect(() => {
    if (team && team.length > 0) {
      const updatedRoster = players
        .filter((p) => p.Tm === team[0]?.Tm)
        .filter((p) => p.Year.toString() === selectedSeason);
      setRoster(updatedRoster);
    } else {
      setRoster([]);
    }
  }, [team, selectedSeason]);

  useEffect(() => {
    const fetchHeadshots = async () => {
      const map = {};
      const seenPlayers = new Set();
      for (const player of newRoster) {
        if (seenPlayers.has(player.playerID)) continue;
        seenPlayers.add(player.playerID);
        const image = await getHeadshot(player.Name);
        map[player.playerID] = image;
        console.log("player", player.Name, player.playerID, image);
      }
      setHeadshots(map);
    };

    if (newRoster.length > 0) fetchHeadshots();
  }, [newRoster]);

  return (
    <div className="ctn">
      {player ? (
        <div className="overview-tab">
          <div className="ctn">
            <PlayerStatistics player={player} newPlayer={newPlayer} />
            <PlayerGamesSection
              player={player}
              newPlayer={newPlayer}
              games={games}
              playerHeadshot={playerHeadshot}
            />
          </div>
          <h2 className="team-title">
            More {newPlayer.team.split(" ").pop()} Info
          </h2>

          <div className="ctn">
            <TeamInfo
              team={players.filter(
                (p) => p.Tm === player.Tm && p.Year === selectedSeason
              )}
              teams={teams}
              newRoster={newRoster}
              newPlayer={newPlayer}
              year={parseInt(selectedSeason)}
              allTeams={allTeams}
              newTeam={allTeams.find(
                (team) =>
                  team.Tm?.toLowerCase() === newPlayer.teamAbbr?.toLowerCase()
              )}
              games={games}
              teamStats={teamStats}
            />
          </div>
        </div>
      ) : team ? (
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
              newRoster={newRoster}
              team={team}
              teams={teams}
              year={parseInt(selectedSeason)}
              newTeam={team}
              allTeams={allTeams}
              games={games}
              teamStats={teamStats}
            />
          </div>

          <h1 className="team-title">Roster</h1>

          <div className="ctn">
            <div className="roster">
              {(() => {
                const seen = new Set();
                return newRoster
                  .filter((p) => {
                    if (!p.playerID || seen.has(p.playerID)) return false;
                    seen.add(p.playerID);
                    return true;
                  })
                  .map((player) => {
                    const playerImage =
                      headshots[player.playerID] || "/headshots/blank.png";
                    return (
                      <div
                        className="roster-card"
                        key={player.playerID}
                        style={
                          player.Tm
                            ? {
                                backgroundColor:
                                  teamColors[player.Tm.toLowerCase()]?.primary,
                              }
                            : {}
                        }
                      >
                        <img
                          src={
                            playerImage || `/headshots/${player.playerID}.png`
                          }
                          alt={player.Name}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "/headshots/blank.png";
                            console.log(
                              "Image failed:",
                              player.playerID,
                              player.Name
                            );
                          }}
                        />
                      </div>
                    );
                  });
              })()}
            </div>
          </div>
        </div>
      ) : (
        <p>No data available</p>
      )}
    </div>
  );
}
