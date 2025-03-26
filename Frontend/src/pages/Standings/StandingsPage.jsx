import { useState, useEffect } from "react";
import "./StandingsPage.css";
import Standings from "./StandingComponent/Standings";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRightLeft } from "@fortawesome/free-solid-svg-icons";

export default function StandingsPage() {
  const [currentConference, setCurrentConference] = useState("W"); // Default to West
  const [teamData, setTeamData] = useState([]); // Store filtered teams
  const [isFadingOut, setIsFadingOut] = useState(false); // Track animation state

  const toggleConference = () => {
    setIsFadingOut(true); // Start fade-out animation

    setTimeout(() => {
      setCurrentConference((prev) => (prev === "W" ? "E" : "W"));
      setIsFadingOut(false); // Apply fade-in animation after conference switch
    }, 300); // Match CSS fade-out duration (0.3s)
  };

  useEffect(() => {
    fetch("/teams.json") // Fetch teams.json
      .then((res) => res.json())
      .then((data) => {
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

        {/* Standings Component with animation */}
        <div className={`standings-container ${isFadingOut ? "fade-out" : "fade-in"}`}>
          <Standings conference={currentConference} />
        </div>
      </div>
    </div>
  );
}
