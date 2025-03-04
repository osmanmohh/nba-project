import React, { useState, useEffect } from "react";
import "./StatsTable.css";

export default function StatsTable({
  jsonData,
  columnsToShow = null,
  title = "STATS TABLE",
}) {
  const [sortConfig, setSortConfig] = useState({
    key: "Year",
    direction: "desc",
  });
  const [columns, setColumns] = useState([]);

  // Detect & trim columns dynamically, ensuring all seasons are included
  useEffect(() => {
    if (jsonData.length > 0) {
      let detectedColumns = Object.keys(jsonData[0]).map((col) => col.trim()); // Trim spaces from headers
      setColumns(
        columnsToShow && columnsToShow.length > 0
          ? columnsToShow
          : detectedColumns
      );
    }
  }, [jsonData, columnsToShow]);

  // Sorting logic (ensures sorting by Year works properly)
  const sortedData = [...jsonData].sort((a, b) => {
    if (!sortConfig.key) return 0;
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
      <h2 className="table-title">{title}</h2>

      <table className="stats-table">
        <thead>
          <tr className="column-headers">
            {columns.map((col) => (
              <th
                key={col}
                onClick={() => handleSort(col)}
                className={sortConfig.key === col ? "sorted-column" : ""}
                style={{ cursor: "pointer" }}
              >
                {col.toUpperCase()}{" "}
                {sortConfig.key === col
                  ? sortConfig.direction === "asc"
                    ? "↑"
                    : "↓"
                  : ""}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sortedData.map((row, index) => (
            <tr key={index}>
              {columns.map((col) => (
                <td key={col} className={col === "Tm" ? "team-cell" : ""}>
                  {row[col] ? row[col].toString().trim() : "-"}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
