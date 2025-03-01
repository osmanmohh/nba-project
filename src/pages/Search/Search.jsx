import "./Search.css";
import players from "/players_2024"; // ✅ Corrected import path
import { teamColors } from "../../../public/teamColors";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import { useState } from "react";
import Fuse from "fuse.js";

function Search() {
  const [query, setQuery] = useState("");
  const [selectedPlayer, setSelectedPlayer] = useState(null);

  const fuse = new Fuse(players, {
    keys: ["Name"],
    threshold: 0.3, // Allows for slight typos and case insensitivity
  });

  const handleSearch = () => {
    if (!query.trim()) return;
    const results = fuse.search(query);
    if (results.length > 0) {
      setSelectedPlayer(results[0].item);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      handleSearch();
      event.target.blur();
    }
  };

  const player = selectedPlayer || players[0]; // Default player (first in list) if none selected
  const teamColor = teamColors[player.Tm] || {
    primary: "#808080",
    secondary: "#606060",
  };

  return (
    <>
      <div
        className="search-results"
        style={{ backgroundColor: teamColor.primary }}
      >
        <div className="search-container">
          <FontAwesomeIcon
            icon={faMagnifyingGlass}
            size="sm"
            style={{ color: "#7B7B7B" }}
            className="search-icon"
            onClick={handleSearch}
          />
          <input
            type="search"
            className="search-bar"
            placeholder="Search for Teams or Players..."
            style={{ backgroundColor: teamColor.secondary }}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </div>

        {player && (
          <>
            <div className="player-summary">
              <img
                className="search-headshot"
                src={`headshots/${player.Player_ID}.png`}
                alt={player.Name}
              />
              <img
                className="search-team-logo-small"
                src={`logos/${player.Tm}.png`}
                alt={player.Tm}
              />
              <img
                className="search-team-logo"
                src={`logos/${player.Tm}.png`}
                alt={player.Tm}
              />
              <div className="search-player-info">
                <div className="player-team-position">
                  {player.Team} |{" "}
                  {"SG,PG".includes(player.Pos) ? "Guard" : "Forward"}
                </div>
                <div className="search-player-name">
                  {player.Name.toUpperCase()}
                </div>
              </div>
            </div>

            <div className="player-stats">
              <div className="stats">
                <div className="stat-item">
                  <div className="stat-label">PPG</div>
                  <div className="stat-value">{player.PTS}</div>
                </div>
                <div className="stat-item">
                  <div className="stat-label">RPG</div>
                  <div className="stat-value">{player.TRB}</div>
                </div>
                <div className="stat-item">
                  <div className="stat-label">APG</div>
                  <div className="stat-value">{player.AST}</div>
                </div>
                <div className="stat-item">
                  <div className="stat-label">FG%</div>
                  <div className="stat-value">
                    {(player["FG%"] * 100).toFixed(1)}%
                  </div>
                </div>
              </div>
              <div className="player-details">
                <div className="detail-item">
                  <div className="detail-label">HEIGHT</div>
                  <div className="detail-value">{player.Height}</div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">WEIGHT</div>
                  <div className="detail-value">{player.Weight}</div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">POSITION</div>
                  <div className="detail-value">{player.Pos}</div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">COLLEGE</div>
                  <div className="detail-value">{player.College}</div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">AGE</div>
                  <div className="detail-value">{player.Age} years</div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">BIRTHDATE</div>
                  <div className="detail-value">
                    {new Date(player.Birthdate).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">DRAFT</div>
                  <div className="detail-value">{player.Draft}</div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">EXPERIENCE</div>
                  <div className="detail-value">
                    {player.Draft
                      ? `${new Date().getFullYear() - 1 - parseInt(player.Draft.split(" ")[0], 10)} years`
                      : "Rookie"}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}

export default Search;
