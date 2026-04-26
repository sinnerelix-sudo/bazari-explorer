import { api } from "@/lib/api";

const productCache = new Map();
const productRequests = new Map();

function keyFor(productId) {
  return productId ? String(productId) : "";
}

export function normalizeProductPreview(product) {
  if (!product) return null;

  const id = product.id || product._id;
  if (!id) return null;

  const images = Array.isArray(product.images)
    ? product.images
    : product.image
      ? [product.image]
      : [];

  return {
    ...product,
    id,
    images,
    image: product.image || images[0] || "",
    price: product.price ?? product.priceNew ?? 0,
    original_price: product.original_price ?? product.priceOld ?? 0,
    discount: product.discount ?? 0,
    rating: product.rating ?? 0,
    review_count: product.review_count ?? product.reviews ?? 0,
    stock: product.stock ?? 0,
    specifications: Array.isArray(product.specifications) ? product.specifications : [],
  };
}

export function seedProduct(product) {
  const normalized = normalizeProductPreview(product);
  if (!normalized) return null;

  const cacheKey = keyFor(normalized.id);
  const current = productCache.get(cacheKey);
  const next = current ? { ...current, ...normalized } : normalized;
  productCache.set(cacheKey, next);
  return next;
}

export function getCachedProduct(productId) {
  return productCache.get(keyFor(productId)) || null;
}

function warmImage(src) {
  if (!src || typeof window === "undefined" || typeof window.Image === "undefined") return;
  const image = new window.Image();
  image.decoding = "async";
  image.src = src;
}

export async function fetchProduct(productId) {
  const cacheKey = keyFor(productId);
  if (!cacheKey) throw new Error("Product id is required");

  if (productRequests.has(cacheKey)) return productRequests.get(cacheKey);

  const request = api
    .get(`/products/${cacheKey}`)
    .then(({ data }) => {
      const product = seedProduct(data);
      warmImage(product?.images?.[0]);
      return product;
    })
    .finally(() => {
      productRequests.delete(cacheKey);
    });

  productRequests.set(cacheKey, request);
  return request;
}

export function prefetchProduct(productId, preview) {
  const seeded = seedProduct(preview || { id: productId });
  warmImage(seeded?.images?.[0]);

  if (!productId || productRequests.has(keyFor(productId))) return;
  fetchProduct(productId).catch(() => {});
}
