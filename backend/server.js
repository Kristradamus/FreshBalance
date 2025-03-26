const express = require("express");
const rateLimit = require('express-rate-limit');
const bodyParser = require("body-parser");
const cors = require("cors");
const { sendEmail, emailIpRateLimiter } = require("./support.js");
const app = express();
const crypto = require("crypto");
const pool = require("./dataBase");
const bcrypt = require('bcryptjs');
const dns = require("dns");
const validator = require("validator")
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
  const { email: submittedEmail, token } = req.body; // Destructure email from reque

  // 1. Check if token exists for ANY email
  const tokenEntry = Array.from(emailVerificationTokens.entries())
    .find(([_, tokenData]) => tokenData.token === token);

  if (!tokenEntry) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }

  const [tokenBoundEmail, tokenData] = tokenEntry;

  // 2. Verify the submitted email MATCHES the token-bound email
  if (submittedEmail !== tokenBoundEmail) {
    return res.status(403).json({ 
      error: "Token does not match this email",
      detail: "Registration email must match the email that requested the token"
    });
  }

  // 3. Proceed if all checks pass
  next();
};

{/*--------------------------------------REGISTER-----------------------------------------*/}
app.post("/register",verifyEmailToken, async (req, res) => {
  try {
    const { email, token, username, password } = req.body;
    console.log(email);
    console.log(token);
    console.log(username);
    console.log(password);
    // 1. Basic validation
    if (!email || !username || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // 2. Validate email format
    if (!validator.isEmail(email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    // 3. Validate username (3-20 alphanumeric + underscore)
    if (!/^[a-zA-Z0-9_]{3,20}$/.test(username)) {
      return res.status(400).json({ error: "Username must be 3-20 characters (letters, numbers, _)" });
    }

    // 4. Validate password (min 8 chars)
    if (password.length < 8) {
      return res.status(400).json({ error: "Password must be at least 8 characters" });
    }

    // 5. Check if email already exists
    const [emailExists] = await pool.query(
      "SELECT user_id FROM users WHERE user_email = ?", 
      [email]
    );
    if (emailExists.length > 0) {
      return res.status(400).json({ error: "Email already registered" });
    }

    // 6. Check if username already exists
    const [usernameExists] = await pool.query(
      "SELECT user_id FROM users WHERE user_name = ?", 
      [username]
    );
    if (usernameExists.length > 0) {
      return res.status(400).json({ error: "Username already taken" });
    }

    // 7. Hash password and create user
    const hashedPassword = await bcrypt.hash(password, 12);
    await pool.query(
      "INSERT INTO users (user_name, user_email, user_password) VALUES (?, ?, ?)",
      [username, email, hashedPassword]
    );

    res.status(201).json({ success: true });

  } catch (error) {
    if (error.response) {
      console.error("Registration server error:", error.response.data);
      alert(error.response.data.error || "Registration failed");
    } 
    else if (error.request) {
      console.error("No response received:", error.request);
      alert("No response from server. Please check your connection.");
    } 
    else {
      console.error("Error setting up registration request:", error.message);
      alert("An unexpected error occurred during registration");
    }
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
    // 1. Find user
    const [users] = await pool.query(
      "SELECT * FROM users WHERE user_email = ?", 
      [email]
    );
    
    if (users.length === 0) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const user = users[0];
    
    // 2. Verify password
    const isPasswordValid = await bcrypt.compare(password, user.user_password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // 3. Create new session
    const authToken = crypto.randomBytes(32).toString('hex');
    await pool.query(
      "INSERT INTO user_session (user_session_user_id, user_session_token) VALUES (?, ?)",
      [user.user_id, authToken]
    );

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