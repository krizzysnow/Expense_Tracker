const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });
const express = require("express");
const cors = require("cors"); 

const expenseRoutes = require("./src/route/expenseRoute");
const authRoutes=require("./src/route/authRoute");
const { notFound, errorHandler } = require("./src/middleware/errorMiddleware");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api",expenseRoutes);
app.use("/api", authRoutes);

app.use(notFound);
app.use(errorHandler);


app.get("/health", (req,res) => {
  res.status(200).json({ MessagePort: "server is running"});
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});












