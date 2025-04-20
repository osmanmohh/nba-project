import "./StandingsCard.css";
import "../StandingComponent/Standings.css";
import { teamColors } from "../../../../public/teamColors";
import { getLogo } from "../../../../public/getLogo";

function StandingsCard({ rank, team, predictedRank, isExpanded, onExpand }) {
  if (!team) return null; // Prevents errors if data is missing

  const { Tm, W, L, ORtg, DRtg, NRtg } = team;
  const predictedWinLossPercentage = team["W/L%"] || 0; // Ensure it doesn't break if missing

  // Get team colors (default to gray if team is unknown)
  const teamColor = teamColors[Tm.toLowerCase()] || { primary: "#808080" };

  // Round predicted win/loss percentage to an integer (e.g., 78% instead of 0.78)
  const roundedWinLossPercentage = Math.round(predictedWinLossPercentage * 100);

  // Determine movement indicator based on predicted rank
  let movement = "";
  if (predictedRank && predictedRank < rank)
    movement = "↑"; // Moving up
  else if (predictedRank && predictedRank > rank) movement = "↓"; // Moving down

  return (
    <div
      className={`standings-card-container ${isExpanded ? "expanded" : ""}`}
      onClick={onExpand} // Controlled by parent component
    >
      <div className="standings-rank">
        {rank}
        {predictedRank ? (
          <span
            className={`predicted-rank ${movement === "↑" ? "up" : movement === "↓" ? "down" : ""}`}
          >
            ( {predictedRank} {movement})
          </span>
        ) : null}
      </div>

      <div className="info" style={{ backgroundColor: teamColor.primary }}>
        {isExpanded && <p className="abbr">{Tm?.toUpperCase() || "N/A"}</p>}

        <div className="expanded-content">
          {isExpanded && (
            <div className="expanded-text">
              {predictedRank && <div>Projected rank: {predictedRank}{movement}</div>}
              <div>W/L%: {((W / 82) * 100).toFixed(1)}%</div>
              <div>ORTG: {ORtg || "N/A"}</div>
              <div>DRTG: {DRtg || "N/A"}</div>
              <div>NTRG: {NRtg || "N/A"}</div>
            </div>
          )}
        </div>

        <div className="logo-container">
          <img
            src={getLogo(Tm)}
            className="logo"
            alt={`${Tm || "default"} logo`}
          />
        </div>

        {/* Wins/Losses disappear when expanded */}
        {!isExpanded && (
          <div className="team-record">
            {W}-{L}
          </div>
        )}
      </div>
    </div>
  );
}

export default StandingsCard;
