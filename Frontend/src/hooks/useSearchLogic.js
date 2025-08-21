import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { getHeadshot } from "../utils/getHeadshot";

const useSearchLogic = () => {
  const { query: urlQuery } = useParams();

  const [query, setQuery] = useState("");
  const [view, setView] = useState("overview");
  const [selectedSeason, setSelectedSeason] = useState("2025");
  const [isTabTransitioning, setIsTabTransitioning] = useState(false);
  const [isFading, setIsFading] = useState(false);
  const [isLoadingNewContent, setIsLoadingNewContent] = useState(true);
  const [contentReady, setContentReady] = useState(false);

  const [fetchedStats, setFetchedStats] = useState([]);
  const [fetchedGames, setFetchedGames] = useState([]);
  const [allTeams, setAllTeams] = useState([]);
  const [bio, setBio] = useState(null);
  const [newRoster, setNewRoster] = useState([]);
  const [roster, setRoster] = useState([]);
  const [playerVersion, setPlayerVersion] = useState(0);
  const [matchedTeam, setMatchedTeam] = useState(null);
  const [teamGames, setTeamGames] = useState([]);
  const [teamStats, setTeamStats] = useState(null);
  const [newPlayer, setNewPlayer] = useState(null);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [lastPlayerLoaded, setLastPlayerLoaded] = useState(false);
  const [selectedType, setSelectedType] = useState(null); // ✅ NEW

  const DEFAULT_PLAYER = {
    bbref_id: "curryst01",
    name: "Stephen Curry",
    birthdate: "March 14, 1988",
    height: "6'2\"",
    weight: "185 lbs",
    pos: "Point Guard",
    shoots: "Right",
    college: "Davidson",
    draft: "2009 1st Round 7th Pick",
    teamAbbr: "gsw",
    team: "Golden State Warriors",
    logo: "https://a.espncdn.com/i/teamlogos/nba/500/gsw.png",
  };

  // Reset content ready state when starting new searches or changing content
  const resetLoadingStates = () => {
    setContentReady(false);
    setIsLoadingNewContent(true);
    setIsFading(true);
  };

  useEffect(() => {
    fetch("/api/team")
      .then((res) => res.json())
      .then((data) => setAllTeams(data))
      .catch((err) => console.error("Failed to fetch teams:", err));
  }, []);

  useEffect(() => {
    if (allTeams.length === 0 || lastPlayerLoaded) return;

    let searchQuery;

    if (urlQuery && urlQuery.trim().length > 0) {
      searchQuery = decodeURIComponent(urlQuery);
    } else {
      try {
        // Try to load from the new unified lastSearchedItem first
        const storedItem = localStorage.getItem("lastSearchedItem");
        const parsedItem = storedItem ? JSON.parse(storedItem) : null;
        const isValidItem =
          parsedItem &&
          typeof parsedItem.name === "string" &&
          typeof parsedItem.type === "string";

        if (isValidItem) {
          // Use the name as search query regardless of type
          searchQuery = parsedItem.name;
        } else {
          // Fall back to the old lastSearchedPlayer if new format not found
          const stored = localStorage.getItem("lastSearchedPlayer");
          const parsed = stored ? JSON.parse(stored) : null;
          const isValid =
            parsed &&
            typeof parsed.name === "string" &&
            typeof parsed.bbref_id === "string";

          searchQuery = isValid ? parsed.name : DEFAULT_PLAYER.name;
        }
      } catch (err) {
        console.warn("⚠️ Invalid localStorage — falling back to Curry.");
        searchQuery = DEFAULT_PLAYER.name;
      }
    }

    handleSearchWithFade(searchQuery);
    setLastPlayerLoaded(true);
  }, [allTeams, urlQuery, lastPlayerLoaded]);

  // Check if all content is ready to display
  useEffect(() => {
    const checkPlayerContentReady = () => {
      return (
        newPlayer?.bbref_id &&
        newPlayer?.team &&
        newPlayer?.pos &&
        fetchedStats.length > 0 &&
        fetchedGames.length > 0 &&
        newRoster.length > 0 &&
        bio !== null
      );
    };

    const checkTeamContentReady = () => {
      return (
        matchedTeam &&
        teamGames.length > 0 &&
        teamStats !== null &&
        newRoster.length > 0
      );
    };

    if (selectedType === "player" && checkPlayerContentReady()) {
      setTimeout(() => {
        setContentReady(true);
        setIsLoadingNewContent(false);
        setIsFading(false);
      }, 300);
    } else if (selectedType === "team" && checkTeamContentReady()) {
      setTimeout(() => {
        setContentReady(true);
        setIsLoadingNewContent(false);
        setIsFading(false);
      }, 500);
    }
  }, [
    newPlayer,
    fetchedStats,
    fetchedGames,
    newRoster,
    bio,
    matchedTeam,
    teamGames,
    teamStats,
    selectedType,
  ]);

  // This effect fetches roster data for a team when team or season changes
  useEffect(() => {
    if (!newPlayer || !newPlayer.teamAbbr || !selectedSeason) return;

    const fetchRosterData = async () => {
      try {
        const teamAbbr = newPlayer.teamAbbr.toLowerCase();
        const rosterRes = await fetch(
          `/api/team/${teamAbbr}/roster?year=${selectedSeason}`
        );
        const rosterData = await rosterRes.json();
        setNewRoster(rosterData);
      } catch (err) {
        console.error("❌ Error fetching team roster:", err);
      }
    };

    fetchRosterData();
  }, [newPlayer?.teamAbbr, selectedSeason]);

  useEffect(() => {
    if (!newPlayer?.bbref_id || allTeams.length === 0) return;

    const fetchAll = async () => {
      try {
        const [statsRes, gamesRes, bioRes] = await Promise.all([
          fetch(`/api/player/${newPlayer.bbref_id}/stats`),
          fetch(`/api/player/${newPlayer.bbref_id}/games`),
          fetch(`/api/player/${newPlayer.bbref_id}`),
        ]);

        const stats = await statsRes.json();
        let games = await gamesRes.json();
        games = games.sort((a, b) => new Date(b.Date) - new Date(a.Date));
        const bio = await bioRes.json();

        setFetchedStats(stats);
        setFetchedGames(games);
        setBio(bio);
        setSelectedSeason(games[0]?.Year);

        if (!games.length || !games[0]?.Team) return;

        const latestAbbr = games[0].Team.toUpperCase();
        const abbrLower = latestAbbr.toLowerCase();

        const validTeam = allTeams.some(
          (t) => t?.Tm?.toLowerCase() === abbrLower
        );
        if (!validTeam) return;

        const match = allTeams.find(
          (t) =>
            t?.Tm === latestAbbr && t?.Year === 2025 && t?.StatType === "totals"
        );

        if (abbrLower && newPlayer.teamAbbr !== abbrLower) {
          setNewPlayer((prev) => ({
            ...prev,
            teamAbbr: abbrLower,
            team: match?.Team || "Unknown Team",
            logo: `https://a.espncdn.com/i/teamlogos/nba/500/${abbrLower}.png`,
          }));
        }

        const headshot = await getHeadshot(newPlayer.name);
        if (headshot) {
          setNewPlayer((prev) => ({ ...prev, headshot }));
        }
      } catch (err) {
        console.error("❌ Error in fetchAll:", err);
      }
    };

    fetchAll();
  }, [newPlayer?.bbref_id, allTeams, playerVersion]);

  const handleSearchWithFade = async (searchQuery) => {
    resetLoadingStates();

    const team = allTeams.find(
      (t) =>
        t?.Team?.toLowerCase() === searchQuery.toLowerCase() ||
        t?.Tm?.toLowerCase() === searchQuery.toLowerCase()
    );

    if (team) {
      try {
        const [gamesRes, statsRes, rosterRes] = await Promise.all([
          fetch(`/api/team/${team.Tm}/games`),
          fetch(`/api/team/${team.Tm.toUpperCase()}`),
          fetch(
            `/api/team/${team.Tm.toLowerCase()}/roster?year=${selectedSeason}`
          ),
        ]);

        const games = await gamesRes.json();
        const stats = await statsRes.json();
        const rosterData = await rosterRes.json();

        setTeamGames(games);
        setTeamStats(stats);
        setNewRoster(rosterData);

        setMatchedTeam(team);
        setSelectedPlayer(null);
        setSelectedType("team");

        // Store team search in localStorage
        const teamData = {
          name: team.Team || team.Tm,
          abbreviation: team.Tm,
          type: "team",
        };
        localStorage.setItem("lastSearchedItem", JSON.stringify(teamData));
      } catch (err) {
        console.error("❌ Failed to fetch team schedule or roster:", err);
        setContentReady(true);
        setIsLoadingNewContent(false);
        setIsFading(false);
      }

      return;
    }

    await new Promise((res) => setTimeout(res, 300));

    try {
      const playerRes = await fetch(
        `/api/player/lookup/${encodeURIComponent(searchQuery)}`
      );

      if (playerRes.ok) {
        const playerData = await playerRes.json();

        setFetchedStats([]);
        setFetchedGames([]);
        setNewRoster([]);
        setBio(null);
        setSelectedPlayer(playerData);
        setSelectedType("player"); // ✅ player selected

        const formattedPlayer = {
          name: playerData.name,
          bbref_id: playerData.bbref_id,
          teamAbbr: playerData.teamAbbr || "unknown",
          pos: playerData.pos || "Unknown",
          team: playerData.team || "Unknown",
          logo: `https://a.espncdn.com/i/teamlogos/nba/500/${(
            playerData.teamAbbr || "unknown"
          ).toLowerCase()}.png`,
        };

        setNewPlayer(formattedPlayer);

        if (playerData?.bbref_id && playerData?.name) {
          // Update to store player with type
          const playerSearchData = {
            ...formattedPlayer,
            type: "player",
          };
          localStorage.setItem(
            "lastSearchedItem",
            JSON.stringify(playerSearchData)
          );

          // Keep the old key for backward compatibility
          localStorage.setItem(
            "lastSearchedPlayer",
            JSON.stringify(formattedPlayer)
          );
        }

        setPlayerVersion((v) => v + 1);
        setMatchedTeam(null);
      } else {
        setNewPlayer(null);
        setSelectedPlayer(null);
        setMatchedTeam(null);
        setSelectedType(null); // ❌ reset type
        setContentReady(true);
        setIsLoadingNewContent(false);
        setIsFading(false);
      }
    } catch (err) {
      console.error("❌ Search handler failed:", err);
      setNewPlayer(null);
      setSelectedPlayer(null);
      setMatchedTeam(null);
      setSelectedType(null); // ❌ reset type
      setContentReady(true);
      setIsLoadingNewContent(false);
      setIsFading(false);
    }
  };

  useEffect(() => {
    if (!query || query.length < 2) return;

    const timeout = setTimeout(() => {
      fetch(`/api/search?query=${encodeURIComponent(query)}`)
        .then((res) => res.json())
        .then((data) => {
          setSearchResults(data);
        })
        .catch((err) => {
          console.error("❌ Debounced search failed:", err);
        });
    }, 300);

    return () => clearTimeout(timeout);
  }, [query]);

  useEffect(() => {
    if (!matchedTeam?.Tm || !selectedSeason) return;

    const fetchTeamRoster = async () => {
      resetLoadingStates();

      try {
        const [gamesRes, statsRes, rosterRes] = await Promise.all([
          fetch(`/api/team/${matchedTeam.Tm}/games?year=${selectedSeason}`),
          fetch(`/api/team/${matchedTeam.Tm}`),
          fetch(
            `/api/team/${matchedTeam.Tm.toLowerCase()}/roster?year=${selectedSeason}`
          ),
        ]);

        const games = await gamesRes.json();
        const stats = await statsRes.json();
        const rosterData = await rosterRes.json();

        setTeamGames(games);
        setTeamStats(stats);
        setNewRoster(rosterData);
      } catch (err) {
        console.error("❌ Error fetching team roster on year change:", err);
        setContentReady(true);
        setIsLoadingNewContent(false);
        setIsFading(false);
      }
    };

    fetchTeamRoster();
  }, [matchedTeam?.Tm, selectedSeason]);

  return {
    query,
    setQuery,
    handleSearchWithFade,
    selectedPlayer,
    newPlayer,
    matchedTeam,
    allTeams,
    fetchedStats,
    fetchedGames,
    newRoster,
    teamStats,
    teamGames,
    selectedSeason,
    setSelectedSeason,
    view,
    setView,
    isFading,
    isTabTransitioning,
    setIsTabTransitioning,
    isLoadingNewContent,
    contentReady,
    searchResults,
    roster,
    selectedType,
    bio,
  };
};

export default useSearchLogic;
