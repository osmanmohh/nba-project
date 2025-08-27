// Simple global data store for preloaded API data
let globalData = {
  teams: [],
  playerStats: [],
  projectedTeams: [],
  isLoading: true,
  error: null,
};

const API_BASE_URL = import.meta.env.VITE_API_URL;

// Preload all data on app start
export const preloadData = async () => {
  try {
    console.log("🚀 Preloading all data...");

    const [teamsRes, playerStatsRes, projectedRes] = await Promise.all([
      fetch(`${API_BASE_URL}/api/team`),
      fetch(
        `${API_BASE_URL}/api/player/stats/all?year=2025&stat_type=Per%20Game`
      ),
      fetch(`${API_BASE_URL}/api/team/projected`),
    ]);

    const [teams, playerStats, projectedTeams] = await Promise.all([
      teamsRes.json(),
      playerStatsRes.json(),
      projectedRes.json(),
    ]);

    globalData = {
      teams,
      playerStats,
      projectedTeams,
      isLoading: false,
      error: null,
    };

    console.log("✅ Data preloaded successfully!");
  } catch (error) {
    console.error("❌ Data preload failed:", error);
    globalData.error = error.message;
    globalData.isLoading = false;
  }
};

// Get data functions
export const getTeams = () => globalData.teams;
export const getPlayerStats = () => globalData.playerStats;
export const getProjectedTeams = () => globalData.projectedTeams;
export const getLoadingState = () => globalData.isLoading;
export const getError = () => globalData.error;

// Helper functions
export const getTeamsByYear = (year) => {
  return globalData.teams.filter(
    (team) => team.Year === year && team.StatType === "per_game"
  );
};

export const getTeamsByConference = (conference, year = 2025) => {
  const teams = getTeamsByYear(year);
  return teams.filter((team) => team.Conf === conference);
};

export const getPlayerById = (playerId) => {
  return globalData.playerStats.find((player) => player.playerID === playerId);
};
