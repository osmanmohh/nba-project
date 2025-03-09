import "./PlayoffCard.css";
import { teamColors } from "../../public/teamColors";
import { useState } from "react";

function PlayoffCard({
  team1Abbr,
  team1Name,
  rank1,
  team2Abbr,
  team2Name,
  rank2,
  winner,
  gamesPlayed,
  gameScores, // Array of game scores from CSV
  finalTeam1Points,
  finalTeam2Points,
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpand = () => {
    setIsExpanded((prev) => !prev);
  };

  return (
    <div
      className={`playoff-card-container ${isExpanded ? "expanded" : ""}`}
      onClick={toggleExpand} // Click to expand or collapse
    >
      <div className="series-result">
        {winner.toUpperCase()} wins series 4-{gamesPlayed - 4}
      </div>
      <div className="matchup-container">
        {[
          { abbr: team1Abbr, name: team1Name, rank: rank1 },
          { abbr: team2Abbr, name: team2Name, rank: rank2 },
        ].map(({ abbr, name, rank }) => (
          <div
            key={abbr}
            className="team-container"
            style={abbr !== winner ? { color: "#A1A2A3" } : {}}
          >
            <img src={`logos/${abbr}.png`} className="team-logo" />
            <div className="rank">{rank}</div>
            {name.split(" ").pop()}
            <div className="team-score">
              {abbr === team1Abbr ? finalTeam1Points : finalTeam2Points}
            </div>
            {abbr === winner && <div className="triangle"></div>}
          </div>
        ))}
      </div>

      {/* Expandable Content: Show Only Played Games */}
      <div className="expanded-content-playoffs">
        {isExpanded && (
          <div className="expanded-text-playoffs">
            {gameScores
              .slice(0, gamesPlayed) // Only show games that happened
              .map(([team1Pts, team2Pts], index) => (
                <div key={index}>
                  Game {index + 1}:{" "}
                  <span
                    style={{
                      fontWeight: team1Pts > team2Pts ? "500" : "",
                    }}
                  >
                    {team1Abbr.toUpperCase()} {team1Pts}
                  </span>
                  -
                  <span
                    style={{
                      fontWeight: team2Pts > team1Pts ? "500" : "",
                    }}
                  >
                    {team2Abbr.toUpperCase()} {team2Pts}
                  </span>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default PlayoffCard;
