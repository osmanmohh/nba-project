import PlayerStatsSection from "./PlayerStatsSection";
import GamesTab from "./GamesTab";
import "./StatsTab.css";

export default function StatsTab({ playerSeasons, teamSeasons }) {
  return (
    <div className="stats-tab">
      
      {playerSeasons ? (
        <PlayerStatsSection playerSeasons={playerSeasons} />
      ) : teamSeasons ? (
        <PlayerStatsSection teamSeasons={teamSeasons} />
      ) : null}
    </div>
  );
}
