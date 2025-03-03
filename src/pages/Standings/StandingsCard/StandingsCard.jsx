import "./StandingsCard.css";
import { teamColors } from "../../../../public/teamColors";

function StandingsCard({ team, predictedRank, isExpanded, onExpand }) {
  if (!team) return null; // Prevents errors if data is missing

  const { tm, rank, wins, losses, ortg, drtg, nrtg, predicted_win_loss_percentage } = team;

  // Get team colors (default to gray if team is unknown)
  const teamColor = teamColors[tm] || { primary: "#808080" };

  // Round predicted win/loss percentage to an integer (e.g., 78% instead of 0.78)
  const roundedWinLossPercentage = Math.round(predicted_win_loss_percentage * 100);

  // Determine movement indicator based on predicted rank
  let movement = "";
  if (predictedRank < rank) movement = "↑"; // Moving up
  else if (predictedRank > rank) movement = "↓"; // Moving down

  return (
    <div
      className={`standings-card-container ${isExpanded ? "expanded" : ""}`}
      onClick={onExpand} // Controlled by parent component
    >
      <div className="standings-rank">
        {rank}{" "}
        <span className={`predicted-rank ${movement === "↑" ? "up" : movement === "↓" ? "down" : ""}`}>
          ( {predictedRank} {movement})
        </span>
      </div>

      <div className="info" style={{ backgroundColor: teamColor.primary }}>
        {isExpanded && <p className="abbr">{tm.toUpperCase()}</p>}

        <div className="expanded-content">
          {isExpanded && (
            <div className="expanded-text">
              <div>Win/Loss %: {predicted_win_loss_percentage}%</div>
              <div>Offensive Rating: {ortg}</div>
              <div>Defensive Rating: {drtg}</div>
              <div>Net Rating: {nrtg}</div>
              <div>Predicted 2025 rank: {predictedRank}</div>
              <div>True Shooting %: -</div>
            </div>
          )}
        </div>

        <div className="logo-container">
          <img
            src={`logos/${tm.toLowerCase()}.png`}
            className="logo"
            alt={`${tm} logo`}
          />
        </div>

        {/* Wins/Losses disappear when expanded */}
        {!isExpanded && <div className="team-record">{wins}-{losses}</div>}
      </div>
    </div>
  );
}

export default StandingsCard;
