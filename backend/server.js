const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { sendEmail } = require('./email');
require('dotenv').config();
const app = express();
const pool = require("./dataBase");
const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: ['http://localhost:5173','https://nutritionwebsitedemo.onrender.com','http://localhost:3000','http://192.168.0.156:3000',],
    credentials: true,
  })
);
app.use(bodyParser.json());
{/*---------------------------------SUPPORT--------------------------------------*/}
app.post('/send-message', async (req, res) => {

  const { name, email, message } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ message: 'Name, email, and message are required' });
  }
  try {
    const result = await sendEmail(name, email, message);
    if (result.success) {
      res.status(200).json({ message: result.message });
    } else {
      res.status(500).json({ message: result.message });
    }
  } catch (error) {
    console.error('Error in /send-message route:', error);
    res.status(500).json({ message: 'An error occurred while sending the message' });
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

{/*-----------------------------------CONSOLE-LOGS----------------------------------------*/}
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
pool.getConnection((err, connection) => {
  if (err) {
    console.error("Error connecting to the database:", err);
    return;
  }
  console.log("Connected to the database!");
  connection.release();

  connection.query("SELECT * FROM users", (err, result) => {
    if(err){
      console.log("Error executing query:", err)
      return;
    }
    else{
      console.log("Query data:", result);
    }
  })
})
