import "./AllNBACard.css";
import { teamColors } from "../../public/teamColors";
import players from "/players_2024"; // ✅ Corrected import path

function AllNBACard({ playerId, rank }) {
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


  return (
    <div className="all-nba-player-container">
      <div className="photo-container">
        <img
          className="all-nba-image"
          src={`headshots/${numericPlayerId}.png`}
          alt={player.Name}
        />
      </div>

      <div className="all-nba-info">
        <div className="name">{player.Name}</div>
        <div className="team">{player.Pos} • {player.Team}</div>
      </div>
    </div>
  );
}

export default AllNBACard;
