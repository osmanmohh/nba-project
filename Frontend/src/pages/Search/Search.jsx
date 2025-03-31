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


function Search() {
  const {
    query,
    setQuery,
    selectedPlayer,
    setSelectedPlayer,
    handleSearch,
  } = usePlayerData();

  const [view, setView] = useState("overview");
  const [selectedSeason, setSelectedSeason] = useState("2024");
  const [isTabTransitioning, setIsTabTransitioning] = useState(false);
  const [isFading, setIsFading] = useState(false);
  const [isLoadingNewContent, setIsLoadingNewContent] = useState(true);
  const [fetchedStats, setFetchedStats] = useState([]);
  const [fetchedGames, setFetchedGames] = useState([]);
  const [allTeams, setAllTeams] = useState([]);
  const [newRoster, setNewRoster] = useState([]);
  const [playerVersion, setPlayerVersion] = useState(0);
  const [matchedTeam, setMatchedTeam] = useState(null);
  const [teamGames, setTeamGames] = useState([]);
  const [teamStats, setTeamStats] = useState(null);

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

  useEffect(() => {
    fetch("http://localhost:5001/api/team")
      .then((res) => res.json())
      .then((data) => setAllTeams(data))
      .catch((err) => console.error("Failed to fetch teams:", err));
  }, []);

  useEffect(() => {
    if (!newPlayer?.bbref_id || allTeams.length === 0) return;

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

  const handleSearchWithFade = async (searchQuery) => {
    console.log("🔍 Search Query:", searchQuery);

    const team = allTeams.find(
      (t) =>
        t?.Team?.toLowerCase() === searchQuery.toLowerCase() ||
        t?.Tm?.toLowerCase() === searchQuery.toLowerCase()
    );

    if (team) {
      setIsFading(true);
      setIsLoadingNewContent(true);
      setMatchedTeam(team);
      setSelectedPlayer(null);

      try {
        const res = await fetch(
          `http://localhost:5001/api/team/${team.Tm}/games`
        );
        const data = await res.json();
        setTeamGames(data);

        const statsRes = await fetch(
          `http://localhost:5001/api/team/${team.Tm.toUpperCase()}`
        );
        const statsData = await statsRes.json();
        setTeamStats(statsData);

        const rosterRes = await fetch(
          `http://localhost:5001/api/team/${team.Tm}/stats?year=${selectedSeason}`
        );
        const rosterData = await rosterRes.json();
        setNewRoster(
          rosterData.filter(
            (p) => p?.Stat_Type === "Per Game" && p?.Season_Type === "Regular"
          )
        );
      } catch (err) {
        console.error("❌ Failed to fetch team schedule or roster:", err);
      } finally {
        setTimeout(() => {
          setIsFading(false);
          setIsLoadingNewContent(false);
        }, 300);
      }

      return;
    }

    setIsFading(true);
    setIsLoadingNewContent(true);
    await new Promise((res) => setTimeout(res, 300));
    await handleSearch(searchQuery);

    try {
      const playerRes = await fetch(
        `http://localhost:5001/api/player/lookup/${encodeURIComponent(searchQuery)}`
      );

      if (playerRes.ok) {
        const playerData = await playerRes.json();

        setFetchedStats([]);
        setFetchedGames([]);
        setNewRoster([]);
        setSelectedPlayer(playerData);
        setNewPlayer({
          name: playerData.name,
          bbref_id: playerData.bbref_id,
          teamAbbr: playerData.teamAbbr || "unknown",
          pos: playerData.pos || "Unknown",
          team: playerData.team || "Unknown",
          logo: `https://a.espncdn.com/i/teamlogos/nba/500/${
            (playerData.teamAbbr || "unknown").toLowerCase()
          }.png`,
        });
        setPlayerVersion((v) => v + 1);
        setMatchedTeam(null);
      } else {
        setNewPlayer(null);
        setSelectedPlayer(null);
        setMatchedTeam(null);
      }
    } catch (err) {
      console.error("❌ Search handler failed:", err);
      setNewPlayer(null);
      setSelectedPlayer(null);
      setMatchedTeam(null);
    }
  };

  const handleViewChange = async (newView) => {
    setIsTabTransitioning(true);
    await new Promise((res) => setTimeout(res, 200));
    setView(newView);
    setIsTabTransitioning(false);
  };

  const isPlayerDataReady =
    newPlayer &&
    fetchedStats.length &&
    fetchedGames.length &&
    newRoster.length;

  const isTeamDataReady = matchedTeam && teamGames.length && newRoster.length;

  const isDataReady = allTeams.length && (isPlayerDataReady || isTeamDataReady);

  if (!isDataReady || isLoadingNewContent) {
    return <div className="search-page fade"></div>;
  }

  const teamColor = teamColors?.[
    (selectedPlayer ? newPlayer?.teamAbbr : matchedTeam?.Tm)?.toLowerCase()
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
          {matchedTeam && !selectedPlayer ? (
            <TeamProfile team={matchedTeam} />
          ) : (
            <PlayerProfile
              player={selectedPlayer}
              newPlayer={newPlayer}
              teams={allTeams}
            />
          )}
        </div>

        <div className={`player-bio-section ${isTabTransitioning ? "tab-transition" : ""}`}>
          {view === "overview" ? (
            <OverviewTab
              player={selectedPlayer}
              newPlayer={newPlayer}
              stats={selectedPlayer ? fetchedStats : teamStats}
              games={selectedPlayer ? fetchedGames : teamGames}
              teamStats={teamStats}
              setSelectedSeason={setSelectedSeason}
              selectedSeason={selectedSeason}
              teams={allTeams}
              allTeams={allTeams}
              newRoster={newRoster}
              team={matchedTeam}
            />
          ) : view === "stats" ? (
            <StatsTab
              playerSeasons={
                selectedPlayer
                  ? fetchedStats
                  : null
              }
              teamSeasons={
                matchedTeam
                  ? teamStats
                  : null
              }
            />
          ) : (
            <GamesTab games={selectedPlayer ? fetchedGames : teamGames} />
          )}
        </div>
      </div>
    </div>
  );
}

export default Search;
