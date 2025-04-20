const express = require("express");
const router = express.Router();
const pool = require("../db");

router.get("/", async (req, res) => {
  const { query } = req.query;

  if (!query || query.length < 2) {
    return res.status(400).json({ message: "Query too short" });
  }

  try {
    await pool.query(`SELECT set_limit(0.1);`);

    const result = await pool.query(
      `
      WITH players AS (
        SELECT 
          pb.name,
          pb.bbref_id AS id,
          'player' AS type,
          similarity(pb.name, $1)::real AS score
        FROM player_bios pb
        WHERE pb.name % $1 OR LOWER(pb.name) LIKE LOWER($2)
      ),
      teams AS (
        SELECT 
          "Team" AS name,
          "Tm" AS id,
          'team' AS type,
          similarity("Team", $1)::real AS score
        FROM team_season_stats
        WHERE "Year" = (SELECT MAX("Year") FROM team_season_stats)
          AND (
            LOWER("Team") LIKE LOWER($2)
            OR LOWER("Tm") = LOWER($1)
            OR "Team" % $1
          )
          AND "StatType" = 'totals'
      )
      SELECT * FROM (
        SELECT * FROM players
        UNION ALL
        SELECT * FROM teams
      ) combined
      ORDER BY score DESC
      LIMIT 10;
      `,
      [query, `%${query}%`]
    );

    res.json(result.rows);
  } catch (err) {
    console.error("Unified search error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
