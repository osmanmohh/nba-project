import { useTeams } from "../../../../useTeamsStore";
import StandingsCard from "../StandingsCard/StandingsCard";
import "./PowerRankings.css";

function PowerRankings() {
  const { teams } = useTeams(); // Get all teams (without filtering by conference)

  // TODO: Replace this with a custom ranking algorithm later
  const powerRankedTeams = [...teams].sort((a, b) => (a.predictedRank || a.rank) - (b.predictedRank || b.rank));

  return (
    <div className="power-rankings">
      {powerRankedTeams.slice(0, 5).map((team) => (
        <StandingsCard key={team.tm} team={team} />
      ))}
    </div>
  );
}

export default PowerRankings;
