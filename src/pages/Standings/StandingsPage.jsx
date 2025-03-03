import { useState } from "react";
import "./StandingsPage.css";
import Standings from "./StandingComponent/Standings";
import StandingsCarousel from "./StandingsCarousel";

export default function StandingsPage() {
  const [currentConference, setCurrentConference] = useState("W"); // Default to West

  return (
    <div className="standings-page-wrapper">
      <div className="standings-page-container">
        <div className="title-container">
          <div className="faded-line">NBA STANDINGS</div>
          <div className="main-title">
            {currentConference === "W" ? "WESTERN CONFERENCE" : "EASTERN CONFERENCE"}
          </div>
          <div className="faded-line">
            THROUGH{" "}
            {new Date()
              .toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })
              .toUpperCase()
              .replace(/(\w{3})/, "$1.")}{" "}
            GAMES
          </div>
        </div>

        <StandingsCarousel 
          conferences={["E", "W"]} 
          onConferenceChange={setCurrentConference} // Pass function to update title
        />
      </div>
    </div>
  );
}
