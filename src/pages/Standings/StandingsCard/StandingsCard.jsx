import { useState } from "react";
import "./StandingsCard.css";
import { teamColors } from "../../../../public/teamColors";

function StandingsCard({ abbr, rank, wins, losses }) {
  const [expanded, setExpanded] = useState(false);

  // Get team colors (default to gray if team is unknown)
  const teamColor = teamColors[abbr] || { primary: "#808080" };

  return (
    <div
      className={`standings-card-container ${expanded ? "expanded" : ""}`}
      onClick={() => setExpanded(!expanded)}
    >
      <div className="standings-rank">{rank}</div>
      <div className="info" style={{ backgroundColor: teamColor.primary }}>
        {expanded && <p className="abbr">{abbr.toUpperCase()}</p>}
        <div className="expanded-content">
          {expanded && (
            <div className="expanded-text">
              <p>Win/Loss % : -</p>
              <p>Offensive Rating: -</p>
              <p>Defensive Rating: -</p>
              <p>Net Rating: -</p>
              <p>Pace: -</p>
              <p>True Shooting %: -</p>
            </div>
          )}
        </div>
        <div className="logo-container">
          <img
            src={`logos/${abbr.toLowerCase()}.png`}
            className="logo"
            alt={`${abbr} logo`}
          />
        </div>
        {/* Wins/Losses will disappear when expanded */}
        <div className="team-record">
          {wins}-{losses}
        </div>
      </div>

      {/* Expanded Section */}
    </div>
  );
}

export default StandingsCard;
