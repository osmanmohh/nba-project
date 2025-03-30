import { useState, useEffect } from "react";
import "./Search.css";
import TeamProfile from "./TeamProfile";
import PlayerProfile from "./PlayerProfile";
import PlayerViewToggle from "../../components/PlayerViewToggle";
import usePlayerData from "../../hooks/usePlayerData";
import SearchBar from "./SearchBar";
import { teamColors } from "../../../public/teamColors";
import { getHeadshot } from "../../../public/getHeadshot";
import OverviewTab from "./OverviewTab";
import StatsTab from "./StatsTab";
import GamesTab from "./GamesTab";
import teams from "/teams.json";
import gameLogs from "/game_logs.json";

function Search() {
  const {
    query,
    setQuery,
    selectedPlayer,
    selectedTeam,
    setSelectedPlayer,
    handleSearch,
  } = usePlayerData();

  const [view, setView] = useState("overview");
  const [latestTeam, setLatestTeam] = useState(null);
  const [selectedSeason, setSelectedSeason] = useState("2024");
  const [isTabTransitioning, setIsTabTransitioning] = useState(false);
  const [isFading, setIsFading] = useState(false);
  const [isLoadingNewContent, setIsLoadingNewContent] = useState(true);
  const [fetchedStats, setFetchedStats] = useState([]);
  const [fetchedGames, setFetchedGames] = useState([]);
  const [allTeams, setAllTeams] = useState([]);
  const [newRoster, setNewRoster] = useState([]);
  const [playerVersion, setPlayerVersion] = useState(0); // 💡 force refresh on same player

  const [newPlayer, setNewPlayer] = useState(() => {
    try {
      const stored = localStorage.getItem("lastSearchedPlayer");
      return stored ? JSON.parse(stored) : defaultPlayer();
    } catch {
      return defaultPlayer();
    }
  });

  function defaultPlayer() {
    return {
      name: "Stephen Curry",
      bbref_id: "curryst01",
      teamAbbr: "gsw",
      team: "Golden State Warriors",
      logo: "https://a.espncdn.com/i/teamlogos/nba/500/gsw.png",
    };
  }

  // Load all team data
  useEffect(() => {
    fetch("http://localhost:5001/api/team")
      .then((res) => res.json())
      .then((data) => {
        setAllTeams(data);
        console.log("🏀 Loaded allTeams:", data.length);
      })
      .catch((err) => console.error("❌ Failed to fetch teams:", err));
  }, []);

  // 🔄 Main fetcher - triggered when player or version changes
  useEffect(() => {
    if (!newPlayer?.bbref_id || allTeams.length === 0) {
      console.log("⚠️ useEffect skipped (missing newPlayer or allTeams)");
      return;
    }

    console.log("🔁 useEffect triggered for:", newPlayer.name, `(v${playerVersion})`);

    const fetchAll = async () => {
      try {
        const [statsRes, gamesRes] = await Promise.all([
          fetch(`http://localhost:5001/api/player/${newPlayer.bbref_id}/stats`),
          fetch(`http://localhost:5001/api/player/${newPlayer.bbref_id}/games`),
        ]);

        const stats = await statsRes.json();
        const games = await gamesRes.json();
        setFetchedStats(stats);
        setFetchedGames(games);
        console.log("📊 Stats loaded:", stats.length);
        console.log("📈 Games loaded:", games.length);

        const latestAbbr = games[0]?.Team?.toUpperCase();
        const abbrLower = latestAbbr?.toLowerCase();
        const match = allTeams.find(
          (t) => t?.Tm === latestAbbr && t?.Year === 2024 && t?.StatType === "totals"
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
          console.log("🧠 Headshot found for", newPlayer.name);
        }

        const rosterRes = await fetch(
          `http://localhost:5001/api/team/${abbrLower}/stats?year=${selectedSeason}`
        );
        const rosterData = await rosterRes.json();
        setNewRoster(
          rosterData.filter(
            (p) => p?.Stat_Type === "Per Game" && p?.Season_Type === "Regular"
          )
        );
        console.log("🧑‍🤝‍🧑 Roster loaded:", rosterData.length);
      } catch (err) {
        console.error("❌ Error in fetchAll:", err);
      } finally {
        setTimeout(() => {
          setIsFading(false);
          setIsLoadingNewContent(false);
        }, 300);
      }
    };

    fetchAll();
  }, [newPlayer?.bbref_id, allTeams, playerVersion]);

  // 🔍 Handles full search + transition
  const handleSearchWithFade = async (searchQuery) => {
    console.log("🔍 Search Query:", searchQuery);
    setIsFading(true);
    setIsLoadingNewContent(true);
    await new Promise((res) => setTimeout(res, 300));

    await handleSearch(searchQuery);

    try {
      const playerRes = await fetch(
        `http://localhost:5001/api/player/lookup/${encodeURIComponent(searchQuery)}`
      );
      let playerData = null;

      if (playerRes.ok) {
        playerData = await playerRes.json();
        console.log("✅ Player found:", playerData.name);
      } else {
        console.warn("❌ Player not found from API");
      }

      if (playerData?.name) {
        console.log("🎯 Setting playerState to:", playerData);
        setFetchedStats([]);
        setFetchedGames([]);
        setNewRoster([]);
        setSelectedPlayer(playerData);
        setNewPlayer({
          name: playerData.name,
          bbref_id: playerData.bbref_id,
          teamAbbr: playerData.teamAbbr || "unknown",
          team: playerData.team || "Unknown",
          logo: `https://a.espncdn.com/i/teamlogos/nba/500/${(playerData.teamAbbr || "unknown").toLowerCase()}.png`,
        });
        setPlayerVersion((v) => v + 1); // 💥 Force refresh
        setLatestTeam(null);
      } else {
        const team = allTeams.find(
          (t) =>
            t?.Team?.toLowerCase() === searchQuery.toLowerCase() ||
            t?.Tm?.toLowerCase() === searchQuery.toLowerCase()
        );

        if (team) {
          setLatestTeam(team);
          console.log("✅ Team match found:", team);
        } else {
          console.warn("❌ No player or team found");
          setNewPlayer(null);
          setLatestTeam(null);
        }
      }
    } catch (err) {
      console.error("❌ Search handler failed:", err);
      setNewPlayer(null);
      setLatestTeam(null);
    }
  };

  const handleViewChange = async (newView) => {
    setIsTabTransitioning(true);
    await new Promise((res) => setTimeout(res, 200));
    setView(newView);
    setIsTabTransitioning(false);
  };

  const isDataReady =
    newPlayer &&
    fetchedStats.length &&
    fetchedGames.length &&
    allTeams.length &&
    newRoster.length;

  if (!isDataReady || isLoadingNewContent) {
    return (
      <div className="search-page fade">
        <div className="loading-spinner">⏳ Loading...</div>
      </div>
    );
  }

  const teamColor = teamColors?.[
    (selectedPlayer ? newPlayer?.teamAbbr : latestTeam?.[0]?.Tm)?.toLowerCase()
  ] || {
    primary: "#808080",
    secondary: "#606060",
  };

  return (
    <div className={`search-page ${isFading ? "fade" : ""}`}>
      <div className="search-wrapper">
        <SearchBar
          query={query}
          setQuery={setQuery}
          handleSearch={() => handleSearchWithFade(query)}
          teamColor={teamColor}
        />

        <div
          className="search-results-container"
          style={{ backgroundColor: teamColor.primary }}
        >
          <PlayerViewToggle
            onViewChange={handleViewChange}
            teamColor={teamColor}
          />
          <PlayerProfile
            player={selectedPlayer}
            newPlayer={newPlayer}
            teams={allTeams}
          />
        </div>

        <div className={`player-bio-section ${isTabTransitioning ? "tab-transition" : ""}`}>
          {view === "overview" ? (
            <OverviewTab
              player={selectedPlayer}
              newPlayer={newPlayer}
              stats={fetchedStats}
              games={fetchedGames}
              setSelectedSeason={setSelectedSeason}
              selectedSeason={selectedSeason}
              teams={teams}
              allTeams={allTeams}
              newRoster={newRoster}
              team={latestTeam}
            />
          ) : view === "stats" ? (
            <StatsTab
              playerSeasons={
                selectedPlayer
                  ? fetchedStats
                  : allTeams.filter(
                      (team) =>
                        team?.Tm?.toLowerCase() === selectedTeam?.Tm?.toLowerCase() &&
                        team?.Year === parseInt(selectedSeason)
                    )
              }
            />
          ) : (
            <GamesTab games={selectedPlayer ? fetchedGames : gameLogs} />
          )}
        </div>
      </div>
    </div>
  );
}

export default Search;
