const mysql = require("mysql2");

const requiredEnvVars = [
  "DB_HOST",
  "DB_USER",
  "DB_PASSWORD",
  "DB_NAME",
  "DB_PORT",
];

requiredEnvVars.forEach((varName) => {
  if (process.env[varName] === undefined) {
    console.error(`Missing required environment variable: ${varName}`);
    process.exit(1);
  }
});

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT),
  enableKeepAlive: true,
  // Only use SSL in production/cloud environments or when using a remote DB
  ...((process.env.NODE_ENV === "production" || process.env.DB_HOST !== "localhost") && {
    ssl: {
      rejectUnauthorized: false,
    },
  }),
});

db.connect((err) => {
  if (err) {
    console.error(
      `Database connection failed: ${err.message}. Host: ${process.env.DB_HOST}, User: ${process.env.DB_USER}, Port: ${process.env.DB_PORT}`
    );
    process.exit(1);
  }

  console.log(
    `MySQL Connected: ${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`
  );
});

db.on("error", (err) => {
  console.error(`Database error: ${err.message}`);
});

module.exports = db;
