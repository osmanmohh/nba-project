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
import { Link } from "react-router-dom";

const NavBar = () => {
  const [showNav, setShowNav] = useState(false);

  return (
    <div className="nav-bar">
      {/* Navigation */}
      <nav className={showNav ? "mobile-show" : ""}>
        <Link to="/" onClick={() => setShowNav(false)}>
          <FontAwesomeIcon className="link-icon" icon={faHome} />
        </Link>
        <Link
          to="/search"
          className="search-link"
          onClick={() => setShowNav(false)}
        >
          <FontAwesomeIcon className="link-icon" icon={faSearch} />
        </Link>
        <Link
          to="/standings"
          className="standings-link"
          onClick={() => setShowNav(false)}
        >
          <FontAwesomeIcon className="link-icon" icon={faList} />
        </Link>
        <Link
          to="/playoffs"
          className="playoffs-link"
          onClick={() => setShowNav(false)}
        >
          <FontAwesomeIcon className="link-icon" icon={faTrophy} />
        </Link>
        <Link
          to="/awards"
          className="awards-link"
          onClick={() => setShowNav(false)}
        >
          <FontAwesomeIcon className="link-icon" icon={faMedal} />
        </Link>
        <Link
          to="/stats"
          className="stats-link"
          onClick={() => setShowNav(false)}
        >
          <FontAwesomeIcon className="link-icon" icon={faChartLine} />
        </Link>

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
