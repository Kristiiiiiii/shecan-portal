require("dotenv").config();

const path = require("path");
const express = require("express");
const cors = require("cors");
const { ensureAdminSeeded } = require("../utils/fileStore");

const app = express();
const PORT = process.env.PORT || 5000;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "*";
const frontendPath = path.join(__dirname, "..", "frontend");

app.use(
  cors({
    origin: CLIENT_ORIGIN === "*" ? "*" : [CLIENT_ORIGIN],
    credentials: false
  })
);
app.use(express.json({ limit: "200kb" }));

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, name: "shecan-portal-api", storage: "json-file" });
});

const authRoutes = require("../routes/auth");
const formRoutes = require("../routes/forms");
app.use("/api/auth", authRoutes);
app.use("/api/forms", formRoutes);

app.get("/", (_req, res) => {
  res.sendFile(path.join(frontendPath, "index.html"));
});

app.use(express.static(frontendPath, { index: false }));

app.use((_req, res) => res.status(404).json({ error: "Not found" }));

async function start() {
  await ensureAdminSeeded().catch((e) => console.warn("Admin seed:", e.message));

  app.listen(PORT, () => {
    console.log(`She Can portal running at http://localhost:${PORT}`);
    console.log(`Open the site: http://localhost:${PORT}/`);
    console.log(`Admin panel: http://localhost:${PORT}/admin.html`);
  });
}

start();
