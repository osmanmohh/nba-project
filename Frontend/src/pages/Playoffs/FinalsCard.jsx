import "./FinalsCard.css";
import { teamColors } from "../../../public/teamColors";
import { getLogo } from "../../../public/getLogo";
import { useState } from "react";
function FinalsCard({
  team1Abbr,
  team1Name,
  rank1,
  team1Points,
  team2Abbr,
  team2Name,
  rank2,
  winner,
  gamesPlayed,
  team2Points,
  gameScores,
}) {
  // Get team colors (default to gray if team is unknown)
  const teamColor = teamColors[winner.toLowerCase()] || { primary: "#808080" };
  const [isExpanded, setIsExpanded] = useState(false);
  const toggleExpand = () => {
    setIsExpanded((prev) => !prev);
  };

  return (
    <div
      className={`playoff-card-container finals ${isExpanded ? "expanded-finals" : ""}`}
      onClick={toggleExpand}
    >
      <div className="title-container-finals">
        <div className="title">
          <h3>Championship</h3>
        </div>
        <div className="finals-result">
          {winner.toUpperCase()} wins series 4-{gamesPlayed - 4}
        </div>
      </div>

      <div className="matchup-container-finals">
        <div
          className="team-container-finals team1"
          style={team1Abbr !== winner ? { color: "gray" } : {}}
        >
          <img src={getLogo(team1Abbr)} className="team-logo finals" />
          <div>
            <div className="finals-score">
              {team1Abbr === winner && <div className="triangle-finals"></div>}
              {team1Points}
            </div>

            <div className="info-container">
              <div className="rank finals">{rank1} </div>
              {team1Abbr.toUpperCase()}
            </div>
          </div>
        </div>
        <div>Final</div>
        <div
          className="team-container-finals team2"
          style={team2Abbr !== winner ? { color: "gray" } : {}}
        >
          <div>
            <div className="finals-score">
              {team2Abbr === winner && <div className="triangle-finals"></div>}
              {team2Points}
            </div>

            <div className="info-container">
              <div className="rank finals">{rank2} </div>
              {team2Abbr.toUpperCase()}
            </div>
          </div>
          <img src={getLogo(team2Abbr)} className="team-logo finals" />
        </div>
        
      </div>
      <div className="expanded-content-finals">
        {isExpanded && (
          <div className="expanded-text-finals">
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

      <div className="line left"></div>
      <div className="line middle"></div>
      <div className="line right"></div>
      <svg class="banner-container" viewBox="0 0 180 250">
        <rect
          x="5"
          y="5"
          width="170"
          height="20"
          rx="10"
          fill={teamColor.primary}
          stroke="black"
          stroke-width="4"
        />

        <path
          d="M10,25 
       h160 
       v180 
       l-80,40 
       l-80,-40 
       v-180 
       z"
          fill={teamColor.primary}
          stroke="black"
          stroke-width="4"
        />
      </svg>

      <div class="banner-text">
        <div class="year">2024-25</div>
        <img
          src={getLogo(team1Abbr ? winner : team2Abbr)}
          className="finals-logo"
        />
        <div class="finals-title">WORLD CHAMPIONS</div>
      </div>
      
    </div>
  );
}

export default FinalsCard;
