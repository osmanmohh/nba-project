const db = require("../db");

const getAllTeams = async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM team_season_stats LIMIT 50");
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = { getAllTeams };
