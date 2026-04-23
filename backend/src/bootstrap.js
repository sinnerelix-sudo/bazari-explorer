import bcrypt from "bcryptjs";
import { getDB } from "./db.js";

export async function ensureBootstrapAdmin() {
  const email = (process.env.ADMIN_BOOTSTRAP_EMAIL || "").trim().toLowerCase();
  const password = process.env.ADMIN_BOOTSTRAP_PASSWORD || "";

  if (!email || !password) return;

  const name = (process.env.ADMIN_BOOTSTRAP_NAME || "Admin").trim() || "Admin";
  const phone = (process.env.ADMIN_BOOTSTRAP_PHONE || "").trim() || null;
  const users = getDB().collection("users");
  const existing = await users.findOne({ email });

  if (!existing) {
    const hash = await bcrypt.hash(password, 10);
    await users.insertOne({
      name,
      email,
      password: hash,
      phone,
      role: "admin",
      created_at: new Date(),
    });
    console.log(`Bootstrap admin created: ${email}`);
    return;
  }

  const updates = {};

  if (existing.role !== "admin") updates.role = "admin";
  if (!existing.password) updates.password = await bcrypt.hash(password, 10);
  if (!existing.name) updates.name = name;
  if (!existing.phone && phone) updates.phone = phone;

  if (Object.keys(updates).length > 0) {
    await users.updateOne({ _id: existing._id }, { $set: updates });
    console.log(`Bootstrap admin updated: ${email}`);
    return;
  }

  console.log(`Bootstrap admin ready: ${email}`);
}
