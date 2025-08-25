import { useState, useEffect } from "react";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "https://nba-project-backend.onrender.com";

export function useTeams(conference) {
  const [teams, setTeams] = useState([]);
  const [predictedRanks, setPredictedRanks] = useState({});

  useEffect(() => {
    Promise.all([
      // Fetch actual current team standings from team_season_stats
      fetch(`${API_BASE_URL}/api/team`)
        .then((res) => res.json())
        .then((data) => {
          // Filter to current season, correct conference, and per_game stats only
          let filteredTeams = data.filter(
            (team) =>
              team.Year === 2025 &&
              team.Conf.toUpperCase() === conference.toUpperCase() &&
              team.StatType === "per_game"
          );

          // Sort teams by current wins and win percentage
          filteredTeams.sort((a, b) => b.W - a.W || b["W/L%"] - a["W/L%"]);

          // Take top 15 teams in the conference
          filteredTeams = filteredTeams.slice(0, 15);

          // Assign current rank (1–15)
          let parsedTeams = filteredTeams.map((team, index) => ({
            ...team,
            rank: index + 1,
          }));

          return parsedTeams;
        }),

      // Fetch predicted standings (W/L and Rk) from projected_team_stats
      fetch(`${API_BASE_URL}/api/team/projected`)
        .then((res) => res.json())
        .then((data) => {
          const predictedData = data.reduce((acc, row) => {
            acc[row.tm.toLowerCase()] = row.rk; // use `rk` not `rank`
            return acc;
          }, {});
          return predictedData;
        }),
    ])
      .then(([parsedTeams, predictedData]) => {
        const updatedTeams = parsedTeams.map((team) => ({
          ...team,
          predictedRank: predictedData[team.Tm.toLowerCase()] || team.rank,
        }));

        setTeams(updatedTeams);
        setPredictedRanks(predictedData);
      })
      .catch((error) => console.error("Error loading teams:", error));
  }, [conference]);

  return { teams, predictedRanks };
}
