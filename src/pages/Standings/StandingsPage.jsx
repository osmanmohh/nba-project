import { useState } from "react";
import "./StandingsPage.css";
import Standings from "./StandingComponent/Standings";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRightLeft } from "@fortawesome/free-solid-svg-icons";

export default function StandingsPage() {
  const [currentConference, setCurrentConference] = useState("W"); // Default to West

  const toggleConference = () => {
    setCurrentConference((prev) => (prev === "W" ? "E" : "W"));
  };

  return (
    <div className="standings-page-wrapper">
      <div className="standings-page-container">
        <div className="title-container">
          <div className="faded-line">NBA STANDINGS</div>
          <div className="main-title">
            <span>{currentConference === "W" ? "WESTERN CONFERENCE" : "EASTERN CONFERENCE"}</span>
            <FontAwesomeIcon 
            className="conference-toggle" 
            icon={faRightLeft} 
            flip 
            size="2xl" 
            style={{ color: "#878889", cursor: "pointer" }} 
            onClick={toggleConference}
          />
            
          </div>
          
          <div className="faded-line">
            THROUGH{" "}
            {new Date()
              .toLocaleDateString("en-US", { month: "short", day: "numeric" })
              .toUpperCase()
              .replace(/(\w{3})/, "$1.")}{" "}
            GAMES
          </div>
{/* Flip Toggle Button (Conference Switch) */}

          
        </div>

        {/* Standings Component - Shows Either East or West */}
        <Standings conference={currentConference} />
      </div>
    </div>
  );
}
