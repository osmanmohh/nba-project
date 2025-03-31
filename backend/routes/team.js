const express = require("express");
const router = express.Router();
const pool = require("../db");

// ✅ Lookup team by abbreviation (latest season)
router.get("/lookup/:abbreviation", async (req, res) => {
  const { abbreviation } = req.params;

  try {
    const result = await pool.query(
      `SELECT * FROM team_season_stats WHERE "Tm" = $1 ORDER BY "Year" DESC LIMIT 1`,
      [abbreviation]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Team not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Team lookup error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ✅ Get all teams for a specific year
router.get("/year/:year", async (req, res) => {
  const { year } = req.params;

  try {
    const result = await pool.query(
      `SELECT * FROM team_season_stats WHERE "Year" = $1 ORDER BY "Rk" ASC`,
      [year]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "No teams found for this year" });
    }

    res.json(result.rows);
  } catch (err) {
    console.error("Team fetch error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Get full history or specific season for one team
router.get("/:abbreviation", async (req, res) => {
  const { abbreviation } = req.params;
  const { year } = req.query;

  try {
    const query = `
      SELECT * FROM team_season_stats
      WHERE "Tm" = $1 ${year ? 'AND "Year" = $2' : ""}
      ORDER BY "Year" DESC
    `;

    const values = year ? [abbreviation, year] : [abbreviation];
    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Team not found" });
    }

    res.json(result.rows);
  } catch (err) {
    console.error("Team detail error:", err);
    res.status(500).json({ success: false, error: "Error fetching team data" });
  }
});

// ✅ Get all teams (full data)
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM team_season_stats ORDER BY "Year" DESC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Team fetch error:", err);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

// In routes/player.js or routes/teams.js
router.get("/:team/stats", async (req, res) => {
  const { team } = req.params;
  const { year } = req.query;

  try {
    const query = `
      SELECT * FROM combined_stats
      WHERE "Tm" = $1 AND "Year" = $2
      ORDER BY "PTS" DESC
    `;
    const result = await pool.query(query, [
      team.toUpperCase(),
      parseInt(year),
    ]);

    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ message: "No players found for this team and year" });
    }

    res.json(result.rows);
  } catch (err) {
    console.error("Team player stats error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/:team/games", async (req, res) => {
  const { team } = req.params;
  const { year } = req.query;

  try {
    const query = `
      SELECT DISTINCT ON ("Date")
        "Year", "Date", "Team", "Location", "Opponent", "Result"
      FROM player_game_logs
      WHERE ("Team" = $1)
      ${year ? `AND "Year" = $2` : ""}
      ORDER BY "Date" DESC, "Minutes" DESC
    `;

    const values = year ? [team.toUpperCase(), parseInt(year)] : [team.toUpperCase()];
    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "No games found for this team" });
    }

    res.json(result.rows);
  } catch (err) {
    console.error("❌ Error fetching team schedule:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
