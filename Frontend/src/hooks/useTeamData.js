import { useState } from "react";

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
        fetch(`/api/team/${teamAbbr}/games?year=${selectedSeason}`),
        fetch(`/api/team/${teamAbbr}`),
        fetch(
          `/api/team/${teamAbbr.toLowerCase()}/roster?year=${selectedSeason}`
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
