import "./index.css";
import Ladder from "../../../components/Ladder";
import AllNBATeam from "../../../components/AllNBATeam";

import { useState, useEffect } from "react";
export default function AwardsPage() {
  const [mvpPlayers, setMvpPlayers] = useState([]);
  const [dpoyPlayers, setDpoyPlayers] = useState([]);
  const [royPlayers, setRoyPlayers] = useState([]);
  const [mipPlayers, setMipPlayers] = useState([]);
  const [players, setPlayers] = useState([]);
  useEffect(() => {
    console.log("🔍 Fetching player stats from API...");
    fetch("/api/player/stats/all?year=2025&stat_type=Per%20Game")
      .then((res) => {
        console.log("📊 API Response status:", res.status);
        if (!res.ok) {
          throw new Error(`API Error: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        console.log("✅ Player stats loaded:", data.length, "players");
        setPlayers(data);
      })
      .catch((error) => {
        console.error("❌ Error fetching player stats:", error);
      });
  }, []);
  // Function to fetch and parse CSV data
  const fetchPlayers = (filePath, setPlayers) => {
    console.log(`🔍 Fetching CSV: ${filePath}`);
    fetch(filePath)
      .then((response) => {
        console.log(`📊 ${filePath} Response status:`, response.status);
        if (!response.ok) {
          throw new Error(`CSV Error: ${response.status}`);
        }
        return response.text();
      })
      .then((csvText) => {
        console.log(`📄 ${filePath} CSV content:`, csvText.substring(0, 200) + "...");
        const rows = csvText.split("\n").slice(1); // Skip header row
        console.log(`📋 ${filePath} Rows found:`, rows.length);
        
        const parsedPlayers = rows
          .map((row) => {
            const columns = row.split(",");
            if (columns.length < 2) return null;

            return {
              playerId: columns[0].trim(),
              abbreviation: columns[1].trim(),
            };
          })
          .filter((player) => player && player.playerId);

        console.log(`✅ ${filePath} Parsed players:`, parsedPlayers);
        setPlayers(parsedPlayers.slice(0, 3)); // Take top 3 players
      })
      .catch((error) => {
        console.error(`❌ Error fetching ${filePath}:`, error);
      });
  };
  // Fetch MVP & DPOY candidates
  useEffect(() => {
    fetchPlayers("/top_3_roy.csv", setRoyPlayers);
    fetchPlayers("/top_3_mip.csv", setMipPlayers);
    fetchPlayers("/top_3_dpoy.csv", setDpoyPlayers);
    fetchPlayers("/top_3_mvp.csv", setMvpPlayers);
  }, []);
  console.log("🎯 Component state:", {
    players: players.length,
    mvpPlayers: mvpPlayers.length,
    dpoyPlayers: dpoyPlayers.length,
    royPlayers: royPlayers.length,
    mipPlayers: mipPlayers.length
  });

  if (
    players.length === 0 ||
    mvpPlayers.length === 0 ||
    dpoyPlayers.length === 0 ||
    royPlayers.length === 0 ||
    mipPlayers.length === 0
  ) {
    console.log("⏳ Still loading... waiting for all data");
    return <div>Loading awards data...</div>;
  }

  return (
    <div className="awards-page-wrapper">
      <div className="awards-page">
        <div className="awards-title-container">
          <div className="awards-gold-boxed">2024-25 </div>
          <div className="awards-main-title">
            NBA AWARD PREDICTIONS <span className="award-name"></span>
          </div>
          <div className="awards-gold-boxed">
            as of{" "}
            {new Date(
              new Date().setDate(new Date().getDate() - 1)
            ).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </div>
        </div>
        <div className="section">
          <div className="section-title ladder">
            <p>INDIVIDUAL AWARDS</p>
          </div>
          <div className="row-container">
            <Ladder title="2025 KIA MVP" players={mvpPlayers} />
            <Ladder title="2025 KIA DPOY" players={dpoyPlayers} />
          </div>
          <div className="row-container">
            <Ladder title="2025 KIA ROY" players={royPlayers} />
            <Ladder title="2025 KIA MIP" players={mipPlayers} />
          </div>
        </div>
        <div className="section">
          <div className="section-title">
            <p>ALL NBA SELECTIONS</p>
          </div>
          <AllNBATeam teamType={1} />
          <AllNBATeam teamType={2} />
          <AllNBATeam teamType={3} />
        </div>
        <div className="section">
          <div className="section-title">
            <p>ALL DEFENSE SELECTIONS</p>
          </div>
          <AllNBATeam isDefense={true} teamType={1} />
          <AllNBATeam isDefense={true} teamType={2} />
        </div>
      </div>
    </div>
  );
}
