import { Heart, ShoppingBag, Star } from "lucide-react";
import { useState } from "react";

export default function ProductCard({ product, showProgress = false }) {
  const [liked, setLiked] = useState(false);

  return (
    <div
      data-testid={`product-card-${product.id}`}
      className="bg-white rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] hover:-translate-y-0.5 group border border-gray-50"
    >
      {/* Image section */}
      <div className="relative aspect-square overflow-hidden bg-[#F5F3F0]">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Discount badge */}
        {product.discount && (
          <div
            data-testid={`discount-badge-${product.id}`}
            className="absolute top-2.5 left-2.5 bg-[#E05A33] text-white px-2 py-0.5 rounded-lg text-xs font-bold font-body"
          >
            -{product.discount}%
          </div>
        )}

        {/* Product badge */}
        {product.badge && (
          <div className="absolute top-2.5 right-2.5 bg-[#1A1A1A] text-white px-2 py-0.5 rounded-lg text-[10px] font-bold font-body uppercase tracking-wider">
            {product.badge}
          </div>
        )}

        {/* Actions overlay */}
        <div className="absolute bottom-2.5 right-2.5 flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-200">
          <button
            data-testid={`favorite-btn-${product.id}`}
            onClick={(e) => {
              e.stopPropagation();
              setLiked(!liked);
            }}
            className="w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-sm hover:bg-white transition-colors"
          >
            <Heart
              size={15}
              className={liked ? "text-[#E05A33] fill-[#E05A33]" : "text-[#595959]"}
            />
          </button>
          <button
            data-testid={`add-to-cart-btn-${product.id}`}
            onClick={(e) => e.stopPropagation()}
            className="w-8 h-8 rounded-full bg-[#E05A33] flex items-center justify-center shadow-sm hover:bg-[#D94A22] transition-colors"
          >
            <ShoppingBag size={14} className="text-white" />
          </button>
        </div>

        {/* Mobile-always-visible favorite */}
        <button
          data-testid={`favorite-mobile-${product.id}`}
          onClick={(e) => {
            e.stopPropagation();
            setLiked(!liked);
          }}
          className="sm:hidden absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-sm"
          style={{ display: product.badge ? 'none' : undefined }}
        >
          <Heart
            size={15}
            className={liked ? "text-[#E05A33] fill-[#E05A33]" : "text-[#595959]"}
          />
        </button>
      </div>

      {/* Content */}
      <div className="p-3 sm:p-3.5">
        {/* Name */}
        <h3 className="font-body font-medium text-[13px] sm:text-sm text-[#1A1A1A] line-clamp-2 leading-snug mb-2 min-h-[32px] sm:min-h-[36px]">
          {product.name}
        </h3>

        {/* Rating */}
        <div className="flex items-center gap-1 mb-1.5">
          <Star size={12} className="text-[#F2A65A] fill-[#F2A65A]" />
          <span className="text-xs font-body font-semibold text-[#1A1A1A]">
            {product.rating}
          </span>
          <span className="text-xs font-body text-[#8C8C8C]">
            ({product.reviews})
          </span>
        </div>

        {/* Price */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-heading font-bold text-base sm:text-lg text-[#E05A33]">
            {product.priceNew} ₼
          </span>
          {product.priceOld && (
            <span className="font-body text-xs text-[#8C8C8C] line-through">
              {product.priceOld} ₼
            </span>
          )}
        </div>

        {/* Progress bar for flash deals */}
        {showProgress && product.sold !== undefined && (
          <div className="mt-2.5">
            <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#E05A33] to-[#F2A65A] rounded-full transition-all duration-500"
                style={{ width: `${(product.sold / product.total) * 100}%` }}
              />
            </div>
            <p className="text-[10px] font-body text-[#8C8C8C] mt-1">
              {product.sold}/{product.total} satıldı
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
