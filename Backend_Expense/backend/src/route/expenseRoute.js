const express = require("express");
const router = express.Router();

const protect = require("../middleware/authmiddleware");
const validateExpense = require("../middleware/validateExpense");

const {
  getExpenses,
  addExpense,
  updateExpense,
  deleteExpense,
} = require("../controller/expenseController");

console.log("protect:", typeof protect);
console.log("validateExpense:", typeof validateExpense);
console.log("addExpense:", typeof addExpense);
console.log("updateExpense:", typeof updateExpense);
console.log("deleteExpense:", typeof deleteExpense);

router.get("/expenses", protect, getExpenses);
router.post("/expenses", protect, validateExpense, addExpense);
router.put("/expenses/:id", protect, validateExpense, updateExpense);
router.delete("/expenses/:id", protect, deleteExpense);

module.exports = router;