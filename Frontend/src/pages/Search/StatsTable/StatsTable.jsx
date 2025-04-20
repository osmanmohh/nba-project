import React, { useState, useEffect, useMemo } from "react";
import "./StatsTable.css";
import { getLogo } from "../../../../public/getLogo";
export default function StatsTable({
  jsonData,
  columnsToShow = null,
  title = null,
  defaultSort = { key: "", direction: "desc" },
}) {
  const maxRows = 15;
  const [sortConfig, setSortConfig] = useState(null);
  const [columns, setColumns] = useState([]);
  const [visibleRows, setVisibleRows] = useState(maxRows);
  const [mounted, setMounted] = useState(false);

useEffect(() => {
  const timeout = setTimeout(() => setMounted(true), 10);
  return () => clearTimeout(timeout);
}, []);


  useEffect(() => {
    if (jsonData.length > 0) {
      const detectedColumns = Object.keys(jsonData[0]).map((col) => col.trim());
      let finalColumns =
        columnsToShow && columnsToShow.length > 0
          ? columnsToShow
          : detectedColumns;

      if (finalColumns.includes("Rk")) {
        finalColumns = ["Rk", ...finalColumns.filter((col) => col !== "Rk")];
      }

      setColumns((prevColumns) =>
        JSON.stringify(prevColumns) !== JSON.stringify(finalColumns)
          ? finalColumns
          : prevColumns
      );

      setSortConfig(
        (prevSort) => (prevSort ? prevSort : defaultSort) // Only set if sortConfig is null
      );
    }
  }, [jsonData, columnsToShow]); // Removed `defaultSort` to prevent unnecessary updates

  const sortedData = useMemo(() => {
    if (!sortConfig) return jsonData;
  
    const key = sortConfig.key;
    const is3P = key === "3P%" || key === "3P";
    const isFT = key === "FT%" || key === "FT";
  
    return [...jsonData].sort((a, b) => {
      const valA = a[key] ? parseFloat(a[key]) || a[key] : 0;
      const valB = b[key] ? parseFloat(b[key]) || b[key] : 0;
  
      // Add logic to sort low-volume shooters to bottom
      const a3pa = parseFloat(a["3PA"] || 0);
      const b3pa = parseFloat(b["3PA"] || 0);
      const afta = parseFloat(a["FTA"] || 0);
      const bfta = parseFloat(b["FTA"] || 0);
  
      if (is3P) {
        if (a3pa < 1.5 && b3pa >= 1.5) return 1;  // move A down
        if (b3pa < 1.5 && a3pa >= 1.5) return -1; // move B down
      }
  
      if (isFT) {
        if (afta < 2 && bfta >= 2) return 1;
        if (bfta < 2 && afta >= 2) return -1;
      }
  
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

  //  Function to open player search in a new tab
  const handlePlayerClick = (playerName) => {
    const encodedName = encodeURIComponent(playerName);
    window.open(`/search/${encodedName}`, "_blank");
  };

  const showMoreRows = () => {
    setVisibleRows((prev) => prev + 30);
  };

  return (
    <div className={`table-container ${mounted ? "mount-animate" : ""}`}>
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
                  {/*  Clickable Player Name (Opens Search in New Tab) */}
                  {(col.includes("Name") && !row.Team) || col === "Team" ||(col === "Tm" && !row.Tm) || (col === "Opponent") ? (
                    <div
                      className="player-name-container"
                      style={{ cursor: col === "Name" ? "pointer" : "default" }} //  Cursor only for player name
                      onClick={
                        col.includes("Name")
                          ? () => handlePlayerClick(row[col])
                          : undefined
                      } //  Clickable only for Name
                    >
                      <img
                        src={
                          col === "Opponent"
                            ? getLogo(row.Opponent)
                            : row.Tm
                            ? getLogo(row.Tm)
                            : row.Team
                            ? getLogo(row.Team)
                            : null
                            
                        }
                        alt={row.Tm}
                        className="stats-team-logo"
                        onError={(e) => (e.target.style.display = "none")}
                      />
                      <span className="player-name-text">{row[col]}</span>
                    </div>
                  ) : col === "Rk" ? (
                    row["Rk"]
                  ) : col.includes("%") && row[col] ? (
                    (parseFloat(row[col]) * 100).toFixed(1) //  Convert percentages to 100-based
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




