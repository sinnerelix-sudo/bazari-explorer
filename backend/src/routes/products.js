import { Router } from "express";
import { getDB } from "../db.js";
import { authRequired, roleRequired } from "../auth.js";
import { publicProduct, toId } from "../util.js";

const r = Router();

function normalizeProductPayload(body = {}, existing = {}) {
  const flashActive = Boolean(body.flash_sale_active);
  const flashPrice = Number(body.flash_sale_price) || 0;
  const flashLimit = Math.max(0, Math.floor(Number(body.flash_sale_limit) || 0));
  const flashPerCustomerLimit = Math.max(0, Math.floor(Number(body.flash_sale_per_customer_limit) || 0));
  const existingSold = Number(existing.flash_sale_sold || 0);

  return {
    name: body.name,
    description: body.description || "",
    price: Number(body.price) || 0,
    original_price: Number(body.original_price) || 0,
    discount: Number(body.discount) || 0,
    images: Array.isArray(body.images) ? body.images : [],
    videos: Array.isArray(body.videos) ? body.videos : [],
    brand: body.brand || "",
    stock: Number(body.stock) || 0,
    badge: body.badge || "",
    category_id: toId(body.category_id),
    seo_title: body.seo_title || "",
    seo_description: body.seo_description || "",
    specifications: Array.isArray(body.specifications) ? body.specifications : [],
    flash_sale_active: flashActive,
    flash_sale_price: flashActive ? flashPrice : 0,
    flash_sale_limit: flashActive ? flashLimit : 0,
    flash_sale_per_customer_limit: flashActive ? flashPerCustomerLimit : 0,
    flash_sale_sold: flashActive ? Math.min(existingSold, flashLimit || existingSold) : 0,
    bonus_amount: Number(body.bonus_amount) || 0,
  };
}

r.get("/", async (req, res) => {
  const { category, q, page = 1, limit = 20, count = "true", flash } = req.query;
  const filter = {};
  if (category) {
    const cid = toId(category);
    if (cid) filter.category_id = cid;
  }
  if (q) filter.$text = { $search: q };
  if (flash === "true") {
    filter.flash_sale_active = true;
    filter.flash_sale_price = { $gt: 0 };
    filter.$or = [
      { flash_sale_limit: { $exists: false } },
      { flash_sale_limit: { $lte: 0 } },
      { $expr: { $lt: [{ $ifNull: ["$flash_sale_sold", 0] }, "$flash_sale_limit"] } },
    ];
  }
  const lim = Math.min(parseInt(limit) || 20, 1000);
  const skip = (Math.max(parseInt(page) || 1, 1) - 1) * lim;
  const cursor = getDB().collection("products").find(filter).sort({ _id: -1 }).skip(skip).limit(lim);
  const shouldCount = count !== "false";
  const [items, total] = await Promise.all([
    cursor.toArray(),
    shouldCount ? getDB().collection("products").countDocuments(filter) : Promise.resolve(null),
  ]);
  res.json({ products: items.map(publicProduct), total: shouldCount ? total : items.length, page: Number(page), limit: lim });
});

r.get("/:id", async (req, res) => {
  const id = toId(req.params.id);
  if (!id) return res.status(404).json({ error: "Not found" });
  const p = await getDB().collection("products").findOne({ _id: id });
  if (!p) return res.status(404).json({ error: "Not found" });
  res.set("Cache-Control", "public, max-age=15, stale-while-revalidate=60");
  res.json(publicProduct(p));
});

r.post("/", authRequired, roleRequired("admin", "seller"), async (req, res) => {
  const body = req.body || {};
  const doc = {
    ...normalizeProductPayload(body),
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
  const existing = await getDB().collection("products").findOne({ _id: id });
  if (!existing) return res.status(404).json({ error: "Not found" });
  const update = normalizeProductPayload({ ...existing, ...body }, existing);
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
