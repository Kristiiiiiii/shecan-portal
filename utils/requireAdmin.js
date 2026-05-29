const jwt = require("jsonwebtoken");

function requireAdmin(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice("Bearer ".length) : null;
    if (!token) return res.status(401).json({ error: "Missing token" });

    const secret = process.env.JWT_SECRET;
    if (!secret) return res.status(500).json({ error: "Missing JWT_SECRET" });

    const payload = jwt.verify(token, secret);
    if (!payload || payload.role !== "admin") return res.status(403).json({ error: "Forbidden" });

    req.admin = payload;
    return next();
  } catch (_err) {
    return res.status(401).json({ error: "Invalid token" });
  }
}

module.exports = { requireAdmin };
