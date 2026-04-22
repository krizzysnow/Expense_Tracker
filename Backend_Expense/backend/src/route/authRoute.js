const express = require("express");
const router = express.Router();

const protect = require("../middleware/authmiddleware");
const {
  loginUser,
  getCurrentUser,
  registerUser,
  verifyOTP,
  resendOTP,
  verifyEmail
} = require("../controller/authcontroller");

router.post("/auth/login", loginUser);
router.post("/auth/register", registerUser);
router.post("/auth/verify-otp", verifyOTP);
router.post("/auth/resend-otp", resendOTP);
router.get("/auth/verify/:token", verifyEmail);   // legacy — returns 410
router.get("/auth/me", protect, getCurrentUser);

module.exports = router;
