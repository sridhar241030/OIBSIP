require("dotenv").config();

const express = require("express");

// Starts the cron job
require("./cron");

const app = express();

app.get("/", (req, res) => {
  res.send("🍕 Pizza Inventory Server Running");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});