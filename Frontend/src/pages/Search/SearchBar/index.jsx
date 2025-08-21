import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import { useState } from "react";
import "./index.css"; // Make sure this exists

export default function SearchBar({
  query,
  setQuery,
  handleSearchWithFade,
  searchResults,
}) {
  const [showDropdown, setShowDropdown] = useState(false);

  const handleSelect = (name) => {
    setQuery(name);
    setShowDropdown(false);

    // Run search after React updates the input
    setTimeout(() => {
      handleSearchWithFade(name);
    }, 0);
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      event.preventDefault(); // disable Enter
    }
  };

  return (
    <div className="search-bar-container" style={{ position: "relative" }}>
      <FontAwesomeIcon
        icon={faMagnifyingGlass}
        size="sm"
        style={{ color: "#7B7B7B", cursor: "pointer" }}
        className="search-icon"
        onClick={() => handleSearchWithFade(query)}
      />

      <input
        type="search"
        className="search-input"
        placeholder="Search for Teams or Players..."
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setShowDropdown(true);
        }}
        onKeyDown={handleKeyDown}
        onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
        onFocus={() => {
          if (query.length >= 2) setShowDropdown(true);
        }}
      />

      {showDropdown && searchResults?.length > 0 && (
        <ul className="suggestions-dropdown">
          {searchResults.map((item, index) => (
            <li
              key={`${item.name}-${item.type}-${index}`}
              className="suggestion-item"
              onClick={() =>
                handleSelect(
                  item.type === "team" ? item.tm || item.name : item.name
                )
              }
            >
              <span className="suggestion-name">{item.name}</span>
              <span className="suggestion-type">
                {item.type === "team" ? "Team" : "Player"}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
