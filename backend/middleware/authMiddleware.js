const jwt = require("jsonwebtoken");
require("dotenv").config();

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN;

const generateToken = (userId, username, email, role) => {
  console.log("Generating token for:", {username});
  return jwt.sign(
    { userId, username, email, role },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
};

const verifyToken = (token) => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log("Token verified successfully!");
    return decoded;
  }
  catch(err) {
    console.error("JWT verification error:", err);
    return null;
  }
};

const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(401).json({ error: "Invalid token" });
  }

  console.log("Authenticated user !");
  req.user = decoded;
  next();
};

const verifyAdmin = (req, res, next) => {
  console.log("Checking admin privileges !");
  if (req.user && req.user.role === 'admin') {
    console.log("Admin access granted !");
    next();
  } 
  else {
    console.log("Admin access denied, user role:", req.user?.role);
    return res.status(403).json({ error: "Access denied. Admin privileges required." });
  }
};

module.exports = {
  generateToken,
  verifyToken,
  authenticateJWT,
  verifyAdmin,
};