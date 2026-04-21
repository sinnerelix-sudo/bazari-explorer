import jwt from "jsonwebtoken";
import { getDB } from "./db.js";
import { ObjectId } from "mongodb";

const SECRET = process.env.JWT_SECRET || "dev-insecure-secret";
const EXPIRES = process.env.JWT_EXPIRES_IN || "30d";
const COOKIE_SECURE = process.env.COOKIE_SECURE !== "false";
const COOKIE_SAMESITE = process.env.COOKIE_SAMESITE || "none";

export function signToken(user) {
  return jwt.sign({ uid: user._id.toString(), role: user.role }, SECRET, { expiresIn: EXPIRES });
}

export function setAuthCookie(res, token) {
  res.cookie("token", token, {
    httpOnly: true,
    secure: COOKIE_SECURE,
    sameSite: COOKIE_SAMESITE,
    maxAge: 30 * 24 * 60 * 60 * 1000,
    path: "/",
  });
}

export function clearAuthCookie(res) {
  res.clearCookie("token", {
    httpOnly: true,
    secure: COOKIE_SECURE,
    sameSite: COOKIE_SAMESITE,
    path: "/",
  });
}

export async function authRequired(req, res, next) {
  try {
    const token = req.cookies?.token || (req.headers.authorization?.startsWith("Bearer ")
      ? req.headers.authorization.slice(7) : null);
    if (!token) return res.status(401).json({ error: "Unauthorized" });
    const payload = jwt.verify(token, SECRET);
    const user = await getDB().collection("users").findOne({ _id: new ObjectId(payload.uid) });
    if (!user) return res.status(401).json({ error: "Unauthorized" });
    req.user = user;
    next();
  } catch {
    return res.status(401).json({ error: "Unauthorized" });
  }
}

export function roleRequired(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: "Forbidden" });
    }
    next();
  };
}

export function publicUser(u) {
  if (!u) return null;
  return {
    id: u._id.toString(),
    name: u.name,
    email: u.email,
    phone: u.phone || null,
    picture: u.picture || null,
    role: u.role || "user",
    two_fa_enabled: !!u.two_fa_enabled,
  };
}
