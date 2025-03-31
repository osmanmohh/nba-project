// import StatsTable from "./StatsTable/StatsTable";
// import Dropdown from "../../components/Dropdown/Dropdown";
// import { useState } from "react";

// function PlayerStatsSection({ playerSeasons, teamSeasons }) {
//   // Determine if this is for a team or player
//   const isTeam = !!teamSeasons;

//   // Set default stat type based on context
//   const [statType, setStatType] = useState(isTeam ? "per_game" : "Per Game");

//   // Player dropdown values (unchanged)
//   const playerStatTypeOptions = [
//     { value: "Per Game", label: "Per Game" },
//     { value: "Per Minute", label: "Per Minute" },
//     { value: "Totals", label: "Totals" },
//   ];

//   // Team dropdown values (lowercase)
//   const teamStatTypeOptions = [
//     { value: "per_game", label: "Per Game" },
//     { value: "per_poss", label: "Per 100 Poss" },
//     { value: "totals", label: "Totals" },
//   ];

//   const formatMinutes = (minutes) => {
//     if (!minutes || isNaN(minutes)) return "-";
//     const totalSeconds = Math.round(minutes * 60);
//     const mins = Math.floor(totalSeconds / 60);
//     const secs = totalSeconds % 60;
//     return `${mins}:${secs.toString().padStart(2, "0")}`;
//   };

//   const formattedPlayerSeasons = (type, seasonType) =>
//     playerSeasons
//       ?.filter(
//         (season) =>
//           season.Season_Type === seasonType && season.Stat_Type === type
//       )
//       .map((season) => ({
//         ...season,
//         MP: formatMinutes(season.MP),
//       }));

//   const formattedTeamSeasons = teamSeasons
//     ?.filter((season) => season.StatType === statType)
//     .map((season) => ({
//       ...season,
//       MP: formatMinutes(season.MP),
//     }));

//   return (
//     <>
//       {playerSeasons ? (
//         <div className="player-bio-section">
//           <div className="season-dropdown-container">
//             <Dropdown
//               options={playerStatTypeOptions}
//               value={statType}
//               onChange={setStatType}
//             />
//           </div>
//           <StatsTable
//             jsonData={formattedPlayerSeasons(statType, "Regular")}
//             title="Regular Season"
//           />
//           <StatsTable
//             jsonData={formattedPlayerSeasons(statType, "Playoffs")}
//             title="Playoffs"
//           />
//         </div>
//       ) : teamSeasons ? (
//         <div className="player-bio-section">
//           <div className="season-dropdown-container">
//             <Dropdown
//               options={teamStatTypeOptions}
//               value={statType}
//               onChange={setStatType}
//             />
//           </div>
//           <StatsTable
//             jsonData={formattedTeamSeasons}
//             title={teamStatTypeOptions.find((opt) => opt.value === statType)?.label}
//             columnsToShow={[
//               "Year",
//               "Tm",
//               "G",
//               "MP",
//               "PTS",
//               "FG",
//               "FGA",
//               "FG%",
//               "3P",
//               "3PA",
//               "3P%",
//               "FT",
//               "FTA",
//               "FT%",
//               "ORB",
//               "DRB",
//               "TRB",
//               "AST",
//               "TOV",
//               "STL",
//               "BLK",
//               "PF",
//             ]}
//           />
//         </div>
//       ) : null}
//     </>
//   );
// }

// export default PlayerStatsSection;
