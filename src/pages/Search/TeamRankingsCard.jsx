import "./TeamRankingsCard.css";
import { teamColors } from "../../../public/teamColors";
import { useEffect, useState } from "react";

export default function TeamRankingsCard({ tm }) {
  const [teamStats, setTeamStats] = useState(null);
  const [teamRanks, setTeamRanks] = useState(null);

  useEffect(() => {
    fetch("/teams.json") // ✅ Lazy-load the JSON
      .then((response) => response.json())
      .then((data) => {
        const all2024Teams = data.filter((team) => team.Year === 2024); // ✅ Get all 2024 teams
        const selectedTeam = all2024Teams.find((team) => team.Tm === tm);

        if (selectedTeam) {
          // ✅ Calculate rankings dynamically
          const calculateRank = (stat, isLowerBetter = false) =>
            all2024Teams
              .sort((a, b) => (isLowerBetter ? a[stat] - b[stat] : b[stat] - a[stat])) // ✅ Correct Sorting
              .findIndex((team) => team.Tm === tm) + 1;
          

          setTeamStats(selectedTeam);
          setTeamRanks({
            ORtg: calculateRank("ORtg"), // High is better
            DRtg: calculateRank("DRtg", true), // ✅ Low is better
            NETRtg: calculateRank("NRtg"), // High is better
            WL: calculateRank("W/L%"), // High is better
          });
          
        }
      })
      .catch((error) => console.error("Error loading team data:", error));
  }, [tm]);

  if (!teamStats || !teamRanks) return <div className="leaders-card">Loading...</div>;

  return (
    <div
      className="teams-card"
      style={{
        backgroundColor: teamColors[teamStats.Tm]?.primary || "#ffffff",
      }}
    >
      <div className="teams-title">Team Rankings</div>
      <div className="player-container">
        {[
          { label: "ORTG", value: teamStats.ORtg, rank: `${teamRanks.ORtg}TH` },
          { label: "DRTG", value: teamStats.DRtg, rank: `${teamRanks.DRtg}TH` },
          { label: "NETRTG", value: teamStats.NRtg, rank: `${teamRanks.NETRtg}TH` },
          { label: "W/L%", value: teamStats["W/L%"], rank: `${teamRanks.WL}TH` },
        ].map((item, index) => (
          <div className={`team-card-container player-${index + 1}`} key={index}>
            <div className="team">
              <div className="team-label">{item.label}</div>
              <div className="team-value">{item.value || "-"}</div>
              <div className="team-player">{item.rank}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
