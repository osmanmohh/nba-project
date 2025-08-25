import { useState, useEffect } from "react";
import { getHeadshot } from "../utils/getHeadshot";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "https://nba-project-backend.onrender.com";

const usePlayerData = (selectedSeason, allTeams) => {
  const [fetchedStats, setFetchedStats] = useState([]);
  const [fetchedGames, setFetchedGames] = useState([]);
  const [newPlayer, setNewPlayer] = useState(null);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [newRoster, setNewRoster] = useState([]);
  const [playerVersion, setPlayerVersion] = useState(0);

  const refreshPlayerData = (bbref_id) => {
    setPlayerVersion((v) => v + 1);
  };

  useEffect(() => {
    if (!newPlayer?.bbref_id || allTeams.length === 0) return;

    const fetchAll = async () => {
      try {
        const [statsRes, gamesRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/player/${newPlayer.bbref_id}/stats`),
          fetch(`${API_BASE_URL}/api/player/${newPlayer.bbref_id}/games`),
        ]);

        const stats = await statsRes.json();
        let games = await gamesRes.json();
        games = games.sort((a, b) => new Date(b.Date) - new Date(a.Date));

        setFetchedStats(stats);
        setFetchedGames(games);

        const year = games[0]?.Year;
        const latestAbbr = games[0]?.Team?.toLowerCase();

        const match = allTeams.find(
          (t) =>
            t?.Tm?.toLowerCase() === latestAbbr &&
            t?.Year === year &&
            t?.StatType === "totals"
        );

        if (latestAbbr && newPlayer.teamAbbr !== latestAbbr) {
          setNewPlayer((prev) => ({
            ...prev,
            teamAbbr: latestAbbr,
            team: match?.Team || "Unknown Team",
            logo: `https://a.espncdn.com/i/teamlogos/nba/500/${latestAbbr}.png`,
          }));
        }

        const headshot = await getHeadshot(newPlayer.name);
        if (headshot) setNewPlayer((prev) => ({ ...prev, headshot }));

        const rosterRes = await fetch(
          `${API_BASE_URL}/api/team/${latestAbbr}/roster?year=${year}`
        );
        const rosterData = await rosterRes.json();
        setNewRoster(rosterData);
      } catch (err) {
        console.error("❌ Error loading player data:", err);
      }
    };

    fetchAll();
  }, [newPlayer?.bbref_id, allTeams, playerVersion, selectedSeason]);

  return {
    newPlayer,
    setNewPlayer,
    selectedPlayer,
    setSelectedPlayer,
    fetchedStats,
    fetchedGames,
    newRoster,
    refreshPlayerData,
  };
};

export default usePlayerData;
