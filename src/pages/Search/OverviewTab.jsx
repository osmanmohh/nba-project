import "./OverviewTab.css";
import PlayerStatistics from "./PlayerStatistics";
import PlayerGamesSection from "./PlayerGamesSection";
export default function OverviewTab({ player, teamColor }) {
  return (
    <div className="overview-tab">
      <PlayerStatistics player={player}/>
      <PlayerGamesSection player={player}/>
    </div>
  );
}
