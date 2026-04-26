import { Router } from "express";
import { getDB } from "../db.js";
import { authRequired } from "../auth.js";
import { isFlashSaleActive, toId, publicProduct } from "../util.js";

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
      const product = publicProduct(p);
      const cartProduct = {
        ...product,
        base_price: product.price,
        price: product.effective_price,
        original_price: product.flash_sale?.active ? product.price : product.original_price,
      };
      return { product_id: i.product_id.toString(), product: cartProduct, quantity: i.quantity };
    })
    .filter(Boolean);
  const total = enriched.reduce((s, i) => s + Number(i.product.effective_price || i.product.price || 0) * i.quantity, 0);
  const count = enriched.reduce((s, i) => s + i.quantity, 0);
  return { items: enriched, total, count };
}

function getMaxAllowedQuantity(product) {
  if (!isFlashSaleActive(product)) return Infinity;
  const perCustomerLimit = Number(product.flash_sale_per_customer_limit || 0);
  const totalLimit = Number(product.flash_sale_limit || 0);
  const sold = Number(product.flash_sale_sold || 0);
  const remaining = totalLimit > 0 ? Math.max(totalLimit - sold, 0) : Infinity;
  const caps = [remaining];
  if (perCustomerLimit > 0) caps.push(perCustomerLimit);
  return Math.max(0, Math.min(...caps));
}

function clampQuantity(product, quantity) {
  const requested = Math.max(1, Number(quantity) || 1);
  const maxAllowed = getMaxAllowedQuantity(product);
  if (maxAllowed <= 0) return 0;
  return Math.min(requested, maxAllowed);
}

r.get("/", authRequired, async (req, res) => {
  res.json(await buildCart(req.user._id));
});

r.post("/add", authRequired, async (req, res) => {
  const { product_id, quantity = 1 } = req.body || {};
  const pid = toId(product_id);
  if (!pid) return res.status(400).json({ error: "Bad product_id" });
  const db = getDB();
  const product = await db.collection("products").findOne({ _id: pid });
  if (!product) return res.status(404).json({ error: "Product not found" });
  const cart = await db.collection("carts").findOne({ user_id: req.user._id });
  const items = cart?.items || [];
  const idx = items.findIndex((i) => i.product_id.toString() === pid.toString());
  const currentQuantity = idx >= 0 ? Number(items[idx].quantity || 0) : 0;
  const nextQuantity = clampQuantity(product, currentQuantity + (Number(quantity) || 1));
  if (nextQuantity <= 0) return res.status(400).json({ error: "Flash endirim limiti bitib" });
  if (idx >= 0) items[idx].quantity = nextQuantity;
  else items.push({ product_id: pid, quantity: nextQuantity });
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
  const product = await db.collection("products").findOne({ _id: pid });
  if (!product) return res.status(404).json({ error: "Product not found" });
  const nextQuantity = clampQuantity(product, quantity);
  if (nextQuantity <= 0) return res.status(400).json({ error: "Flash endirim limiti bitib" });
  const cart = await db.collection("carts").findOne({ user_id: req.user._id });
  const items = (cart?.items || []).map((i) =>
    i.product_id.toString() === pid.toString() ? { ...i, quantity: nextQuantity } : i
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
