const jwt = require("jsonwebtoken");
require("dotenv").config();

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN;

const generateToken = (userId, username, email) => {
  return jwt.sign({ userId, username, email }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } 
  catch (err) {
    console.error('JWT verification error:', err);
    return null;
  }
};

module.exports = { generateToken, verifyToken };