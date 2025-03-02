import React, { useState } from "react";
import "./PlayerStatsTable.css";

export default function PlayerStatsTable({ playerData, statsType }) {
  // Define columns for Traditional and Advanced Stats
  const statsCategories = {
    traditional: [
      "Year", "Tm", "G", "MP", "PTS", "FG", "FGA", "FG%", "3P", "3PA", "3P%", 
      "FT", "FTA", "FT%", "ORB", "DRB", "TRB", "AST", "TOV", "STL", 
      "BLK", "PF", "+/-"
    ],
    advanced: [
      "Year", "Tm", "G", "MP", "eFG%", "2P%", "ORtg", "DRtg", "NRtg", "W/L%", "WS", "WS/48", "BPM", "VORP"
    ]
  };

  // Get the columns based on `statsType`
  const statsOrder = statsCategories[statsType];

  // Sorting state
  const [sortConfig, setSortConfig] = useState({ key: "Year", direction: "desc" });

  // Sorting logic
  const sortedData = [...playerData].sort((a, b) => {
    const key = sortConfig.key;
    const valA = a[key] ? parseFloat(a[key]) || a[key] : 0;
    const valB = b[key] ? parseFloat(b[key]) || b[key] : 0;

    if (valA < valB) return sortConfig.direction === "asc" ? -1 : 1;
    if (valA > valB) return sortConfig.direction === "asc" ? 1 : -1;
    return 0;
  });

  // Handle sorting when a header is clicked
  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  return (
    <div className="table-container">
      <table className="stats-table">
        <thead>
          <tr>
            <th colSpan={statsOrder.length} className="table-header">
              {statsType === "traditional" ? "Traditional Stats" : "Advanced Stats"}
            </th>
          </tr>
          <tr className="column-headers">
            {statsOrder.map((stat) => (
              <th
                key={stat}
                onClick={() => handleSort(stat)}
                className={sortConfig.key === stat ? "sorted-column" : ""}
                style={{ cursor: "pointer" }}
              >
                {stat.toUpperCase()} {sortConfig.key === stat ? (sortConfig.direction === "asc" ? "↑" : "↓") : ""}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sortedData.map((season, index) => (
            <tr key={index}>
              {statsOrder.map((stat) => (
                <td key={stat} className={stat === "Tm" ? "team-cell" : ""}>
                  {season[stat] ? season[stat] : "-"}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
