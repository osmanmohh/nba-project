import "./index.css";
import { useEffect, useState } from "react";
import { teamColors } from "../../../constants/teamColors";
import { getHeadshot } from "../../../utils/getHeadshot"; // 🛠 adjust the import path

export default function LeadersCard({
  statCategory = null,
  tm = "",
  year = "",
  players = [],
  newRoster = [],
}) {
  const [headshotsLoaded, setHeadshotsLoaded] = useState(false);
  const [headshotSources, setHeadshotSources] = useState([]);
  const [roster, setRoster] = useState([]);

  // Use the roster data passed as a prop or from the players array
  useEffect(() => {
    if (newRoster && newRoster.length > 0) {
      setRoster(newRoster);
    } else if (players && players.length > 0) {
      setRoster(players);
    }
  }, [newRoster, players]);
  console.log(roster);

  const getLastName = (name = "") => name.split(" ").slice(-1)[0] || "";

  const safeSorted = (key) =>
    [...roster]
      .filter((p) => p?.[key] !== undefined)
      .sort((a, b) => b[key] - a[key]);

  const leaderStats = statCategory
    ? [...roster]
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
      if (!leaderStats.length) return;

      const sources = await Promise.all(
        leaderStats.map(async ({ player }) => {
          if (!player?.Name) return "blank.png";
          const src = await getHeadshot(player.Name);
          return src || "blank.png";
        })
      );

      setHeadshotSources(sources);
      setHeadshotsLoaded(true);
    };

    loadImages();
  }, [roster, statCategory]);

  if (!headshotsLoaded) return null;

  return (
    <div
      className="leaders-card"
      style={{
        backgroundColor:
          teamColors[leaderStats[0]?.player?.Tm?.toLowerCase()]?.primary ||
          "#909090",
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
