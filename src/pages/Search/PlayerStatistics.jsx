import "./PlayerStatistics.css";
import { teamColors } from "../../../public/teamColors";

export default function PlayerStatistics({ player }) {
  const teamColor = teamColors[player.Tm] || {
    primary: "#909090",
    secondary: "#909090",
  };

  return (
    <div className="player-statistics">
      {/* Player Details Grid */}
      <div
        className="player-grid-container"
        style={{ backgroundColor: teamColor.primary }}
      >
        <div className="player-details-grid bio">
          {[
            {
              label: "HEIGHT",
              value: player["Height"] ? `${player["Height"]}` : "-",
              className: "height",
            },
            {
              label: "WEIGHT",
              value: player["Weight"] ? `${player["Weight"]}` : "-",
              className: "weight",
            },
            { label: "POSITION", value: player["Pos"], className: "position" },
            {
              label: "COLLEGE",
              value: player["College"],
              className: "college",
            },
            { label: "AGE", value: `${player["Age"]} years`, className: "age" },
            {
              label: "BIRTHDATE",
              value: player["Birthdate"]
                ? new Date(player["Birthdate"]).toLocaleString("default", {
                    month: "long",
                    day: "2-digit",
                    year: "numeric",
                  })
                : "-",
              className: "birthdate",
            },
            { label: "DRAFT", value: player["Draft"], className: "draft" },

            {
              label: "EXPERIENCE",
              value: player["Draft"]
                ? `${new Date().getFullYear() - 1 - parseInt(player["Draft"].split(" ")[0], 10)} years`
                : "Rookie",
              className: "experience",
            },
            {
              label: "CONFERENCE",
              value: player["Conf"],
              className: "experience",
            },
          ].map((item) => (
            <div className={`detail ${item.className}`} key={item.label}>
              <div className="detail-value">{item.value || "-"}</div>
              <div className="detail-label">{item.label}</div>
            </div>
          ))}
        </div>
      </div>
      {/* Basic Stats Section */}
      <div
        className="player-grid-container"
        style={{ backgroundColor: teamColor.primary }}
      >
        <h1>Career Regular Season</h1>
        <div className="player-stats-grid">
          {[
            { label: "PPG", value: player["PTS"], className: "ppg" },
            { label: "RPG", value: player["REB"], className: "rpg" },
            { label: "APG", value: player["AST"], className: "apg" },
            { label: "SPG", value: player["STL"], className: "spg" },
            { label: "BPG", value: player["BLK"], className: "bpg" },
            { label: "MPG", value: player["MP"], className: "mpg" },
            {
              label: "FG%",
              value: `${(parseFloat(player["FG%"]) * 100).toFixed(1)}%`,
              className: "fg",
            },
            {
              label: "3P%",
              value: `${(parseFloat(player["3P%"]) * 100).toFixed(1)}%`,
              className: "three-point",
            },
            {
              label: "FT%",
              value: `${(parseFloat(player["FT%"]) * 100).toFixed(1)}%`,
              className: "three-point",
            },
            { label: "TOV", value: player["TOV"], className: "tov" },
          ].map((item) => (
            <div className={`detail ${item.className}`} key={item.label}>
              <div className="detail-value">{item.value || "-"}</div>
              <div className="detail-label">{item.label}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="player-grid-container playoffs">
        <h1>Career Playoffs</h1>
        <div className="player-stats-grid">
          {[
            { label: "PPG", value: player["PTS"], className: "ppg" },
            { label: "RPG", value: player["REB"], className: "rpg" },
            { label: "APG", value: player["AST"], className: "apg" },
            { label: "SPG", value: player["STL"], className: "spg" },
            { label: "BPG", value: player["BLK"], className: "bpg" },
            { label: "MPG", value: player["MP"], className: "mpg" },
            {
              label: "FG%",
              value: `${(parseFloat(player["FG%"]) * 100).toFixed(1)}%`,
              className: "fg",
            },
            {
              label: "3P%",
              value: `${(parseFloat(player["3P%"]) * 100).toFixed(1)}%`,
              className: "three-point",
            },
            {
              label: "FT%",
              value: `${(parseFloat(player["FT%"]) * 100).toFixed(1)}%`,
              className: "three-point",
            },
            { label: "TOV", value: player["TOV"], className: "tov" },
          ].map((item) => (
            <div className={`detail ${item.className}`} key={item.label}>
              <div className="detail-value">{item.value || "-"}</div>
              <div className="detail-label">{item.label}</div>
            </div>
          ))}
        </div>
      </div>
      <div
        className="player-grid-container playoffs"
      >
        <h1>Summary</h1>
        <p className="player-summary">
          Stephen Curry has played 16 seasons for the Warriors. He has averaged
          24.7 points, 6.4 assists and 4.7 rebounds in 1,012 regular-season
          games. He was selected to play in 10 All-Star games. 
        </p>
      </div>
    </div>
  );
}
