const mysql = require("mysql2");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../../.env") });

const requiredEnvVars = [
  "DB_HOST",
  "DB_USER",
  "DB_PASSWORD",
  "DB_NAME",
  "DB_PORT",
];

requiredEnvVars.forEach((varName) => {
  if (!process.env[varName]) {
    console.error(`Missing required environment variable: ${varName}`);
    process.exit(1);
  }
});

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: parseInt(process.env.DB_PORT, 10),
  enableKeepAlive: true,
});

db.connect((err) => {
  if (err) {
    console.error(
      `Database connection failed: ${err.message}`,
      `Host: ${process.env.DB_HOST}, User: ${process.env.DB_USER}`
    );
    setTimeout(() => db.connect(), 5000);
  } else {
    console.log(
      `MySQL Connected: ${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`
    );
  }
});

db.on("error", (err) => {
  console.error(`Database error: ${err.message}`);
  if (err.code === "PROTOCOL_CONNECTION_LOST") {
    db.connect();
  }
});

module.exports = db;
