import { useEffect, useState } from "react";
import { teamColors } from "../../../public/teamColors";
import Papa from "papaparse"; // CSV parser
import "./PlayerGamesSection.css";

export default function PlayerGamesSection({ player }) {
  const [games, setGames] = useState([]);

  useEffect(() => {
    // Load games.csv
    fetch("/combined_game_logs.csv") // Update with actual path
      .then((response) => response.text())
      .then((csvText) => {
        Papa.parse(csvText, {
          header: true,
          skipEmptyLines: true,
          dynamicTyping: true,
          complete: (result) => {
            // Sort by date (most recent first)
            const sortedGames = result.data.sort(
              (a, b) => new Date(b.Date) - new Date(a.Date)
            );
            setGames(sortedGames);
          },
        });
      })
      .catch((error) => console.error("Error loading games.csv:", error));
  }, []);

  const teamColor = teamColors[player.Team] || {
    primary: "#909090",
    secondary: "#909090",
  };

  if (games.length === 0) {
    return <div>Loading...</div>;
  }

  // Latest performance (most recent game)
  const latestGame = games[0];

  // Last 5 games (excluding the latest game)
  const recentGames = games.slice(1, 7);

  return (
    <div className="games-section">
      {/* Latest Performance */}
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
              <span>{latestGame.Date}</span>
              <span className="opp-container latest">
                vs
                <img
                  src={`/logos/${latestGame.Opponent.toLowerCase()}.png`}
                  className="latest-team-logo"
                />
                {latestGame.Opponent.toUpperCase()}
              </span>
              <span className="latest-result-container">
              <span className={`latest-result ${latestGame.Result.slice(0, 1)}`}>
              {latestGame.Result.split(" ")[0]} {/* Extract W/L only */}
                </span>{" "}
                {latestGame.Result.split(" ")[1]}
              </span>
            </div>
          </div>
        </div>
        <div className="player-stats-grid latest">
          {[
            { label: "FG", value: latestGame["FG"], className: "fg" },
            { label: "FGA", value: latestGame["FGA"], className: "fga" },
            {
              label: "FG%",
              value: latestGame["FG%"]
                ? `${latestGame["FG%"].toFixed(2) * 100}%`
                : "-",
              className: "fg-percent",
            },
            {
              label: "3P",
              value: latestGame["3P"],
              className: "three-point-made",
            },
            {
              label: "3PA",
              value: latestGame["3PA"],
              className: "three-point-attempted",
            },
            {
              label: "3P%",
              value: latestGame["3P%"]
                ? `${latestGame["3P%"].toFixed(2) * 100}%`
                : "-",
              className: "three-point-percent",
            },
            { label: "FT", value: latestGame["FT"], className: "free-throws" },
            {
              label: "FTA",
              value: latestGame["FTA"],
              className: "free-throw-attempts",
            },
            {
              label: "FT%",
              value: latestGame["FT%"]
                ? `${latestGame["FT%"].toFixed(2) * 100}%`
                : "-",
              className: "free-throw-percent",
            },
            {
              label: "ORB",
              value: latestGame["ORB"],
              className: "offensive-rebounds",
            },
            {
              label: "DRB",
              value: latestGame["DRB"],
              className: "defensive-rebounds",
            },
            {
              label: "TRB",
              value: latestGame["TRB"],
              className: "total-rebounds",
            },
            { label: "AST", value: latestGame["AST"], className: "assists" },
          ].map((stat) => (
            <div className={`detail ${stat.className}`} key={stat.label}>
              <div className="detail-value">{stat.value || "-"}</div>
              <div className="detail-label">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Games */}
      <div className="latest-game-stats-container games">
        <h1>Games</h1>
        <div className="games-container">
          {recentGames.map((game, index) => (
            <div className="game" key={index}>
              <div className="game-detail">
                <div className="game-header">{game.Date}</div>
                <div className="game-data">
                  <div className="opp-container">
                    vs
                    <img
                      src={`/logos/${game.Opponent.toLowerCase()}.png`}
                      className="latest-team-logo"
                    />
                    {game.Opponent.toUpperCase()}
                  </div>
                </div>
              </div>
              <div className="game-detail">
                <div className="game-data">
                  <span className={`latest-result ${game.Result.slice(0, 1)}`}>
                    {game.Result.split(" ")[0]} {/* Extract W/L only */}
                  </span>{" "}
                  {game.Result.split(" ")[1]}
                </div>
              </div>
              <div className="game-detail stats">
                <div className="game-header stats">
                  <span>PTS</span> <span>REB</span> <span>AST</span>{" "}
                  <span>FG%</span>
                </div>
                <div className="game-data stats">
                  <span>{game.PTS}</span> <span>{game.TRB}</span>
                  <span>{game.AST}</span>{" "}
                  <span>{game["FG%"].toFixed(1) * 100}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
