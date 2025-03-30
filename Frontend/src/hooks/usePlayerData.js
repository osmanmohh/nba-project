import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Fuse from "fuse.js";

function usePlayerData() {
  const { query: urlQuery } = useParams();
  const navigate = useNavigate();

  const lastSearchedPlayer = JSON.parse(
    localStorage.getItem("lastSearchedPlayer")
  );
  const lastSearchedTeam = JSON.parse(localStorage.getItem("lastSearchedTeam"));

  const [query, setQuery] = useState(urlQuery || "");
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [players, setPlayers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [playerSeasons, setPlayerSeasons] = useState([]);
  const [allData, setAllData] = useState([]);
  const [teamData, setTeamData] = useState([]);
  const [newPlayer, setNewPlayer] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        const playerResponse = await fetch("/all_players.json");
        const playerData = await playerResponse.json();

        if (!isMounted || !playerData || playerData.length === 0) return;

        setAllData(playerData);

        const latestPlayers = Object.values(
          playerData.reduce((acc, player) => {
            if (!acc[player.Name] || player.Year > acc[player.Name].Year) {
              acc[player.Name] = player;
            }
            return acc;
          }, {})
        );

        setPlayers(latestPlayers);

        const teamResponse = await fetch("/teams.json");
        const teamData = await teamResponse.json();

        if (!isMounted || !teamData || teamData.length === 0) return;
        setTeams(teamData);
        setTeamData(teamData);

        if (urlQuery) {
          const player = latestPlayers.find(
            (p) => p.Name.toLowerCase() === urlQuery.toLowerCase()
          );

          if (player) {
            setSelectedPlayer(player);
            setNewPlayer(player);
            setPlayerSeasons(playerData.filter((p) => p.Name === player.Name));
            return;
          }

          const teamSeasons = teamData.filter(
            (t) => t.Team.toLowerCase() === urlQuery.toLowerCase()
          );

          if (teamSeasons.length > 0) {
            const latestTeam =
              teamSeasons.find((t) => t.Year === 2024) || teamSeasons[0];
            setSelectedTeam(latestTeam);
          }
        } else {
          if (lastSearchedPlayer) {
            setEntityFromQuery(
              lastSearchedPlayer.name,
              latestPlayers,
              playerData
            );
          } else if (lastSearchedTeam) {
            setEntityFromQuery(
              lastSearchedTeam.name,
              latestPlayers,
              playerData
            );
          }
        }
      } catch (error) {
        console.error("Error loading data:", error);
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [urlQuery]);

  const setEntityFromQuery = (searchTerm, latestPlayers, fullData) => {
    const player = latestPlayers.find(
      (p) =>
        p.Name.toLowerCase() === searchTerm.toLowerCase() ||
        p.Player_ID === searchTerm
    );

    if (player) {
      if (selectedPlayer?.Name !== player.Name) {
        setSelectedPlayer(player);
        setSelectedTeam(null);
        setNewPlayer(player);
        setPlayerSeasons(fullData.filter((p) => p.Name === player.Name));
      }
      return;
    }

    const teamSeasons = teamData.filter(
      (t) => t.Team.toLowerCase() === searchTerm.toLowerCase()
    );

    if (teamSeasons.length > 0) {
      const latestTeam =
        teamSeasons.find((t) => t.Year === 2024) || teamSeasons[0];
      setSelectedTeam(latestTeam);
      setSelectedPlayer(null);
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

    const playerResults = playerFuse.search(query);
    if (playerResults.length > 0) {
      const player = playerResults[0].item;
      setSelectedPlayer(player);
      setSelectedTeam(null);
      setNewPlayer(player);
      setPlayerSeasons(allData.filter((p) => p.Name === player.Name));
      navigate(`/search/${encodeURIComponent(player.Name)}`);

      
      return;
    }

    const teamResults = teamFuse.search(query);
    if (teamResults.length > 0) {
      const team = teamResults[0].item;
      setSelectedTeam(team);
      setSelectedPlayer(null);
      navigate(`/search/${encodeURIComponent(team.Team)}`);

      
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
    newPlayer,
    setSelectedPlayer, // ✅ Add this!

  };
}

export default usePlayerData;
