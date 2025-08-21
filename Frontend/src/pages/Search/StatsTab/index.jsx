import StatsTable from "../StatsTable";
import Dropdown from "../../../components/Dropdown";
import { useEffect, useState } from "react";
import "./index.css";

export default function StatsTab({ playerSeasons, teamSeasons, isActive }) {
  const isTeam = !!teamSeasons;
  const [statType, setStatType] = useState(isTeam ? "per_game" : "Per Game");

  useEffect(() => {
    // Reset stat type when team changes
    if (isTeam) {
      setStatType("per_game");
    } else {
      setStatType("Per Game");
    }
  }, [teamSeasons, playerSeasons, isTeam]);

  if (!isActive) return null;

  const playerStatTypeOptions = [
    { value: "Per Game", label: "Per Game" },
    { value: "Per Minute", label: "Per Minute" },
    { value: "Totals", label: "Totals" },
  ];

  const teamStatTypeOptions = [
    { value: "per_game", label: "Per Game" },
    { value: "per_poss", label: "Per 100 Poss" },
    { value: "totals", label: "Totals" },
  ];

  const formatMinutes = (minutes) => {
    if (!minutes || isNaN(minutes)) return "-";
    const totalSeconds = Math.round(minutes * 60);
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const formattedPlayerSeasons = (type, seasonType) =>
    playerSeasons
      ?.filter(
        (season) =>
          season.Season_Type === seasonType && season.Stat_Type === type
      )
      .map((season) => ({
        ...season,
        MP: formatMinutes(season.MP),
      }));

  const formattedTeamSeasons = teamSeasons
    ?.filter((season) => season.StatType === statType)
    .map((season) => ({
      ...season,
      MP: formatMinutes(season.MP),
    }));

  return (
    <div className="stats-tab">
      {playerSeasons ? (
        <div className="player-bio-section">
          <div className="season-dropdown-container">
            <Dropdown
              options={playerStatTypeOptions}
              value={statType}
              onChange={setStatType}
            />
          </div>
          <StatsTable
            jsonData={formattedPlayerSeasons(statType, "Regular")}
            title="Regular Season"
          />
          <StatsTable
            jsonData={formattedPlayerSeasons(statType, "Playoffs")}
            title="Playoffs"
          />
        </div>
      ) : teamSeasons ? (
        <div className="player-bio-section">
          <div className="season-dropdown-container">
            <Dropdown
              options={teamStatTypeOptions}
              value={statType}
              onChange={setStatType}
            />
          </div>
          <StatsTable
            jsonData={formattedTeamSeasons}
            title={
              teamStatTypeOptions.find((opt) => opt.value === statType)?.label
            }
            columnsToShow={[
              "Year",
              "Tm",
              "G",
              "MP",
              "PTS",
              "FG",
              "FGA",
              "FG%",
              "3P",
              "3PA",
              "3P%",
              "FT",
              "FTA",
              "FT%",
              "ORB",
              "DRB",
              "TRB",
              "AST",
              "TOV",
              "STL",
              "BLK",
              "PF",
            ]}
          />
        </div>
      ) : null}
    </div>
  );
}
