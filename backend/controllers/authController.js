const bcrypt = require("bcryptjs");
const rateLimit = require("express-rate-limit");
const validator = require("validator");
const dns = require("dns");
const crypto = require("crypto");
const { z } = require("zod");
const pool = require("../dataBase");
const { generateToken } = require("../middleware/authMiddleware");

/*--------------------------------------------------------START----------------------------------------------------*/
const emailVerificationCode = new Map();

const cleanExpiredVerificationCodes = () => {
  const now = Date.now();
  emailVerificationCode.forEach((value, key) => {
    if (now - value.createdAt > 15 * 60 * 1000) {
      emailVerificationCode.delete(key);
    }
  });
};
setInterval(cleanExpiredVerificationCodes, 10 * 60 * 1000);

/*-------------------------------------------------EMAIL-VALIDATION--------------------------------------------------*/
const emailCheckLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: "Too many attempts. Please try again in 15 minutes.",
  skip: (req) => {
    const whitelist = ["84.43.144.178", "::1", "127.0.0.1"];
    return whitelist.includes(req.ip);
  }
});

const verifyEmailDomain = async (email) => {
  try {
    const domain = email.split("@")[1];
    const mxRecords = await dns.promises.resolveMx(domain);
    return mxRecords && mxRecords.length > 0;
  } 
  catch (error) {
    console.error("DNS verification failed:", error);
    return false;
  }
};

const checkEmail = async (req, res) => {
  const { email } = req.body;
  console.log(email);

  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }
  if (!validator.isEmail(email)) {
    return res.status(400).json({ error: "Invalid email address!" });
  }

  try {
    const isDomainValid = await verifyEmailDomain(email);
    if (!isDomainValid) {
      return res.status(400).json({ error: "Email does not exist!" });
    }

    const [rows] = await pool.query(
      "SELECT * FROM users WHERE user_email = ?",
      [email]
    );
    const verificationCode = crypto.randomBytes(32).toString("hex");
    emailVerificationCode.set(email, { verificationCode, createdAt: Date.now() });

    console.log(rows);
    if (rows.length > 0) {
      res.status(200).json({ exists: true, verificationCode });
    } else {
      res.status(200).json({ exists: false, verificationCode });
    }
  } catch (error) {
    console.error("Error checking email:", error);
    res.status(500).json({ error: "Database error" });
  }
};

/*------------------------------------------EMAIL-VERIFICATION-CODE------------------------------------------*/
const verifyEmailVerificationCode = (req, res, next) => {
  const { email: submittedEmail, verificationCode } = req.body;

  if (!submittedEmail || !verificationCode) {
    return res.status(400).json({ error: "Email and verification code are required!" });
  }

  const verificationCodeEntry = emailVerificationCode.get(submittedEmail);

  if (!verificationCodeEntry) {
    return res
      .status(401)
      .json({ error: "No verification code found for this email!" });
  }

  if (verificationCodeEntry.verificationCode !== verificationCode) {
    return res.status(403).json({
      error: "Invalid verification code!",
      detail: "The provided verification code does not match the expected verification code.",
    });
  }

  const currentTime = Date.now();
  const verificationCodeAge = currentTime - verificationCodeEntry.createdAt;
  const CODE_EXPIRATION = 15 * 60 * 1000;

  if (verificationCodeAge > CODE_EXPIRATION) {
    emailVerificationCode.delete(submittedEmail);
    return res.status(401).json({
      error: "Verification code has expired!",
      detail: "Please request a new verification code.",
    });
  }

  emailVerificationCode.delete(submittedEmail);
  next();
};

/*----------------------------------------------REGISTRATION--------------------------------------------*/
const register = async (req, res) => {
  try {
    const { email, username, password } = req.body;

    const registerSchema = z.object({
      username: z
        .string()
        .max(30, "Username cannot exceed 30 characters!")
        .min(3, "Username must contain at least 3 characters!")
        .regex(
          /^[a-zA-Z0-9_]+$/,
          "Only letters, numbers, and underscores are allowed in the username!"
        )
        .min(1, "Username is required!")
        .trim(),
      password: z
        .string()
        .regex(/[A-Z]/, "Password must contain atleast one uppercase letter!")
        .regex(/[0-9]/, "Password must contain atleast one number!")
        .min(8, "Password must be atleast 8 characters!")
        .min(1, "Password is required!")
        .trim(),
    });

    const validationResult = registerSchema.safeParse({ username, password });
    if (!validationResult.success) {
      const errorMessages = validationResult.error.errors.map(
        (err) => err.message
      );
      return res.status(400).json({
        error: "Validation failed",
        messages: errorMessages,
      });
    }

    const [usernameExists] = await pool.query(
      "SELECT user_id FROM users WHERE user_name = ?",
      [username]
    );
    if (usernameExists.length > 0) {
      return res.status(409).json({ error: "Username is already taken!" });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const [result] = await pool.query(
      "INSERT INTO users (user_name, user_email, user_password, user_role) VALUES (?, ?, ?, 'user')",
      [username, email, hashedPassword]
    );

    const userId = result.insertId;
    const authToken = generateToken(
      userId,
      username,
      email,
      'user'
    );

    emailVerificationCode.delete(email);
    res.status(201).json({
      success: true,
      token: authToken,
      user: {
        id: userId,
        username: username,
        email: email,
        role: 'user'
      }
    });
    
    console.log(`New registration: ${username} (${email})`);
  } 
  catch (error) {
    console.error("Registration error:", error);

    const errorResponse = {
      error: "Registration failed",
      message: "An error occurred during registration",
    };

    if (error.code === "ER_DUP_ENTRY") {
      errorResponse.details = "Email already registered";
    }

    res.status(500).json(errorResponse);
  }
};

/*------------------------------------------USERNAME-AVAILABILITY-CHECK---------------------------------------------*/
const checkUsername = async (req, res) => {
  const { username } = req.body;
  if (!username) {
    return res.status(400).json({ error: "Username is required!" });
  }
  try {
    const [rows] = await pool.query("SELECT * FROM users WHERE user_name = ?", [
      username,
    ]);
    if (rows.length > 0) {
      res.status(200).json({ exists: true });
    } else {
      res.status(200).json({ exists: false });
    }
  } catch (error) {
    console.error("Error checking username:", error);
    res.status(500).json({ error: "Database error" });
  }
};

/*----------------------------------------------LOGIN-------------------------------------------------*/
const login = async (req, res) => {
  const { email, password, verificationCode } = req.body;
  console.log("Login request received:", req.body);
  try {
    if (!verificationCode) {
      return res.status(401).json({ error: "Verification code is required!" });
    }
    if (verificationCode) {
      const verificationCodeEntry = emailVerificationCode.get(email);
      if (!verificationCodeEntry || verificationCodeEntry.verificationCode !== verificationCode) {
        return res.status(401).json({ error: "Invalid verification code!" });
      }
      emailVerificationCode.delete(email);
    }

    const [users] = await pool.query(
      "SELECT * FROM users WHERE user_email = ?",
      [email]
    );
    if (users.length === 0) {
      return res.status(401).json({ error: "Invalid credentials!" });
    }

    const user = users[0];
    const isPasswordValid = await bcrypt.compare(password, user.user_password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid password!" });
    }

    const authToken = generateToken(
      user.user_id,
      user.user_name,
      user.user_email,
      user.user_role
    );
    res.json({
      token: authToken,
      user: {
        id: user.user_id,
        username: user.user_name,
        email: user.user_email,
        role: user.user_role
      },
    });
  } 
  catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      error: "Login failed",
      details: error.message,
    });
  }
};

/*---------------------------------------GET-USERNAME-BY-EMAIL---------------------------------------*/
const getUser = async (req, res) => {
  const { email } = req.query;

  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }
  try {
    const [rows] = await pool.query(
      "SELECT user_name FROM users WHERE user_email = ?",
      [email]
    );
    if (rows.length > 0) {
      res.status(200).json({ username: rows[0].user_name });
    } else {
      res.status(404).json({ error: "User not found" });
    }
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ error: "Database error" });
  }
};

module.exports = {
  emailCheckLimiter,
  verifyEmailVerificationCode,
  checkEmail,
  register,
  checkUsername,
  login,
  getUser,
};
