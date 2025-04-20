import { useEffect, useState } from "react";
import "./PlayerStatistics.css";
import { teamColors } from "../../../public/teamColors";

export default function PlayerStatistics({ newPlayer, stats, bio }) {
  const [perGameStats, setPerGameStats] = useState(null);
  const [playoffStats, setPlayoffStats] = useState(null);

  const statsData = stats;
  useEffect(() => {
    if (!newPlayer?.bbref_id || perGameStats) return;

    const fetchPlayerData = async () => {
      try {
        const calculateWeightedStats = (stats, seasonType) => {
          const gamesPlayedStats = stats.filter(
            (s) => s.Stat_Type === "Per Game" && s.Season_Type === seasonType
          );

          const totals = {
            G: 0,
            PTS: 0,
            REB: 0,
            AST: 0,
            STL: 0,
            BLK: 0,
            MP: 0,
            TOV: 0,
            FG: 0,
            TP: 0,
            FT: 0,
            FG_ATT: 0,
            TP_ATT: 0,
            FT_ATT: 0,
          };

          for (const row of gamesPlayedStats) {
            const G = parseFloat(row.G);
            if (!G) continue;
            totals.G += G;
            totals.PTS += G * parseFloat(row.PTS || 0);
            totals.REB += G * parseFloat(row.REB || 0);
            totals.AST += G * parseFloat(row.AST || 0);
            totals.STL += G * parseFloat(row.STL || 0);
            totals.BLK += G * parseFloat(row.BLK || 0);
            totals.MP += G * parseFloat(row.MP || 0);
            totals.TOV += G * parseFloat(row.TOV || 0);

            const FGA = parseFloat(row.FGA || 0);
            const FG_PCT = parseFloat(row["FG%"] || 0);
            const TPA = parseFloat(row["3PA"] || 0);
            const TP_PCT = parseFloat(row["3P%"] || 0);
            const FTA = parseFloat(row["FTA"] || 0);
            const FT_PCT = parseFloat(row["FT%"] || 0);

            totals.FG += FGA * FG_PCT;
            totals.TP += TPA * TP_PCT;
            totals.FT += FTA * FT_PCT;
            totals.FG_ATT += FGA;
            totals.TP_ATT += TPA;
            totals.FT_ATT += FTA;
          }

          const avg = (total, div) => (div ? total / div : null);

          return {
            PTS: avg(totals.PTS, totals.G),
            REB: avg(totals.REB, totals.G),
            AST: avg(totals.AST, totals.G),
            STL: avg(totals.STL, totals.G),
            BLK: avg(totals.BLK, totals.G),
            MP: avg(totals.MP, totals.G),
            TOV: avg(totals.TOV, totals.G),
            "FG%": avg(totals.FG, totals.FG_ATT),
            "3P%": avg(totals.TP, totals.TP_ATT),
            "FT%": avg(totals.FT, totals.FT_ATT),
          };
        };

        const round = (val, isPct = false) => {
          if (val == null) return "-";
          const fixed = isPct ? (val * 100).toFixed(1) : val.toFixed(1);
          return parseFloat(fixed);
        };

        const regular = calculateWeightedStats(statsData, "Regular");
        const playoffs = calculateWeightedStats(statsData, "Playoffs");

        Object.entries(regular).forEach(
          ([k, v]) => (regular[k] = round(v, k.includes("%")))
        );
        Object.entries(playoffs).forEach(
          ([k, v]) => (playoffs[k] = round(v, k.includes("%")))
        );

        setPerGameStats(regular);
        setPlayoffStats(playoffs);
      } catch (err) {
        console.error("Failed to load player data:", err);
      }
    };

    fetchPlayerData();
  }, [newPlayer]);

  if (!bio || !perGameStats) return <div>Loading player stats...</div>;

  const teamColor = teamColors[newPlayer.teamAbbr] || {
    primary: "#909090",
    secondary: "#909090",
  };

  const Detail = ({ label, value }) => (
    <div className={`detail ${label.toLowerCase()}`}>
      <div className="detail-value">{value ?? "-"}</div>
      <div className="detail-label">{label}</div>
    </div>
  );

  const bioDetails = [
    { label: "HEIGHT", value: bio.height },
    { label: "WEIGHT", value: bio.weight },
    { label: "POSITION", value: bio.pos },
    { label: "COLLEGE", value: bio.college },
    {
      label: "BIRTHDATE",
      value: bio.birthdate
        ? new Date(bio.birthdate).toLocaleDateString("default", {
            month: "long",
            day: "numeric",
            year: "numeric",
          })
        : "-",
    },
    { label: "DRAFT", value: bio.draft },
    {
      label: "EXPERIENCE",
      value: bio.draft
        ? `${new Date().getFullYear() - parseInt(bio.draft.split(" ")[0], 10)} years`
        : "Rookie",
    },
    {
      label: "AGE",
      value: `${new Date().getFullYear() - new Date(bio.birthdate).getFullYear()} years`,
    },
  ];

  const statKeys = [
    "PTS",
    "REB",
    "AST",
    "STL",
    "BLK",
    "MP",
    "FG%",
    "3P%",
    "FT%",
    "TOV",
  ];
  const statLabels = [
    "PPG",
    "RPG",
    "APG",
    "SPG",
    "BPG",
    "MPG",
    "FG%",
    "3P%",
    "FT%",
    "TOV",
  ];

  return (
    <div className="player-statistics">
      <div
        className="player-grid-container"
        style={{ backgroundColor: teamColor.primary }}
      >
        <div className="player-details-grid bio">
          {bioDetails.map((item) => (
            <Detail key={item.label} label={item.label} value={item.value} />
          ))}
        </div>
      </div>

      <div
        className="player-grid-container"
        style={{ backgroundColor: teamColor.primary }}
      >
        <h1>Career Regular Season</h1>
        <div className="player-stats-grid">
          {statKeys.map((key, i) => (
            <Detail key={key} label={statLabels[i]} value={perGameStats[key]} />
          ))}
        </div>
      </div>

      {playoffStats && (
        <div className="player-grid-container playoffs">
          <h1>Career Playoffs</h1>
          <div className="player-stats-grid">
            {statKeys.map((key, i) => (
              <Detail
                key={key}
                label={statLabels[i]}
                value={playoffStats[key]}
              />
            ))}
          </div>
        </div>
      )}

      <div className="player-grid-container summary">
        <h1>Summary</h1>
        <p className="player-summary">
          {bio.name} is a {bio.pos?.toLowerCase() || "player"} who was drafted
          {bio.draft
            ? ` in ${bio.draft.split(" ")[0]} (${bio.draft})`
            : " as an undrafted free agent"}
          .
          {bio.college && bio.college !== "-"
            ? ` He attended ${bio.college}.`
            : ""}{" "}
          He stands at {bio.height} and weighs {bio.weight}, and{" "}
          {bio.shoots
            ? `shoots ${bio.shoots.toLowerCase()} handed.`
            : "his shooting hand is unknown."}{" "}
          In his most recent regular season, he averaged {perGameStats["PTS"]}{" "}
          points, {perGameStats["AST"]} assists, and {perGameStats["REB"]}{" "}
          rebounds per game. He shot {perGameStats["FG%"]}% from the field,{" "}
          {perGameStats["3P%"]}% from three, and {perGameStats["FT%"]}% from the
          free-throw line.
        </p>
      </div>
    </div>
  );
}
