require("dotenv").config();

const express = require("express");
const cors    = require("cors");

const expenseRoutes = require("./src/route/expenseRoute");
const authRoutes    = require("./src/route/authRoute");
const incomeRoutes  = require("./src/route/incomeRoute");
const { notFound, errorHandler } = require("./src/middleware/errorMiddleware");

const app = express();

// ── CORS ─────────────────────────────────────────────────────────────────────
const allowedOrigins = [
  "http://localhost:3000",
  "https://expense-tracker-iota-eosin-32.vercel.app",
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (curl, Postman, Render health checks)
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true
  })
);

app.use(express.json());

// ── Health / smoke-test routes ────────────────────────────────────────────────
app.get("/health", (req, res) => {
  res.status(200).json({ message: "server is running" });
});

app.get("/", (req, res) => {
  res.json({ message: "Backend is running" });
});

app.get("/test", (req, res) => {
  res.json({ message: "Backend is working 🚀" });
});

// ── API routes ────────────────────────────────────────────────────────────────
app.use("/api",          expenseRoutes);
app.use("/api",          authRoutes);
app.use("/api/finance",  incomeRoutes);

// ── Error middleware ──────────────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

// ── Start server ──────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});