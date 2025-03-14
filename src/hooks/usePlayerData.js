import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Fuse from "fuse.js";

function usePlayerData() {
  const { query: urlQuery } = useParams();
  const navigate = useNavigate();

  // Retrieve last searched team/player from localStorage
  const lastSearchedPlayer = JSON.parse(localStorage.getItem("lastSearchedPlayer"));
  const lastSearchedTeam = JSON.parse(localStorage.getItem("lastSearchedTeam"));

  const [query, setQuery] = useState(urlQuery || "");
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [players, setPlayers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [playerSeasons, setPlayerSeasons] = useState([]);
  const [allData, setAllData] = useState([]);
  const [teamData, setTeamData] = useState([]);

  useEffect(() => {
    let isMounted = true; // ✅ Prevents state updates on an unmounted component

    // Load Players
    fetch("/all_players.json")
      .then((response) => response.json())
      .then((data) => {
        if (!isMounted || !data || data.length === 0) return;

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

        // Set last searched player if no query is provided
        if (urlQuery) {
          setEntityFromQuery(urlQuery, latestPlayers, data);
        } else if (lastSearchedPlayer) {
          setEntityFromQuery(lastSearchedPlayer.name, latestPlayers, data);
        }
      })
      .catch((error) => console.error("Error loading player data:", error));

    // Load Teams
    fetch("/teams.json")
      .then((response) => response.json())
      .then((data) => {
        if (!isMounted || !data || data.length === 0) return;
        setTeams(data);
        setTeamData(data);

        // Set last searched team if no query is provided
        if (!urlQuery && lastSearchedTeam) {
          setEntityFromQuery(lastSearchedTeam.name, players, allData);
        }
      })
      .catch((error) => console.error("Error loading team data:", error));

    return () => {
      isMounted = false; // ✅ Cleanup to prevent state updates if unmounted
    };
  }, [urlQuery]);

  const setEntityFromQuery = (searchTerm, latestPlayers, fullData) => {
    // Search for player first
    const player = latestPlayers.find(
      (p) =>
        p.Name.toLowerCase() === searchTerm.toLowerCase() ||
        p.Player_ID === searchTerm
    );

    if (player) {
      if (selectedPlayer?.Name !== player.Name) {
        setSelectedPlayer(player);
        setSelectedTeam(null);
        setPlayerSeasons(fullData.filter((p) => p.Name === player.Name));
      }
      return;
    }

    // Search for team and select most recent year
    const teamSeasons = teams.filter((t) =>
      t.Team.toLowerCase() === searchTerm.toLowerCase()
    );

    if (teamSeasons.length > 0) {
      const latestTeam = teamSeasons.find((t) => t.Year === 2024) || teamSeasons[0];

      if (selectedTeam?.Team !== latestTeam.Team || selectedTeam?.Year !== latestTeam.Year) {
        setSelectedTeam(latestTeam);
        setSelectedPlayer(null);
        console.log(`Showing ${latestTeam.Team} for ${latestTeam.Year}`);
      }
    }
  };

  const playerFuse = new Fuse(players, {
    keys: ["Name"],
    threshold: 0.3,
  });

  const teamFuse = new Fuse(teams, {
    keys: ["Team"],
    threshold: 0.3,
  });

  const handleSearch = () => {
    if (!query.trim()) return;

    // First, search for a player
    const playerResults = playerFuse.search(query);
    if (playerResults.length > 0) {
      const player = playerResults[0].item;
      setSelectedPlayer(player);
      setSelectedTeam(null);
      setPlayerSeasons(allData.filter((p) => p.Name === player.Name));
      navigate(`/search/${encodeURIComponent(player.Name)}`);

      localStorage.setItem(
        "lastSearchedPlayer",
        JSON.stringify({
          name: player.Name,
          url: `/search/${encodeURIComponent(player.Name)}`,
        })
      );
      return;
    }

    // If no player is found, search for a team
    const teamResults = teamFuse.search(query);
    if (teamResults.length > 0) {
      const team = teamResults[0].item;
      setSelectedTeam(team);
      setSelectedPlayer(null);
      navigate(`/search/${encodeURIComponent(team.Team)}`);

      localStorage.setItem(
        "lastSearchedTeam",
        JSON.stringify({
          name: team.Team,
          url: `/search/${encodeURIComponent(team.Team)}`,
        })
      );
    }
  };

  return {
    query,
    setQuery,
    selectedPlayer,
    selectedTeam,
    players,
    teams,
    playerSeasons,
    handleSearch,
  };
}

export default usePlayerData;
