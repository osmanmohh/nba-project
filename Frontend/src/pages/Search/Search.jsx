import "./Search.css";
import { teamColors } from "../../../public/teamColors";
import SearchBar from "./SearchBar";
import ProfileCard from "./ProfileCard";
import OverviewTab from "./OverviewTab";
import StatsTab from "./StatsTab";
import GamesTab from "./GamesTab";
import useSearchLogic from "../../hooks/useSearchLogic";
import { BeatLoader } from "react-spinners";
import { useState, useEffect } from "react";

function Search() {
  const {
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
    roster,
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
    selectedType,
    bio,
  } = useSearchLogic();

  // Add state for tracking initial fade-in
  const [showContent, setShowContent] = useState(false);
  const [initialFade, setInitialFade] = useState(true);
  const [spinnerVisible, setSpinnerVisible] = useState(true);

  // Handle fade-in when content becomes ready
  useEffect(() => {
    if (contentReady && !showContent) {
      // Keep the spinner visible for a moment before starting the transition
      setTimeout(() => {
        // Start fading out the spinner
        setSpinnerVisible(false);

        // After spinner starts fading, begin revealing content
        setTimeout(() => {
          setShowContent(true);

          // After content starts appearing, remove the initial fade class
          setTimeout(() => {
            setInitialFade(false);
          }, 400);
        }, 300);
      }, 200);
    }
  }, [contentReady, showContent]);

  const handleViewChange = async (newView) => {
    setIsTabTransitioning(true);
    await new Promise((res) => setTimeout(res, 200));
    setView(newView);
    setTimeout(() => {
      setIsTabTransitioning(false);
    }, 50);
  };

  const teamColor = teamColors?.[
    (selectedPlayer ? newPlayer?.teamAbbr : matchedTeam?.Tm)?.toLowerCase()
  ] || {
    primary: "#808080",
    secondary: "#606060",
  };

  // Show loader if content is not ready or is loading or fading
  if ((!contentReady || isLoadingNewContent || isFading) && spinnerVisible) {
    return (
      <div
        className={`loading-spinner-container ${!spinnerVisible ? "fade-out" : ""}`}
      >
        <BeatLoader size={12} color="#ffffff" />
      </div>
    );
  }

  return (
    <div
      className={`search-page ${isFading ? "fade" : ""} ${initialFade ? "initial-fade" : ""}`}
    >
      <div
        className={`search-wrapper ${showContent ? "show-content" : "hide-content"}`}
      >
        <SearchBar
          query={query}
          setQuery={setQuery}
          handleSearchWithFade={handleSearchWithFade}
          searchResults={searchResults}
          teamColor={teamColor}
        />

        {(selectedPlayer || matchedTeam) && (
          <>
            <div
              className="search-results-container"
              style={{ backgroundColor: teamColor.primary }}
            >
              <ProfileCard
                type={selectedPlayer ? "player" : "team"}
                player={selectedPlayer ? newPlayer : null}
                team={matchedTeam}
                teamColor={teamColor}
                handleViewChange={handleViewChange}
              />
            </div>
            <div className="player-bio-section-container">
              <div
                className={`player-bio-section ${
                  isTabTransitioning ? "tab-transition" : ""
                }`}
              >
                <>
                  <OverviewTab
                    isActive={view === "overview"}
                    isReady={contentReady}
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
                    roster={roster}
                    team={matchedTeam}
                    selectedType={selectedType}
                    bio={bio}
                  />
                  <StatsTab
                    isActive={view === "stats"}
                    playerSeasons={selectedPlayer ? fetchedStats : null}
                    teamSeasons={matchedTeam ? teamStats : null}
                  />
                  <GamesTab
                    isActive={view === "games"}
                    games={selectedPlayer ? fetchedGames : teamGames}
                    year={selectedSeason}
                    setSelectedSeason={setSelectedSeason}
                    selectedSeason={selectedSeason.toString()}
                  />
                </>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Search;
