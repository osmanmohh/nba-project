import "./Search.css";
import { teamColors } from "../../../public/teamColors";
import { useState } from "react";
import SearchBar from "./SearchBar";
import PlayerProfile from "./PlayerProfile";
import PlayerStatistics from "./PlayerStatistics";
import PlayerViewToggle from "../../components/PlayerViewToggle";
import usePlayerData from "../../hooks/usePlayerData";
import PlayerStatsSection from "./PlayerStatsSection";

import OverviewTab from "./OverviewTab";
import StatsTab from "./StatsTab";

function Search() {
  const {
    query,
    setQuery,
    selectedPlayer,
    players,
    playerSeasons,
    handleSearch,
  } = usePlayerData();

  const [view, setView] = useState("overview");

  if (players.length === 0) {
    return <div>Loading players...</div>;
  }

  const player = selectedPlayer || players[0];
  const teamColor = teamColors[player.Tm] || {
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

        {player && <PlayerProfile player={player} />}
      </div>

      {/* ✅ Dynamically render tabs */}
      {player &&
        (view === "overview" ? (
          <OverviewTab player={player} teamColor={teamColor} />
        ) : (
          <StatsTab playerSeasons={playerSeasons} />
        ))}
    </div>
    </div>
  );
}

export default Search;