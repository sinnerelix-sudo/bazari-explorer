import { Router } from "express";
import { getDB } from "../db.js";
import { isFlashSaleActive, publicCategory, publicProduct } from "../util.js";
import { ensureDefaultHeroBanners, publicHeroBanner } from "../heroBanners.js";

const r = Router();

function uniqueById(items) {
  const seen = new Set();
  return items.filter((item) => {
    const key = item?._id?.toString();
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

r.get("/", async (_req, res) => {
  const db = getDB();
  await ensureDefaultHeroBanners(db);

  const [categories, heroBanners, recentProducts, topRatedProducts, flashSaleProducts] = await Promise.all([
    db.collection("categories").find().sort({ name: 1 }).toArray(),
    db.collection("hero_banners").find({ is_active: { $ne: false } }).sort({ order: 1, _id: 1 }).toArray(),
    db.collection("products").find().sort({ _id: -1 }).limit(24).toArray(),
    db.collection("products").find().sort({ review_count: -1, rating: -1, _id: -1 }).limit(24).toArray(),
    db
      .collection("products")
      .find({ flash_sale_active: true, flash_sale_price: { $gt: 0 } })
      .sort({ _id: -1 })
      .limit(12)
      .toArray(),
  ]);

  const trendingProducts = recentProducts.slice(0, 10);

  const recommendedProducts = uniqueById([...topRatedProducts, ...recentProducts]).slice(0, 10);

  const flashDeals = uniqueById(flashSaleProducts.filter(isFlashSaleActive)).slice(0, 4);

  res.set("Cache-Control", "public, max-age=10, stale-while-revalidate=60");
  res.json({
    categories: categories.map(publicCategory),
    hero_banners: heroBanners.map(publicHeroBanner),
    flash_deals: flashDeals.map(publicProduct),
    trending: trendingProducts.map(publicProduct),
    recommended: recommendedProducts.map(publicProduct),
    campaigns: [],
  });
});

export default r;
