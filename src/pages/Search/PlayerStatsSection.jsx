import StatsTable from "./StatsTable/StatsTable";

function PlayerStatsSection({ playerSeasons }) {
  return (
    <div className="player-bio-section">
      <StatsTable
        jsonData={playerSeasons}
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
          "REB",
          "AST",
          "TOV",
          "STL",
          "BLK",
          "PF",
          "+/-",
        ]}
        title="TRADITIONAL STATS"
      />
      <StatsTable
        jsonData={playerSeasons}
        columnsToShow={[
          "Year",
          "Tm",
          "G",
          "MP",
          "eFG%",
          "2P%",
          "ORtg",
          "DRtg",
          "NRtg",
          "W/L%",
          "WS",
          "WS/48",
          "BPM",
          "VORP",
        ]}
        title="ADVANCED STATS"
      />
    </div>
  );
}

export default PlayerStatsSection;
