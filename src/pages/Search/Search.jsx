import "./Search.css";
import TeamInfo from "./TeamInfo";
import teams from "/teams.json";
import { teamColors } from "../../../public/teamColors";
import { useState, useEffect } from "react";
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

  useEffect(() => {
    if (selectedTeam && !selectedPlayer) {
      const filteredTeam = Array.isArray(selectedTeam)
        ? selectedTeam.find((t) => t.Year === 2024) || selectedTeam[0]
        : selectedTeam;

      // ✅ Prevents redundant updates if the team is unchanged
      if (filteredTeam && filteredTeam !== latestTeam) {
        setLatestTeam(filteredTeam);
      }
    } else {
      // ✅ Reset latestTeam when switching to a player
      setLatestTeam(null);
    }
  }, [selectedTeam, selectedPlayer]); // ✅ Runs only when `selectedTeam` or `selectedPlayer` changes

  if (!selectedPlayer && !latestTeam) {
    return <div>Loading players and teams...</div>;
  }

  // ✅ Handle Team Rendering
  if (latestTeam && !selectedPlayer) {
    const teamColor = teamColors[latestTeam.Tm] || {
      primary: "#808080",
      secondary: "#606060",
    };
    console.log("Latest Team:", latestTeam.Tm);
    console.log("Filtered Players for Team:", allPlayers.filter(
      (p) => p.Tm === latestTeam.Tm && p.Year === "2024"
    ));
  

    return (
      <div className="search-page">
        <div className="search-wrapper">
          <div
            className="search-results-container"
            style={{ backgroundColor: teamColor.primary }}
          >
            <PlayerViewToggle onViewChange={setView} teamColor={teamColor} />

            <SearchBar
              query={query}
              setQuery={setQuery}
              handleSearch={handleSearch}
              teamColor={teamColor}
            />
            <TeamProfile team={latestTeam} />
          </div>
          <OverviewTab
            team={allPlayers.filter(
              (p) => p.Tm === latestTeam.Tm && p.Year === "2024"
            )}
          />
        </div>
      </div>
    );
  }

  // ✅ Handle Player Rendering
  if (selectedPlayer) {
    const teamColor = teamColors[selectedPlayer.Tm] || {
      primary: "#808080",
      secondary: "#606060",
    };

    return (
      <div className="search-page">
        <div className="search-wrapper">
          <div
            className="search-results-container"
            style={{ backgroundColor: teamColor.primary }}
          >
            <PlayerViewToggle onViewChange={setView} teamColor={teamColor} />

            <SearchBar
              query={query}
              setQuery={setQuery}
              handleSearch={handleSearch}
              teamColor={teamColor}
            />

            <PlayerProfile player={selectedPlayer} />
          </div>

          {/* ✅ Dynamically render tabs */}
          {view === "overview" ? (
            <OverviewTab player={selectedPlayer} teamColor={teamColor} />
          ) : view === "stats" ? (
            <StatsTab playerSeasons={playerSeasons} />
          ) : (
            <GamesTab games={gameLogs} />
          )}
        </div>
      </div>
    );
  }

  return <div>Loading players and teams...</div>;
}

export default Search;
