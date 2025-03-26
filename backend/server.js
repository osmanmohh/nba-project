const express = require("express");
const cors = require("cors");
require("dotenv").config();
const pool = require("./db");

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

// Load route files
const teamsRoutes = require("./routes/teams");
const playerRoutes = require("./routes/player");

app.use("/api/teams", teamsRoutes);
app.use("/api/player", playerRoutes);

// Test DB connection
app.get("/api/test-db", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json({ success: true, time: result.rows[0] });
  } catch (err) {
    console.error("DB Error:", err);
    res.status(500).json({ success: false, error: "Database error" });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
