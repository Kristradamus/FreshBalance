const mysql = require("mysql2");
require("dotenv");

const pool = mysql.createPool({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "NUTRITION_WEBSITE2.0",
    connectionLimit: 10,
})

module.exports = pool;