const express = require("express");
const router = express.Router();

const protect = require("../middleware/authmiddleware");
const {
  loginUser,
  getCurrentUser,
  registerUser,
  verifyOTP,
  resendOTP,
  verifyEmail,
  forgotPassword,
  resetPassword,
  deleteAccount
} = require("../controller/authcontroller");

router.post("/auth/login", loginUser);
router.post("/auth/register", registerUser);
router.post("/auth/verify-otp", verifyOTP);
router.post("/auth/resend-otp", resendOTP);
router.post("/auth/forgot-password", forgotPassword);
router.post("/auth/reset-password", resetPassword);
router.delete("/auth/delete-account", protect, deleteAccount);
router.get("/auth/verify/:token", verifyEmail);   // legacy — returns 410
router.get("/auth/me", protect, getCurrentUser);

module.exports = router;
