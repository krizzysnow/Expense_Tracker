const express = require("express");
const router = express.Router();

const protect = require("../middleware/authmiddleware");
const { loginUser, getCurrentUser, registerUser } = require("../controller/authcontroller");

router.post("/auth/login", loginUser);
router.post("/auth/register", registerUser);
router.get("/auth/me", protect, getCurrentUser);


module.exports = router;
