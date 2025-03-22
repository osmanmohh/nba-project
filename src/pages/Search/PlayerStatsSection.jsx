import StatsTable from "./StatsTable/StatsTable";
import Dropdown from "../../components/Dropdown/Dropdown";
import { useState } from "react";

function PlayerStatsSection({ playerSeasons, teamSeasons }) {
  const [statType, setStatType] = useState("per_game");

  const statTypeOptions = [
    { value: "per_game", label: "Per Game" },
    { value: "per_poss", label: "Per 100 Possessions" },
    { value: "totals", label: "Totals" },
  ];

  return (
    <>
      {playerSeasons ? (
        <div className="player-bio-section">
          <div className="season-dropdown-container">
            <Dropdown
              options={statTypeOptions}
              value={statType}
              onChange={setStatType}
            />
          </div>
          <StatsTable jsonData={playerSeasons} title="Regular Season" />
          <StatsTable jsonData={playerSeasons} title="Regular Season" />
          <StatsTable jsonData={playerSeasons} title="Regular Season" />

        </div>
      ) : teamSeasons ? (
        <div className="player-bio-section">
          <div className="season-dropdown-container">
            <Dropdown
              options={statTypeOptions}
              value={statType}
              onChange={setStatType}
            />
          </div>
          <StatsTable
            jsonData={teamSeasons.filter(
              (season) => season.StatType === statType
            )}
            title={statTypeOptions.find((opt) => opt.value === statType)?.label}
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
    </>
  );
}

export default PlayerStatsSection;
