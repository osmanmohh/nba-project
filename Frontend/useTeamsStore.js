import { useState, useEffect } from "react";
import {
  getTeamsByConference,
  getProjectedTeams,
  getLoadingState,
} from "./src/utils/globalData";

export function useTeams(conference) {
  const [teams, setTeams] = useState([]);
  const [predictedRanks, setPredictedRanks] = useState({});

  useEffect(() => {
    if (!getLoadingState()) {
      // Filter to current season, correct conference, and per_game stats only
      let filteredTeams = getTeamsByConference(conference, 2025);

      // Sort teams by current wins and win percentage
      filteredTeams.sort((a, b) => b.W - a.W || b["W/L%"] - a["W/L%"]);

      // Take top 15 teams in the conference
      filteredTeams = filteredTeams.slice(0, 15);

      // Assign current rank (1–15)
      let parsedTeams = filteredTeams.map((team, index) => ({
        ...team,
        rank: index + 1,
      }));

      // Create predicted data mapping
      const predictedData = getProjectedTeams().reduce((acc, row) => {
        acc[row.tm.toLowerCase()] = row.rk; // use `rk` not `rank`
        return acc;
      }, {});

      const updatedTeams = parsedTeams.map((team) => ({
        ...team,
        predictedRank: predictedData[team.Tm.toLowerCase()] || team.rank,
      }));

      setTeams(updatedTeams);
      setPredictedRanks(predictedData);
    }
  }, [conference]);

  return { teams, predictedRanks };
}
