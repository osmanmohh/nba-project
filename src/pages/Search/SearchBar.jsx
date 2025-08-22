import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";

export default function SearchBar({
  query,
  setQuery,
  handleSearch,
  teamColor,
}) {
  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      console.log("Search Query:", query);
      handleSearch();
    }
  };

  return (
    <div className="search-bar-container">
      {/* Search Icon as a Button */}
      <FontAwesomeIcon
        icon={faMagnifyingGlass}
        size="sm"
        style={{ color: "#7B7B7B", cursor: "pointer" }} // ✅ Cursor ensures it looks clickable
        className="search-icon"
        onClick={handleSearch} // ✅ Triggers search on click
      />

      {/* Search Input */}
      <input
        type="search"
        className="search-input"
        placeholder="Search for Teams or Players..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
      />
    </div>
  );
}
