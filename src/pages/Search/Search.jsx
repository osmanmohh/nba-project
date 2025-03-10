import "./Search.css";
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom"; // ✅ Import React Router Hooks
import { teamColors } from "../../../public/teamColors";
import Fuse from "fuse.js";
import SearchBar from "./SearchBar";
import PlayerProfile from "./PlayerProfile";
import PlayerStatistics from "./PlayerStatistics";
import StatsTable from "./StatsTable/StatsTable";

function Search() {
  const { query: urlQuery } = useParams(); // ✅ Get search query from URL
  const navigate = useNavigate(); // ✅ Allows updating the URL when searching
  const [query, setQuery] = useState(urlQuery || ""); // Sync with URL
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [players, setPlayers] = useState([]);
  const [playerSeasons, setPlayerSeasons] = useState([]);
  const [allData, setAllData] = useState([]); // Store full dataset

  useEffect(() => {
    fetch("/all_players.json")
      .then((response) => response.json())
      .then((data) => {
        if (!data || data.length === 0) return;

        setAllData(data); // Store full dataset

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

        // ✅ If a URL search exists, set the searched player
        if (urlQuery) {
          setPlayerFromQuery(urlQuery, latestPlayers, data);
        } else {
          // ✅ Restore last searched player from localStorage
          const lastSearchedPlayerName = localStorage.getItem("lastSearchedPlayer");
          const lastPlayer = lastSearchedPlayerName
            ? latestPlayers.find((p) => p.Name === lastSearchedPlayerName)
            : null;

          if (lastPlayer) {
            setSelectedPlayer(lastPlayer);
            setPlayerSeasons(data.filter((p) => p.Name === lastSearchedPlayerName));
          } else if (latestPlayers.length > 0) {
            setSelectedPlayer(latestPlayers[0]);
            setPlayerSeasons(data.filter((p) => p.Name === latestPlayers[0].Name));
          }
        }
        console.log("Selected Player:", selectedPlayer);

      })
      
      .catch((error) => console.error("Error loading player data:", error));
  }, [urlQuery]); // ✅ Runs when URL changes

  // ✅ Function to set player based on URL search
  const setPlayerFromQuery = (searchTerm, latestPlayers, fullData) => {
    const player = latestPlayers.find((p) =>
      p.Name.toLowerCase() === searchTerm.toLowerCase() || p.Player_ID === searchTerm
    );

    if (player) {
      setSelectedPlayer(player);
      setPlayerSeasons(fullData.filter((p) => p.Name === player.Name));
    }
  };

  // Setup fuzzy search
  const fuse = new Fuse(players, {
    keys: ["Name"],
    threshold: 0.3,
  });

  // ✅ Handles search & updates URL
  const handleSearch = () => {
    if (!query.trim()) return;
    const results = fuse.search(query);
    
    if (results.length > 0) {
      const player = results[0].item;
      setSelectedPlayer(player);
      setPlayerSeasons(allData.filter((p) => p.Name === player.Name));

      // ✅ Update the URL to allow sharing
      navigate(`/search/${encodeURIComponent(player.Name)}`);
    }
  };

  // Search on pressing Enter
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
            "REB",
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
