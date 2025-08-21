import { useState } from "react";
import { useTeams } from "../../../../useTeamsStore";
import StandingsCard from "../StandingsCard";
import "./index.css";

function Standings({ conference }) {
  const { teams, predictedRanks } = useTeams(conference);
  const [expandedCards, setExpandedCards] = useState({
    playoffs: null,
    playIn: null,
    other: null,
  });

  const handleExpand = (teamRank, column) => {
    setExpandedCards((prev) => ({
      ...prev,
      [column]: prev[column] === teamRank ? null : teamRank,
    }));
  };

  return (
    <div className="standings-container">
      <div className="conference">
        <div className="team-col playoffs">
          <div className="game-type">
            <img src="logos/nba.png" className="nba-logo" alt="NBA Logo" />{" "}
            PLAYOFFS
          </div>
          {teams.slice(0, 6).map((team, index) => (
            <StandingsCard
              rank={teams.indexOf(team) + 1}
              key={team.tm}
              team={team}
              predictedRank={
                predictedRanks[team.Tm?.toLowerCase()?.trim()] ??
                teams.indexOf(team) + 1
              }
              isExpanded={expandedCards.playoffs === teams.indexOf(team) + 1}
              onExpand={() => handleExpand(teams.indexOf(team) + 1, "playoffs")}
            />
          ))}
        </div>

        <div className="team-col play-in">
          <div className="game-type">
            <img src="logos/nba.png" className="nba-logo" alt="NBA Logo" />{" "}
            PLAY-IN TOURNAMENT
          </div>
          {teams.slice(6, 10).map((team, index) => (
            <StandingsCard
              rank={teams.indexOf(team) + 1}
              key={team.tm}
              team={team}
              predictedRank={
                predictedRanks[team.Tm?.toLowerCase()?.trim()] ??
                teams.indexOf(team) + 1
              }
              isExpanded={expandedCards.playIn === teams.indexOf(team) + 1}
              onExpand={() => handleExpand(teams.indexOf(team) + 1, "playIn")}
            />
          ))}
        </div>

        <div className="team-col">
          <div className="game-type">{/* Other content */}</div>
          {teams.slice(10).map((team, index) => (
            <StandingsCard
              rank={teams.indexOf(team) + 1}
              key={team.tm}
              team={team}
              predictedRank={
                predictedRanks[team.Tm?.toLowerCase()?.trim()] ??
                teams.indexOf(team) + 1
              }
              isExpanded={expandedCards.other === teams.indexOf(team) + 1}
              onExpand={() => handleExpand(teams.indexOf(team) + 1, "other")}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default Standings;
