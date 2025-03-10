import "./AwardsPage.css";
import Ladder from "../../components/Ladder";
import players from "../../../players_2024";
import AllNBATeam from "../../components/AllNBATeam";

import { useState, useEffect } from "react";
export default function AwardsPage() {
  const [mvpPlayers, setMvpPlayers] = useState([]);
  const [dpoyPlayers, setDpoyPlayers] = useState([]);
  const smoyPlayers = ["Naz Reid", "Tyler Herro", "Malik Monk"];
  const royPlayers = ["Victor Wembanyama", "Chet Holmgren", "Brandon Miller"];
  const mipPlayers = ["Tyrese Maxey", "Coby White", "Alperen Sengun"];
  const cpoyPlayers = ["Stephen Curry", "Kyrie Irving", "Anthony Edwards"];

  // Function to fetch and parse CSV data
  const fetchPlayers = (filePath, setPlayers) => {
    fetch(filePath)
      .then((response) => response.text())
      .then((csvText) => {
        const rows = csvText.split("\n").slice(1); // Skip header row
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

        setPlayers(parsedPlayers.slice(0, 3)); // Take top 3 players
      })
      .catch((error) => console.error(`Error fetching ${filePath}:`, error));
  };
  // Fetch MVP & DPOY candidates
  useEffect(() => {
    fetchPlayers("/predicted_mvp_2025_minimal.csv", setMvpPlayers);
    fetchPlayers("/predicted_dpoy_2025_minimal.csv", setDpoyPlayers);
  }, []);

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
          <div className="section-title">
            <p>INDIVIDUAL AWARDS</p>
          </div>
          <div className="row-container">
            <Ladder title="2025 KIA MVP" players={mvpPlayers} />
            <Ladder title="2025 KIA DPOY" players={dpoyPlayers} />
          </div>
          <div className="row-container">
            <Ladder
              title="2025 KIA ROY"
              players={royPlayers
                .map((name, index) => {
                  const player = players.find((p) => p.Name === name);
                  return player
                    ? { rank: index + 1, playerId: player.Player_ID }
                    : null;
                })
                .filter((player) => player !== null)} // Remove nulls if players aren't found
            />
            <Ladder
              title="2025 6th MAN"
              players={smoyPlayers
                .map((name, index) => {
                  const player = players.find((p) => p.Name === name);
                  return player
                    ? { rank: index + 1, playerId: player.Player_ID }
                    : null;
                })
                .filter((player) => player !== null)} // Remove nulls if players aren't found
            />
          </div>
          <div className="row-container">
            <Ladder
              title="2025 KIA MIP"
              players={mipPlayers
                .map((name, index) => {
                  const player = players.find((p) => p.Name === name);
                  return player
                    ? { rank: index + 1, playerId: player.Player_ID }
                    : null;
                })
                .filter((player) => player !== null)} // Remove nulls if players aren't found
            />
            <Ladder
              title="2025 KIA CPOY"
              players={cpoyPlayers
                .map((name, index) => {
                  const player = players.find((p) => p.Name === name);
                  return player
                    ? { rank: index + 1, playerId: player.Player_ID }
                    : null;
                })
                .filter((player) => player !== null)} // Remove nulls if players aren't found
            />
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
