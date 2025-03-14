import { useEffect, useState } from "react";
import Papa from "papaparse"; // CSV parser
import "./TeamInfo.css";
import LeadersCard from "./LeadersCard";
import TeamRankingsCard from "./TeamRankingsCard";
import { teamColors } from "../../../public/teamColors";

export default function TeamInfo({ team, teams }) {
  const selectedTeam = team[0];
  console.log("Selected team: ", selectedTeam)
  const [games, setGames] = useState([]);

  useEffect(() => {
    // Load games.csv
    fetch("/combined_game_logs.csv") // Update with actual path
      .then((response) => response.text())
      .then((csvText) => {
        Papa.parse(csvText, {
          header: true,
          skipEmptyLines: true,
          dynamicTyping: true,
          complete: (result) => {
            // Sort by date (most recent first)
            const sortedGames = result.data.sort(
              (a, b) => new Date(b.Date) - new Date(a.Date)
            );
            setGames(sortedGames);
          },
        });
      })
      .catch((error) => console.error("Error loading games.csv:", error));
  }, []);
  // Filter and sort teams from the same conference
  const sameConfTeams = teams
    .filter((t) => t.Year === 2024 && t.Conf === selectedTeam.Conf)
    .sort((a, b) => b.W - a.W); // Sort by Wins (Descending)

  // Assign proper conference ranks
  sameConfTeams.forEach((t, i) => (t.confRank = i + 1));

  // Find index of the selected team
  const teamIndex = sameConfTeams.findIndex((t) => t.Tm === selectedTeam.Tm);

  // Determine start and end indices for slicing
  let start = Math.max(0, teamIndex - 2); // Try to center the team
  let end = Math.min(sameConfTeams.length, start + 5); // Ensure we get 5 teams

  // Adjust start again if at the bottom edge
  if (end - start < 5) {
    start = Math.max(0, end - 5);
  }

  const surroundingTeams = sameConfTeams.slice(start, end);;

  return (
    <div className="team-section">
      {/* <h2 className="team-title">More {selectedTeam.Team.split(" ").pop()} Stats</h2> */}
      <div className="ctn">
        <LeadersCard players={team} />
        <TeamRankingsCard tm={selectedTeam.Tm} />
      </div>

      <div className="ctn">
        <div className="latest-team-info-stats-container">
          <div className="team-infos-container">
            {/* Fixed Table Header */}
            <h1 className="card-title">2024-25 Conference Standings</h1>
            <div className="team-info-header stats">
              <span className="team-header">Team</span>
              <span className="team-vals">W</span>
              <span className="team-vals">L</span>
              <span className="team-vals">.PCT</span>
            </div>

            {/* Dynamic Team Data */}
            {surroundingTeams.map((t) => (
              <div className="team-info" key={t.Tm} 
              style={t.Tm === selectedTeam.Tm ? { backgroundColor: teamColors[t.Tm]?.primary } : {}}
>
                <div className="team-info-detail stats">
                  <div className="team-info-data stats">
                    <div className="team-vals opp">
                      <span className="team-info-rank">{t.confRank}</span>
                      <div className="opp-info-container">
                        <div className="opp-logo-container">
                          <img
                            src={`/logos/${t.Tm}.png`}
                            className="latest-team-logo"
                            alt={t.Team}
                          />
                        </div>
                        <div className="team-info-name">
                          {t.Team.split(" ").pop()}
                        </div>
                      </div>
                    </div>
                    <div className="team-vals">{t.W}</div>
                    <div className="team-vals">{t.L}</div>
                    <div className="team-vals">{t["W/L%"]}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="latest-team-info-stats-container">
          <div className="team-infos-container">
            {/* Fixed Table Header */}
            <h1 className="card-title">Schedule</h1>
            <div className="team-info-header stats">
              <span className="team-vals">DATE</span>
              <span className="team-vals matchup">MATCHUP</span>
              <span className="team-vals">TIME</span>
            </div>

            {/* Dynamic Team Data */}
            {games.slice(0, 5).map((game, index) => (
            <div className="team-info" key={index}>
              <div className="team-info-detail stats">
                <div className="team-info-data stats">
                  <div className="team-vals">{game.Date}</div>
                  <div className="team-vals matchup">
                    <div className="opp-info-container">
                      <div className="opp-logo-container">
                        <img
                          src={`/logos/${game.Location === "@" ? selectedTeam.Tm : game.Opponent}.png`}
                          className="latest-team-logo"
                          alt={game.Opponent}
                        />
                      </div>
                      <div className="team-info-name">{game.Location === "@" ? selectedTeam.Tm.toUpperCase() : game.Opponent.toUpperCase()}</div>
                    </div>
                    <div>@</div>
                    <div className="opp-info-container">
                      <div className="opp-logo-container">
                        <img
                          src={`/logos/${game.Location === "@" ? game.Opponent : selectedTeam.Tm}.png`}
                          className="latest-team-logo"
                          alt={selectedTeam.Team}
                        />
                      </div>
                      <div className="team-info-name">{game.Location === "@" ? game.Opponent.toUpperCase() : selectedTeam.Tm.toUpperCase()}</div>
                    </div>
                  </div>
                  <div className="team-vals">{game.Time || "TBD"}</div>
                </div>
              </div>
            </div>
          ))}
          </div>
        </div>
      </div>
    </div>
  );
}
