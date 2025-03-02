import "./Search.css";
import { useState, useEffect } from "react";
import { teamColors } from "../../../public/teamColors";
import Fuse from "fuse.js";
import SearchBar from "./SearchBar";
import PlayerProfile from "./PlayerProfile";
import PlayerStatistics from "./PlayerStatistics";
import PlayerStatsTable from "./PlayerStatsTable/PlayerStatsTable";

function Search() {
  const [query, setQuery] = useState("");
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [players, setPlayers] = useState([]);
  const [playerSeasons, setPlayerSeasons] = useState([]);

  useEffect(() => {
    fetch("/all_players.json")
      .then((response) => response.json())
      .then((data) => {
        // Extract latest season for each player
        const latestPlayers = Object.values(
          data.reduce((acc, player) => {
            if (!acc[player.Name] || (acc[player.Name] && player.Year > acc[player.Name].Year)) {
              acc[player.Name] = player;
            }
            return acc;
          }, {})
        );

        setPlayers(latestPlayers);

        // Restore the last searched player from localStorage
        const lastSearchedPlayerName = localStorage.getItem("lastSearchedPlayer");

        if (lastSearchedPlayerName) {
          const lastPlayer = latestPlayers.find(p => p.Name === lastSearchedPlayerName);
          if (lastPlayer) {
            setSelectedPlayer(lastPlayer);
            setPlayerSeasons(data.filter(p => p.Name === lastSearchedPlayerName));
            return;
          }
        }

        // Default to the first player in the list
        if (latestPlayers.length > 0) {
          const defaultPlayerName = latestPlayers[0].Name;
          setSelectedPlayer(latestPlayers[0]);
          setPlayerSeasons(data.filter(p => p.Name === defaultPlayerName));
        }
      })
      .catch((error) => console.error("Error loading player data:", error));
  }, []);

  const fuse = new Fuse(players, {
    keys: ["Name"],
    threshold: 0.3,
  });

  const handleSearch = () => {
    if (!query.trim()) return;
    const results = fuse.search(query);
    if (results.length > 0) {
      const playerName = results[0].item.Name;
      setSelectedPlayer(results[0].item);

      // Save the last searched player in localStorage
      localStorage.setItem("lastSearchedPlayer", playerName);

      // Fetch all seasons for the selected player
      fetch("/all_players.json")
        .then((response) => response.json())
        .then((data) => {
          setPlayerSeasons(data.filter((p) => p.Name === playerName));
        })
        .catch((error) => console.error("Error loading player season data:", error));
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      handleSearch();
      event.target.blur();
    }
  };

  if (players.length === 0) {
    return <div>Loading players...</div>;
  }

  const player = selectedPlayer || players[0];
  const teamColor = teamColors[player["Tm"]] || { primary: "#808080", secondary: "#606060" };

  return (
    <div className="search-wrapper">
      <div className="search-results-container" style={{ backgroundColor: teamColor.primary }}>
        <SearchBar query={query} setQuery={setQuery} handleSearch={handleSearch} handleKeyDown={handleKeyDown} teamColor={teamColor} />
        {player && (
          <>
            <PlayerProfile player={player} />
            <PlayerStatistics player={player} teamColor={teamColor} />
          </>
        )}
      </div>
      <div className="player-bio-section">
        {/* Traditional Stats Table */}
        <PlayerStatsTable playerData={playerSeasons} statsType="traditional" />
        {/* Advanced Stats Table */}
        <PlayerStatsTable playerData={playerSeasons} statsType="advanced" />
      </div>
    </div>
  );
}

export default Search;
