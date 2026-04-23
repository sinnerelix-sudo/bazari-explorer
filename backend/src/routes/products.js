import { Router } from "express";
import { getDB } from "../db.js";
import { authRequired, roleRequired } from "../auth.js";
import { publicProduct, toId } from "../util.js";

const r = Router();

r.get("/", async (req, res) => {
  const { category, q, page = 1, limit = 20 } = req.query;
  const filter = {};
  if (category) {
    const cid = toId(category);
    if (cid) filter.category_id = cid;
  }
  if (q) filter.$text = { $search: q };
  const lim = Math.min(parseInt(limit) || 20, 1000);
  const skip = (Math.max(parseInt(page) || 1, 1) - 1) * lim;
  const cursor = getDB().collection("products").find(filter).sort({ _id: -1 }).skip(skip).limit(lim);
  const [items, total] = await Promise.all([cursor.toArray(), getDB().collection("products").countDocuments(filter)]);
  res.json({ products: items.map(publicProduct), total, page: Number(page), limit: lim });
});

r.get("/:id", async (req, res) => {
  const id = toId(req.params.id);
  if (!id) return res.status(404).json({ error: "Not found" });
  const p = await getDB().collection("products").findOne({ _id: id });
  if (!p) return res.status(404).json({ error: "Not found" });
  res.json(publicProduct(p));
});

r.post("/", authRequired, roleRequired("admin", "seller"), async (req, res) => {
  const body = req.body || {};
  const doc = {
    name: body.name,
    description: body.description || "",
    price: Number(body.price) || 0,
    original_price: Number(body.original_price) || 0,
    discount: Number(body.discount) || 0,
    images: Array.isArray(body.images) ? body.images : [],
    brand: body.brand || "",
    stock: Number(body.stock) || 0,
    badge: body.badge || "",
    category_id: toId(body.category_id),
    seo_title: body.seo_title || "",
    seo_description: body.seo_description || "",
    specifications: body.specifications || [],
    rating: 0,
    review_count: 0,
    created_at: new Date(),
  };
  const { insertedId } = await getDB().collection("products").insertOne(doc);
  res.json(publicProduct({ ...doc, _id: insertedId }));
});

r.put("/:id", authRequired, roleRequired("admin", "seller"), async (req, res) => {
  const id = toId(req.params.id);
  if (!id) return res.status(404).json({ error: "Not found" });
  const body = req.body || {};
  const update = { ...body };
  delete update.id;
  delete update._id;
  if (update.category_id) update.category_id = toId(update.category_id);
  ["price", "original_price", "discount", "stock"].forEach((k) => {
    if (update[k] !== undefined) update[k] = Number(update[k]) || 0;
  });
  await getDB().collection("products").updateOne({ _id: id }, { $set: update });
  const p = await getDB().collection("products").findOne({ _id: id });
  res.json(publicProduct(p));
});

r.delete("/:id", authRequired, roleRequired("admin", "seller"), async (req, res) => {
  const id = toId(req.params.id);
  if (!id) return res.status(404).json({ error: "Not found" });
  await getDB().collection("products").deleteOne({ _id: id });
  res.json({ ok: true });
});

export default r;
