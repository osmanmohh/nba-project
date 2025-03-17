import "./PlayerCard.css";
import { teamColors } from "../../public/teamColors";
import players from "/players_2024"; // ✅ Corrected import path
import { useNavigate } from "react-router-dom"; // ✅ Import navigation hook

function PlayerCard({ playerId, rank }) {
  const navigate = useNavigate(); // ✅ Initialize navigation

  // Convert playerId to integer for comparison
  const numericPlayerId = parseInt(playerId, 10);

  // Find the player in the dataset
  const player = players.find(
    (p) => Math.round(p.Player_ID) === numericPlayerId
  );

  // Handle case where player is not found
  if (!player) {
    return <div className="player-card-container">Player not found</div>;
  }

  // Split the name safely
  const nameParts = player.Name.split(" ");
  const firstName = nameParts[0]?.toUpperCase() || "";
  const lastName = nameParts[1]?.toUpperCase() || "";

  // Get team colors
  const teamColor = teamColors[player.Tm] || {
    primary: "#808080",
    secondary: "#606060",
  };

  // ✅ Function to navigate to the player search page
  const handleClick = () => {
    window.open(`/search/${encodeURIComponent(player.Name)}`);
  };

  return (
    <div className="player-card-container" onClick={handleClick} style={{
      "--team-color": teamColor.primary, // Pass team color as a CSS variable
    }}>
      <div
        className="player-rank"
        style={{ backgroundColor: teamColor.secondary }}
      >
        {rank}
      </div>
      <div
        className="player-card-info"
        style={{ backgroundColor: teamColor.primary }}
      >
        <div className="player-name">
          <div className="first-name">{firstName}</div>
          <div className="last-name">{lastName}</div>
        </div>
        <div className="img-container">
          <img
            src={`logos/${player.Tm.toLowerCase()}.png`}
            className="player-team-logo"
            alt={`${player.Tm} logo`}
          />
          <img
            className="player-image"
            src={`headshots/${numericPlayerId}.png`}
            alt={player.Name}
          />
        </div>
      </div>
      <div
        className="award-stats"
        style={{ backgroundColor: teamColor.primary }}
      >
        <div className="award-stat-item">
          <div className="award-stat-label">PPG</div>
          <div className="award-stat-value">{player.PTS}</div>
        </div>
        <div className="award-stat-item" style={{ borderLeft: "1px solid", borderRight: "1px solid" }}>
          <div className="award-stat-label">RPG</div>
          <div className="award-stat-value">{player.REB}</div>
        </div>
        <div className="award-stat-item">
          <div className="award-stat-label">APG</div>
          <div className="award-stat-value">{player.AST}</div>
        </div>
      </div>
    </div>
  );
}

export default PlayerCard;
