import { useEffect, useState } from "react";
import { teamColors } from "../../../public/teamColors";
import { getLogo } from "../../../public/getLogo";
import "./PlayerGamesSection.css";

export default function PlayerGamesSection({ newPlayer, games }) {
  const [latestGame, setLatestGame] = useState(null);
  const [recentGames, setRecentGames] = useState([]);

  useEffect(() => {
    if (games.length > 0) {
      setLatestGame(games[0]);
      setRecentGames(games.slice(1, 6));
    }
  }, [games]);

  if (!latestGame || !newPlayer) return <div>Loading...</div>;

  const teamColor = teamColors[newPlayer.team] || {
    primary: "#909090",
    secondary: "#909090",
  };

  const formatDate = (date) => new Date(date).toLocaleDateString();

  const renderLogo = (abbr) =>
    getLogo(abbr) ? (
      <img
        src={getLogo(abbr)}
        className="latest-team-logo"
        alt={`${abbr} logo`}
        onError={(e) => (e.target.style.display = "none")}
      />
    ) : (
      " "
    );

  const statBlocks = [
    { label: "MIN", value: latestGame.Minutes?.split(":")[0] },
    { label: "PTS", value: latestGame.Points },
    { label: "REB", value: latestGame.Rebounds },
    { label: "AST", value: latestGame.Assists },
    {
      label: "FG%",
      value: latestGame["FG%"] ? (latestGame["FG%"] * 100).toFixed(1) : "-",
    },
    { label: "FG", value: latestGame.FGM },
    { label: "FGA", value: latestGame.FGA },
    {
      label: "3P%",
      value: latestGame["3P%"] ? (latestGame["3P%"] * 100).toFixed(1) : "-",
    },
    { label: "3PM", value: latestGame["3PM"] },
    { label: "3PA", value: latestGame["3PA"] },
    { label: "TOV", value: latestGame.TOV },
    { label: "+/-", value: latestGame.PlusMinus },
  ];

  return (
    <div className="games-section">
      {/* Latest Game */}
      <div className="latest-game-stats-container">
        <h1>Latest Performance</h1>
        <div className="latest-game-info">
          <img
            src={newPlayer.headshot || "blank.png"}
            className="player-photo"
            alt={newPlayer.name}
          />
          <div>
            <div className="latest-player-name">{newPlayer.name}</div>
            <div className="latest-game-details">
              <span>{formatDate(latestGame.Date)}</span>
              <span className="opp-container latest">
                vs {renderLogo(latestGame.Opponent)}
                {latestGame.Opponent.toUpperCase()}
              </span>
              <span className="latest-result-container">
                <span className={`latest-result ${latestGame.Result[0]}`}>
                  {latestGame.Result.split(" ")[0]}
                </span>{" "}
                {latestGame.Result.split(" ")[1]}
              </span>
            </div>
          </div>
        </div>

        <div className="player-stats-grid latest">
          {statBlocks.map(({ label, value }) => (
            <div className="detail" key={label}>
              <div className="detail-value">{value ?? "-"}</div>
              <div className="detail-label">{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Games */}
      <div className="latest-game-stats-container games">
        <h1>Recent Games</h1>
        <div className="games-container">
          {recentGames.map((game, index) => (
            <div className="game" key={index}>
              <div className="game-detail">
                <div className="game-header">{formatDate(game.Date)}</div>
                <div className="game-data">
                  <div className="opp-container">
                    vs {renderLogo(game.Opponent)}
                    {game.Opponent.toUpperCase()}
                  </div>
                </div>
              </div>

              <div className="game-detail">
                <div className="game-data">
                  <span className={`latest-result ${game.Result[0]}`}>
                    {game.Result.split(" ")[0]}
                  </span>{" "}
                  {game.Result.split(" ")[1]}
                </div>
              </div>

              <div className="game-detail stats">
                <div className="game-header stats">
                  <span>PTS</span>
                  <span>REB</span>
                  <span>AST</span>
                  <span>+/-</span>
                </div>
                <div className="game-data stats">
                  <span>{game.Points}</span>
                  <span>{game.Rebounds}</span>
                  <span>{game.Assists}</span>
                  <span>{game.PlusMinus}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
