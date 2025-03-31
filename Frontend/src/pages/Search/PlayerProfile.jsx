export default function PlayerProfile({ newPlayer}) {


  return (
    <div className="player-profile">
      <img
        className="player-headshot"
        src={newPlayer.headshot} // ✅ Absolute Path
        onError={(e) => (e.target.src = "/headshots/blank.png")} // ✅ Absolute Path for fallback
        alt="Player Headshot"
      />
      <img
        className="team-logo-small"
        src={newPlayer.logo}
        alt={newPlayer.tm}
      />
      <img
        className="team-logo-large"
        src={newPlayer.logo}
        alt={newPlayer.tm}
      />
      <div className="player-info">
        <div className="team-position">
          {newPlayer?.team} |{" "}
          {newPlayer?.pos === "Center"
            ? "Forward"
            : newPlayer?.pos?.split(" ")?.pop() || ""}
        </div>
        <div className="profile-name">{newPlayer.name.toUpperCase() || ""}</div>
      </div>
    </div>
  );
}
