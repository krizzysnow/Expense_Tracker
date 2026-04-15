const jwt = require("jsonwebtoken");

const protect = (req, res, next) => {
  console.log(`[AUTH] ${req.method} ${req.path}`);

  const authHeader = req.header("Authorization");

  if (!process.env.JWT_SECRET) {
    console.error("[AUTH]  JWT_SECRET not configured");
    return res.status(500).json({ error: "Server configuration error" });
  }

  if (!authHeader) {
    console.warn("[AUTH]  No Authorization header");
    return res.status(401).json({ error: "No Authorization header" });
  }

  if (!authHeader.startsWith("Bearer ")) {
    console.warn("[AUTH]  Invalid Bearer format");
    return res.status(401).json({ error: "Invalid Authorization format" });
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    console.warn("[AUTH]  No token provided");
    return res.status(401).json({ error: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log(`[AUTH] Decoded token:`, { user: decoded.user, email: decoded.email });

   
    const userId = decoded.user || decoded.id;

    if (!userId) {
      console.error("[AUTH]  No user ID in token", { tokenKeys: Object.keys(decoded) });
      return res.status(401).json({ error: "Invalid token structure" });
    }

    req.user = {
      id: userId,
      email: decoded.email,
    };

    console.log(`[AUTH]  User ${userId} authenticated`);
    next();
  } catch (err) {
    console.error(`[AUTH] JWT error: ${err.message}`, { code: err.code });
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};

module.exports = protect;


