const db = require("../config/db");


const getAllExpenses = (callback) => {
  const sql = "SELECT * FROM expenses ORDER BY Date_Time DESC";
  db.query(sql, callback);
};


const createExpense = (expense, callback) => {
  const { Title, Amount, Category } = expense;
  const sql = "INSERT INTO expenses (Title, Amount, Category) VALUES (?, ?, ?)";
  db.query(sql, [Title, Amount, Category], callback);

};


const removeExpense = (Id, callback) => {
  const sql = "DELETE FROM expenses WHERE Id = ?";
  db.query(sql, [Id], callback);
};

module.exports = {
  getAllExpenses,
  createExpense,
  removeExpense,
};
