import { Heart, ShoppingBag, Star } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { normalizeProductPreview, prefetchProduct } from "@/lib/productPrefetch";
import { getDisplayDiscount, getDisplayOldPrice, getDisplayPrice } from "@/lib/productPricing";

export default function ProductCard({ product, showProgress = false, linkTo }) {
  const [liked, setLiked] = useState(false);
  const { addToCart, loading } = useCart();

  const productId = product.id || product._id;
  const productLink = linkTo || (productId ? `/product/${productId}` : "");
  const productPreview = normalizeProductPreview(product);
  const image = product.image || product.images?.[0] || "";
  const priceNew = getDisplayPrice(product);
  const priceOld = getDisplayOldPrice(product);
  const discount = getDisplayDiscount(product);
  const reviews = product.reviews ?? product.review_count ?? 0;

  const warmProduct = () => {
    if (productId) prefetchProduct(productId, productPreview);
  };

  const handleAddToCart = async (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (!productId) return;
    await addToCart(productId, 1);
  };

  const handleFavorite = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setLiked((current) => !current);
  };

  return (
    <div
      data-testid={`product-card-${productId}`}
      className="bg-white rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] hover:-translate-y-0.5 group border border-gray-50"
    >
      <div className="relative aspect-square overflow-hidden bg-[#F5F3F0]">
        {productLink ? (
          <Link
            to={productLink}
            state={{ productPreview }}
            className="block h-full w-full"
            aria-label={product.name}
            onPointerEnter={warmProduct}
            onFocus={warmProduct}
            onTouchStart={warmProduct}
          >
            <img
              src={image}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
              decoding="async"
            />
          </Link>
        ) : (
          <img
            src={image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
            decoding="async"
          />
        )}

        {discount > 0 && (
          <div
            data-testid={`discount-badge-${productId}`}
            className="absolute top-2.5 left-2.5 bg-[#E05A33] text-white px-2 py-0.5 rounded-lg text-xs font-bold font-body"
          >
            -{discount}%
          </div>
        )}

        {product.badge && (
          <div className="absolute top-2.5 right-2.5 bg-[#1A1A1A] text-white px-2 py-0.5 rounded-lg text-[10px] font-bold font-body uppercase tracking-wider">
            {product.badge}
          </div>
        )}

        <div className="absolute bottom-2.5 right-2.5 flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-200">
          <button
            type="button"
            data-testid={`favorite-btn-${productId}`}
            onClick={handleFavorite}
            className="w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-sm hover:bg-white transition-colors"
          >
            <Heart
              size={15}
              className={liked ? "text-[#E05A33] fill-[#E05A33]" : "text-[#595959]"}
            />
          </button>
          <button
            type="button"
            data-testid={`add-to-cart-btn-${productId}`}
            onClick={handleAddToCart}
            disabled={loading}
            className="w-8 h-8 rounded-full bg-[#E05A33] flex items-center justify-center shadow-sm hover:bg-[#D94A22] transition-colors disabled:opacity-60"
          >
            <ShoppingBag size={14} className="text-white" />
          </button>
        </div>

        <button
          type="button"
          data-testid={`favorite-mobile-${productId}`}
          onClick={handleFavorite}
          className="sm:hidden absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-sm"
          style={{ display: product.badge ? "none" : undefined }}
        >
          <Heart
            size={15}
            className={liked ? "text-[#E05A33] fill-[#E05A33]" : "text-[#595959]"}
          />
        </button>
      </div>

      <div className="p-3 sm:p-3.5">
        {productLink ? (
          <Link
            to={productLink}
            state={{ productPreview }}
            className="block"
            onPointerEnter={warmProduct}
            onFocus={warmProduct}
            onTouchStart={warmProduct}
          >
            <CardText
              product={product}
              priceNew={priceNew}
              priceOld={priceOld}
              reviews={reviews}
              showProgress={showProgress}
            />
          </Link>
        ) : (
          <CardText
            product={product}
            priceNew={priceNew}
            priceOld={priceOld}
            reviews={reviews}
            showProgress={showProgress}
          />
        )}
      </div>
    </div>
  );
}

function CardText({ product, priceNew, priceOld, reviews, showProgress }) {
  const total = Number(product.total || 0);
  const sold = Math.max(0, Number(product.sold || 0));
  const progress = total > 0 ? Math.min((sold / total) * 100, 100) : 0;

  return (
    <>
      <h3 className="font-body font-medium text-[13px] sm:text-sm text-[#1A1A1A] line-clamp-2 leading-snug mb-2 min-h-[32px] sm:min-h-[36px]">
        {product.name}
      </h3>

      <div className="flex items-center gap-1 mb-1.5">
        <Star size={12} className="text-[#F2A65A] fill-[#F2A65A]" />
        <span className="text-xs font-body font-semibold text-[#1A1A1A]">
          {product.rating}
        </span>
        <span className="text-xs font-body text-[#8C8C8C]">
          ({reviews})
        </span>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <span className="font-heading font-bold text-base sm:text-lg text-[#E05A33]">
          {priceNew} ₼
        </span>
        {priceOld > priceNew && (
          <span className="font-body text-xs text-[#8C8C8C] line-through">
            {priceOld} ₼
          </span>
        )}
      </div>

      {showProgress && total > 0 && (
        <div className="mt-2.5">
          <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#E05A33] to-[#F2A65A] rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-[10px] font-body text-[#8C8C8C] mt-1">
            {sold}/{total} satıldı
          </p>
        </div>
      )}
    </>
  );
}
