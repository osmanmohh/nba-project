import { useEffect, useState } from "react";
import StandingsCard from "../StandingsCard/StandingsCard";
import "./Standings.css";

function Standings({ conference }) {
  const [teams, setTeams] = useState([]);
  const [predictedRanks, setPredictedRanks] = useState({});
  const [expandedCards, setExpandedCards] = useState({ playoffs: null, playIn: null, other: null });

  const fetchStandings = (filePath, conference) => {
    return fetch(filePath)
      .then((response) => response.text())
      .then((csvText) => {
        const rows = csvText.split("\n").slice(1); // Skip header row
        let parsedTeams = rows
          .map((row) => {
            const columns = row.split(",");
            if (columns.length < 11) return null; // Ensure we have enough columns

            return {
              team: columns[1].trim(), // Team name
              conference: columns[2].trim(), // Conference
              wins: parseInt(columns[3].trim(), 10), // Wins
              losses: parseInt(columns[4].trim(), 10), // Losses
              win_loss_percentage: Math.round(parseFloat(columns[5].trim()) * 100), // W/L% (0.817 → 82%)
              ortg: parseFloat(columns[6].trim()), // Offensive Rating
              drtg: parseFloat(columns[7].trim()), // Defensive Rating
              nrtg: parseFloat(columns[8].trim()), // Net Rating
              year: parseInt(columns[9].trim(), 10), // Year
              tm: columns[10].trim(), // Team abbreviation
            };
          })
          .filter((team) => team && team.year === 2023 && team.conference === conference); // Filter for 2023 teams

        // Sort by Wins first, then by W/L% as a tiebreaker
        parsedTeams.sort((a, b) => b.wins - a.wins || b.win_loss_percentage - a.win_loss_percentage);

        return parsedTeams.map((team, index) => ({
          ...team,
          rank: index + 1, // Assign rank correctly (1-based)
        }));
      })
      .catch((error) => {
        console.error(`Error fetching ${filePath}:`, error);
        return [];
      });
  };

  const fetchPredictedRanks = (filePath) => {
    return fetch(filePath)
      .then((response) => response.text())
      .then((csvText) => {
        const rows = csvText.split("\n").slice(1); // Skip header row
        const predictedData = {};

        rows.forEach((row) => {
          const columns = row.split(",");
          if (columns.length < 10) return;

          const teamAbbr = columns[2].trim(); // Abbreviation (tm)
          const predictedRank = parseInt(columns[9].trim(), 10); // 2025 Predicted Rank

          predictedData[teamAbbr] = predictedRank; // Store in lookup object
        });

        return predictedData;
      })
      .catch((error) => {
        console.error(`Error fetching ${filePath}:`, error);
        return {};
      });
  };

  useEffect(() => {
    Promise.all([
      fetchStandings("/teams.csv", conference), 
      fetchPredictedRanks("/predicted_seeds_2025.csv")
    ])
    .then(([parsedTeams, predictedData]) => {
      // Assign predicted ranks to teams based on abbreviation
      const updatedTeams = parsedTeams.map((team) => ({
        ...team,
        predictedRank: predictedData[team.tm] || team.rank, // Default to current rank if missing
      }));

      setTeams(updatedTeams);
      setPredictedRanks(predictedData);
    });
  }, [conference]);

  // Handle expanding logic to ensure only one expanded card per column
  const handleExpand = (teamRank, column) => {
    setExpandedCards((prev) => ({
      ...prev,
      [column]: prev[column] === teamRank ? null : teamRank, // Toggle logic
    }));
  };

  return (
    <div className="standings-container">
      <div className="conference">
        {/* Playoffs Column */}
        <div className="team-col playoffs">
          <div className="game-type">
            <img src="logos/nba.png" className="nba-logo" alt="NBA Logo" /> PLAYOFFS
          </div>
          {teams.slice(0, 6).map((team) => (
            <StandingsCard
              key={team.rank}
              team={team}
              predictedRank={team.predictedRank}
              isExpanded={expandedCards.playoffs === team.rank}
              onExpand={() => handleExpand(team.rank, "playoffs")}
            />
          ))}
        </div>

        {/* Play-In Column */}
        <div className="team-col play-in">
          <div className="game-type">
            <img src="logos/nba.png" className="nba-logo" alt="NBA Logo" /> PLAY-IN TOURNAMENT
          </div>
          {teams.slice(6, 10).map((team) => (
            <StandingsCard
              key={team.rank}
              team={team}
              predictedRank={team.predictedRank}
              isExpanded={expandedCards.playIn === team.rank}
              onExpand={() => handleExpand(team.rank, "playIn")}
            />
          ))}
        </div>

        {/* Other Teams Column */}
        <div className="team-col">
          <div className="game-type"></div>
          {teams.slice(10).map((team) => (
            <StandingsCard
              key={team.rank}
              team={team}
              predictedRank={team.predictedRank}
              isExpanded={expandedCards.other === team.rank}
              onExpand={() => handleExpand(team.rank, "other")}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default Standings;
