import { useState } from "react";
import Standings from "./StandingComponent/Standings"; // Your full-screen Standings component
import "./StandingsCarousel.css";

const StandingsCarousel = ({ onConferenceChange }) => {
  const conferences = ["E", "W"];
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? 1 : 0));
    onConferenceChange(conferences[currentIndex === 0 ? 1 : 0]); // Update title in StandingsPage
  };

  const handlePrev = () => {
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? 1 : 0));
    onConferenceChange(conferences[currentIndex === 0 ? 1 : 0]); // Update title in StandingsPage
  };

  return (
    <div className="carousel-container">
      {/* Left Arrow */}
      <button className="arrow left" onClick={handlePrev}>
        &#10094;
      </button>

      {/* Standings Component - Only One is Shown */}
      <Standings conference={conferences[currentIndex]} />

      {/* Right Arrow */}
      <button className="arrow right" onClick={handleNext}>
        &#10095;
      </button>
    </div>
  );
};

export default StandingsCarousel;
