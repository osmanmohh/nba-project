import { teamColors } from "../../../public/teamColors";
import "./PlayerGamesSection.css";
export default function PlayerGamesSection({ player }) {
  const teamColor = teamColors[player.Tm] || {
    primary: "#909090",
    secondary: "#909090",
  };
  return (
    <div className="games-section">
      <div className="latest-game-stats-container">
        <h1>Latest Performance</h1>
        <div className="latest-game-info">
          <img
            src={`/headshots/${player.Player_ID}.png`}
            className="player-photo"
          ></img>
          <div>
            <div className="latest-player-name">{player.Name}</div>
            <div className="latest-game-details">
              <span>Mar 10</span>
              <span className="opp-container latest">
                {" "}
                vs{" "}
                <img
                  src={`/logos/${player.Tm}.png`}
                  className="latest-team-logo"
                />{" "}
                {player.Tm.toUpperCase()}
              </span>
              <span className="latest-result-container">
                <span className="latest-result">L</span> 112-120
              </span>
            </div>
          </div>
        </div>
        <div className="player-stats-grid latest">
          {[
            { label: "PPG", value: player["PTS"], className: "ppg" },
            { label: "RPG", value: player["REB"], className: "rpg" },
            { label: "APG", value: player["AST"], className: "apg" },
            { label: "SPG", value: player["STL"], className: "spg" },
            { label: "BPG", value: player["BLK"], className: "bpg" },
            { label: "MPG", value: player["MP"], className: "mpg" },
            {
              label: "FG%",
              value: `${(parseFloat(player["FG%"]) * 100).toFixed(1)}%`,
              className: "fg",
            },
            {
              label: "3P%",
              value: `${(parseFloat(player["3P%"]) * 100).toFixed(1)}%`,
              className: "three-point",
            },
            { label: "3PA", value: player["3PA"], className: "threePA" },

            {
              label: "FT%",
              value: `${(parseFloat(player["FT%"]) * 100).toFixed(1)}%`,
              className: "three-point",
            },
            { label: "FTA", value: player["FTA"], className: "fta" },

            { label: "TOV", value: player["TOV"], className: "tov" },
            { label: "PF", value: player["PF"], className: "pf" },
          ].map((item) => (
            <div className={`detail ${item.className}`} key={item.label}>
              <div className="detail-value">{item.value || "-"}</div>
              <div className="detail-label">{item.label}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="latest-game-stats-container games">
        <h1>Games</h1>
        <div className="games-container">
          <div className="game">
            <div className="game-detail">
              <div className="game-header"><span>Next</span></div>
              <div className="game-data">
                <div className="opp-container">
                  vs
                  <img src={`/logos/sac.png`} className="latest-team-logo" />
                  SAC
                </div>
              </div>
            </div>
            <div className="game-detail">
              <div className="game-header">Career</div>
              <div className="game-header">vs SAC</div>
            </div>
            <div className="game-detail stats">
              <div className="game-header stats">
                <span>G</span>
                <span>PPG</span> <span>RPG</span> <span>APG</span>
              </div>
              <div className="game-data stats">
                <span>{player["G"]}</span> <span>{player.PTS}</span>
                <span>{player.REB}</span> <span>{player.AST}</span>
              </div>
            </div>
          </div>
          <div className="game">
            <div className="game-detail">
              <div className="game-header">Sat, Mar 10</div>
              <div className="game-data">
                <div className="opp-container">
                  vs
                  <img src={`/logos/por.png`} className="latest-team-logo" />
                  POR
                </div>
              </div>
            </div>
            <div className="game-detail">
              <div className="game-header"></div>
              <div className="game-data">
                <span className="latest-result">L</span> 112-120
              </div>
            </div>
            <div className="game-detail stats">
              <div className="game-header stats">
                <span>PTS</span> <span>REB</span> <span>AST</span>{" "}
                <span>FG%</span>
              </div>
              <div className="game-data stats">
                <span>{player.PTS}</span> <span>{player.REB}</span>{" "}
                <span>{player.AST}</span> <span>{player["FG%"] * 100}%</span>
              </div>
            </div>
          </div>
          <div className="game">
            <div className="game-detail">
              <div className="game-header">Sat, Mar 10</div>
              <div className="game-data">
                <div className="opp-container">
                  vs
                  <img src={`/logos/det.png`} className="latest-team-logo" />
                  DET
                </div>
              </div>
            </div>
            <div className="game-detail">
              <div className="game-header"></div>
              <div className="game-data">
                <span className="latest-result">L</span> 112-120
              </div>
            </div>
            <div className="game-detail stats">
              <div className="game-header stats">
                <span>PTS</span> <span>REB</span> <span>AST</span>{" "}
                <span>FG%</span>
              </div>
              <div className="game-data stats">
                <span>{player.PTS}</span> <span>{player.REB}</span>{" "}
                <span>{player.AST}</span> <span>{player["FG%"] * 100}%</span>
              </div>
            </div>
          </div>
          <div className="game">
            <div className="game-detail">
              <div className="game-header">Sat, Mar 10</div>
              <div className="game-data">
                <div className="opp-container">
                  vs
                  <img src={`/logos/bkn.png`} className="latest-team-logo" />
                  BKN
                </div>
              </div>
            </div>
            <div className="game-detail">
              <div className="game-header"></div>
              <div className="game-data">
                <span className="latest-result">L</span> 112-120
              </div>
            </div>
            <div className="game-detail stats">
              <div className="game-header stats">
                <span>PTS</span> <span>REB</span> <span>AST</span>{" "}
                <span>FG%</span>
              </div>
              <div className="game-data stats">
                <span>{player.PTS}</span> <span>{player.REB}</span>{" "}
                <span>{player.AST}</span> <span>{player["FG%"] * 100}%</span>
              </div>
            </div>
          </div>
          <div className="game">
            <div className="game-detail">
              <div className="game-header">Sat, Mar 10</div>
              <div className="game-data">
                <div className="opp-container">
                  vs
                  <img src={`/logos/nyk.png`} className="latest-team-logo" />
                  NYK
                </div>
              </div>
            </div>
            <div className="game-detail">
              <div className="game-header"></div>
              <div className="game-data">
                <span className="latest-result">L</span> 112-120
              </div>
            </div>
            <div className="game-detail stats">
              <div className="game-header stats">
                <span>PTS</span> <span>REB</span> <span>AST</span>{" "}
                <span>FG%</span>
              </div>
              <div className="game-data stats">
                <span>{player.PTS}</span> <span>{player.REB}</span>{" "}
                <span>{player.AST}</span> <span>{player["FG%"] * 100}%</span>
              </div>
            </div>
          </div>
          <div className="game">
            <div className="game-detail">
              <div className="game-header">Sat, Mar 10</div>
              <div className="game-data">
                <div className="opp-container">
                  vs
                  <img src={`/logos/cha.png`} className="latest-team-logo" />
                  CHA
                </div>
              </div>
            </div>
            <div className="game-detail">
              <div className="game-header"></div>
              <div className="game-data">
                <span className="latest-result">L</span> 112-120
              </div>
            </div>
            <div className="game-detail stats">
              <div className="game-header stats">
                <span>PTS</span> <span>REB</span> <span>AST</span>{" "}
                <span>FG%</span>
              </div>
              <div className="game-data stats">
                <span>{player.PTS}</span> <span>{player.REB}</span>{" "}
                <span>{player.AST}</span> <span>{player["FG%"] * 100}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
