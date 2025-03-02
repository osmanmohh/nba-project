import "./StandingsCard.css";
import { teamColors } from "../../../../public/teamColors";
function StandingsCard({ abbr, rank, wins, losses }) {
  // Get team colors (default to gray if team is unknown)
  const teamColor = teamColors[abbr] || { primary: "#808080" };

  return (
    <div className="standings-card-container">
      <div className="standings-rank">{rank}</div>
      <div className="info" style={{ backgroundColor: teamColor.primary }}>
        <div className="logo-container">
          <img
            src={`logos/${abbr.toLowerCase()}.png`}
            className="logo"
            alt={`${abbr} logo`}
          />
        </div>
        <div className="team-record">
          {wins}-{losses}
        </div>
      </div>
    </div>
  );
}

export default StandingsCard;
