import React, { useState } from "react";

function PlayerViewToggle({ onViewChange, teamColor }) {
  const [view, setView] = useState("overview");

  const handleViewChange = (newView) => {
    setView(newView);
    onViewChange(newView);
  };

  return (
    <div className="btn-container">
      <button
        className={`overview-btn ${view === "overview" ? "active" : ""}`}
        style={{
          backgroundColor: view === "overview" ? "#ffffff" : teamColor.secondary,
          color: view === "overview" ? "#000000" : "#ffffff",
        }}
        onClick={() => handleViewChange("overview")}
      >
        Overview
      </button>
      <button
        className={`stats-btn ${view === "stats" ? "active" : ""}`}
        style={{
          backgroundColor: view === "stats" ? "#ffffff" : teamColor.secondary,
          color: view === "stats" ? "#000000" : "#ffffff",
        }}
        onClick={() => handleViewChange("stats")}
      >
        Stats
      </button>
    </div>
  );
}

export default PlayerViewToggle;
