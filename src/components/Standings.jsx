import { useEffect, useState } from "react";
import StandingsCard from "./StandingsCard";
import "./Standings.css";

function Standings() {
  const [eastTeams, setEastTeams] = useState([]);
  const [westTeams, setWestTeams] = useState([]);

  const fetchStandings = (filePath, setTeams, conference) => {
    fetch(filePath)
      .then((response) => response.text())
      .then((csvText) => {
        const rows = csvText.split("\n").slice(1); // Skip header row
        const parsedTeams = rows
          .map((row) => {
            const columns = row.split(",");
            if (columns.length < 9) return null;

            return {
              rank: columns[9].trim(),
              tm: columns[2].trim(),
              wins: columns[3].trim(),
              losses: columns[4].trim(),
              conference: columns[1].trim(),
            };
          })
          .filter((team) => team && team.conference === conference);

        setTeams(parsedTeams.slice(0, 16)); // Take top 16 teams
      })
      .catch((error) => console.error(`Error fetching ${filePath}:`, error));
  };

  useEffect(() => {
    fetchStandings("/predicted_seeds_2025.csv", setEastTeams, "E");
    fetchStandings("/predicted_seeds_2025.csv", setWestTeams, "W");
  }, []);

  return (
    <div className="standings-container">
      <div className="conference">
        <h2>Eastern Conference</h2>
        <div className="team-list">
          {eastTeams.map((team) => (
            <StandingsCard
              key={team.rank}
              abbr={team.tm}
              rank={team.rank}
              wins={team.wins}
              losses={team.losses}
            />
          ))}
        </div>
      </div>
      <div className="conference">
        <h2>Western Conference</h2>
        <div className="team-list">
          {westTeams.map((team) => (
            <StandingsCard
              key={team.rank}
              abbr={team.tm}
              rank={team.rank}
              wins={team.wins}
              losses={team.losses}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default Standings;
