const express = require("express");
const router = express.Router();
const protect = require("../middleware/authmiddleware");
const { getIncome, setIncome } = require("../controller/incomeController");

router.get("/income", protect, getIncome);
router.put("/income", protect, setIncome);

module.exports = router;