import React, { useState, useEffect, useMemo } from "react";
import "./StatsTable.css";

export default function StatsTable({
  jsonData,
  columnsToShow = null,
  title = null,
  defaultSort = { key: "", direction: "desc" },
}) {
  const [sortConfig, setSortConfig] = useState(null);
  const [columns, setColumns] = useState([]);
  const [visibleRows, setVisibleRows] = useState(30);

  useEffect(() => {
    if (jsonData.length > 0) {
      const detectedColumns = Object.keys(jsonData[0]).map((col) => col.trim());
      let finalColumns =
        columnsToShow && columnsToShow.length > 0 ? columnsToShow : detectedColumns;
  
      if (finalColumns.includes("Rk")) {
        finalColumns = ["Rk", ...finalColumns.filter((col) => col !== "Rk")];
      }
  
      setColumns((prevColumns) =>
        JSON.stringify(prevColumns) !== JSON.stringify(finalColumns) ? finalColumns : prevColumns
      );
  
      setSortConfig((prevSort) =>
        prevSort ? prevSort : defaultSort // Only set if sortConfig is null
      );
    }
  }, [jsonData, columnsToShow]); // Removed `defaultSort` to prevent unnecessary updates
  

  const sortedData = useMemo(() => {
    if (!sortConfig) return jsonData;

    return [...jsonData].sort((a, b) => {
      const key = sortConfig.key;
      const valA = a[key] ? parseFloat(a[key]) || a[key] : 0;
      const valB = b[key] ? parseFloat(b[key]) || b[key] : 0;

      if (valA < valB) return sortConfig.direction === "asc" ? -1 : 1;
      if (valA > valB) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });
  }, [jsonData, sortConfig]);

  const rankedData = useMemo(() => {
    return sortedData.map((row, index, array) => ({
      ...row,
      Rk: sortConfig?.direction === "desc" ? index + 1 : array.length - index,
    }));
  }, [sortedData, sortConfig]);

  const handleSort = (key) => {
    setSortConfig((prevSortConfig) => {
      let direction = "desc";
      if (prevSortConfig && prevSortConfig.key === key) {
        direction = prevSortConfig.direction === "desc" ? "asc" : "desc";
      }
      return { key, direction };
    });
  };

  // ✅ Function to open player search in a new tab
  const handlePlayerClick = (playerName) => {
    const encodedName = encodeURIComponent(playerName);
    window.open(`/search/${encodedName}`, "_blank");
  };

  const showMoreRows = () => {
    setVisibleRows((prev) => prev + 30);
  };

  return (
    <div className="table-container">
      {title && (
        <div className="table-title">
          <p>{title}</p>
        </div>
      )}

      <table className="stats-table">
        <thead>
          <tr className="column-headers">
            {columns.map((col) => (
              <th
                key={col}
                onClick={() => handleSort(col)}
                className={sortConfig?.key === col ? "sorted-column" : ""}
                style={{ cursor: col === "Rk" ? "default" : "pointer" }}
              >
                {col.toUpperCase()}{" "}
                {sortConfig?.key === col && col !== "Rk"
                  ? sortConfig.direction === "asc"
                    ? "↑"
                    : "↓"
                  : ""}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rankedData.slice(0, visibleRows).map((row, index) => (
            <tr key={index}>
              {columns.map((col) => (
                <td
                  key={col}
                  className={`${col === "Tm" ? "team-cell" : ""} ${
                    sortConfig?.key === col ? "sorted-column" : ""
                  }`}
                >
                  {/* ✅ Clickable Player Name (Opens Search in New Tab) */}
                  {col === "Name" || col === "Team" ? (
                    <div
                      className="player-name-container"
                      style={{ cursor: col === "Name" ? "pointer" : "default" }} // ✅ Cursor only for player name
                      onClick={
                        col === "Name"
                          ? () => handlePlayerClick(row[col])
                          : undefined
                      } // ✅ Clickable only for Name
                    >
                      <img
                        src={`/logos/${row.Tm}.png`}
                        alt={row.Tm}
                        className="stats-team-logo"
                        onError={(e) => (e.target.style.display = "none")}
                      />
                      <span className="player-name-text">{row[col]}</span>
                    </div>
                  ) : col === "Rk" ? (
                    row["Rk"]
                  ) : col.includes("%") && row[col] ? (
                    (parseFloat(row[col]) * 100).toFixed(1) // ✅ Convert percentages to 100-based
                  ) : row[col] ? (
                    row[col].toString().trim()
                  ) : (
                    "-"
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      {visibleRows < rankedData.length && (
        <div className="table-title show-more-container">
          <button className="show-more-btn" onClick={showMoreRows}>
            Show More
          </button>
        </div>
      )}
    </div>
  );
}
