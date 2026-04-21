import { Router } from "express";
import { getDB } from "../db.js";
import { authRequired, roleRequired, publicUser } from "../auth.js";
import { toId } from "../util.js";

const r = Router();

r.get("/users", authRequired, roleRequired("admin"), async (_req, res) => {
  const users = await getDB().collection("users").find().sort({ created_at: -1 }).toArray();
  res.json(users.map(publicUser));
});

r.put("/users/:id/role", authRequired, roleRequired("admin"), async (req, res) => {
  const id = toId(req.params.id);
  if (!id) return res.status(404).json({ error: "Not found" });
  const { role } = req.body || {};
  if (!["user", "seller", "admin"].includes(role)) return res.status(400).json({ error: "Bad role" });
  await getDB().collection("users").updateOne({ _id: id }, { $set: { role } });
  res.json({ ok: true });
});

export default r;
