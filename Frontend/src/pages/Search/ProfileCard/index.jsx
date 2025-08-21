import PlayerViewToggle from "../../../components/PlayerViewToggle";
import { getLogo } from "../../../utils/getLogo";

export default function ProfileCard({
  type,
  team,
  player,
  teamColor,
  handleViewChange,
}) {
  const isPlayer = type === "player";

  const headshotSrc = isPlayer
    ? (player?.headshot ?? "blank.png")
    : "blank.png";
  const teamLogo = getLogo(team?.Tm ?? player?.teamAbbr);

  const teamAbbr = isPlayer ? player?.teamAbbr : team?.Tm;

  const name = isPlayer
    ? (player?.name ?? "Unknown Player")
    : (team?.Team ?? "Unknown Team");

  const position = isPlayer
    ? `${player?.team ?? "No Team"} | ${
        player?.pos
          ? player.pos === "Center"
            ? "Forward"
            : player.pos.split(" ").pop()
          : "Unknown"
      }`
    : team?.W != null && team?.L != null && team?.Rk != null
      ? `${team.W}-${team.L} | ${team.Rk}${getOrdinal(team.Rk)} in ${
          team.Conf === "W" ? "Western" : "Eastern"
        } Conference`
      : "Team info not available";

  const displayName = isPlayer
    ? name
        .toUpperCase()
        .split(" ")
        .map((part, i) => <div key={i}>{part}</div>)
    : name.toUpperCase();

  return (
    <div className="player-profile">
      <div className="team-logo-large-container">
        <img
          className="team-logo-large tm"
          src={teamLogo}
          alt={teamAbbr ?? "Team Logo"}
        />
      </div>

      <div className="profile-headshot-container">
        {isPlayer ? (
          <img
            className="profile-headshot"
            src={headshotSrc}
            onError={(e) => (e.target.src = "blank.png")}
            alt="Headshot"
          />
        ) : (
          <img
            className="profile-headshot team"
            src={teamLogo}
            alt={teamAbbr ?? "Team Logo"}
          />
        )}
      </div>

      {isPlayer && (
        <img
          className="team-logo-small"
          src={teamLogo}
          alt={teamAbbr ?? "Team Logo"}
        />
      )}

      <div className="player-info">
        <div className="profile-info-container">
          <div className="team-position">{position}</div>
          <div className="profile-name">{displayName}</div>
        </div>
        <PlayerViewToggle
          onViewChange={handleViewChange}
          teamColor={teamColor}
        />
      </div>
    </div>
  );
}

// Helper
function getOrdinal(rank) {
  if (!rank) return "";
  const mod10 = rank % 10;
  const mod100 = rank % 100;
  if (mod10 === 1 && mod100 !== 11) return "st";
  if (mod10 === 2 && mod100 !== 12) return "nd";
  if (mod10 === 3 && mod100 !== 13) return "rd";
  return "th";
}
