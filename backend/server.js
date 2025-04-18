const express = require("express");
const cors = require("cors");
const app = express();
const PORT = process.env.PORT || 5000;
require("dotenv").config();

const authMiddleware = require("./middleware/authMiddleware.js");
const authController = require("./controllers/authController.js");
const supportController = require("./controllers/supportController.js");
const cartRoutes = require("./routes/cartRoutes.js");
const productRoutes = require("./routes/productRoutes.js");
const favoriteRoutes = require("./routes/favoriteRoutes.js");
const pool = require("./dataBase.js");

app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:5174", "https://freshbalance.onrender.com", "http://localhost:3000", "http://192.168.0.156:3000"],
    credentials: true,
  })
);

app.use(express.json());

app.use("/cart", cartRoutes);
app.use("/products", productRoutes);
app.use("/favorites", favoriteRoutes);

app.post("/check-email", authController.emailCheckLimiter, authController.checkEmail);
app.post("/register", authController.verifyEmailVerificationCode, authController.register);
app.post("/login", authController.login);
app.post("/username-check", authController.checkUsername);
app.get("/user", authController.getUser);
app.post("/send-message", supportController.emailIpRateLimiter, supportController.sendMessage);

/*---------------------------------------------CALLING-AUTH-MIDDLEWARE-----------------------------------------------*/
app.post("/validate-token", authMiddleware.authenticateJWT, (req, res) => {
  res.json({
    valid: true,
    user: req.user
  });
});

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