import "./NavBar.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHome,
  faSearch,
  faEnvelope,
  faClose,
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
      <nav className={showNav ? "mobile-show" : ""}>
        <a href="/" onClick={() => setShowNav(false)}>
          <FontAwesomeIcon size="xs" className="link-icon" icon={faHome} />
        </a>
        <a
          href="/search"
          className="search-link"
          onClick={() => setShowNav(false)}
        >
          <FontAwesomeIcon size="xs" className="link-icon" icon={faSearch} />
        </a>
        <a
          href="/standings"
          className="standings-link"
          onClick={() => setShowNav(false)}
        >
          <FontAwesomeIcon size="xs" className="link-icon" icon={faList} />
        </a>
        <a
          href="/playoffs"
          className="playoffs-link"
          onClick={() => setShowNav(false)}
        >
          <FontAwesomeIcon size="xs" className="link-icon" icon={faTrophy} />
        </a>
        <a
          href="/awards"
          className="awards-link"
          onClick={() => setShowNav(false)}
        >
          <FontAwesomeIcon size="xs" className="link-icon" icon={faMedal} />
        </a>
        <a
          href="/contact"
          className="contact-link"
          onClick={() => setShowNav(false)}
        >
          <FontAwesomeIcon size="xs" className="link-icon" icon={faEnvelope} />
        </a>

        <FontAwesomeIcon
          icon={faClose}
          size="xs"
          className="close-icon"
          onClick={() => setShowNav(false)}
        />
      </nav>
      <FontAwesomeIcon
        icon={faBars}
        size="xs"
        className="hamburger-icon"
        onClick={() => setShowNav(!showNav)}
      />
    </div>
  );
};

export default NavBar;
