const db = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { randomUUID } = require("crypto");
const { sendOTPEmail } = require("../utils/emailService");

// ── Helpers ─────────────────────────────────────────────────────────────────
const generateOTP = () => String(Math.floor(100000 + Math.random() * 900000));
const OTP_EXPIRY_MINUTES = 10;

// ── Login ────────────────────────────────────────────────────────────────────
exports.loginUser = (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  if (!process.env.JWT_SECRET) {
    return res.status(500).json({ message: "JWT secret is not configured" });
  }

  const sql =
    "SELECT USER_ID, Name AS name, Email AS email, Password AS password, is_verified FROM users WHERE Email = ? LIMIT 1";

  db.query(sql, [email], async (err, results) => {
    if (err) return res.status(500).json({ message: "Database error", error: err.message });

    if (results.length === 0) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const user = results[0];

    // Block unverified users
    if (!user.is_verified) {
      return res.status(401).json({
        message: "Please verify your email before logging in",
        needsVerification: true,
        email: user.email
      });
    }

    if (!user.password) {
      return res.status(500).json({ message: "Stored password hash is missing" });
    }

    let isMatch;
    try {
      isMatch = await bcrypt.compare(password, user.password);
    } catch (compareError) {
      return res.status(500).json({ message: "Stored password hash is invalid", error: compareError.message });
    }

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign(
      { id: user.USER_ID, user: user.USER_ID, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      user: { user: user.USER_ID, name: user.name, email: user.email }
    });
  });
};

// ── Get Current User ──────────────────────────────────────────────────────────
exports.getCurrentUser = (req, res) => {
  const sql = "SELECT USER_ID, Name AS name, Email AS email FROM users WHERE USER_ID = ? LIMIT 1";

  db.query(sql, [req.user.id], (err, results) => {
    if (err) return res.status(500).json({ message: "Database error", error: err.message });
    if (results.length === 0) return res.status(404).json({ message: "User not found" });
    res.status(200).json({ user: results[0] });
  });
};

// ── Register ──────────────────────────────────────────────────────────────────
exports.registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: "Please provide all required fields (name, email, password)" });
  }

  const checkSql = "SELECT Email FROM users WHERE Email = ?";
  db.query(checkSql, [email], async (err, results) => {
    if (err) return res.status(500).json({ message: "Database error", error: err.message });

    if (results && results.length > 0) {
      return res.status(400).json({ message: "User already exists with this email" });
    }

    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const userId = randomUUID();
      const otp = generateOTP();
      const otpExpiry = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

      const insertSql =
        "INSERT INTO users (User_ID, Name, Email, Password, otp_code, otp_expires_at, is_verified) VALUES (?, ?, ?, ?, ?, ?, ?)";

      db.query(insertSql, [userId, name, email, hashedPassword, otp, otpExpiry, false], async (insertErr) => {
        if (insertErr) {
          return res.status(500).json({ message: "Database error during registration", error: insertErr.message });
        }

        // Try sending OTP email
        const emailResult = await sendOTPEmail(email, otp);

        if (!emailResult.success) {
          // Dev fallback: log OTP to console so dev can test without real email
          console.log(`\n[DEV] OTP for ${email}: ${otp}  (expires in ${OTP_EXPIRY_MINUTES} min)\n`);
        }

        res.status(201).json({
          message: "Registration successful! Please enter the OTP sent to your email.",
          userId,
          email,
          emailSent: emailResult.success,
          // Only expose OTP in dev mode when email fails
          ...(process.env.NODE_ENV !== 'production' && !emailResult.success
            ? { devOtp: otp, devNote: "Email not configured — OTP shown here for development only" }
            : {})
        });
      });
    } catch (hashError) {
      res.status(500).json({ message: "Error hashing password", error: hashError.message });
    }
  });
};

// ── Verify OTP ────────────────────────────────────────────────────────────────
exports.verifyOTP = (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ message: "Email and OTP are required" });
  }

  const sql =
    "SELECT USER_ID, otp_code, otp_expires_at, is_verified FROM users WHERE Email = ? LIMIT 1";

  db.query(sql, [email], (err, results) => {
    if (err) return res.status(500).json({ message: "Database error", error: err.message });

    if (results.length === 0) {
      return res.status(404).json({ message: "No account found with this email" });
    }

    const user = results[0];

    if (user.is_verified) {
      return res.status(400).json({ message: "Email is already verified. Please login." });
    }

    if (!user.otp_code) {
      return res.status(400).json({ message: "No OTP found. Please register again." });
    }

    if (String(user.otp_code) !== String(otp).trim()) {
      return res.status(400).json({ message: "Incorrect OTP. Please try again." });
    }

    const now = new Date();
    const expiresAt = new Date(user.otp_expires_at);
    if (now > expiresAt) {
      return res.status(400).json({ message: "OTP has expired. Please request a new one." });
    }

    // Mark verified and clear OTP
    const updateSql =
      "UPDATE users SET is_verified = true, otp_code = NULL, otp_expires_at = NULL WHERE USER_ID = ?";

    db.query(updateSql, [user.USER_ID], (updateErr) => {
      if (updateErr) return res.status(500).json({ message: "Database error", error: updateErr.message });
      res.status(200).json({ message: "Email verified successfully! You can now login." });
    });
  });
};

// ── Resend OTP ────────────────────────────────────────────────────────────────
exports.resendOTP = async (req, res) => {
  const { email } = req.body;

  if (!email) return res.status(400).json({ message: "Email is required" });

  const sql = "SELECT USER_ID, is_verified FROM users WHERE Email = ? LIMIT 1";
  db.query(sql, [email], async (err, results) => {
    if (err) return res.status(500).json({ message: "Database error", error: err.message });

    if (results.length === 0) {
      return res.status(404).json({ message: "No account found with this email" });
    }

    const user = results[0];

    if (user.is_verified) {
      return res.status(400).json({ message: "Email is already verified. Please login." });
    }

    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

    const updateSql = "UPDATE users SET otp_code = ?, otp_expires_at = ? WHERE USER_ID = ?";
    db.query(updateSql, [otp, otpExpiry, user.USER_ID], async (updateErr) => {
      if (updateErr) return res.status(500).json({ message: "Database error", error: updateErr.message });

      const emailResult = await sendOTPEmail(email, otp);

      if (!emailResult.success) {
        console.log(`\n[DEV] Resent OTP for ${email}: ${otp}  (expires in ${OTP_EXPIRY_MINUTES} min)\n`);
      }

      res.status(200).json({
        message: "A new OTP has been sent to your email.",
        emailSent: emailResult.success,
        ...(process.env.NODE_ENV !== 'production' && !emailResult.success
          ? { devOtp: otp, devNote: "Email not configured — OTP shown here for development only" }
          : {})
      });
    });
  });
};

// ── Legacy verify link (kept for old links, redirects to login) ───────────────
exports.verifyEmail = (req, res) => {
  res.status(410).json({ message: "This verification method is no longer supported. Please use OTP verification." });
};

// ── Forgot Password ───────────────────────────────────────────────────────────
exports.forgotPassword = (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: "Email is required" });

  const sql = "SELECT USER_ID FROM users WHERE Email = ? LIMIT 1";
  db.query(sql, [email], async (err, results) => {
    if (err) return res.status(500).json({ message: "Database error", error: err.message });
    
    if (results.length === 0) {
      return res.status(200).json({ message: "If the email is registered, an OTP has been sent." });
    }

    const user = results[0];
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

    const updateSql = "UPDATE users SET reset_otp_code = ?, reset_otp_expires_at = ? WHERE USER_ID = ?";
    db.query(updateSql, [otp, otpExpiry, user.USER_ID], async (updateErr) => {
      if (updateErr) return res.status(500).json({ message: "Database error", error: updateErr.message });

      await sendOTPEmail(email, otp); 
      res.status(200).json({ message: "If the email is registered, an OTP has been sent." });
    });
  });
};

// ── Reset Password ────────────────────────────────────────────────────────────
exports.resetPassword = (req, res) => {
  const { email, otp, newPassword } = req.body;
  if (!email || !otp || !newPassword) {
    return res.status(400).json({ message: "Email, OTP, and new password are required" });
  }

  if (newPassword.length < 6) {
     return res.status(400).json({ message: "Password must be at least 6 characters long" });
  }

  const sql = "SELECT USER_ID, reset_otp_code, reset_otp_expires_at FROM users WHERE Email = ? LIMIT 1";
  db.query(sql, [email], async (err, results) => {
    if (err) return res.status(500).json({ message: "Database error", error: err.message });

    if (results.length === 0) {
      return res.status(400).json({ message: "Invalid request" });
    }

    const user = results[0];

    if (!user.reset_otp_code || String(user.reset_otp_code) !== String(otp).trim()) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    const now = new Date();
    const expiresAt = new Date(user.reset_otp_expires_at);
    if (now > expiresAt) {
      return res.status(400).json({ message: "OTP has expired. Please request a new one." });
    }

    try {
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      const updateSql = "UPDATE users SET Password = ?, reset_otp_code = NULL, reset_otp_expires_at = NULL WHERE USER_ID = ?";
      
      db.query(updateSql, [hashedPassword, user.USER_ID], (updateErr) => {
        if (updateErr) return res.status(500).json({ message: "Database error", error: updateErr.message });
        res.status(200).json({ message: "Password has been successfully reset" });
      });
    } catch (hashError) {
      res.status(500).json({ message: "Error hashing password", error: hashError.message });
    }
  });
};

// ── Delete Account ────────────────────────────────────────────────────────────
exports.deleteAccount = (req, res) => {
  const userId = req.user.id;

  const sql = "DELETE FROM users WHERE USER_ID = ?";
  db.query(sql, [userId], (err, results) => {
    if (err) return res.status(500).json({ message: "Database error", error: err.message });
    
    if (results.affectedRows === 0) {
       return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "Account successfully deleted" });
  });
};