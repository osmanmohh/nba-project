import { useState, useMemo } from "react";
import "./index.css";
import StatsTable from "../StatsTable";
import Dropdown from "../../../components/Dropdown";

export default function GamesTab({
  games,
  selectedSeason,
  setSelectedSeason,
  isActive,
}) {
  if (!isActive) return null;

  // Extract available seasons dynamically
  const seasons = useMemo(() => {
    if (!games || games.length === 0) return [];

    // Extract unique seasons from games data
    return [...new Set(games.map((game) => game.Year))]
      .sort((a, b) => b - a)
      .map((year) => ({
        label: `${year - 1}-${year}`,
        value: year.toString(),
      }));
  }, [games]);

  // Filter games by selected season
  const filteredGames = useMemo(() => {
    return (
      games?.filter((game) => game.Year?.toString() === selectedSeason) || []
    );
  }, [games, selectedSeason]);

  // Group games by month and sort by most recent date
  const gamesByMonth = useMemo(() => {
    return filteredGames.reduce((acc, game) => {
      const gameDate = new Date(game.Date);
      if (isNaN(gameDate)) return acc; // Skip invalid dates

      const month = gameDate.toLocaleString("en-US", {
        month: "long",
        year: "numeric",
      });

      if (!acc[month]) acc[month] = [];
      acc[month].push({
        ...game,
        Date: gameDate.toLocaleDateString("en-US", {
          weekday: "short",
          month: "numeric",
          day: "numeric",
        }),
      });

      // Sort games in the month by most recent first
      acc[month].sort((a, b) => new Date(b.Date) - new Date(a.Date));

      return acc;
    }, {});
  }, [filteredGames]);

  const hasGames = Object.keys(gamesByMonth).length > 0;

  return (
    <div className="player-bio-section games">
      {/* Season Dropdown */}
      {seasons.length > 0 && (
        <div className="season-dropdown-container">
          <Dropdown
            options={seasons}
            value={selectedSeason}
            onChange={setSelectedSeason}
          />
        </div>
      )}

      {hasGames ? (
        Object.entries(gamesByMonth)
          .sort(([a], [b]) => new Date(b) - new Date(a)) // Sort months by newest first
          .map(([month, games]) => (
            <StatsTable
              key={month}
              jsonData={games}
              title={month}
              columnsToShow={[]}
            />
          ))
      ) : (
        <div className="no-games-message">
          No games available for this season
        </div>
      )}
    </div>
  );
}
//[
//  "Date",
//  "Team",
//  "Location",
//  "Opponent",
//  "Result",
//  "Minutes",
//  "Points",
//  "Rebounds",
//  "Assists",
//  "FGM",
//  "FGA",
//  "FG%",
//  "3PM",
//  "3PA",
//  "3P%",
//  "FTM",
//  "FTA",
//  "FT%",
