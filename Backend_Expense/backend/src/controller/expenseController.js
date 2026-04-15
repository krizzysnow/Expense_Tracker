const { randomUUID } = require("crypto");
const db = require("../config/db");

exports.getExpenses = (req, res) => {
  if (!req.user || !req.user.id) {
    console.error("[getExpenses] No user ID in request");
    return res.status(401).json({ error: "User not authenticated" });
  }

  const userId = req.user.id;

  const sql = `
    SELECT *
    FROM expenses
    WHERE User_ID = ?
    ORDER BY Date_Time DESC
  `;

  db.query(sql, [userId], (err, rows) => {
    if (err) {
      console.error("[getExpenses] Database error:", err.message);
      return res.status(500).json({ error: "Failed to fetch expenses" });
    }

    console.log(`[getExpenses] Retrieved ${rows.length} expenses for User_ID=${userId}`);
    res.status(200).json(rows);
  });
};

exports.addExpense = (req, res) => {
  if (!req.user || !req.user.id) {
    console.error("[addExpense] No user ID in request");
    return res.status(401).json({ error: "User not authenticated" });
  }

  const userId = req.user.id;
  const { title, amount, category } = req.body;

  if (!title || !amount || !category) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const expenseId = randomUUID();

  const sql = `
    INSERT INTO expenses (Expense_ID, User_ID, Title, Amount, Category)
    VALUES (?, ?, ?, ?, ?)
  `;

  db.query(sql, [expenseId, userId, title, amount, category], (err, result) => {
    if (err) {
      console.error("[addExpense] Database error:", err.message);
      return res.status(500).json({ error: "Failed to add expense" });
    }

    console.log(`[addExpense] Expense added: Expense_ID=${expenseId}, User_ID=${userId}`);
    res.status(201).json({
      message: "Expense added successfully",
      Expense_id: expenseId,
      title,
      amount,
      category
    });
  });
};

exports.updateExpense = (req, res) => {
  if (!req.user || !req.user.id) {
    console.error("[updateExpense] No user ID in request");
    return res.status(401).json({ error: "User not authenticated" });
  }

  const userId = req.user.id;
  const expenseId = req.params.id;
  const { title, amount, category } = req.body;

  if (!expenseId) {
    return res.status(400).json({ error: "Expense ID is required" });
  }

  if (!title && !amount && !category) {
    return res.status(400).json({ error: "At least one field (title, amount, or category) is required" });
  }

  const sql = `
    UPDATE expenses
    SET Title = COALESCE(?, Title),
        Amount = COALESCE(?, Amount),
        Category = COALESCE(?, Category)
    WHERE Expense_ID = ? AND User_ID = ?
  `;

  db.query(sql, [title, amount, category, expenseId, userId], (err, result) => {
    if (err) {
      console.error("[updateExpense] Database error:", err.message);
      return res.status(500).json({ error: "Failed to update expense" });
    }

    if (result.affectedRows === 0) {
      console.warn(`[updateExpense] Expense not found: ID=${expenseId}, User_ID=${userId}`);
      return res.status(404).json({ error: "Expense not found or you don't have permission to update it" });
    }

    console.log(`[updateExpense] ✓ Expense updated: ID=${expenseId}, User_ID=${userId}`);
    res.status(200).json({
      message: "Expense updated successfully",
      Expense_id: expenseId,
      title,
      amount,
      category
    });
  });
};

exports.deleteExpense = (req, res) => {
  if (!req.user || !req.user.id) {
    console.error("[deleteExpense] No user ID in request");
    return res.status(401).json({ error: "User not authenticated" });
  }

  const userId = req.user.id;
  const expenseId = req.params.id;

  if (!expenseId) {
    return res.status(400).json({ error: "Expense ID is required" });
  }

  const sql = `
    DELETE FROM expenses
    WHERE Expense_ID = ? AND User_ID = ?
  `;

  db.query(sql, [expenseId, userId], (err, result) => {
    if (err) {
      console.error("[deleteExpense] Database error:", err.message);
      return res.status(500).json({ error: "Failed to delete expense" });
    }

    if (result.affectedRows === 0) {
      console.warn(`[deleteExpense] Expense not found: ID=${expenseId}, User_ID=${userId}`);
      return res.status(404).json({ error: "Expense not found or you don't have permission to delete it" });
    }

    console.log(`[deleteExpense] ✓ Expense deleted: ID=${expenseId}, User_ID=${userId}`);
    res.status(200).json({ message: "Expense deleted successfully" });
  });
};
