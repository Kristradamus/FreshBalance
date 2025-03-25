const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { sendEmail } = require('./support.js');
require('dotenv').config();
const app = express();
const pool = require("./dataBase");
const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: ['http://localhost:5173','https://freshbalance.onrender.com','http://localhost:3000','http://192.168.0.156:3000',],
    credentials: true,
  })
);
app.use(bodyParser.json());
{/*---------------------------------SUPPORT--------------------------------------*/}
app.post('/send-message', async (req, res) => {
  try {
    const result = await sendEmail(req.body.name, req.body.email, req.body.message);
    res.status(200).json(result);
  } 
  catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
});

{/*---------------------------------EMAIL-LOGIN-REGISTER--------------------------------------*/}
app.post("/check-email", async (req, res) => {
  const { email } = req.body;
  console.log(email);

  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }

  try {
    const [rows] = await pool.query("SELECT * FROM users WHERE user_email = ?", [email]);
    console.log(rows);
    if (rows.length > 0) {
      res.status(200).json({ exists: true });
    } else {
      res.status(200).json({ exists: false });
    }
  } catch (error) {
    console.error("Error checking email:", error);
    res.status(500).json({ error: "Database error" });
  }
});

{/*-----------------------------------USERNAME-----------------------------------------*/}
app.get("/user", async (req, res) => {
  const { email } = req.query;

  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }
  try {
    const [rows] = await pool.query("SELECT user_name FROM users WHERE user_email = ?", [email]);
    if (rows.length > 0) {
      res.status(200).json({ username: rows[0].user_name });
    } else {
      res.status(404).json({ error: "User not found" });
    }
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ error: "Database error" });
  }
});

{/*-----------------------------------USERNAME-CHECK----------------------------------------*/}
app.post("/username-check", async (req, res) => {
  const { username } = req.body;
  if (!username) {
    return res.status(400).json({ error: "Username is required" });
  }
  try {
    const [rows] = await pool.query("SELECT * FROM users WHERE user_name = ?", [username]);
    if (rows.length > 0) {
      res.status(200).json({ exists: true });
    } else {
      res.status(200).json({ exists: false });
    }
  } 
  catch (error) {
    console.error("Error checking username:", error);
    res.status(500).json({ error: "Database error" });
  }
});
{/*-----------------------------------CONSOLE-LOGS----------------------------------------*/}
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

const startServer = async () => {
  try {
    const connection = await pool.getConnection();
    console.log("Connected to the database!");
    connection.release();

    const [rows] = await pool.query("SELECT * FROM users");
    console.log("Query data:", rows);

  } 
    catch (err) {
    console.error("Error connecting to the database:", err);
  }
};
startServer();