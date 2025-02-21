import "./PlayerCard.css";
import players from "/players_2024"; // ✅ Corrected import path

function PlayerCard({ playerId, rank }) {
  const teamColors = {
    atl: { primary: "#B00E26", secondary: "#800C1D" },
    bos: { primary: "#00662B", secondary: "#02361E" },
    bkn: { primary: "#000000", secondary: "#1A1A1A" },
    cha: { primary: "#190E50", secondary: "#100838" },
    chi: { primary: "#B00E38", secondary: "#7E0B29" },
    cle: { primary: "#750032", secondary: "#4D0020" },
    dal: { primary: "#00477B", secondary: "#00224A" },
    den: { primary: "#0B1D36", secondary: "#081428" },
    det: { primary: "#B00E26", secondary: "#7E0B1A" },
    gsw: { primary: "#192C6A", secondary: "#0D1E48" },
    hou: { primary: "#B00E26", secondary: "#7E0B1A" },
    ind: { primary: "#00254F", secondary: "#00122F" },
    lac: { primary: "#B00E26", secondary: "#7E0B1A" },
    lal: { primary: "#4A1F73", secondary: "#2D0E4A" },
    mem: { primary: "#4E6794", secondary: "#2D3E5E" },
    mia: { primary: "#840028", secondary: "#55001A" },
    mil: { primary: "#003E18", secondary: "#00260C" },
    min: { primary: "#081C36", secondary: "#050F21" },
    nop: { primary: "#081C36", secondary: "#050F21" },
    nyk: { primary: "#005B9E", secondary: "#003666" },
    okc: { primary: "#006AAE", secondary: "#004A7E" },
    orl: { primary: "#0067A6", secondary: "#004274" },
    phi: { primary: "#005B9E", secondary: "#003666" },
    phx: { primary: "#190E50", secondary: "#100838" },
    por: { primary: "#C03134", secondary: "#8C1E20" },
    sac: { primary: "#4A2673", secondary: "#2E184A" },
    sas: { primary: "#A5ADB4", secondary: "#727C82" },
    tor: { primary: "#B00E26", secondary: "#7E0B1A" },
    uta: { primary: "#00224C", secondary: "#00122A" },
    was: { primary: "#00224C", secondary: "#00122A" },
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
