import "./index.css";
import { teamColors } from "../../../constants/teamColors";
import { useEffect, useState } from "react";

export default function TeamRankingsCard({ tm, year }) {
  const [teamStats, setTeamStats] = useState(null);
  const [teamRanks, setTeamRanks] = useState(null);

  useEffect(() => {
    fetch("/api/team")
      .then((response) => response.json())
      .then((data) => {
        const allTeamsForYear = data.filter((team) => team.Year === year); //  Use dynamic year
        const selectedTeam = allTeamsForYear.find(
          (team) => team.Tm.toLowerCase() === tm.toLowerCase()
        );

        if (selectedTeam) {
          //  Calculate rankings dynamically
          const calculateRank = (stat, isLowerBetter = false) =>
            allTeamsForYear
              .sort((a, b) =>
                isLowerBetter ? a[stat] - b[stat] : b[stat] - a[stat]
              ) //  Correct Sorting
              .findIndex((team) => team.Tm.toLowerCase() === tm.toLowerCase()) +
            1;

          setTeamStats(selectedTeam);
          setTeamRanks({
            ORtg: calculateRank("ORtg"),
            DRtg: calculateRank("DRtg", true),
            NETRtg: calculateRank("NRtg"),
            WL: calculateRank("W/L%"),
          });
        }
      })
      .catch((error) => console.error("Error loading team data:", error));
  }, [tm, year]); //  Add `year` to dependency array

  if (!teamStats || !teamRanks)
    return <div className="leaders-card">Loading...</div>;

  return (
    <div
      className="teams-card"
      style={{
        backgroundColor:
          teamColors[teamStats.Tm.toLowerCase()]?.primary || "#ffffff",
      }}
    >
      <div className="teams-title">Team Rankings</div>
      <div className="rankings-container">
        {[
          { label: "ORTG", value: teamStats.ORtg, rank: `${teamRanks.ORtg}TH` },
          { label: "DRTG", value: teamStats.DRtg, rank: `${teamRanks.DRtg}TH` },
          {
            label: "NETRTG",
            value: teamStats.NRtg,
            rank: `${teamRanks.NETRtg}TH`,
          },
          {
            label: "W/L%",
            value: teamStats["W/L%"],
            rank: `${teamRanks.WL}TH`,
          },
        ].map((item, index) => (
          <div
            className={`team-card-container player-${index + 1}`}
            key={index}
          >
            <div className="team-ctn">
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
