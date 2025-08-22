import "./NavBar.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHome,
  faSearch,
  faChartLine,
  faTimes, // Changed faClose to faTimes for better visibility
  faBars,
  faList,
  faTrophy,
  faMedal,
} from "@fortawesome/free-solid-svg-icons";
import { useState } from "react";

const NavBar = () => {
  const [showNav, setShowNav] = useState(false);

  return (
    <div className="nav-bar">
      {/* Navigation */}
      <nav className={showNav ? "mobile-show" : ""}>
        <a href="/" onClick={() => setShowNav(false)}>
          <FontAwesomeIcon className="link-icon" icon={faHome} />
        </a>
        <a href="/search" className="search-link" onClick={() => setShowNav(false)}>
          <FontAwesomeIcon className="link-icon" icon={faSearch} />
        </a>
        <a href="/standings" className="standings-link" onClick={() => setShowNav(false)}>
          <FontAwesomeIcon className="link-icon" icon={faList} />
        </a>
        <a href="/playoffs" className="playoffs-link" onClick={() => setShowNav(false)}>
          <FontAwesomeIcon className="link-icon" icon={faTrophy} />
        </a>
        <a href="/awards" className="awards-link" onClick={() => setShowNav(false)}>
          <FontAwesomeIcon className="link-icon" icon={faMedal} />
        </a>
        <a href="/stats" className="stats-link" onClick={() => setShowNav(false)}>
          <FontAwesomeIcon className="link-icon" icon={faChartLine} />
        </a>

        {/* Close icon inside the nav */}
        {showNav && (
          <FontAwesomeIcon
            icon={faTimes}
            className="close-icon"
            onClick={() => setShowNav(false)}
          />
        )}
      </nav>

      {/* Hamburger icon - Show only when nav is closed */}
      {!showNav && (
        <FontAwesomeIcon
          icon={faBars}
          className="hamburger-icon"
          onClick={() => setShowNav(true)}
        />
      )}
    </div>
  );
};

export default NavBar;
