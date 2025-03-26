const express = require("express");
const router = express.Router();
const pool = require("../db");

// GET player bio
router.get("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      "SELECT * FROM player_bios WHERE bbref_id = $1",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Player not found" });
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
    res.status(500).json({ success: false, error: "Error fetching player stats" });
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

module.exports = router;
