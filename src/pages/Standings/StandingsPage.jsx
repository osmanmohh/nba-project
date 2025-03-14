import { useState, useEffect } from "react";
import "./StandingsPage.css";
import Standings from "./StandingComponent/Standings";
import StatsTable from "../Search/StatsTable/StatsTable";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRightLeft } from "@fortawesome/free-solid-svg-icons";

export default function StandingsPage() {
  const [currentConference, setCurrentConference] = useState("W"); // Default to West
  const [teamData, setTeamData] = useState([]); // Store filtered teams

  const toggleConference = () => {
    setCurrentConference((prev) => (prev === "W" ? "E" : "W"));
  };

  useEffect(() => {
    fetch("/teams.json") // Fetch teams.json
      .then((res) => res.json())
      .then((data) => {
        // Filter teams by conference (W = Western, E = Eastern)
        const filteredTeams = data.filter(
          (team) => team.Conf === currentConference && team.Year === 2023
        );
        setTeamData(filteredTeams);
      })
      .catch((err) => console.error("Error loading teams:", err));
  }, [currentConference]); // Re-run when conference changes

  return (
    <div className="standings-page-wrapper">
      <div className="standings-page-container">
        <div className="title-container">
          <div className="faded-line">NBA STANDINGS</div>
          <div className="main-title">
            <span>
              {currentConference === "W"
                ? "WESTERN CONFERENCE"
                : "EASTERN CONFERENCE"}
            </span>
            <div
              className="conference-toggle-wrapper"
              style={{ color: "#878889", cursor: "pointer" }}
              onClick={toggleConference}
            >
              <FontAwesomeIcon
                className="conference-toggle"
                icon={faRightLeft}
                flip
                size="2xl"
              />
            </div>
          </div>
          <div className="faded-line">
            THROUGH{" "}
            {new Date()
              .toLocaleDateString("en-US", { month: "short", day: "numeric" })
              .toUpperCase()
              .replace(/(\w{3})/, "$1.")}{" "}
            GAMES
          </div>
        </div>

        {/* Standings Component */}
        <Standings conference={currentConference} />
      </div>
      {/* ✅ Pass Filtered Team Data to StatsTable */}
      {/* <StatsTable
        jsonData={teamData} // ✅ Pass teamData instead of currentConference
        columnsToShow={[ "Tm", "W", "L", "ORtg", "DRtg", "NRtg", "W/L%"]}
        title="TEAM ADVANCED STATS"
      /> */}
    </div>
  );
}
