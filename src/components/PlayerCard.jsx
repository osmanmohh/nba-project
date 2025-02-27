import "./PlayerCard.css";
import { teamColors } from "../../public/teamColors";
import players from "/players_2024"; // ✅ Corrected import path

function PlayerCard({ playerId, rank }) {


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

  // Split the name safely (handles players with a single name)
  const nameParts = player.Name.split(" ");
  const firstName = nameParts[0]?.toUpperCase() || "";
  const lastName = nameParts[1]?.toUpperCase() || "";

  // Get team colors (default to gray if team is unknown)
  const teamColor = teamColors[player.Tm] || {
    primary: "#808080",
    secondary: "#606060",
  };
  console.log("Player:", player.Name, "Team Abbreviation:", player.Tm);

  return (
    <div className="player-card-container">
      <div className="rank" style={{ backgroundColor: teamColor.secondary }}>
        {rank}
      </div>
      <div
        className="player-info"
        style={{ backgroundColor: teamColor.primary }}
      >
        <div className="player-name">
          <div className="first-name">{firstName}</div>
          <div className="last-name">{lastName}</div>
        </div>
        <div className="img-container">
          <img
            src={`logos/${player.Tm.toLowerCase()}.png`}
            className="team-logo"
            alt={`${player.Tm} logo`}
          />
          <img
            className="player-image"
            src={`headshots/${numericPlayerId}.png`}
            alt={player.Name}
          />
        </div>
      </div>
    </div>
  );
}

export default PlayerCard;
