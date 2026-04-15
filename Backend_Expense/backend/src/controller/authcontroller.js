const db = require("../config/db");

exports.getIncome = (req, res) => {
  const userId = req.user.id;
  const sql = "SELECT Income FROM expenses WHERE User_ID = ? LIMIT 1";

  db.query(sql, [userId], (err, results) => {
    if (err) {
      console.error("[getIncome] DB error:", err.message);
      return res.status(500).json({ message: "Database error", error: err.message });
    }
    if (results.length === 0) {
      return res.status(200).json({ income: 0, message: "No expenses found yet" });
    }
    res.status(200).json({ income: parseFloat(results[0].Income) || 0 });
  });
};

exports.updateIncome = (req, res) => {
  const userId = req.user.id;
  const { income } = req.body;

  const parsed = parseFloat(income);
  if (isNaN(parsed) || parsed < 0) {
    return res.status(400).json({ message: "Invalid income value" });
  }

  const sql = "UPDATE expenses SET Income = ? WHERE User_ID = ?";

  db.query(sql, [parsed, userId], (err, result) => {
    if (err) {
      console.error("[updateIncome] DB error:", err.message);
      return res.status(500).json({ message: "Database error", error: err.message });
    }
    if (result.affectedRows === 0) {
      return res.status(200).json({ message: "No expenses found to attach income to yet", income: parsed });
    }
    console.log(`[updateIncome] Income updated to ${parsed} for User_ID=${userId}`);
    res.status(200).json({ message: "Income updated successfully", income: parsed });
  });
};
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { randomUUID } = require("crypto");

exports.loginUser = (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      message: "Email and password are required"  
    });
  }

  if (!process.env.JWT_SECRET) {
    return res.status(500).json({
      message: "JWT secret is not configured"
    });
  }

  const sql =
    "SELECT USER_ID, Name AS name, Email AS email, Password AS password FROM users WHERE Email = ? LIMIT 1";

  db.query(sql, [email], async (err, results) => {
    if (err) {
      return res.status(500).json({
        message: "Database error",
        error: err.message
      });
    }

    if (results.length === 0) {
      return res.status(401).json({
        message: "Invalid email or password"
      });
    }

    const user = results[0];

    if (!user.password) {
      return res.status(500).json({
        message: "Stored password hash is missing for this user"
      });
    }

    let isMatch;

    try {
      isMatch = await bcrypt.compare(password, user.password);
    } catch (compareError) {
      return res.status(500).json({
        message: "Stored password hash is invalid",
        error: compareError.message
      });
    }

    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid email or password"
      });
    }

    const token = jwt.sign(
      {
        user: user.USER_ID,
        email: user.email
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        user: user.USER_ID,
        name: user.name,
        email: user.email
      }
    });
  });
};

exports.getCurrentUser = (req, res) => {
  const sql = "SELECT USER_ID, Name AS name, Email AS email FROM users WHERE USER_ID = ? LIMIT 1";

  db.query(sql, [req.user.id], (err, results) => {
    if (err) {
      return res.status(500).json({
        message: "Database error",
        error: err.message
      });
    }

    if (results.length === 0) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    res.status(200).json({
      user: results[0]
    });
  });
};

exports.registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({
      message: "Please provide all required fields (name, email, password)"
    });
  }

  const checkUserSql = "SELECT Email FROM users WHERE Email = ?";
  db.query(checkUserSql, [email], async (err, results) => {
    if (err) {
      return res.status(500).json({ message: "Database error", error: err.message });
    }

    if (results && results.length > 0) {
      return res.status(400).json({ message: "User already exists with this email" });
    }

    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const userId = randomUUID();
      const insertSql = "INSERT INTO users (User_ID, Name, Email, Password) VALUES (?, ?, ?, ?)";

      db.query(insertSql, [userId, name, email, hashedPassword], (insertErr) => {
        if (insertErr) {
          return res.status(500).json({ message: "Database error during registration", error: insertErr.message });
        }

        res.status(201).json({
          message: "User registered successfully",
          userId
        });
      });
    } catch (hashError) {
      res.status(500).json({ message: "Error hashing password", error: hashError.message });
    }
  });
};