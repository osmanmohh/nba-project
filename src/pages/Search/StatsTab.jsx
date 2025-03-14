import PlayerStatsSection from "./PlayerStatsSection";
import GamesTab from "./GamesTab";
import "./StatsTab.css";

export default function StatsTab({ playerSeasons }) {
  return (
    <div className="stats-tab">
      <PlayerStatsSection playerSeasons={playerSeasons}  />
    </div>
  );
}
