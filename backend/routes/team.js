const express = require("express");
const router = express.Router();
const pool = require("../db");

//  Lookup team by abbreviation (latest season)
// GET /api/team/projected
// Fuzzy search for teams by name or abbreviation
router.get("/search", async (req, res) => {
  const { query } = req.query;

  if (!query || query.length < 2) {
    return res.status(400).json({ message: "Query too short" });
  }

  try {
    await pool.query(`SELECT set_limit(0.1);`);

    const result = await pool.query(
      `
      SELECT DISTINCT ON ("Team")
        "Team", "Tm", "Year", "W", "L", "W/L%" AS win_pct
      FROM team_season_stats
      WHERE "Year" = (SELECT MAX("Year") FROM team_season_stats)
        AND (
          "Team" % CAST($1 AS text)
          OR "Tm" ILIKE $2
          OR LOWER("Team") LIKE LOWER($3)
        )
      ORDER BY
        "Team",                                 -- must match DISTINCT ON
        similarity("Team", CAST($1 AS text)) DESC,
        "W" DESC
      LIMIT 10;
      `,
      [query, query, `%${query}%`]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "No matching teams found" });
    }

    res.json(result.rows);
  } catch (err) {
    console.error("Team search error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/projected", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT "Tm" AS tm, "Conf" AS conference, "W" AS wins, "L" AS losses, "W/L%" AS win_pct, "Rk" AS rk
       FROM projected_team_stats
       WHERE "Year" = (SELECT MAX("Year") FROM projected_team_stats)
       ORDER BY "W" DESC`
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "No projected data found." });
    }

    res.json(result.rows);
  } catch (err) {
    console.error("Projected standings error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});
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

//  Get all teams for a specific year
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

//  Get full history or specific season for one team
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

//  Get all teams (full data)
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

    const values = year
      ? [team.toUpperCase(), parseInt(year)]
      : [team.toUpperCase()];
    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "No games found for this team" });
    }

    res.json(result.rows);
  } catch (err) {
    console.error(" Error fetching team schedule:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
// GET /api/team/:team/roster?year=2025
router.get("/:team/roster", async (req, res) => {
  const { team } = req.params;
  const { year } = req.query;

  if (!year || isNaN(parseInt(year))) {
    return res
      .status(400)
      .json({ message: "Year is required and must be a number" });
  }

  try {
    const result = await pool.query(
      `
      SELECT cs.*
      FROM combined_stats cs
      JOIN (
        SELECT DISTINCT ON ("BBRef ID")
          "BBRef ID", "Team" AS last_team
        FROM player_game_logs
        WHERE "Year" = $1
        ORDER BY "BBRef ID", "Date" DESC
      ) last_games
        ON cs."playerID" = last_games."BBRef ID"
      WHERE cs."Year" = $1
        AND cs."Season_Type" = 'Regular'
        AND cs."Stat_Type" = 'Per Game'
        AND last_games.last_team = $2
        AND cs."Tm" = $2
      ORDER BY cs."PTS" DESC
      `,
      [parseInt(year), team.toUpperCase()]
    );

    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ message: "No roster found for that team and year" });
    }

    res.json(result.rows);
  } catch (err) {
    console.error("Roster fetch error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});
