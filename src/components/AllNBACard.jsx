import "./AllNBACard.css";
import { teamColors } from "../../public/teamColors";
import players from "/players_2024"; // ✅ Corrected import path
import { useNavigate } from "react-router-dom"; // ✅ Import navigation hook

function AllNBACard({ playerId, rank }) {
  const navigate = useNavigate(); // ✅ Initialize navigation

  // Convert playerId to integer for comparison
  const numericPlayerId = parseInt(playerId, 10);

  // Find the player in the dataset (handles float Player_ID)
  const player = players.find(
    (p) => Math.round(p.Player_ID) === numericPlayerId
  );

  // Handle case where player is not found
  if (!player) {
    return <div className="player-card-container">Player not found</div>;
  }

  // ✅ Function to navigate to the player search page
  const handleClick = () => {
    window.open(`/search/${encodeURIComponent(player.Name)}`);
  };

  return (
    <div className="all-nba-player-container" onClick={handleClick}>
      <div className="photo-container">
        <img
          className="all-nba-image"
          src={`headshots/${numericPlayerId}.png`}
          alt={player.Name}
        />
      </div>

      <div className="all-nba-info">
        <div className="name-team">
          <div className="name">{player.Name}</div>
          <div className="team">
            {player.Pos} • {player.Team}
          </div>
        </div>
        <div className="all-nba-stats">
          <div className="all-nba-stat-item">
            <div className="all-nba-stat-label">PPG</div>
            <div className="all-nba-stat-value">{player.PTS}</div>
          </div>
          <div
            className="all-nba-stat-item"
            style={{ borderLeft: "1px solid", borderRight: "1px solid" }}
          >
            <div className="all-nba-stat-label">RPG</div>
            <div className="all-nba-stat-value">{player.REB}</div>
          </div>
          <div className="all-nba-stat-item">
            <div className="all-nba-stat-label">APG</div>
            <div className="all-nba-stat-value">{player.AST}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AllNBACard;
