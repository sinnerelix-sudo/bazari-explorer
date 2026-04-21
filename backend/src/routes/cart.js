import { Router } from "express";
import { getDB } from "../db.js";
import { authRequired } from "../auth.js";
import { toId, publicProduct } from "../util.js";

const r = Router();

async function buildCart(userId) {
  const db = getDB();
  const cart = await db.collection("carts").findOne({ user_id: userId });
  const items = cart?.items || [];
  if (!items.length) return { items: [], total: 0, count: 0 };
  const ids = items.map((i) => i.product_id).filter(Boolean);
  const prods = await db.collection("products").find({ _id: { $in: ids } }).toArray();
  const map = new Map(prods.map((p) => [p._id.toString(), p]));
  const enriched = items
    .map((i) => {
      const p = map.get(i.product_id.toString());
      if (!p) return null;
      return { product: publicProduct(p), quantity: i.quantity };
    })
    .filter(Boolean);
  const total = enriched.reduce((s, i) => s + i.product.price * i.quantity, 0);
  const count = enriched.reduce((s, i) => s + i.quantity, 0);
  return { items: enriched, total, count };
}

r.get("/", authRequired, async (req, res) => {
  res.json(await buildCart(req.user._id));
});

r.post("/add", authRequired, async (req, res) => {
  const { product_id, quantity = 1 } = req.body || {};
  const pid = toId(product_id);
  if (!pid) return res.status(400).json({ error: "Bad product_id" });
  const db = getDB();
  const cart = await db.collection("carts").findOne({ user_id: req.user._id });
  const items = cart?.items || [];
  const idx = items.findIndex((i) => i.product_id.toString() === pid.toString());
  if (idx >= 0) items[idx].quantity += Number(quantity) || 1;
  else items.push({ product_id: pid, quantity: Number(quantity) || 1 });
  await db.collection("carts").updateOne(
    { user_id: req.user._id },
    { $set: { items, updated_at: new Date() } },
    { upsert: true }
  );
  res.json(await buildCart(req.user._id));
});

r.put("/update", authRequired, async (req, res) => {
  const { product_id, quantity } = req.body || {};
  const pid = toId(product_id);
  if (!pid) return res.status(400).json({ error: "Bad product_id" });
  const db = getDB();
  const cart = await db.collection("carts").findOne({ user_id: req.user._id });
  const items = (cart?.items || []).map((i) =>
    i.product_id.toString() === pid.toString() ? { ...i, quantity: Number(quantity) || 1 } : i
  );
  await db.collection("carts").updateOne(
    { user_id: req.user._id },
    { $set: { items, updated_at: new Date() } },
    { upsert: true }
  );
  res.json(await buildCart(req.user._id));
});

r.delete("/remove/:productId", authRequired, async (req, res) => {
  const pid = toId(req.params.productId);
  if (!pid) return res.status(400).json({ error: "Bad product_id" });
  const db = getDB();
  const cart = await db.collection("carts").findOne({ user_id: req.user._id });
  const items = (cart?.items || []).filter((i) => i.product_id.toString() !== pid.toString());
  await db.collection("carts").updateOne(
    { user_id: req.user._id },
    { $set: { items, updated_at: new Date() } },
    { upsert: true }
  );
  res.json(await buildCart(req.user._id));
});

r.delete("/clear", authRequired, async (req, res) => {
  await getDB().collection("carts").updateOne(
    { user_id: req.user._id },
    { $set: { items: [], updated_at: new Date() } },
    { upsert: true }
  );
  res.json({ items: [], total: 0, count: 0 });
});

export default r;
