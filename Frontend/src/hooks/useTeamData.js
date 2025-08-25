import { useState } from "react";

const API_BASE_URL = import.meta.env.VITE_API_URL;

const useTeamData = (selectedSeason) => {
  const [matchedTeam, setMatchedTeam] = useState(null);
  const [teamGames, setTeamGames] = useState([]);
  const [teamStats, setTeamStats] = useState(null);
  const [newRoster, setNewRoster] = useState([]);
  const [isRosterReady, setIsRosterReady] = useState(false);

  const fetchTeamData = async (teamAbbr) => {
    setIsRosterReady(false); // reset
    try {
      const [gamesRes, statsRes, rosterRes] = await Promise.all([
        fetch(
          `${API_BASE_URL}/api/team/${teamAbbr}/games?year=${selectedSeason}`
        ),
        fetch(`${API_BASE_URL}/api/team/${teamAbbr}`),
        fetch(
          `${API_BASE_URL}/api/team/${teamAbbr.toLowerCase()}/roster?year=${selectedSeason}`
        ),
      ]);

      const games = await gamesRes.json();
      const stats = await statsRes.json();
      const rosterData = await rosterRes.json();

      setTeamGames(games);
      setTeamStats(stats);
      setNewRoster(rosterData);

      setIsRosterReady(true); // ✅ done loading
    } catch (err) {
      console.error("❌ Team data fetch error:", err);
      setIsRosterReady(false);
    }
  };

  return {
    matchedTeam,
    setMatchedTeam,
    teamGames,
    teamStats,
    newRoster,
    fetchTeamData,
  };
};

export default useTeamData;
