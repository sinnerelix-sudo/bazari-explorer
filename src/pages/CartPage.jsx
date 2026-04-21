import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Minus, Plus, Trash2, ShoppingBag, ChevronLeft, ArrowRight } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import Header from "@/components/layout/Header";
import MobileBottomNav from "@/components/layout/MobileBottomNav";

export default function CartPage() {
  const { cart, fetchCart, updateQuantity, removeFromCart, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) fetchCart();
  }, [user, fetchCart]);

  if (!user) {
    return (
      <div className="min-h-screen bg-[#FDFCFB]">
        <Header />
        <div className="max-w-lg mx-auto text-center py-24 px-4">
          <ShoppingBag size={48} className="mx-auto text-[#8C8C8C] mb-4" />
          <h2 className="font-heading font-bold text-xl text-[#1A1A1A] mb-2">Səbəti görmək üçün daxil olun</h2>
          <Link to="/login" className="inline-block bg-[#E05A33] text-white px-6 py-2.5 rounded-full font-body font-semibold text-sm mt-4">Daxil ol</Link>
        </div>
        <MobileBottomNav />
      </div>
    );
  }

  const items = cart.items || [];

  return (
    <div data-testid="cart-page" className="min-h-screen bg-[#FDFCFB]">
      <Header />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-24 md:pb-12">
        {/* Back + title */}
        <div className="flex items-center gap-3 py-4">
          <button data-testid="cart-back-btn" onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-xl hover:bg-gray-50 sm:hidden">
            <ChevronLeft size={22} />
          </button>
          <h1 className="font-heading font-bold text-xl sm:text-2xl text-[#1A1A1A]">
            Səbət {items.length > 0 && <span className="text-[#8C8C8C] font-normal text-base">({cart.count} məhsul)</span>}
          </h1>
        </div>

        {items.length === 0 ? (
          <div className="text-center py-16">
            <ShoppingBag size={48} className="mx-auto text-[#8C8C8C] mb-4" />
            <h2 className="font-heading font-bold text-lg text-[#1A1A1A] mb-2">Səbətiniz boşdur</h2>
            <p className="font-body text-sm text-[#8C8C8C] mb-6">Məhsul əlavə edin və alış-verişə başlayın</p>
            <Link to="/" data-testid="continue-shopping" className="inline-block bg-[#E05A33] text-white px-6 py-2.5 rounded-full font-body font-semibold text-sm">
              Alış-verişə davam et
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Items list */}
            <div className="lg:col-span-2 space-y-3">
              {items.map((item) => {
                const p = item.product;
                if (!p) return null;
                return (
                  <div key={item.product_id} data-testid={`cart-item-${item.product_id}`} className="flex gap-4 p-4 bg-white rounded-2xl border border-gray-50">
                    <Link to={`/product/${p.id}`} className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-[#F5F3F0] flex-shrink-0">
                      <img src={p.images?.[0] || ""} alt={p.name} className="w-full h-full object-cover" />
                    </Link>
                    <div className="flex-1 min-w-0">
                      <Link to={`/product/${p.id}`} className="font-body font-medium text-sm text-[#1A1A1A] line-clamp-2 hover:text-[#E05A33] transition-colors">{p.name}</Link>
                      {p.brand && <p className="font-body text-xs text-[#8C8C8C] mt-0.5">{p.brand}</p>}
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="font-heading font-bold text-[#E05A33]">{p.price} ₼</span>
                        {p.original_price > p.price && <span className="font-body text-xs text-[#8C8C8C] line-through">{p.original_price} ₼</span>}
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-0 border border-gray-200 rounded-lg overflow-hidden">
                          <button data-testid={`cart-minus-${item.product_id}`} onClick={() => updateQuantity(item.product_id, item.quantity - 1)} className="w-8 h-8 flex items-center justify-center hover:bg-gray-50">
                            <Minus size={14} />
                          </button>
                          <span className="w-8 text-center font-body text-sm font-semibold">{item.quantity}</span>
                          <button data-testid={`cart-plus-${item.product_id}`} onClick={() => updateQuantity(item.product_id, item.quantity + 1)} className="w-8 h-8 flex items-center justify-center hover:bg-gray-50">
                            <Plus size={14} />
                          </button>
                        </div>
                        <button data-testid={`cart-remove-${item.product_id}`} onClick={() => removeFromCart(item.product_id)} className="p-2 rounded-lg hover:bg-red-50 text-[#8C8C8C] hover:text-red-500 transition-colors">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
              <button data-testid="clear-cart-btn" onClick={clearCart} className="text-sm font-body text-[#8C8C8C] hover:text-red-500 transition-colors">
                Səbəti təmizlə
              </button>
            </div>

            {/* Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl border border-gray-50 p-5 sticky top-20">
                <h3 className="font-heading font-bold text-lg text-[#1A1A1A] mb-4">Sifariş xülasəsi</h3>
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between font-body text-sm">
                    <span className="text-[#8C8C8C]">Məhsullar ({cart.count})</span>
                    <span className="text-[#1A1A1A] font-medium">{cart.total} ₼</span>
                  </div>
                  <div className="flex justify-between font-body text-sm">
                    <span className="text-[#8C8C8C]">Çatdırılma</span>
                    <span className="text-green-600 font-medium">Pulsuz</span>
                  </div>
                </div>
                <div className="border-t border-gray-100 pt-3 mb-5">
                  <div className="flex justify-between">
                    <span className="font-heading font-bold text-[#1A1A1A]">Cəmi</span>
                    <span className="font-heading font-bold text-lg text-[#E05A33]">{cart.total} ₼</span>
                  </div>
                </div>
                <button data-testid="checkout-btn" className="w-full bg-[#E05A33] hover:bg-[#D94A22] text-white py-3.5 rounded-full font-body font-semibold text-sm flex items-center justify-center gap-2 transition-all hover:shadow-lg">
                  Sifarişi tamamla <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      <MobileBottomNav />
    </div>
  );
}
