export default function PlayerStatistics({ player }) {
  return (
    <div className="player-statistics">
      <div className="basic-stats">
        {["PTS", "TRB", "AST", "FG%"].map((stat) => (
          <div className="stat" key={stat}>
            <div className="stat-label">{stat}</div>
            <div className="stat-value">
              {stat === "FG%" ? `${(player[stat] * 100).toFixed(1)}%` : player[stat]}
            </div>
          </div>
        ))}
      </div>
      <div className="player-details-grid">
        {[
          { label: "HEIGHT", value: player["Height"] },
          { label: "WEIGHT", value: player["Weight"] },
          { label: "POSITION", value: player["Pos"] },
          { label: "COLLEGE", value: player["College"] },
          { label: "AGE", value: player["Age"] },
          { label: "BIRTHDATE", value: player["Birthdate"] },
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
