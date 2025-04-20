import { useState, useMemo } from "react";
import "./GamesTab.css";
import StatsTable from "./StatsTable/StatsTable";
import Dropdown from "../../components/Dropdown/Dropdown";

export default function GamesTab({
  games,
  selectedSeason,
  setSelectedSeason,
  isActive,
}) {
  if (!isActive) return null;

  // Extract available seasons dynamically
  const seasons = useMemo(() => {
    const uniqueSeasons = [...new Set(games.map((game) => game.Year))];
    return uniqueSeasons
      .sort((a, b) => b - a)
      .map((season) => ({
        label: `${season - 1}-${season}`,
        value: season.toString(),
      }));
  }, [games]);

  // Filter games by selected season
  const filteredGames = useMemo(() => {
    return games.filter((game) => game.Year.toString() === selectedSeason);
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

  return (
    <div className="player-bio-section games">
      {/*  Season Dropdown */}
      <div className="season-dropdown-container">
        <Dropdown
          options={seasons}
          value={selectedSeason}
          onChange={setSelectedSeason}
        />
      </div>

      {Object.entries(gamesByMonth)
        .sort(([a], [b]) => new Date(b) - new Date(a)) // Sort months by newest first
        .map(([month, games]) => (
          <StatsTable
            key={month}
            jsonData={games}
            title={month}
            columnsToShow={[]}
          />
        ))}
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
