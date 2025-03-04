import { useState, useEffect } from "react";

export function useTeams(conference) {
  const [teams, setTeams] = useState([]);
  const [predictedRanks, setPredictedRanks] = useState({});

  useEffect(() => {
    console.log("Conference Passed to useTeams:", conference);

    Promise.all([
      fetch("/teams.json")
        .then((res) => res.json())
        .then((data) => {
          console.log("Raw Teams JSON Data:", data); // Debugging

          // Separate teams by conference
          let filteredTeams = data
            .filter(team => team.Year === 2023 && team.Conf.toUpperCase() === conference.toUpperCase());

          // Sort teams by Wins first, then W/L% as a tiebreaker
          filteredTeams.sort((a, b) => b.W - a.W || b["W/L%"] - a["W/L%"]);

          // Only keep the top 15 teams in the conference
          filteredTeams = filteredTeams.slice(0, 15);

          // Assign proper rank (1-15)
          let parsedTeams = filteredTeams.map((team, index) => ({
            ...team,
            rank: index + 1, // Ensure ranks are 1-15
          }));

          console.log("Parsed Teams:", parsedTeams); // Debugging
          return parsedTeams;
        }),

      fetch("/predicted_seeds_2025.json")
        .then((res) => res.json())
        .then((data) => {
          console.log("Predicted Seeds JSON Data:", data); // Debugging

          // Ensure predicted ranks are assigned using lowercase tm (from predicted_seeds_2025.json)
          const predictedData = data.reduce((acc, row) => {
            acc[row.tm.toLowerCase()] = row.rank; // Store using lowercase team abbreviation
            return acc;
          }, {});

          return predictedData;
        }),
    ])
      .then(([parsedTeams, predictedData]) => {
        // Assign predicted ranks, ensuring the abbreviation keys match
        const updatedTeams = parsedTeams.map((team) => ({
          ...team,
          predictedRank: predictedData[team.Tm.toLowerCase()] || team.rank, // Match lowercase keys
          
        }));

        setTeams(updatedTeams);
        setPredictedRanks(predictedData);
      })
      .catch((error) => console.error("Error loading teams:", error));
  }, [conference]);

  return { teams, predictedRanks };
}
