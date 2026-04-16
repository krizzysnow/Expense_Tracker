const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });

const express = require("express");
const cors = require("cors");

const expenseRoutes = require("./src/route/expenseRoute");
const authRoutes = require("./src/route/authRoute");
const incomeRoutes = require("./src/route/incomeRoute");
const { notFound, errorHandler } = require("./src/middleware/errorMiddleware");

const app = express();

app.use(cors({
  origin: [
    "http://localhost:3000",
    "https://expense-tracker-mn6e.vercel.app",
    "https://expense-tracker-iota-eosin-32.vercel.app"
  ],
  credentials: true
}));

app.use(express.json());

app.get("/health", (req, res) => {
  res.status(200).json({ message: "server is running" });
});

app.get("/", (req, res) => {
  res.json({ message: "Backend is running" });
});

app.get("/test", (req, res) => {
  res.json({ message: "Backend is working 🚀" });
});

app.use("/api", expenseRoutes);
app.use("/api", authRoutes);
app.use("/api/finance", incomeRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});