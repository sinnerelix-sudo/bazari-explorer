import { Router } from "express";
import bcrypt from "bcryptjs";
import speakeasy from "speakeasy";
import qrcode from "qrcode";
import { getDB } from "../db.js";
import { authRequired, signToken, setAuthCookie, clearAuthCookie, publicUser } from "../auth.js";

const r = Router();

r.post("/register", async (req, res) => {
  const { name, email, password, phone } = req.body || {};
  if (!name || !email || !password) return res.status(400).json({ error: "Missing fields" });
  const db = getDB();
  const exists = await db.collection("users").findOne({ email: email.toLowerCase() });
  if (exists) return res.status(409).json({ error: "Email already registered" });
  const hash = await bcrypt.hash(password, 10);
  const doc = {
    name, email: email.toLowerCase(), password: hash, phone: phone || null,
    role: "user", created_at: new Date(),
  };
  const { insertedId } = await db.collection("users").insertOne(doc);
  const user = { ...doc, _id: insertedId };
  const token = signToken(user);
  setAuthCookie(res, token);
  res.json(publicUser(user));
});

r.post("/login", async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: "Missing fields" });
  const user = await getDB().collection("users").findOne({ email: email.toLowerCase() });
  if (!user || !user.password) return res.status(401).json({ error: "Invalid credentials" });
  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return res.status(401).json({ error: "Invalid credentials" });
  const token = signToken(user);
  setAuthCookie(res, token);
  res.json(publicUser(user));
});

r.post("/logout", (_req, res) => {
  clearAuthCookie(res);
  res.json({ ok: true });
});

r.get("/me", authRequired, (req, res) => {
  res.json(publicUser(req.user));
});

// 2FA — TOTP
r.post("/2fa/setup", authRequired, async (req, res) => {
  const secret = speakeasy.generateSecret({ name: `Modamall (${req.user.email})` });
  await getDB().collection("users").updateOne(
    { _id: req.user._id },
    { $set: { two_fa_temp_secret: secret.base32 } }
  );
  const qr = await qrcode.toDataURL(secret.otpauth_url);
  res.json({ secret: secret.base32, qr });
});

r.post("/2fa/verify", authRequired, async (req, res) => {
  const { code } = req.body || {};
  const u = await getDB().collection("users").findOne({ _id: req.user._id });
  const secret = u.two_fa_temp_secret || u.two_fa_secret;
  if (!secret) return res.status(400).json({ error: "No 2FA setup in progress" });
  const ok = speakeasy.totp.verify({ secret, encoding: "base32", token: code, window: 1 });
  if (!ok) return res.status(400).json({ error: "Invalid code" });
  await getDB().collection("users").updateOne(
    { _id: req.user._id },
    { $set: { two_fa_enabled: true, two_fa_secret: secret }, $unset: { two_fa_temp_secret: "" } }
  );
  res.json({ ok: true });
});

export default r;
