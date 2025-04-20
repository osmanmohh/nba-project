import "./AllNBACard.css";

import { useNavigate } from "react-router-dom"; //  Import navigation hook

import { useHeadshot } from "../hooks/useHeadshot";
import { useState, useEffect } from "react";
function AllNBACard({ playerId, rank, tm, selection }) {
  const navigate = useNavigate();
  const [player, setPlayer] = useState(null);

  // Always call this — even if `player` is null on first render
  const headshot = useHeadshot(player?.Name || "");

  useEffect(() => {
    fetch(`/api/player/${playerId}/stats`)
      .then((response) => response.json())
      .then((data) =>
        setPlayer(
          data.find((p) => p.Stat_Type === "Per Game" && p.Year === 2025)
        )
      )
      .catch((error) => console.error("Error fetching player data:", error));
  }, [playerId]);

  if (!player) {
    return <div className="player-card-container">Player not found</div>;
  }

  const teamMap = {
    ATL: "Atlanta Hawks",
    BKN: "Brooklyn Nets",
    BOS: "Boston Celtics",
    CHA: "Charlotte Hornets",
    CHI: "Chicago Bulls",
    CLE: "Cleveland Cavaliers",
    DAL: "Dallas Mavericks",
    DEN: "Denver Nuggets",
    DET: "Detroit Pistons",
    GSW: "Golden State Warriors",
    HOU: "Houston Rockets",
    IND: "Indiana Pacers",
    LAC: "Los Angeles Clippers",
    LAL: "Los Angeles Lakers",
    MEM: "Memphis Grizzlies",
    MIA: "Miami Heat",
    MIL: "Milwaukee Bucks",
    MIN: "Minnesota Timberwolves",
    NOP: "New Orleans Pelicans",
    NYK: "New York Knicks",
    OKC: "Oklahoma City Thunder",
    ORL: "Orlando Magic",
    PHI: "Philadelphia 76ers",
    PHX: "Phoenix Suns",
    POR: "Portland Trail Blazers",
    SAC: "Sacramento Kings",
    SAS: "San Antonio Spurs",
    TOR: "Toronto Raptors",
    UTA: "Utah Jazz",
    WAS: "Washington Wizards",
  };

  // Render when ready
  return (
    <div
      className="all-nba-player-container"
      onClick={() => window.open(`/search/${encodeURIComponent(player.Name)}`)}
    >
      <div className="photo-container">
        <img className="all-nba-image" src={headshot} alt={player.Name} />
      </div>
      <div className="all-nba-info">
        <div className="name-team">
          <div className="name">{player.Name}</div>
          <div className="team">
            {player.Pos} • {teamMap[tm].split(" ").pop()}
          </div>
          <div className="team short">{teamMap[tm].split(" ").pop()}</div>
        </div>
        <div className="all-nba-stats">
          <div className="all-nba-stat-item">
            <div className="all-nba-stat-label">PPG</div>
            <div className="all-nba-stat-value">{player.PTS}</div>
          </div>
          <div
            className="all-nba-stat-item"
            style={{ borderLeft: "1px solid", borderRight: "1px solid" }}
          >
            <div className="all-nba-stat-label">RPG</div>
            <div className="all-nba-stat-value">{player.REB}</div>
          </div>
          <div className="all-nba-stat-item">
            <div className="all-nba-stat-label">APG</div>
            <div className="all-nba-stat-value">{player.AST}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AllNBACard;
