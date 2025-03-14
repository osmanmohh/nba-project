import TeamInfo from "./TeamInfo";
import players from "/all_players.json";
import teams from "/teams.json";

export default function team({ team }) {
  return (
    <div>
      <div></div>
      <div className="player-profile">
        <img
          className="player-headshot"
          src={`/logos/${team["Tm"]}.png`} // ✅ Absolute Path
          onError={(e) => (e.target.src = "/headshots/blank.png")} // ✅ Absolute Path for fallback
          alt="Player Headshot"
        />
        <img
          className="team-logo-large"
          src={`/logos/${team["Tm"]}.png`}
          alt={team["Tm"]}
        />
        <div className="player-info">
          <div className="team-position">
            {/* {player["Team"]} | {"SG,PG".includes(player["Pos"]) ? "Guard" : "Forward"} */}
          </div>
          <div className="player-name">{team["Team"].toUpperCase()}</div>
        </div>
      </div>

     
    </div>
  );
}
