import { useState, useEffect } from "react";
import "./Search.css";
import TeamInfo from "./TeamInfo";
import teams from "/teams.json";
import teamData from "/team_data.json";
import { teamColors } from "../../../public/teamColors";
import SearchBar from "./SearchBar";
import PlayerProfile from "./PlayerProfile";
import TeamProfile from "./TeamProfile";
import PlayerViewToggle from "../../components/PlayerViewToggle";
import usePlayerData from "../../hooks/usePlayerData";
import gameLogs from "/game_logs.json";
import OverviewTab from "./OverviewTab";
import StatsTab from "./StatsTab";
import GamesTab from "./GamesTab";
import allPlayers from "/all_players.json";

function Search() {
  const {
    query,
    setQuery,
    selectedPlayer,
    selectedTeam,
    players,
    playerSeasons,
    handleSearch,
  } = usePlayerData();

  const [view, setView] = useState("overview");
  const [latestTeam, setLatestTeam] = useState(null);
  const [selectedSeason, setSelectedSeason] = useState("2024");
  const [isFading, setIsFading] = useState(false);
  const [isTabTransitioning, setIsTabTransitioning] = useState(false);

  // Handle fade effect on search
  const handleSearchWithFade = async (searchQuery) => {
    setIsFading(true);
    await new Promise((resolve) => setTimeout(resolve, 200));
    handleSearch(searchQuery);
    setIsFading(false);
  };

  // Handle tab transitions
  const handleViewChange = async (newView) => {
    setIsTabTransitioning(true);
    await new Promise((resolve) => setTimeout(resolve, 200));
    setView(newView);
    setIsTabTransitioning(false);
  };

  useEffect(() => {
    if (selectedTeam && !selectedPlayer) {
      const filteredTeam = Array.isArray(selectedTeam)
        ? selectedTeam
        : [selectedTeam];

      if (filteredTeam.length > 0 && filteredTeam !== latestTeam) {
        setLatestTeam(filteredTeam);
        setView("overview"); // Reset to overview when team changes
      }
    } else {
      setLatestTeam(null);
    }
  }, [selectedTeam, selectedPlayer]);

  if (!selectedPlayer && !latestTeam) {
    return <div>Loading players and teams...</div>;
  }

  // Handle Team Rendering
  if (latestTeam && !selectedPlayer) {
    const teamColor = teamColors[latestTeam[0].Tm] || {
      primary: "#808080",
      secondary: "#606060",
    };

    return (
      <div className="search-page">
        <div className={`search-wrapper ${isFading ? "fade" : ""}`}>
          <SearchBar
            query={query}
            setQuery={setQuery}
            handleSearch={handleSearchWithFade}
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
            <TeamProfile team={latestTeam[0]} />
          </div>

          <div
            className={`player-bio-section ${isTabTransitioning ? "tab-transition" : ""}`}
          >
            {view === "overview" ? (
              <OverviewTab
                team={latestTeam}
                selectedSeason={selectedSeason}
                setSelectedSeason={setSelectedSeason}
              />
            ) : view === "stats" ? (
              <StatsTab
                teamSeasons={teamData.filter(
                  (team) => team.Tm.toLowerCase() === selectedTeam.Tm
                )}
              />
            ) : (
              <GamesTab games={gameLogs} />
            )}
          </div>
        </div>
      </div>
    );
  }

  // Handle Player Rendering
  if (selectedPlayer) {
    const teamColor = teamColors[selectedPlayer.Tm] || {
      primary: "#808080",
      secondary: "#606060",
    };

    return (
      <div className="search-page">
        <div className={`search-wrapper ${isFading ? "fade" : ""}`}>
          <SearchBar
            query={query}
            setQuery={setQuery}
            handleSearch={handleSearchWithFade}
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
            <PlayerProfile player={selectedPlayer} />
          </div>

          <div
            className={`player-bio-section ${isTabTransitioning ? "tab-transition" : ""}`}
          >
            {view === "overview" ? (
              <OverviewTab
                player={selectedPlayer}
                setSelectedSeason={setSelectedSeason}
                selectedSeason={selectedSeason}
              />
            ) : view === "stats" ? (
              <StatsTab playerSeasons={playerSeasons} />
            ) : (
              <GamesTab games={gameLogs} />
            )}
          </div>
        </div>
      </div>
    );
  }

  return <div>Loading players and teams...</div>;
}

export default Search;
