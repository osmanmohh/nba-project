import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";

export default function SearchBar({ query, setQuery, handleSearch, handleKeyDown, teamColor }) {
  return (
    <div className="search-bar-container">
      <FontAwesomeIcon
        icon={faMagnifyingGlass}
        size="sm"
        style={{ color: "#7B7B7B" }}
        className="search-icon"
        onClick={handleSearch}
      />
      <input
        type="search"
        className="search-input"
        placeholder="Search for Teams or Players..."
        style={{ backgroundColor: teamColor.secondary }}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
      />
    </div>
  );
}
