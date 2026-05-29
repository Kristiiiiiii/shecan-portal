const express = require("express");
const jwt = require("jsonwebtoken");
const { verifyAdminLogin } = require("../utils/fileStore");

const router = express.Router();

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const admin = await verifyAdminLogin(email, password);
    if (!admin) return res.status(401).json({ error: "Invalid credentials" });

    const secret = process.env.JWT_SECRET;
    if (!secret) return res.status(500).json({ error: "Missing JWT_SECRET" });

    const token = jwt.sign(
      { sub: admin.email, email: admin.email, role: "admin" },
      secret,
      { expiresIn: "7d" }
    );

    return res.json({ token });
  } catch (_err) {
    return res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
