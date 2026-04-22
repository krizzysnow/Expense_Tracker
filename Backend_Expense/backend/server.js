require("dotenv").config();

const express = require("express");
const cors = require("cors");

const expenseRoutes = require("./src/route/expenseRoute");
const authRoutes = require("./src/route/authRoute");
const incomeRoutes = require("./src/route/incomeRoute");
const { notFound, errorHandler } = require("./src/middleware/errorMiddleware");

const app = express();

// CORS
const allowedOrigins = [
  "http://localhost:3000",

  // Correct current Vercel frontend URL
  "https://expense-tracker-blond-eight-97.vercel.app",

  // Keep previous Vercel URLs if needed
  "https://expense-tracker-iota-eosin-32.vercel.app",

  // Custom domain
  "https://expenseflow.in",
  "https://www.expenseflow.in",

  // Render environment variable
  process.env.FRONTEND_URL
].filter(Boolean);

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) {
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    console.log("Blocked by CORS:", origin);
    return callback(new Error(`Not allowed by CORS: ${origin}`));
  },
  credentials: true
};

app.use(cors(corsOptions));

// Handle browser preflight requests
app.options(/.*/, cors(corsOptions));

app.use(express.json());

// Health route
app.get("/health", (req, res) => {
  res.status(200).json({
    message: "server is running",
    allowedOrigins
  });
});

app.get("/", (req, res) => {
  res.json({ message: "Backend is running" });
});

app.get("/test", (req, res) => {
  res.json({ message: "Backend is working 🚀" });
});

// API routes
app.use("/api", expenseRoutes);
app.use("/api", authRoutes);
app.use("/api/finance", incomeRoutes);

// Error middleware
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log("Allowed CORS origins:", allowedOrigins);
});