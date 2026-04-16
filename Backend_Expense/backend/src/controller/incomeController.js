const db = require("../config/db");

exports.getIncome = (req, res) => {
  const userId = req.user.id;
  const sql = "SELECT Monthly_Income FROM user_income WHERE User_ID = ?";
  db.query(sql, [userId], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    const income = results[0]?.Monthly_Income || 0;
    res.json({ income });
  });
};

exports.setIncome = (req, res) => {
  const userId = req.user.id;
  let { income } = req.body;
  const parsedIncome = Number(income);
  if (isNaN(parsedIncome) || parsedIncome < 0) {
    return res.status(400).json({ error: "Invalid income value" });
  }
  const sql = `
    INSERT INTO user_income (User_ID, Monthly_Income)
    VALUES (?, ?)
    ON DUPLICATE KEY UPDATE Monthly_Income = VALUES(Monthly_Income), Updated_At = CURRENT_TIMESTAMP
  `;
  db.query(sql, [userId, parsedIncome], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ income: parsedIncome });
  });
};
