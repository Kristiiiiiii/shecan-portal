const express = require("express");
const { addSubmission, listSubmissions } = require("../utils/fileStore");
const { requireAdmin } = require("../utils/requireAdmin");

const router = express.Router();

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

router.post("/", async (req, res) => {
  try {
    const { name, email, message } = req.body || {};

    const cleaned = {
      name: String(name || "").trim(),
      email: String(email || "").trim().toLowerCase(),
      message: String(message || "").trim()
    };

    if (!cleaned.name) return res.status(400).json({ error: "Name is required" });
    if (!cleaned.email) return res.status(400).json({ error: "Email is required" });
    if (!isValidEmail(cleaned.email)) return res.status(400).json({ error: "Invalid email" });
    if (!cleaned.message) return res.status(400).json({ error: "Message is required" });
    if (cleaned.message.length < 10) {
      return res.status(400).json({ error: "Message must be at least 10 characters" });
    }
    if (cleaned.name.length < 2) {
      return res.status(400).json({ error: "Name must be at least 2 characters" });
    }

    const created = await addSubmission(cleaned);
    return res.status(201).json({ ok: true, id: created.id });
  } catch (_err) {
    return res.status(500).json({ error: "Server error" });
  }
});

router.get("/", requireAdmin, async (_req, res) => {
  try {
    const items = await listSubmissions();
    return res.json({ items });
  } catch (_err) {
    return res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
