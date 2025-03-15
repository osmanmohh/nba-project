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
  const [selectedSeason, setSelectedSeason] = useState("2024"); // ✅ Lift season state

  useEffect(() => {
    if (selectedTeam && !selectedPlayer) {
      const filteredTeam = Array.isArray(selectedTeam)
        ? selectedTeam
        : [selectedTeam];

      if (filteredTeam.length > 0 && filteredTeam !== latestTeam) {
        setLatestTeam(filteredTeam);
      }
    } else {
      setLatestTeam(null);
    }
  }, [selectedTeam, selectedPlayer]);

  if (!selectedPlayer && !latestTeam) {
    return <div>Loading players and teams...</div>;
  }

  // ✅ Handle Team Rendering
  if (latestTeam && !selectedPlayer) {
    const teamColor = teamColors[latestTeam[0].Tm] || {
      primary: "#808080",
      secondary: "#606060",
    };

    return (
      <div className="search-page">
        <div className="search-wrapper">
          <SearchBar
            query={query}
            setQuery={setQuery}
            handleSearch={handleSearch}
            teamColor={teamColor}
          />
          <div
            className="search-results-container"
            style={{ backgroundColor: teamColor.primary }}
          >
            <PlayerViewToggle onViewChange={setView} teamColor={teamColor} />
            <TeamProfile team={latestTeam[0]} />
          </div>

          {view === "overview" ? (
            <OverviewTab
              team={latestTeam}
              selectedSeason={selectedSeason} // ✅ Pass season state
              setSelectedSeason={setSelectedSeason} // ✅ Allow updates
            />
          ) : view === "stats" ? (
            <StatsTab playerSeasons={teamData.filter(team => team.Tm.toLowerCase() === selectedTeam.Tm)} />
          ) : (
            <GamesTab games={gameLogs} />
          )}
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
          <SearchBar
            query={query}
            setQuery={setQuery}
            handleSearch={handleSearch}
            teamColor={teamColor}
          />

          <div
            className="search-results-container"
            style={{ backgroundColor: teamColor.primary }}
          >
            <PlayerViewToggle onViewChange={setView} teamColor={teamColor} />
            <PlayerProfile player={selectedPlayer} />
          </div>

          {view === "overview" ? (
            <OverviewTab
              player={selectedPlayer}
              setSelectedSeason={setSelectedSeason} // ✅ Allow updates
              selectedSeason={selectedSeason} // ✅ Pass to OverviewTab
            />
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
