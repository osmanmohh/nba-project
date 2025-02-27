import "./PlayoffCard.css";
import { teamColors } from "../../public/teamColors";

function PlayoffCard({ abbr, rank, wins, losses }) {

  // Get team colors (default to gray if team is unknown)
  const teamColor = teamColors[abbr] || { primary: "#808080" };

  return (
    <div className="playoff-card-container">
      <div className="playoff-rank"  style={{ backgroundColor: teamColor.primary }}>{rank}</div>
      <div className="info" style={{ backgroundColor: teamColor.primary }}>
        <div className="logo-container">
          <img
            src={`logos/${abbr.toLowerCase()}.png`}
            className="playoff-logo"
            alt={`${abbr} logo`}
          />
        </div>
        <div className="team-name">
          {abbr.toUpperCase()}
        </div>
      </div>
    </div>
  );
}

export default PlayoffCard;
