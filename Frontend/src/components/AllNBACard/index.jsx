import "./index.css";

import { useNavigate } from "react-router-dom"; //  Import navigation hook

import { useHeadshot } from "../../hooks/useHeadshot";
import { useState, useEffect } from "react";
function AllNBACard({ playerId, rank, tm, selection }) {
  const navigate = useNavigate();
  const [player, setPlayer] = useState(null);

  console.log(
    `🎮 [AllNBACard] Rendering card for playerId: ${playerId}, tm: ${tm}, selection: ${selection}`
  );

  // Always call this — even if `player` is null on first render
  const headshot = useHeadshot(player?.Name || "");

  useEffect(() => {
    console.log(`🔍 [AllNBACard] Fetching stats for playerId: ${playerId}`);

    fetch(`/api/player/${playerId}/stats`)
      .then((response) => {
        console.log(
          `📊 [AllNBACard] API response status for ${playerId}:`,
          response.status
        );
        if (!response.ok) {
          throw new Error(`API Error: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        console.log(`📄 [AllNBACard] Raw API data for ${playerId}:`, data);

        const perGamePlayer = data.find(
          (p) => p.Stat_Type === "Per Game" && p.Year === 2025
        );
        console.log(
          `✅ [AllNBACard] Found per-game player data for ${playerId}:`,
          perGamePlayer
        );

        if (!perGamePlayer) {
          console.warn(
            `⚠️ [AllNBACard] No per-game data found for playerId: ${playerId}`
          );
          console.log(`🔍 [AllNBACard] Available data types:`, [
            ...new Set(data.map((p) => p.Stat_Type)),
          ]);
          console.log(`🔍 [AllNBACard] Available years:`, [
            ...new Set(data.map((p) => p.Year)),
          ]);
        }

        setPlayer(perGamePlayer);
      })
      .catch((error) => {
        console.error(
          `❌ [AllNBACard] Error fetching player data for ${playerId}:`,
          error
        );
      });
  }, [playerId]);

  if (!player) {
    console.log(`⏳ [AllNBACard] Player data not yet loaded for ${playerId}`);
    return <div className="player-card-container">Loading player data...</div>;
  }

  console.log(`✅ [AllNBACard] Successfully loaded player:`, player);

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

  const teamName = teamMap[tm];
  if (!teamName) {
    console.warn(`⚠️ [AllNBACard] Unknown team abbreviation: ${tm}`);
  }

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
            {player.Pos} • {teamName ? teamName.split(" ").pop() : tm}
          </div>
          <div className="team short">
            {teamName ? teamName.split(" ").pop() : tm}
          </div>
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
