import "./LeadersCard.css";
import { useEffect, useState } from "react";
import { teamColors } from "../../../public/teamColors";
import { getHeadshot } from "../../../public/getHeadshot";

export default function LeadersCard({ players = [], statCategory = null }) {
  const [headshotsLoaded, setHeadshotsLoaded] = useState(false);
  const [headshotSources, setHeadshotSources] = useState([]);

  const getLastName = (name = "") => name.split(" ").slice(-1)[0] || "";

  const safeSorted = (key) =>
    [...players]
      .filter((p) => p?.[key] !== undefined)
      .sort((a, b) => b[key] - a[key]);

  const leaderStats = statCategory
    ? [...players]
        .filter((p) => p?.[statCategory] !== undefined)
        .sort((a, b) => b[statCategory] - a[statCategory])
        .slice(0, 3)
        .map((player) => ({
          label: statCategory,
          stat: statCategory,
          player,
        }))
    : [
        { label: "PPG", stat: "PTS", player: safeSorted("PTS")[0] },
        { label: "RPG", stat: "REB", player: safeSorted("REB")[0] },
        { label: "APG", stat: "AST", player: safeSorted("AST")[0] },
      ];

  useEffect(() => {
    const loadImages = async () => {
      const sources = await Promise.all(
        leaderStats.map(async ({ player }) => {
          const src = await getHeadshot(player?.Name);
          return src || "/headshots/blank.png";
        })
      );
      setHeadshotSources(sources);
      setHeadshotsLoaded(true);
    };

    loadImages();
  }, [players, statCategory]);

  if (!headshotsLoaded) return null;

  return (
    <div
      className="leaders-card"
      style={{
        backgroundColor:
          teamColors[players[0]?.Tm?.toLowerCase()]?.primary || "#909090",
      }}
    >
      <div className="leaders-title">
        {statCategory ? `${statCategory} Leaders` : "Team Leaders"}
      </div>
      <div className="player-container">
        {leaderStats.map(({ label, stat, player }, index) => (
          <div
            className={`leader-card-container player-${index + 1}`}
            key={index}
          >
            <div className="leader">
              <div className="leader-label">{label}</div>
              <div className="leader-value">{player?.[stat] ?? "-"}</div>
              <div className="leader-player">{getLastName(player?.Name)}</div>
            </div>
            <div className={`leader-headshot-container headshot-${index + 1}`}>
              <img
                src={headshotSources[index]}
                alt={player?.Name}
                className={`leader-headshot headshot-${index + 1}`}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
