import { useState, useEffect } from "react";
import teams from "/teams.json";
import "./OverviewTab.css";
import PlayerStatistics from "./PlayerStatistics";
import PlayerGamesSection from "./PlayerGamesSection";
import TeamInfo from "./TeamInfo";
import Dropdown from "../../components/Dropdown/Dropdown";
import { teamColors } from "../../../public/teamColors";
import { getHeadshot } from "../../../public/getHeadshot";

export default function OverviewTab({
  isActive,
  player,
  team,
  newPlayer,
  games,
  playerHeadshot,
  teams,
  allTeams,
  newRoster,
  teamStats,
  selectedSeason,
  setSelectedSeason,
  selectedType, // ✅ NEW PROP
  stats,
  bio,
  isReady,
}) {
  if (!isActive || !isReady) return null;

  let seasons = [];

  if (team) {
    seasons = teamStats.length
      ? [...new Set(teamStats.map((p) => p.Year))]
          .sort((a, b) => b - a)
          .map((year) => ({
            label: `${year - 1}-${year}`,
            value: year.toString(),
          }))
      : [];
  }

  return (
    <div className="ctn">
      {selectedType === "player" ? (
        <div className={`overview-tab`}>
          <div className="ctn">
            <PlayerStatistics
              player={player}
              newPlayer={newPlayer}
              stats={stats}
              bio={bio}
            />
            <PlayerGamesSection
              player={player}
              newPlayer={newPlayer}
              games={games}
              playerHeadshot={playerHeadshot}
            />
          </div>
          <h2 className="team-title">
            More {newPlayer.team.split(" ").pop()} Info
          </h2>
          <div className="ctn">
            <TeamInfo
              teams={teams}
              newPlayer={newPlayer}
              year={parseInt(selectedSeason)}
              allTeams={allTeams}
              newTeam={allTeams.find(
                (team) =>
                  team.Tm?.toLowerCase() === newPlayer.teamAbbr?.toLowerCase()
              )}
              games={games}
              teamStats={teamStats}
              newRoster={newRoster}
            />
          </div>
        </div>
      ) : selectedType === "team" ? (
        <div className={`overview-tab`}>
          {seasons.length > 0 && (
            <div className="season-dropdown-container">
              <Dropdown
                options={seasons}
                value={selectedSeason}
                onChange={(newValue) => setSelectedSeason(newValue)}
              />
            </div>
          )}
          <div className="ctn">
            <TeamInfo
              team={team}
              teams={teams}
              year={parseInt(selectedSeason)}
              newTeam={team}
              allTeams={allTeams}
              games={games}
              teamStats={teamStats}
              newRoster={newRoster}
            />
          </div>
        </div>
      ) : (
        <p>No data available</p>
      )}
    </div>
  );
}
