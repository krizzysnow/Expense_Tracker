const express = require("express");
const router = express.Router();
const db = require("../config/db");

// GET /api/debug/tables - Runs: SHOW TABLES
router.get("/tables", (req, res) => {
  db.query("SHOW TABLES", (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    const tables = results.map(row => Object.values(row)[0]);
    res.json({ tables });
  });
});

// GET /api/debug/counts - Checks row counts for: users, expenses, user_income
router.get("/counts", async (req, res) => {
  const tables = ["users", "expenses", "user_income"];
  const counts = {};

  try {
    for (const table of tables) {
      try {
        const [results] = await db.promise().query(`SELECT COUNT(*) as count FROM ${table}`);
        counts[table] = results[0].count;
      } catch (err) {
        counts[table] = "missing";
      }
    }
    res.json(counts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/debug/users - Returns only safe user fields
router.get("/users", (req, res) => {
  const query = "SELECT User_ID, Name, Email, is_verified, Date_Time FROM users";
  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

// GET /api/debug/expenses - Returns expense fields, latest first
router.get("/expenses", (req, res) => {
  const query = "SELECT Expense_ID, User_ID, Title, Amount, Category, Date_Time FROM expenses ORDER BY Date_Time DESC";
  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

// GET /api/debug/income - Returns income fields
router.get("/income", (req, res) => {
  const query = "SELECT User_ID, Monthly_Income, Updated_At FROM user_income";
  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

module.exports = router;
