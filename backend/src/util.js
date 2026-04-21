import { ObjectId } from "mongodb";

export function toId(v) {
  try { return new ObjectId(v); } catch { return null; }
}

export function publicProduct(p) {
  if (!p) return null;
  return {
    id: p._id.toString(),
    name: p.name,
    description: p.description || "",
    price: p.price || 0,
    original_price: p.original_price || 0,
    discount: p.discount || 0,
    images: p.images || [],
    brand: p.brand || "",
    stock: p.stock ?? 0,
    badge: p.badge || "",
    category_id: p.category_id ? p.category_id.toString() : null,
    rating: p.rating || 0,
    review_count: p.review_count || 0,
    specifications: p.specifications || [],
    seo_title: p.seo_title || "",
    seo_description: p.seo_description || "",
    created_at: p.created_at,
  };
}

export function publicCategory(c) {
  if (!c) return null;
  return {
    id: c._id.toString(),
    name: c.name,
    slug: c.slug,
    image: c.image || "",
    icon: c.icon || "",
    parent_id: c.parent_id ? c.parent_id.toString() : null,
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
