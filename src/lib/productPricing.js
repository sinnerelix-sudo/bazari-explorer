export function getFlashSale(product) {
  const sale = product?.flash_sale || {};
  const active = typeof sale.active === "boolean" ? sale.active : Boolean(product?.flash_sale_active);
  const price = Number(sale.price ?? product?.flash_sale_price ?? 0);
  const limit = Number(sale.limit ?? product?.flash_sale_limit ?? product?.total ?? 0);
  const sold = Number(sale.sold ?? product?.flash_sale_sold ?? product?.sold ?? 0);
  const perCustomerLimit = Number(
    sale.per_customer_limit ?? product?.flash_sale_per_customer_limit ?? 0
  );

  return {
    active: active && price > 0,
    price,
    limit,
    sold: Math.max(0, sold),
    perCustomerLimit: Math.max(0, perCustomerLimit),
    remaining: limit > 0 ? Math.max(limit - sold, 0) : null,
    discountPercent: Number(sale.discount_percent || 0),
  };
}

export function getDisplayPrice(product) {
  const sale = getFlashSale(product);
  return sale.active ? sale.price : Number(product?.effective_price ?? product?.priceNew ?? product?.price ?? 0);
}

export function getDisplayOldPrice(product) {
  const sale = getFlashSale(product);
  if (sale.active) return Number(product?.base_price ?? product?.price ?? product?.priceOld ?? product?.original_price ?? 0);
  return Number(product?.priceOld ?? product?.original_price ?? 0);
}

export function getDisplayDiscount(product) {
  const sale = getFlashSale(product);
  if (sale.active && sale.discountPercent > 0) return sale.discountPercent;
  return Number(product?.discount || 0);
}

export function mapProductForCard(product) {
  const sale = getFlashSale(product);
  return {
    ...product,
    id: product.id || product._id,
    name: product.name,
    image: product.image || product.images?.[0] || "",
    priceNew: getDisplayPrice(product),
    priceOld: getDisplayOldPrice(product),
    discount: getDisplayDiscount(product),
    rating: product.rating,
    reviews: product.reviews ?? product.review_count,
    sold: sale.sold,
    total: sale.limit,
  };
}
