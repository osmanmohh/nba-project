import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Fuse from "fuse.js";

function usePlayerData() {
  const { query: urlQuery } = useParams();
  const navigate = useNavigate();

  const [query, setQuery] = useState(urlQuery || "");
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [players, setPlayers] = useState([]);
  const [playerSeasons, setPlayerSeasons] = useState([]);
  const [allData, setAllData] = useState([]);

  useEffect(() => {
    fetch("/all_players.json")
      .then((response) => response.json())
      .then((data) => {
        if (!data || data.length === 0) return;

        setAllData(data);

        const latestPlayers = Object.values(
          data.reduce((acc, player) => {
            if (!acc[player.Name] || player.Year > acc[player.Name].Year) {
              acc[player.Name] = player;
            }
            return acc;
          }, {})
        );

        setPlayers(latestPlayers);

        if (urlQuery) {
          setPlayerFromQuery(urlQuery, latestPlayers, data);
        } else {
          const lastSearch = JSON.parse(
            localStorage.getItem("lastSearchedPlayer")
          );
          if (lastSearch) {
            setPlayerFromQuery(lastSearch.name, latestPlayers, data);
          } else if (latestPlayers.length > 0) {
            setSelectedPlayer(latestPlayers[0]);
            setPlayerSeasons(
              data.filter((p) => p.Name === latestPlayers[0].Name)
            );
          }
        }
      })
      .catch((error) => console.error("Error loading player data:", error));
  }, [urlQuery]);

  const setPlayerFromQuery = (searchTerm, latestPlayers, fullData) => {
    const player = latestPlayers.find(
      (p) =>
        p.Name.toLowerCase() === searchTerm.toLowerCase() ||
        p.Player_ID === searchTerm
    );

    if (player) {
      setSelectedPlayer(player);
      setPlayerSeasons(fullData.filter((p) => p.Name === player.Name));

      localStorage.setItem(
        "lastSearchedPlayer",
        JSON.stringify({
          name: player.Name,
          url: `/search/${encodeURIComponent(player.Name)}`,
        })
      );
    }
  };

  const fuse = new Fuse(players, {
    keys: ["Name"],
    threshold: 0.3,
  });

  const handleSearch = () => {
    if (!query.trim()) return;
    const results = fuse.search(query);
    console.log(query);

    if (results.length > 0) {
      const player = results[0].item;
      setSelectedPlayer(player);
      console.log(allData.filter((p) => p.Tm === player.Tm && p.Year === "2024").sort((a, b) => b.PTS - a.PTS).slice(0, 3));
      setPlayerSeasons(allData.filter((p) => p.Name === player.Name));
      navigate(`/search/${encodeURIComponent(player.Name)}`);

      localStorage.setItem(
        "lastSearchedPlayer",
        JSON.stringify({
          name: player.Name,
          url: `/search/${encodeURIComponent(player.Name)}`,
        })
      );
    }
  };

  return {
    query,
    setQuery,
    selectedPlayer,
    setSelectedPlayer,
    players,
    playerSeasons,
    handleSearch,
  };
}

export default usePlayerData;
