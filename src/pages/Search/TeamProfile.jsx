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
            {team["W"]}-{team["L"]} | {team["Rk"]}
            { // Determine the correct ordinal suffix (st, nd, rd, th)

              ["th", "st", "nd", "rd"][
                ((team["Rk"] % 100) - 11) % 10 === 0 ||
                (team["Rk"] % 100) - 12 === 0 ||
                (team["Rk"] % 100) - 13 === 0
                  ? 0
                  : team["Rk"] % 10 < 4
                    ? team["Rk"] % 10
                    : 0
              ]
            }{" "}
            in {team["Conf"] === "W" ? "Western" : "Eastern"} Conference
          </div>
          <div className="profile-name">{team["Team"].toUpperCase()}</div>
        </div>
      </div>
    </div>
  );
}
