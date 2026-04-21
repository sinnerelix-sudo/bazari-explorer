import { Router } from "express";
import { getDB } from "../db.js";
import { authRequired } from "../auth.js";
import { toId } from "../util.js";

const r = Router();

async function recomputeStats(productId) {
  const db = getDB();
  const all = await db.collection("reviews").find({ product_id: productId }).toArray();
  const count = all.length;
  const avg = count ? all.reduce((s, r) => s + (r.rating || 0), 0) / count : 0;
  await db.collection("products").updateOne(
    { _id: productId },
    { $set: { rating: Math.round(avg * 10) / 10, review_count: count } }
  );
  const buckets = { r1: 0, r2: 0, r3: 0, r4: 0, r5: 0 };
  all.forEach((r) => { const k = `r${Math.round(r.rating)}`; if (buckets[k] !== undefined) buckets[k]++; });
  return { avg_rating: avg, count, ...buckets };
}

r.get("/:productId", async (req, res) => {
  const pid = toId(req.params.productId);
  if (!pid) return res.json({ reviews: [], stats: {} });
  const db = getDB();
  const reviews = await db.collection("reviews").find({ product_id: pid }).sort({ created_at: -1 }).toArray();
  const stats = await recomputeStats(pid);
  res.json({
    reviews: reviews.map((r) => ({
      id: r._id.toString(),
      user_name: r.user_name,
      rating: r.rating,
      comment: r.comment,
      created_at: r.created_at,
    })),
    stats,
  });
});

r.post("/:productId", authRequired, async (req, res) => {
  const pid = toId(req.params.productId);
  if (!pid) return res.status(404).json({ error: "Not found" });
  const { rating, comment } = req.body || {};
  const doc = {
    product_id: pid,
    user_id: req.user._id,
    user_name: req.user.name,
    rating: Math.max(1, Math.min(5, Number(rating) || 5)),
    comment: comment || "",
    created_at: new Date(),
  };
  await getDB().collection("reviews").insertOne(doc);
  await recomputeStats(pid);
  res.json({ ok: true });
});

export default r;
