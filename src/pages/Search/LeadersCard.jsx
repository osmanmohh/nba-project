import "./LeadersCard.css";
import { teamColors } from "../../../public/teamColors";

export default function LeadersCard({ players, statCategory }) {
  const getLastName = (name) => name.split(" ").slice(-1)[0];

  if (statCategory) {
    const topPlayers = [...players]
      .sort((a, b) => b[statCategory] - a[statCategory])
      .slice(0, 3);

    return (
      <div
        className="leaders-card"
        style={{
          backgroundColor: teamColors[topPlayers[0]?.Tm]?.primary || "#909090",
        }}
      >
        <div className="player-container">
          {topPlayers.map((player, index) => (
            <div
              className={`leader-card-container player-${index + 1}`}
              key={index}
            >
              <div className="leader">
                <div className="leader-label">{statCategory}</div>
                <div className="leader-value">
                  {player[statCategory] || "-"}
                </div>
                <div className="leader-player">{getLastName(player.Name)}</div>
              </div>
              <div
                className={`leader-headshot-container headshot-${index + 1}`}
              >
                <img
                  src={`/headshots/${player.Player_ID}.png`}
                  alt={player.Name}
                  className={`leader-headshot headshot-${index + 1}`}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  } else {
    const topPPG = [...players].sort((a, b) => b.PTS - a.PTS)[0];
    const topRPG = [...players].sort((a, b) => b.REB - a.REB)[0];
    const topAPG = [...players].sort((a, b) => b.AST - a.AST)[0];

    return (
      <div
        className="leaders-card"
        style={{
          backgroundColor: teamColors[players[0]?.Tm]?.primary || "#909090",
        }}
      >
        <div className="leaders-title">Team Leaders</div>
        <div className="player-container">
          {[
            { label: "PPG", player: topPPG, stat: "PTS" },
            { label: "RPG", player: topRPG, stat: "REB" },
            { label: "APG", player: topAPG, stat: "AST" },
          ].map((item, index) => (
            <div
              className={`leader-card-container player-${index + 1}`}
              key={index}
            >
              <div className="leader">
                <div className="leader-label">{item.label}</div>
                <div className="leader-value">
                  {item.player[item.stat] || "-"}
                </div>
                <div className="leader-player">
                  {getLastName(item.player.Name)}
                </div>
              </div>
              <div
                className={`leader-headshot-container headshot-${index + 1}`}
              >
                <img
                  src={`/headshots/${item.player.Player_ID}.png`}
                  alt={item.player.Name}
                  className={`leader-headshot headshot-${index + 1}`}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
}
