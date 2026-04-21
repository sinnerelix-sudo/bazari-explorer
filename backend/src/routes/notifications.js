import { Router } from "express";
import { getDB } from "../db.js";
import { authRequired, roleRequired } from "../auth.js";
import { publicNotification, toId } from "../util.js";

const r = Router();

r.get("/", authRequired, async (req, res) => {
  const items = await getDB().collection("notifications")
    .find({ $or: [{ user_id: req.user._id }, { user_id: null }] })
    .sort({ created_at: -1 }).limit(50).toArray();
  res.json(items.map(publicNotification));
});

r.get("/unread-count", authRequired, async (req, res) => {
  const count = await getDB().collection("notifications").countDocuments({
    $or: [{ user_id: req.user._id }, { user_id: null }],
    is_read: { $ne: true },
  });
  res.json({ count });
});

r.post("/read/:id", authRequired, async (req, res) => {
  const id = toId(req.params.id);
  if (!id) return res.status(404).json({ error: "Not found" });
  await getDB().collection("notifications").updateOne({ _id: id }, { $set: { is_read: true } });
  res.json({ ok: true });
});

r.post("/read-all", authRequired, async (req, res) => {
  await getDB().collection("notifications").updateMany(
    { $or: [{ user_id: req.user._id }, { user_id: null }] },
    { $set: { is_read: true } }
  );
  res.json({ ok: true });
});

r.post("/send", authRequired, roleRequired("admin"), async (req, res) => {
  const { title, message, type = "info", url = null } = req.body || {};
  await getDB().collection("notifications").insertOne({
    user_id: null, title, message, type, url, is_read: false, created_at: new Date(),
  });
  res.json({ ok: true });
});

export default r;
