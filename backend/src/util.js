import { ObjectId } from "mongodb";

export function toId(v) {
  try { return new ObjectId(v); } catch { return null; }
}

export function isFlashSaleActive(p) {
  if (!p?.flash_sale_active) return false;
  const flashPrice = Number(p.flash_sale_price || 0);
  if (!(flashPrice > 0)) return false;
  const totalLimit = Number(p.flash_sale_limit || 0);
  const sold = Number(p.flash_sale_sold || 0);
  return totalLimit <= 0 || sold < totalLimit;
}

export function getEffectiveProductPrice(p) {
  return isFlashSaleActive(p) ? Number(p.flash_sale_price || 0) : Number(p?.price || 0);
}

export function getFlashSalePayload(p) {
  const totalLimit = Number(p?.flash_sale_limit || 0);
  const sold = Math.max(0, Number(p?.flash_sale_sold || 0));
  const perCustomerLimit = Math.max(0, Number(p?.flash_sale_per_customer_limit || 0));
  const active = isFlashSaleActive(p);
  const originalPrice = Number(p?.price || 0);
  const flashPrice = Number(p?.flash_sale_price || 0);
  const discountPercent =
    active && originalPrice > flashPrice
      ? Math.round(((originalPrice - flashPrice) / originalPrice) * 100)
      : 0;

  return {
    active,
    price: flashPrice,
    limit: totalLimit,
    sold,
    per_customer_limit: perCustomerLimit,
    remaining: totalLimit > 0 ? Math.max(totalLimit - sold, 0) : null,
    discount_percent: discountPercent,
  };
}

export function publicProduct(p) {
  if (!p) return null;
  const flashSale = getFlashSalePayload(p);
  const effectivePrice = getEffectiveProductPrice(p);

  return {
    id: p._id.toString(),
    name: p.name,
    description: p.description || "",
    price: p.price || 0,
    effective_price: effectivePrice,
    original_price: p.original_price || 0,
    discount: p.discount || 0,
    images: p.images || [],
    videos: p.videos || [],
    brand: p.brand || "",
    stock: p.stock ?? 0,
    badge: p.badge || "",
    category_id: p.category_id ? p.category_id.toString() : null,
    rating: p.rating || 0,
    review_count: p.review_count || 0,
    specifications: p.specifications || [],
    seo_title: p.seo_title || "",
    seo_description: p.seo_description || "",
    flash_sale_active: !!p.flash_sale_active,
    flash_sale_price: Number(p.flash_sale_price || 0),
    flash_sale_limit: Number(p.flash_sale_limit || 0),
    flash_sale_per_customer_limit: Number(p.flash_sale_per_customer_limit || 0),
    flash_sale_sold: Number(p.flash_sale_sold || 0),
    flash_sale: flashSale,
    sold: flashSale.sold,
    total: flashSale.limit,
    bonus_amount: Number(p.bonus_amount || 0),
    created_at: p.created_at,
  };
}

export function publicCategory(c) {
  if (!c) return null;
  return {
    id: c._id.toString(),
    name: c.name,
    name_ru: c.name_ru || "",
    slug: c.slug,
    image: c.image || "",
    icon: c.icon || "",
    parent_id: c.parent_id ? c.parent_id.toString() : null,
    order: Number(c.order || 0),
  };
}

export function publicNotification(n) {
  return {
    id: n._id.toString(),
    user_id: n.user_id ? n.user_id.toString() : null,
    title: n.title,
    message: n.message,
    type: n.type || "info",
    is_read: !!n.is_read,
    url: n.url || null,
    created_at: n.created_at,
  };
}
