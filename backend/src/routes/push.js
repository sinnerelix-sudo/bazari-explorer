import { Router } from "express";
import webpush from "web-push";
import { getDB } from "../db.js";
import { authRequired, roleRequired } from "../auth.js";

const r = Router();

const VAPID_PUBLIC = process.env.VAPID_PUBLIC_KEY;
const VAPID_PRIVATE = process.env.VAPID_PRIVATE_KEY;
const VAPID_SUBJECT = process.env.VAPID_SUBJECT || "mailto:admin@example.com";

if (VAPID_PUBLIC && VAPID_PRIVATE) {
  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC, VAPID_PRIVATE);
}

r.post("/subscribe", authRequired, async (req, res) => {
  const { subscription } = req.body || {};
  if (!subscription) return res.status(400).json({ error: "Missing subscription" });
  await getDB().collection("push_subscriptions").updateOne(
    { user_id: req.user._id },
    { $set: { user_id: req.user._id, subscription, updated_at: new Date() } },
    { upsert: true }
  );
  res.json({ ok: true });
});

r.post("/unsubscribe", authRequired, async (req, res) => {
  await getDB().collection("push_subscriptions").deleteOne({ user_id: req.user._id });
  res.json({ ok: true });
});

r.post("/send", authRequired, roleRequired("admin"), async (req, res) => {
  if (!VAPID_PUBLIC || !VAPID_PRIVATE) return res.status(503).json({ error: "Push not configured" });
  const { title, message, url = "/" } = req.body || {};
  const subs = await getDB().collection("push_subscriptions").find().toArray();
  const payload = JSON.stringify({ title, message, url });
  const results = await Promise.allSettled(
    subs.map((s) => webpush.sendNotification(s.subscription, payload))
  );
  // Also save in-app
  await getDB().collection("notifications").insertOne({
    user_id: null, title, message, type: "deal", url, is_read: false, created_at: new Date(),
  });
  res.json({ ok: true, sent: results.filter((r) => r.status === "fulfilled").length, total: subs.length });
});

export default r;
