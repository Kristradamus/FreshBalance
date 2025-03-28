const { verifyToken } = require('./jwtUtils');

const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (authHeader) {
    const token = authHeader.split(' ')[1];
    
    const decoded = verifyToken(token);
    if (decoded) {
      req.user = decoded;
      return next();
    }
  }

  return res.status(401).json({ error: "Unauthorized" });
};

module.exports = authenticateJWT;