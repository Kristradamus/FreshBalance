const express = require("express");
const rateLimit = require('express-rate-limit');
const bodyParser = require("body-parser");
const cors = require("cors");
const app = express();
const crypto = require("crypto");
const pool = require("./dataBase");
const bcrypt = require('bcryptjs');
const dns = require("dns");
const validator = require("validator");
const { sendEmail, emailIpRateLimiter } = require("./support.js");
const { generateToken } = require('./jwtUtils');
const { z } = require('zod');
const emailVerificationTokens = new Map();
const PORT = process.env.PORT || 5000;
require('dotenv').config();

app.use(
  cors({
    origin: ['http://localhost:5173','http://localhost:5174','https://freshbalance.onrender.com','http://localhost:3000','http://192.168.0.156:3000',],
    credentials: true,
  })
);
app.use(bodyParser.json());

{/*---------------------------------SUPPORT--------------------------------------*/}
app.post('/send-message', emailIpRateLimiter, async (req, res) => {
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
const emailCheckLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message:"Too many attempts. Please try again in 15 minutes.",
  skip: (req) => {
    const whitelist = ["84.43.144.178", "::1", "127.0.0.1"];
    return whitelist.includes(req.ip);
  }
});

app.post("/check-email", emailCheckLimiter, async (req, res) => {
  const { email } = req.body;
  console.log(email);

  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }
  if(!validator.isEmail(email)){
    return res.status(400).json({ error: "Invalid email address!"});
  }
  const verifyEmailDomain = async (email) => {
    try {
      const domain = email.split('@')[1];
      const mxRecords = await dns.promises.resolveMx(domain);
      return mxRecords && mxRecords.length > 0;
    }
    catch (error) {
      console.error("DNS verification failed:", error);
      return false;
    }
  };
  try {
    const isDomainValid = await verifyEmailDomain(email);
    if (!isDomainValid) {
      return res.status(400).json({ error: "Email does not exist!" });
    }
    const [rows] = await pool.query("SELECT * FROM users WHERE user_email = ?", [email]);
    const token = crypto.randomBytes(32).toString('hex');
    emailVerificationTokens.set(email, {token, createdAt: Date.now()});

    console.log(rows);
    if (rows.length > 0) {
      res.status(200).json({ exists: true, token });
    } 
    else {
      res.status(200).json({ exists: false, token });
    }
  } 
  catch (error) {
    console.error("Error checking email:", error);
    res.status(500).json({ error: "Database error" });
  }
});

/*TOKENS-CODE*/
const cleanExpiredTokens = () => {
  const now = Date.now();
  emailVerificationTokens.forEach((value, key) => {
    if (now - value.createdAt > 15 * 60 * 1000) {
      emailVerificationTokens.delete(key);
    }
  });
};
setInterval(cleanExpiredTokens, 10 * 60 * 1000);

const verifyEmailToken = (req, res, next) => {
  const { email: submittedEmail, token } = req.body;

  if (!submittedEmail || !token) {
    return res.status(400).json({ error: "Email and token are required!" });
  }

  const tokenEntry = emailVerificationTokens.get(submittedEmail);

  if (!tokenEntry) {
    return res.status(401).json({ error: "No verification token found for this email!" });
  }

  if (tokenEntry.token !== token) {
    return res.status(403).json({ 
      error: "Invalid token!",
      detail: "The provided token does not match the expected token."
    });
  }

  const currentTime = Date.now();
  const tokenAge = currentTime - tokenEntry.createdAt;
  const TOKEN_EXPIRATION = 15 * 60 * 1000;

  if (tokenAge > TOKEN_EXPIRATION) {
    emailVerificationTokens.delete(submittedEmail);
    return res.status(401).json({ 
      error: "Token has expired!",
      detail: "Please request a new verification token."
    });
  }

  emailVerificationTokens.delete(submittedEmail);
  next();
};

{/*--------------------------------------REGISTER-----------------------------------------*/}
app.post("/register",verifyEmailToken, async (req, res) => {
  try {
    const { email, username, password } = req.body;

    const registerSchema = z.object({
      username: z.string()
        .max(30, "Username cannot exceed 30 characters!")
        .min(3, "Username must contain at least 3 characters!")
        .regex(/^[a-zA-Z0-9_]+$/, "Only letters, numbers, and underscores are allowed in the username!")
        .min(1, "Username is required!")
        .trim(),
      password: z.string()
        .regex(/[A-Z]/, "Password must contain atleast one uppercase letter!")
        .regex(/[0-9]/, "Password must contain atleast one number!")
        .min(8, "Password must be atleast 8 characters!")
        .min(1, "Password is required!")
        .trim(),
    })

    const validationResult = registerSchema.safeParse({username, password });
    if (!validationResult.success) {
      const errorMessages = validationResult.error.errors.map(err => err.message);
      return res.status(400).json({ 
        error: "Validation failed",
        messages: errorMessages
      });
    }

    const [usernameExists] = await pool.query("SELECT user_id FROM users WHERE user_name = ?", [username]);
    if (usernameExists.length > 0) {
      return res.status(409).json({ error: "Username is already taken!" });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    await pool.query("INSERT INTO users (user_name, user_email, user_password) VALUES (?, ?, ?)",[username, email, hashedPassword]);

    emailVerificationTokens.delete(email);
    res.status(201).json({ success: true });
    console.log(`New registration: ${username} (${email})`);
  } 
  catch (error) {
    console.error("Registration error:", error);
    
    const errorResponse = {
      error: "Registration failed",
      message: "An error occurred during registration"
    };

    if (error.code === 'ER_DUP_ENTRY') {
      errorResponse.details = "Email already registered";
    }

    res.status(500).json(errorResponse);
  }
});

{/*-----------------------------------USERNAME-CHECK----------------------------------------*/}
app.post("/username-check", async (req, res) => {
  const { username } = req.body;
  if (!username) {
    return res.status(400).json({ error: "Username is required!" });
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

{/*----------------------------------------LOGIN------------------------------------------*/}
app.post("/login", verifyEmailToken, async (req, res) => {
  const { email, password } = req.body;
  
  try {
    const [users] = await pool.query(
      "SELECT * FROM users WHERE user_email = ?", 
      [email]
    );
    
    if (users.length === 0) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const user = users[0];
    
    const isPasswordValid = await bcrypt.compare(password, user.user_password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = generateToken(user.user_id, user.user_name, user.user_email);

    res.json({ 
      token: authToken,
      user: {
        id: user.user_id,
        name: user.user_name,
        email: user.user_email
      }
    });
    
  } catch (error) {
    res.status(500).json({ 
      error: "Login failed",
      details: process.env.NODE_ENV === "development" ? error.message : null
    });
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