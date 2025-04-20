const express = require("express");
const router = express.Router();
const pool = require("../db");

// GET top 5 matching players by partial name (for autocomplete)
router.get("/search", async (req, res) => {
  const { query } = req.query;

  if (!query || query.length < 2) {
    return res.status(400).json({ message: "Query too short" });
  }

  try {
    // Lower the pg_trgm match threshold
    await pool.query(`SELECT set_limit(0.1);`);

    const result = await pool.query(
      `
      WITH career_points AS (
        SELECT "playerID", SUM("PTS") AS total_pts
        FROM combined_stats
        WHERE "Stat_Type" = 'Totals' AND "Season_Type" = 'Regular'
        GROUP BY "playerID"
      )

      SELECT pb.name, pb.bbref_id, pb.pos, COALESCE(cp.total_pts, 0) AS points
      FROM player_bios pb
      LEFT JOIN career_points cp ON pb.bbref_id = cp."playerID"
      WHERE pb.name % CAST($1 AS text)
         OR LOWER(pb.name) LIKE LOWER($2)
      ORDER BY similarity(pb.name, CAST($1 AS text)) DESC, points DESC
      LIMIT 10
      `,
      [query, `%${query}%`]
    );

    res.json(result.rows);
  } catch (err) {
    console.error("Search error:", err);
    res.status(500).json({ message: "Server error" });
  }
});



// GET player bio
router.get("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      "SELECT * FROM player_bios WHERE bbref_id = $1",
      [id]
    );

    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Player not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Database error:", err);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

// GET player stats
router.get("/:id/stats", async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `SELECT * FROM combined_stats WHERE "playerID" = $1 ORDER BY "Year" DESC`,
      [id]
    );

    res.json(result.rows);
  } catch (err) {
    console.error("Stats error:", err);
    res
      .status(500)
      .json({ success: false, error: "Error fetching player stats" });
  }
});

// GET player game logs
router.get("/:id/games", async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `SELECT * FROM player_game_logs WHERE "BBRef ID" = $1 ORDER BY "Date" DESC`,
      [id]
    );

    res.json(result.rows);
  } catch (err) {
    console.error("Games error:", err);
    res.status(500).json({ success: false, error: "Error fetching game logs" });
  }
});
// GET bbref_id by fuzzy player name
router.get("/lookup/:name", async (req, res) => {
  const { name } = req.params;

  try {
    const result = await pool.query(
      `SELECT bbref_id, name, pos FROM player_bios WHERE LOWER(name) LIKE LOWER($1) LIMIT 1`,
      [`%${name}%`]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Player not found" });
    }

    res.json(result.rows[0]); // e.g., { bbref_id: 'curryst01', name: 'Stephen Curry' }
  } catch (err) {
    console.error("Lookup error:", err);
    res.status(500).json({ message: "Server error" });
  }
});
// GET all player stats (optionally filtered by year)
router.get("/stats/all", async (req, res) => {
  const { year, stat_type } = req.query;

  // 🔒 Require both query params
  if (!year || !stat_type) {
    return res.status(400).json({
      success: false,
      message: "Missing required query parameters: 'year' and 'stat_type'",
    });
  }

  try {
    const query = `
      SELECT * FROM combined_stats 
      WHERE "Season_Type" = 'Regular'
        AND "Year" = $1
        AND "Stat_Type" = $2
    `;
    const result = await pool.query(query, [year, stat_type]);

    res.json(result.rows);
  } catch (err) {
    console.error("All stats error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
