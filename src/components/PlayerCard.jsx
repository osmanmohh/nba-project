import "./PlayerCard.css";
import players from "/players_2024"; // ✅ Corrected import path

function PlayerCard({ playerId, rank }) {
 const teamColors = {
    atl: { primary: "#C8102E", secondary: "#A00E26" },
    bos: { primary: "#007A33", secondary: "#034227" },
    bkn: { primary: "#000000", secondary: "#333333" },
    cha: { primary: "#1D1160", secondary: "#140B42" },
    chi: { primary: "#CE1141", secondary: "#9E0D31" },
    cle: { primary: "#860038", secondary: "#5E0028" },
    dal: { primary: "#00538C", secondary: "#002B5E" },
    den: { primary: "#0E2240", secondary: "#0A162C" },
    det: { primary: "#C8102E", secondary: "#921021" },
    gsw: { primary: "#1D428A", secondary: "#112A60" },
    hou: { primary: "#CE1141", secondary: "#9E0D31" },
    ind: { primary: "#002D62", secondary: "#001A3D" },
    lac: { primary: "#C8102E", secondary: "#9E0D31" },
    lal: { primary: "#552583", secondary: "#3A1957" },
    mem: { primary: "#5D76A9", secondary: "#3A4E75" },
    mia: { primary: "#98002E", secondary: "#69001F" },
    mil: { primary: "#00471B", secondary: "#00300E" },
    min: { primary: "#0C2340", secondary: "#081629" },
    nop: { primary: "#0C2340", secondary: "#081629" },
    nyk: { primary: "#006BB6", secondary: "#00407E" },
    okc: { primary: "#007AC1", secondary: "#005A91" },
    orl: { primary: "#0077C0", secondary: "#005491" },
    phi: { primary: "#006BB6", secondary: "#00407E" },
    phx: { primary: "#1D1160", secondary: "#140B42" },
    por: { primary: "#E03A3E", secondary: "#A0282C" },
    sac: { primary: "#5A2D81", secondary: "#3D1E5A" },
    sas: { primary: "#C4CED4", secondary: "#8B969D" },
    tor: { primary: "#CE1141", secondary: "#9E0D31" },
    uta: { primary: "#002B5C", secondary: "#001C3D" },
    was: { primary: "#002B5C", secondary: "#001C3D" },
  };

  // Convert playerId to integer for comparison
  const numericPlayerId = parseInt(playerId, 10);

  // Find the player in the dataset (handles float Player_ID)
  const player = players.find((p) => Math.round(p.Player_ID) === numericPlayerId);

  // Handle case where player is not found
  if (!player) {
    return <div className="player-card-container">Player not found</div>;
  }

  // Split the name safely (handles players with a single name)
  const nameParts = player.Name.split(" ");
  const firstName = nameParts[0]?.toUpperCase() || "";
  const lastName = nameParts[1]?.toUpperCase() || "";

  // Get team colors (default to gray if team is unknown)
  const teamColor = teamColors[player.Tm] || { primary: "#808080", secondary: "#606060" };
  console.log("Player:", player.Name, "Team Abbreviation:", player.Tm);


  return (
    <div className="player-card-container">
      <div className="rank" style={{ backgroundColor: teamColor.secondary }}>
        {rank}
      </div>
      <div className="player-info" style={{ backgroundColor: teamColor.primary }}>
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
