const express = require("express");
const router = express.Router();

const protect = require("../middleware/authmiddleware");
const { loginUser, getCurrentUser, registerUser, verifyEmail } = require("../controller/authcontroller");

router.post("/auth/login", loginUser);
router.post("/auth/register", registerUser);
router.get("/auth/verify/:token", verifyEmail);
router.get("/auth/me", protect, getCurrentUser);


module.exports = router;
