const express = require("express");
const rateLimit = require('express-rate-limit');
const bodyParser = require("body-parser");
const cors = require("cors");
const app = express();
const cookieParser = require('cookie-parser');
const PORT = process.env.PORT || 5000;
require('dotenv').config();

const authMiddleware = require("./middleware/authMiddleware.js");
const authController = require("./controllers/authController.js");
const supportController = require("./controllers/supportController.js");
const pool = require("./dataBase.js");

app.use(
  cors({
    origin: ['http://localhost:5173','http://localhost:5174','https://freshbalance.onrender.com','http://localhost:3000','http://192.168.0.156:3000',],
    credentials: true,
  })
);
app.use(cookieParser());
app.use(bodyParser.json());

app.post("/check-email", authController.emailCheckLimiter, authController.checkEmail);
app.post("/register", authController.verifyEmailVerificationCode, authController.register);
app.post("/login", authController.login);
app.post("/username-check", authController.checkUsername);
app.get("/user", authController.getUser);
app.post('/send-message', supportController.emailIpRateLimiter, supportController.sendMessage);

// Protected routes (example)
// app.get("/protected-route", authMiddleware.authenticateJWT, (req, res) => {
//   res.json({ message: "This is a protected route", user: req.user });
// });


/*---------------------------------------------START-SERVER-----------------------------------------------*/
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