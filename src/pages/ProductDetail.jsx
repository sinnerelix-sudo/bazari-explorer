import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  Star, Heart, ShoppingBag, ChevronLeft, Share2,
  Truck, Shield, RefreshCw, Minus, Plus, ChevronRight, Check
} from "lucide-react";
import axios from "axios";
import { useCart } from "@/contexts/CartContext";
import { ProductJsonLd, BreadcrumbJsonLd } from "@/components/seo/JsonLd";
import Header from "@/components/layout/Header";
import MobileBottomNav from "@/components/layout/MobileBottomNav";
import Footer from "@/components/layout/Footer";
import ProductCard from "@/components/home/ProductCard";

import { API_BASE as API } from "@/lib/api";

function RatingStars({ rating, size = 14 }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          size={size}
          className={s <= Math.round(rating) ? "text-[#F2A65A] fill-[#F2A65A]" : "text-gray-200 fill-gray-200"}
        />
      ))}
    </div>
  );
}

function ReviewBar({ label, count, total }) {
  const pct = total > 0 ? (count / total) * 100 : 0;
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="w-4 text-right font-body text-[#595959]">{label}</span>
      <Star size={11} className="text-[#F2A65A] fill-[#F2A65A]" />
      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div className="h-full bg-[#F2A65A] rounded-full transition-all" style={{ width: `${pct}%` }} />
      </div>
      <span className="w-6 text-right font-body text-[#8C8C8C] text-xs">{count}</span>
    </div>
  );
}

export default function ProductDetail() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState({ reviews: [], stats: {} });
  const [similar, setSimilar] = useState([]);
  const [liked, setLiked] = useState(false);
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("description");
  const { addToCart } = useCart();
  const [addedToCart, setAddedToCart] = useState(false);

  const handleAddToCart = async () => {
    const ok = await addToCart(productId, qty);
    if (ok) {
      setAddedToCart(true);
      setTimeout(() => setAddedToCart(false), 2000);
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    const load = async () => {
      try {
        setLoading(true);
        const [prodRes, revRes] = await Promise.all([
          axios.get(`${API}/products/${productId}`),
          axios.get(`${API}/reviews/${productId}`),
        ]);
        setProduct(prodRes.data);
        setReviews(revRes.data);
        // Load similar products
        if (prodRes.data.category_id) {
          const simRes = await axios.get(`${API}/products?category=${prodRes.data.category_id}&limit=4`);
          setSimilar(simRes.data.products.filter((p) => p.id !== productId).slice(0, 4));
        }
      } catch (err) {
        console.error("Failed to load product", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [productId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FDFCFB]">
        <Header />
        <div className="flex items-center justify-center py-32">
          <div className="w-8 h-8 border-2 border-[#E05A33] border-t-transparent rounded-full animate-spin" />
        </div>
        <MobileBottomNav />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#FDFCFB]">
        <Header />
        <div className="text-center py-32">
          <p className="font-body text-[#595959] text-lg">Məhsul tapılmadı</p>
          <Link to="/" className="text-[#E05A33] font-body font-medium mt-4 inline-block">Ana səhifəyə qayıt</Link>
        </div>
        <MobileBottomNav />
      </div>
    );
  }

  const stats = reviews.stats || {};
  const avgRating = stats.avg_rating || product.rating || 0;
  const totalReviews = stats.count || product.review_count || 0;

  return (
    <div data-testid="product-detail-page" className="min-h-screen bg-[#FDFCFB]">
      <ProductJsonLd product={product} />
      <BreadcrumbJsonLd items={[{ name: "Ana səhifə", url: "/" }, { name: product.name }]} />
      <Header />

      {/* Breadcrumb - Desktop */}
      <div className="hidden sm:block max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <nav className="flex items-center gap-2 text-sm font-body text-[#8C8C8C]">
          <Link to="/" className="hover:text-[#E05A33] transition-colors">Ana səhifə</Link>
          <ChevronRight size={14} />
          <span className="text-[#1A1A1A]">{product.name}</span>
        </nav>
      </div>

      {/* Mobile back button */}
      <div className="sm:hidden flex items-center gap-3 px-4 py-2">
        <button data-testid="back-btn" onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-xl hover:bg-gray-50">
          <ChevronLeft size={22} className="text-[#1A1A1A]" />
        </button>
        <span className="font-body text-sm text-[#595959] line-clamp-1 flex-1">{product.name}</span>
        <button onClick={() => setLiked(!liked)} className="p-2 rounded-xl hover:bg-gray-50">
          <Heart size={20} className={liked ? "text-[#E05A33] fill-[#E05A33]" : "text-[#595959]"} />
        </button>
        <button className="p-2 rounded-xl hover:bg-gray-50">
          <Share2 size={20} className="text-[#595959]" />
        </button>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24 md:pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12">
          {/* Product Image */}
          <div data-testid="product-image-section" className="relative">
            <div className="aspect-square rounded-2xl overflow-hidden bg-[#F5F3F0]">
              <img
                src={product.images?.[0] || ""}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              {product.discount > 0 && (
                <div className="absolute top-4 left-4 bg-[#E05A33] text-white px-3 py-1 rounded-xl text-sm font-bold font-body">
                  -{product.discount}%
                </div>
              )}
              {product.badge && (
                <div className="absolute top-4 right-4 bg-[#1A1A1A] text-white px-3 py-1 rounded-xl text-xs font-bold font-body uppercase tracking-wider">
                  {product.badge}
                </div>
              )}
            </div>
            {/* Thumbnail strip */}
            {product.images?.length > 1 && (
              <div className="flex gap-2 mt-3 overflow-x-auto scrollbar-hide">
                {product.images.map((img, i) => (
                  <div key={i} className="w-16 h-16 rounded-xl overflow-hidden border-2 border-[#E05A33]/30 flex-shrink-0">
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div data-testid="product-info-section" className="flex flex-col">
            {/* Brand */}
            {product.brand && (
              <span className="font-body text-xs text-[#E05A33] font-semibold uppercase tracking-wider mb-1">
                {product.brand}
              </span>
            )}

            {/* Name */}
            <h1 className="font-heading font-bold text-xl sm:text-2xl lg:text-3xl text-[#1A1A1A] mb-3 leading-tight">
              {product.name}
            </h1>

            {/* Rating */}
            <div className="flex items-center gap-3 mb-4">
              <RatingStars rating={avgRating} />
              <span className="font-body font-semibold text-sm text-[#1A1A1A]">{avgRating.toFixed(1)}</span>
              <span className="font-body text-sm text-[#8C8C8C]">({totalReviews} rəy)</span>
            </div>

            {/* Price */}
            <div className="flex items-end gap-3 mb-5">
              <span className="font-heading font-bold text-3xl sm:text-4xl text-[#E05A33]">
                {product.price} ₼
              </span>
              {product.original_price > product.price && (
                <span className="font-body text-lg text-[#8C8C8C] line-through mb-1">
                  {product.original_price} ₼
                </span>
              )}
              {product.discount > 0 && (
                <span className="bg-[#FFF0E6] text-[#E05A33] px-2.5 py-1 rounded-lg text-sm font-bold font-body mb-1">
                  {product.discount}% endirim
                </span>
              )}
            </div>

            {/* Quantity */}
            <div className="flex items-center gap-4 mb-5">
              <span className="font-body text-sm text-[#595959]">Miqdar:</span>
              <div className="flex items-center gap-0 border border-gray-200 rounded-xl overflow-hidden">
                <button
                  data-testid="qty-minus"
                  onClick={() => setQty(Math.max(1, qty - 1))}
                  className="w-10 h-10 flex items-center justify-center hover:bg-gray-50 transition-colors"
                >
                  <Minus size={16} />
                </button>
                <span className="w-12 text-center font-body font-semibold text-[#1A1A1A]">{qty}</span>
                <button
                  data-testid="qty-plus"
                  onClick={() => setQty(qty + 1)}
                  className="w-10 h-10 flex items-center justify-center hover:bg-gray-50 transition-colors"
                >
                  <Plus size={16} />
                </button>
              </div>
              <span className="font-body text-xs text-[#8C8C8C]">Stokda: {product.stock}</span>
            </div>

            {/* Action buttons */}
            <div className="flex gap-3 mb-6">
              <button
                data-testid="add-to-cart-detail"
                onClick={handleAddToCart}
                className={`flex-1 py-3.5 rounded-full font-body font-semibold text-base transition-all flex items-center justify-center gap-2 ${
                  addedToCart
                    ? "bg-green-500 text-white"
                    : "bg-[#E05A33] hover:bg-[#D94A22] text-white hover:shadow-lg hover:shadow-[#E05A33]/20"
                }`}
              >
                {addedToCart ? <><Check size={18} /> Əlavə edildi</> : <><ShoppingBag size={18} /> Səbətə əlavə et</>}
              </button>
              <button
                data-testid="favorite-detail"
                onClick={() => setLiked(!liked)}
                className="w-14 h-14 rounded-full border-2 border-gray-200 flex items-center justify-center hover:border-[#E05A33] transition-colors flex-shrink-0"
              >
                <Heart size={20} className={liked ? "text-[#E05A33] fill-[#E05A33]" : "text-[#595959]"} />
              </button>
            </div>

            {/* Features */}
            <div className="grid grid-cols-3 gap-3 mb-6 p-4 bg-[#F5F3F0] rounded-2xl">
              {[
                { icon: Truck, label: "Pulsuz çatdırılma" },
                { icon: Shield, label: "Zəmanət" },
                { icon: RefreshCw, label: "14 gün qaytarma" },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex flex-col items-center gap-1.5 text-center">
                  <Icon size={18} className="text-[#E05A33]" />
                  <span className="font-body text-[11px] text-[#595959] font-medium">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tabs: Description / Reviews */}
        <div className="mt-8 sm:mt-12">
          <div className="flex gap-0 border-b border-gray-200">
            {[
              { id: "description", label: "Təsvir" },
              { id: "reviews", label: `Rəylər (${totalReviews})` },
            ].map((tab) => (
              <button
                key={tab.id}
                data-testid={`tab-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-3 font-body font-medium text-sm transition-colors relative ${
                  activeTab === tab.id ? "text-[#E05A33]" : "text-[#8C8C8C] hover:text-[#595959]"
                }`}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#E05A33] rounded-full" />
                )}
              </button>
            ))}
          </div>

          {/* Description */}
          {activeTab === "description" && (
            <div data-testid="product-description" className="py-6 max-w-3xl">
              <p className="font-body text-[#595959] leading-relaxed">{product.description}</p>
              {product.specifications?.length > 0 && (
                <div className="mt-6">
                  <h3 className="font-heading font-semibold text-lg text-[#1A1A1A] mb-3">Xüsusiyyətlər</h3>
                  <div className="space-y-2">
                    {product.specifications.map((spec, i) => (
                      <div key={i} className="flex gap-4 py-2 border-b border-gray-50">
                        <span className="font-body text-sm text-[#8C8C8C] w-1/3">{spec.key}</span>
                        <span className="font-body text-sm text-[#1A1A1A] font-medium">{spec.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Reviews */}
          {activeTab === "reviews" && (
            <div data-testid="reviews-section" className="py-6">
              {/* Rating summary */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8 p-6 bg-[#F5F3F0] rounded-2xl">
                <div className="flex flex-col items-center justify-center gap-2">
                  <span className="font-heading font-bold text-5xl text-[#1A1A1A]">{avgRating.toFixed(1)}</span>
                  <RatingStars rating={avgRating} size={18} />
                  <span className="font-body text-sm text-[#8C8C8C]">{totalReviews} rəy</span>
                </div>
                <div className="flex flex-col gap-2 justify-center">
                  <ReviewBar label="5" count={stats.r5 || 0} total={totalReviews} />
                  <ReviewBar label="4" count={stats.r4 || 0} total={totalReviews} />
                  <ReviewBar label="3" count={stats.r3 || 0} total={totalReviews} />
                  <ReviewBar label="2" count={stats.r2 || 0} total={totalReviews} />
                  <ReviewBar label="1" count={stats.r1 || 0} total={totalReviews} />
                </div>
              </div>

              {/* Review list */}
              <div className="space-y-4">
                {reviews.reviews?.map((review) => (
                  <div key={review.id} data-testid={`review-${review.id}`} className="p-4 sm:p-5 bg-white rounded-2xl border border-gray-50">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-9 h-9 rounded-full bg-[#E05A33]/10 flex items-center justify-center">
                        <span className="font-heading font-bold text-sm text-[#E05A33]">
                          {review.user_name?.[0] || "?"}
                        </span>
                      </div>
                      <div>
                        <span className="font-body font-semibold text-sm text-[#1A1A1A]">{review.user_name}</span>
                        <div className="flex items-center gap-1.5">
                          <RatingStars rating={review.rating} size={11} />
                          <span className="font-body text-[10px] text-[#8C8C8C]">
                            {new Date(review.created_at).toLocaleDateString("az-AZ")}
                          </span>
                        </div>
                      </div>
                    </div>
                    <p className="font-body text-sm text-[#595959] leading-relaxed">{review.comment}</p>
                  </div>
                ))}
                {reviews.reviews?.length === 0 && (
                  <p className="text-center py-8 font-body text-[#8C8C8C]">Hələ rəy yoxdur</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Similar Products */}
        {similar.length > 0 && (
          <section data-testid="similar-products" className="mt-10 sm:mt-14">
            <h2 className="font-heading font-bold text-lg sm:text-xl text-[#1A1A1A] mb-4 sm:mb-6">
              Oxşar məhsullar
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {similar.map((p) => (
                <Link key={p.id} to={`/product/${p.id}`} className="block">
                  <ProductCard product={p} />
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>

      <Footer />
      <MobileBottomNav />
    </div>
  );
}
