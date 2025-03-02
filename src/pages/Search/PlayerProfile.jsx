export default function PlayerProfile({ player }) {
  return (
    <div className="player-profile">
      <img
        className="player-headshot"
        src={`headshots/${player["Player_ID"]}.png`}
        onError={(e) => (e.target.src = "headshots/blank.png")}
        alt="Player Headshot"
      />
      <img className="team-logo-small" src={`logos/${player["Tm"]}.png`} alt={player["Tm"]} />
      <img className="team-logo-large" src={`logos/${player["Tm"]}.png`} alt={player["Tm"]} />
      <div className="player-info">
        <div className="team-position">
          {player["Team"]} | {"SG,PG".includes(player["Pos"]) ? "Guard" : "Forward"}
        </div>
        <div className="player-name">{player["Name"].toUpperCase()}</div>
      </div>
    </div>
  );
}
