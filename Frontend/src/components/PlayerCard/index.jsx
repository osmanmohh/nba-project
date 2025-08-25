import "./index.css";
import { teamColors } from "../../constants/teamColors";
import players from "/players_2024"; // ✅ Corrected import path
import { useNavigate } from "react-router-dom"; // ✅ Import navigation hook
import { getLogo } from "../../utils/getLogo";
import { useHeadshot } from "../../hooks/useHeadshot";
import { useState, useEffect } from "react";

const API_BASE_URL = import.meta.env.VITE_API_URL;

function PlayerCard({ playerId, rank }) {
  const navigate = useNavigate(); // ✅ Initialize navigation
  const [player, setPlayer] = useState(null);

  useEffect(() => {
    console.log(`🔍 PlayerCard: Fetching stats for playerId: ${playerId}`);
    fetch(`${API_BASE_URL}/api/player/${playerId}/stats`)
      .then((response) => {
        console.log(
          `📊 PlayerCard API Response status for ${playerId}:`,
          response.status
        );
        if (!response.ok) {
          throw new Error(`API Error: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        console.log(`📋 PlayerCard: Received data for ${playerId}:`, data);
        const foundPlayer = data.find(
          (p) => p.Stat_Type === "Per Game" && p.Year === 2025
        );
        console.log(
          `✅ PlayerCard: Found player for ${playerId}:`,
          foundPlayer
        );
        setPlayer(foundPlayer);
      })
      .catch((error) => {
        console.error(
          `❌ PlayerCard: Error fetching player data for ${playerId}:`,
          error
        );
      });
  }, [playerId]);

  // Convert playerId to integer for comparison

  // Find the player in the dataset

  const name = player?.Name;
  const headshot = useHeadshot(name); // Always called, even if name is undefined

  // Handle case where player is not found
  if (!player) {
    return <div className="player-card-container">Player not found</div>;
  }

  // Split the name safely
  const nameParts = player.Name.split(" ");
  const firstName = nameParts[0]?.toUpperCase() || "";
  const lastName = nameParts[1]?.toUpperCase() || "";

  // ✅ Function to navigate to the player search page
  const handleClick = () => {
    navigate(`/search/${encodeURIComponent(player.Name)}`);
  };

  return (
    <div className="player-card-container" onClick={handleClick}>
      <div className="player-rank">{rank}</div>
      <div className="player-card-info">
        <div className="player-name">
          <div className="first-name">{firstName}</div>
          <div className="last-name">{lastName}</div>
        </div>
        <div className="img-container">
          <img
            src={getLogo(player.Tm)}
            className="player-team-logo"
            alt={`${player.Tm} logo`}
          />
          <img className="player-image" src={headshot} alt={player.Name} />
        </div>
      </div>
      <div className="award-stats">
        <div className="award-stat-item">
          <div className="award-stat-label">PPG</div>
          <div className="award-stat-value">{player.PTS}</div>
        </div>
        <div
          className="award-stat-item"
          style={{ borderLeft: "1px solid", borderRight: "1px solid" }}
        >
          <div className="award-stat-label">RPG</div>
          <div className="award-stat-value">{player.REB}</div>
        </div>
        <div className="award-stat-item">
          <div className="award-stat-label">APG</div>
          <div className="award-stat-value">{player.AST}</div>
        </div>
      </div>
    </div>
  );
}

export default PlayerCard;
