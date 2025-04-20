import React, { useState } from "react";

function PlayerViewToggle({ onViewChange, teamColor }) {
  const [view, setView] = useState("overview");

  const handleViewChange = (newView) => {
    setView(newView);
    onViewChange(newView);
  };
  

  return (
    <div className="btn-container-wrapper">
      <div
        className="btn-container"
        onClick={() => handleViewChange("overview")}
      >
        <div className="btn-text">Overview</div>
        <div className="btn-wrapper">
          <button
            className={`overview-bn ${view === "overview" ? "active" : ""}`}
            style={{
              backgroundColor: view === "overview" ? "#ffffff" : "transparent",
              
            }}
            
          >
            Overview
          </button>
        </div>
      </div>

      <div className="btn-container" onClick={() => handleViewChange("stats")}>
        <div className="btn-text">Stats</div>
        <div className="btn-wrapper">
          <button
            className={`stats-btn ${view === "stats" ? "active" : ""}`}
            style={{
              backgroundColor: view === "stats" ? "#ffffff" : "transparent",
            }}
          >
            Stats
          </button>
        </div>
      </div>

      <div className="btn-container" onClick={() => handleViewChange("games")}>
        <div className="btn-text">Games</div>
        <div className="btn-wrapper">
          <button
            className={`games-btn ${view === "games" ? "active" : ""}`}
            style={{
              backgroundColor: view === "games" ? "#ffffff" : "transparent",
            }}
          >
            Games
          </button>
        </div>
      </div>
    </div>
  );
}

export default PlayerViewToggle;
