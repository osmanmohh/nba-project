import "./Search.css";
import { useState, useEffect } from "react";
import { teamColors } from "../../../public/teamColors";
import Fuse from "fuse.js";
import SearchBar from "./SearchBar";
import PlayerProfile from "./PlayerProfile";
import PlayerStatistics from "./PlayerStatistics";
import StatsTable from "./StatsTable/StatsTable";

function Search() {
  const [query, setQuery] = useState("");
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [players, setPlayers] = useState([]);
  const [playerSeasons, setPlayerSeasons] = useState([]);
  const [allData, setAllData] = useState([]); // Store full JSON dataset

  useEffect(() => {
    fetch("/all_players.json")
      .then((response) => response.json())
      .then((data) => {
        if (!data || data.length === 0) return;

        setAllData(data); // Store the full dataset

        // Extract latest season for each player
        const latestPlayers = Object.values(
          data.reduce((acc, player) => {
            if (!acc[player.Name] || player.Year > acc[player.Name].Year) {
              acc[player.Name] = player;
            }
            return acc;
          }, {})
        );

        setPlayers(latestPlayers);

        // Restore the last searched player from localStorage
        const lastSearchedPlayerName =
          localStorage.getItem("lastSearchedPlayer");
        const lastPlayer = lastSearchedPlayerName
          ? latestPlayers.find((p) => p.Name === lastSearchedPlayerName)
          : null;

        if (lastPlayer) {
          setSelectedPlayer(lastPlayer);
          setPlayerSeasons(
            data.filter((p) => p.Name === lastSearchedPlayerName)
          ); // Get all seasons
        } else if (latestPlayers.length > 0) {
          setSelectedPlayer(latestPlayers[0]);
          setPlayerSeasons(
            data.filter((p) => p.Name === latestPlayers[0].Name)
          ); // Get all seasons
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
      localStorage.setItem("lastSearchedPlayer", playerName);

      // Get all seasons from allData instead of just filtering players (which only has latest seasons)
      setPlayerSeasons(allData.filter((p) => p.Name === playerName));
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
  const teamColor = teamColors[player.Tm] || {
    primary: "#808080",
    secondary: "#606060",
  };

  return (
    <div className="search-wrapper">
      <div
        className="search-results-container"
        style={{ backgroundColor: teamColor.primary }}
      >
        <SearchBar
          query={query}
          setQuery={setQuery}
          handleSearch={handleSearch}
          handleKeyDown={handleKeyDown}
          teamColor={teamColor}
        />
        {player && (
          <>
            <PlayerProfile player={player} />
            <PlayerStatistics player={player} teamColor={teamColor} />
          </>
        )}
      </div>
      <div className="player-bio-section">
        <StatsTable
          jsonData={playerSeasons}
          columnsToShow={[
            "Year",
            "Tm",
            "G",
            "MP",
            "PTS",
            "FG",
            "FGA",
            "FG%",
            "3P",
            "3PA",
            "3P%",
            "FT",
            "FTA",
            "FT%",
            "ORB",
            "DRB",
            "TRB",
            "AST",
            "TOV",
            "STL",
            "BLK",
            "PF",
            "+/-",
          ]}
          title="TRADITIONAL STATS"
        />
        <StatsTable
          jsonData={playerSeasons}
          columnsToShow={[
            "Year",
            "Tm",
            "G",
            "MP",
            "eFG%",
            "2P%",
            "ORtg",
            "DRtg",
            "NRtg",
            "W/L%",
            "WS",
            "WS/48",
            "BPM",
            "VORP",
          ]}
          title="ADVANCED STATS"
        />
      </div>
    </div>
  );
}

export default Search;
