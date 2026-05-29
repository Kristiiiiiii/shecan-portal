const mongoose = require("../backend/node_modules/mongoose");
const bcrypt = require("../backend/node_modules/bcryptjs");

const AdminSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true }
  },
  { timestamps: true }
);

AdminSchema.methods.verifyPassword = async function verifyPassword(password) {
  return bcrypt.compare(password, this.passwordHash);
};

const Admin = mongoose.model("Admin", AdminSchema);

async function ensureAdminSeeded() {
  const existing = await Admin.findOne().lean();
  if (existing) return;

  const seedEmail = process.env.ADMIN_EMAIL;
  const seedPassword = process.env.ADMIN_PASSWORD;
  if (!seedEmail || !seedPassword) return;

  const passwordHash = await bcrypt.hash(seedPassword, 12);
  await Admin.create({ email: seedEmail, passwordHash });
}

module.exports = { Admin, ensureAdminSeeded };

