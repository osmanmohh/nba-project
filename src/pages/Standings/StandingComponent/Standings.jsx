import { useEffect, useState } from "react";
import StandingsCard from "../StandingsCard/StandingsCard";
import "./Standings.css";

function Standings({ conference }) {
  const [teams, setTeams] = useState([]);

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
    fetchStandings("/predicted_seeds_2025.csv", setTeams, conference);
  }, [conference]);

  return (
    <div className="standings-container">
      <div className="title-container">
        <div className="blue-boxed">NBA STANDINGS</div>
        <div className="main-title">
          {conference == "W" ? "WESTERN" : "EASTERN"} CONFERENCE
        </div>
        <div>
          THROUGH{" "}
          {new Date()
            .toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })
            .toUpperCase()
            .replace(/(\w{3})/, "$1.")}{" "}
          GAMES
        </div>
      </div>{" "}
      <div className="conference">
        <div className="team-col playoffs">
          <div className="game-type">
            <img src="logos/nba.png" className="nba-logo"></img> PLAYOFFS
          </div>
          {teams.slice(0, 6).map((team) => (
            <StandingsCard
              key={team.rank}
              abbr={team.tm}
              rank={team.rank}
              wins={team.wins}
              losses={team.losses}
            />
          ))}
        </div>
        <div className="team-col play-in">
          <div className="game-type">
            <img src="logos/nba.png" className="nba-logo"></img>PLAY-IN
            TOURNAMENT
          </div>
          {teams.slice(6, 10).map((team) => (
            <StandingsCard
              key={team.rank}
              abbr={team.tm}
              rank={team.rank}
              wins={team.wins}
              losses={team.losses}
            />
          ))}
        </div>
        <div className="team-col">
          <div className="game-type"></div>
          {teams.slice(10).map((team) => (
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
