const express = require("express");
const router = express.Router();

const protect = require("../middleware/authmiddleware");
const { loginUser, getCurrentUser, registerUser, getIncome, updateIncome } = require("../controller/authcontroller");

router.post("/auth/login", loginUser);
router.post("/auth/register", registerUser);
router.get("/auth/me", protect, getCurrentUser);
router.get("/user/income", protect, getIncome);
router.put("/user/income", protect, updateIncome);

module.exports = router;
