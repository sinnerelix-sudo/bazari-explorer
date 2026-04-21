import { Router } from "express";
import { getDB } from "../db.js";
import { publicProduct, publicCategory } from "../util.js";

const r = Router();

r.get("/autocomplete", async (req, res) => {
  const q = (req.query.q || "").toString().trim();
  if (q.length < 2) return res.json({ products: [], categories: [] });
  const db = getDB();
  const re = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
  const [products, categories] = await Promise.all([
    db.collection("products").find({ $or: [{ name: re }, { brand: re }] }).limit(6).toArray(),
    db.collection("categories").find({ name: re }).limit(4).toArray(),
  ]);
  res.json({
    products: products.map(publicProduct),
    categories: categories.map(publicCategory),
  });
});

export default r;
