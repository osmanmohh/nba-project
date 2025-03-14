import players from "/all_players.json";
import teams from "/teams.json";
import "./OverviewTab.css";
import PlayerStatistics from "./PlayerStatistics";
import PlayerGamesSection from "./PlayerGamesSection";
import TeamInfo from "./TeamInfo";

export default function OverviewTab({ player, team, teamColor }) {
  return (
    <div className="ctn">
      {player ? (
        // ✅ Player Overview
        <div className="overview-tab">
          <div className="ctn">
            <PlayerStatistics player={player} />
            <PlayerGamesSection player={player} />
          </div>
          <div className="ctn">
          <TeamInfo
    team={players.filter((p) => p.Tm === player.Tm && p.Year === "2024")} teams={teams}
    />
          </div>
        </div>
      ) : team ? (
        // ✅ Team Overview
        <div className="overview-tab">
          <div className="ctn">
          <TeamInfo
    team={players.filter((p) => p.Tm === team[0].Tm && p.Year === "2024")} teams={teams}
    />          </div>
        </div>
      ) : (
        <p>No data available</p> // ✅ Handles empty state
      )}
    </div>
  );
}
