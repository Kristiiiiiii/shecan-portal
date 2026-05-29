const fs = require("fs/promises");
const path = require("path");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");

const DATA_DIR = path.join(__dirname, "..", "data");
const SUBMISSIONS_FILE = path.join(DATA_DIR, "submissions.json");
const ADMIN_FILE = path.join(DATA_DIR, "admin.json");

async function ensureDataDir() {
  await fs.mkdir(DATA_DIR, { recursive: true });
}

async function readJson(file, defaultValue) {
  try {
    const raw = await fs.readFile(file, "utf8");
    return JSON.parse(raw);
  } catch {
    return defaultValue;
  }
}

async function writeJson(file, data) {
  await ensureDataDir();
  await fs.writeFile(file, JSON.stringify(data, null, 2), "utf8");
}

async function addSubmission({ name, email, message }) {
  const items = await readJson(SUBMISSIONS_FILE, []);
  const entry = {
    id: crypto.randomUUID(),
    name,
    email,
    message,
    createdAt: new Date().toISOString()
  };
  items.unshift(entry);
  await writeJson(SUBMISSIONS_FILE, items);
  return entry;
}

async function listSubmissions() {
  const items = await readJson(SUBMISSIONS_FILE, []);
  return items.slice(0, 200);
}

async function getAdmin() {
  return readJson(ADMIN_FILE, null);
}

async function ensureAdminSeeded() {
  const existing = await getAdmin();
  if (existing) return;

  const seedEmail = process.env.ADMIN_EMAIL;
  const seedPassword = process.env.ADMIN_PASSWORD;
  if (!seedEmail || !seedPassword) return;

  const passwordHash = await bcrypt.hash(seedPassword, 12);
  await writeJson(ADMIN_FILE, {
    email: String(seedEmail).toLowerCase().trim(),
    passwordHash
  });
}

async function verifyAdminLogin(email, password) {
  const admin = await getAdmin();
  if (!admin) return null;

  const normalized = String(email).toLowerCase().trim();
  if (admin.email !== normalized) return null;

  const ok = await bcrypt.compare(String(password), admin.passwordHash);
  return ok ? admin : null;
}

module.exports = {
  addSubmission,
  listSubmissions,
  ensureAdminSeeded,
  verifyAdminLogin
};
