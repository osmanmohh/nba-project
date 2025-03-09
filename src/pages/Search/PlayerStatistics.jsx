export default function PlayerStatistics({ player, teamColor }) {
  return (
    <div className="player-statistics">
      <div className="basic-stats">
        {["PTS", "REB", "AST", "FG%"].map((stat) => (
          <div className="stat" key={stat}>
            <div className="stat-label">{stat}</div>
            <div className="stat-value">
              {stat === "FG%"
                ? `${(player[stat] * 100).toFixed(1)}%`
                : player[stat]}
            </div>
          </div>
        ))}
      </div>
      <div className="player-details-grid">
        {[
          {
            label: "HEIGHT",
            value: player["Height"]
              ? `${player["Height"]} (${(parseInt(player["Height"]) * 0.3048 + parseInt(player["Height"].split("'")[1]) * 0.0254).toFixed(2)}m)`
              : "-",
          },
          {
            label: "WEIGHT",
            value: player["Weight"]
              ? `${player["Weight"]} (${(parseInt(player["Weight"], 10) * 0.453592).toFixed(1)}kg)`
              : "-",
          },
          { label: "POSITION", value: player["Pos"] },
          { label: "COLLEGE", value: player["College"] },
          { label: "AGE", value: `${player["Age"]} years` },
          {
            label: "BIRTHDATE",
            value: player["Birthdate"]
              ? new Date(player["Birthdate"]).toLocaleString("default", {
                  month: "long",
                  day: "2-digit",
                  year: "numeric",
                })
              : "-",
          },
          { label: "DRAFT", value: player["Draft"] },
          {
            label: "EXPERIENCE",
            value: player["Draft"]
              ? `${new Date().getFullYear() - 1 - parseInt(player["Draft"].split(" ")[0], 10)} years`
              : "Rookie",
          },
        ].map((item) => (
          <div className="detail" key={item.label}>
            <div className="detail-label">{item.label}</div>
            <div className="detail-value">{item.value || "-"}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
