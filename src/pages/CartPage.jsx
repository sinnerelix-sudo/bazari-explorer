import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  AlertCircle,
  ArrowRight,
  Banknote,
  ChevronLeft,
  CreditCard,
  Landmark,
  Minus,
  Plus,
  ShoppingBag,
  Trash2,
} from "lucide-react";
import { api as ax } from "@/lib/api";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import Header from "@/components/layout/Header";
import MobileBottomNav from "@/components/layout/MobileBottomNav";

const PAYMENT_ICON_MAP = {
  card_to_card: Landmark,
  card: CreditCard,
  cash_on_delivery: Banknote,
};

const TECHNICAL_MESSAGE = "Texniki səbəblərdən çalışmır";

function formatPrice(value) {
  const amount = Number(value || 0);
  const fixed = amount.toFixed(2);
  return fixed.endsWith(".00") ? fixed.slice(0, -3) : fixed;
}

function normalizeWhatsappPhone(phone) {
  return String(phone || "").replace(/[^\d]/g, "");
}

function buildWhatsappMessage({ user, items, total, paymentMethodName }) {
  const lines = [
    "Salam, yeni sifariş vermək istəyirəm.",
    "",
    `Ödəniş metodu: ${paymentMethodName}`,
    `Müştəri: ${user?.name || "-"}`,
    `Email: ${user?.email || "-"}`,
    `Telefon: ${user?.phone || "-"}`,
    "",
    "Sifariş məhsulları:",
  ];

  items.forEach((item, index) => {
    const product = item.product;
    const subtotal = Number(product?.price || 0) * Number(item.quantity || 0);
    lines.push(`${index + 1}. ${product?.name || "Məhsul"} x${item.quantity} - ${formatPrice(subtotal)} ₼`);
  });

  lines.push("");
  lines.push(`Cəmi: ${formatPrice(total)} ₼`);

  return lines.join("\n");
}

export default function CartPage() {
  const { cart, fetchCart, updateQuantity, removeFromCart, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [selectedMethodId, setSelectedMethodId] = useState("");
  const [methodsLoading, setMethodsLoading] = useState(false);
  const [whatsappPhone, setWhatsappPhone] = useState("");

  useEffect(() => {
    if (!user) return;

    fetchCart();

    const loadPaymentMethods = async () => {
      setMethodsLoading(true);
      try {
        const { data } = await ax.get("/payment-methods");
        const methods = Array.isArray(data?.methods) ? data.methods : [];
        setPaymentMethods(methods);
        setWhatsappPhone(data?.whatsapp_phone || "");
        setSelectedMethodId((current) => {
          const activeIds = methods.filter((method) => method.is_active).map((method) => method.id);
          if (current && activeIds.includes(current)) return current;
          return activeIds[0] || "";
        });
      } catch (err) {
        console.error("Payment methods load failed:", err);
        setPaymentMethods([]);
        setWhatsappPhone("");
        setSelectedMethodId("");
      } finally {
        setMethodsLoading(false);
      }
    };

    loadPaymentMethods();
  }, [user, fetchCart]);

  const items = cart.items || [];
  const activeMethods = useMemo(
    () => paymentMethods.filter((method) => method.is_active),
    [paymentMethods]
  );
  const selectedMethod = paymentMethods.find((method) => method.id === selectedMethodId) || null;
  const canCheckout = items.length > 0 && !!selectedMethod && !!normalizeWhatsappPhone(whatsappPhone);

  const handleCheckout = () => {
    if (!selectedMethod) return;

    const normalizedPhone = normalizeWhatsappPhone(whatsappPhone);
    if (!normalizedPhone) {
      window.alert("WhatsApp sifariş nömrəsi hələ qurulmayıb.");
      return;
    }

    const message = buildWhatsappMessage({
      user,
      items,
      total: cart.total,
      paymentMethodName: selectedMethod.name,
    });

    window.location.href = `https://wa.me/${normalizedPhone}?text=${encodeURIComponent(message)}`;
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-[#FDFCFB]">
        <Header />
        <div className="max-w-lg mx-auto text-center py-24 px-4">
          <ShoppingBag size={48} className="mx-auto text-[#8C8C8C] mb-4" />
          <h2 className="font-heading font-bold text-xl text-[#1A1A1A] mb-2">{"Səbəti görmək üçün daxil olun"}</h2>
          <Link
            to="/login"
            className="inline-block bg-[#E05A33] text-white px-6 py-2.5 rounded-full font-body font-semibold text-sm mt-4"
          >
            Daxil ol
          </Link>
        </div>
        <MobileBottomNav />
      </div>
    );
  }

  return (
    <div data-testid="cart-page" className="min-h-screen bg-[#FDFCFB]">
      <Header />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-24 md:pb-12">
        <div className="flex items-center gap-3 py-4">
          <button
            data-testid="cart-back-btn"
            onClick={() => navigate(-1)}
            className="p-2 -ml-2 rounded-xl hover:bg-gray-50 sm:hidden"
          >
            <ChevronLeft size={22} />
          </button>
          <h1 className="font-heading font-bold text-xl sm:text-2xl text-[#1A1A1A]">
            {"Səbət "}
            {items.length > 0 && (
              <span className="text-[#8C8C8C] font-normal text-base">
                ({cart.count} {"məhsul"})
              </span>
            )}
          </h1>
        </div>

        {items.length === 0 ? (
          <div className="text-center py-16">
            <ShoppingBag size={48} className="mx-auto text-[#8C8C8C] mb-4" />
            <h2 className="font-heading font-bold text-lg text-[#1A1A1A] mb-2">{"Səbətiniz boşdur"}</h2>
            <p className="font-body text-sm text-[#8C8C8C] mb-6">
              {"Məhsul əlavə edin və alış-verişə başlayın"}
            </p>
            <Link
              to="/"
              data-testid="continue-shopping"
              className="inline-block bg-[#E05A33] text-white px-6 py-2.5 rounded-full font-body font-semibold text-sm"
            >
              {"Alış-verişə davam et"}
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-3">
              {items.map((item) => {
                const product = item.product;
                const productId = item.product_id || product?.id;
                if (!product || !productId) return null;

                return (
                  <div
                    key={productId}
                    data-testid={`cart-item-${productId}`}
                    className="flex gap-4 p-4 bg-white rounded-2xl border border-gray-50"
                  >
                    <Link
                      to={`/product/${product.id}`}
                      className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-[#F5F3F0] flex-shrink-0"
                    >
                      <img src={product.images?.[0] || ""} alt={product.name} className="w-full h-full object-cover" />
                    </Link>
                    <div className="flex-1 min-w-0">
                      <Link
                        to={`/product/${product.id}`}
                        className="font-body font-medium text-sm text-[#1A1A1A] line-clamp-2 hover:text-[#E05A33] transition-colors"
                      >
                        {product.name}
                      </Link>
                      {product.brand && <p className="font-body text-xs text-[#8C8C8C] mt-0.5">{product.brand}</p>}
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="font-heading font-bold text-[#E05A33]">
                          {formatPrice(product.price)} {"₼"}
                        </span>
                        {Number(product.original_price) > Number(product.price) && (
                          <span className="font-body text-xs text-[#8C8C8C] line-through">
                            {formatPrice(product.original_price)} {"₼"}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-0 border border-gray-200 rounded-lg overflow-hidden">
                          <button
                            data-testid={`cart-minus-${productId}`}
                            onClick={() =>
                              item.quantity > 1
                                ? updateQuantity(productId, item.quantity - 1)
                                : removeFromCart(productId)
                            }
                            className="w-8 h-8 flex items-center justify-center hover:bg-gray-50"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="w-8 text-center font-body text-sm font-semibold">{item.quantity}</span>
                          <button
                            data-testid={`cart-plus-${productId}`}
                            onClick={() => updateQuantity(productId, item.quantity + 1)}
                            className="w-8 h-8 flex items-center justify-center hover:bg-gray-50"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                        <button
                          data-testid={`cart-remove-${productId}`}
                          onClick={() => removeFromCart(productId)}
                          className="p-2 rounded-lg hover:bg-red-50 text-[#8C8C8C] hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}

              <button
                data-testid="clear-cart-btn"
                onClick={clearCart}
                className="text-sm font-body text-[#8C8C8C] hover:text-red-500 transition-colors"
              >
                {"Səbəti təmizlə"}
              </button>
            </div>

            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl border border-gray-50 p-5 sticky top-20">
                <h3 className="font-heading font-bold text-lg text-[#1A1A1A] mb-4">{"Sifariş xülasəsi"}</h3>
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between font-body text-sm">
                    <span className="text-[#8C8C8C]">
                      {"Məhsullar"} ({cart.count})
                    </span>
                    <span className="text-[#1A1A1A] font-medium">{formatPrice(cart.total)} {"₼"}</span>
                  </div>
                  <div className="flex justify-between font-body text-sm">
                    <span className="text-[#8C8C8C]">{"Çatdırılma"}</span>
                    <span className="text-green-600 font-medium">Pulsuz</span>
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-3 mb-5">
                  <div className="flex justify-between">
                    <span className="font-heading font-bold text-[#1A1A1A]">{"Cəmi"}</span>
                    <span className="font-heading font-bold text-lg text-[#E05A33]">
                      {formatPrice(cart.total)} {"₼"}
                    </span>
                  </div>
                </div>

                <div className="space-y-3 mb-5">
                  <div className="flex items-center justify-between">
                    <h4 className="font-heading font-bold text-base text-[#1A1A1A]">{"Ödəniş metodları"}</h4>
                    {activeMethods.length > 0 && (
                      <span className="text-[11px] font-body text-[#8C8C8C]">
                        {"WhatsApp-a yönləndiriləcək"}
                      </span>
                    )}
                  </div>

                  {methodsLoading ? (
                    <div className="space-y-2">
                      {[1, 2, 3].map((value) => (
                        <div key={value} className="h-16 rounded-2xl bg-[#F5F3F0] animate-pulse" />
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {paymentMethods.map((method) => {
                        const Icon = PAYMENT_ICON_MAP[method.id] || CreditCard;
                        const isSelected = selectedMethodId === method.id;

                        return (
                          <button
                            key={method.id}
                            type="button"
                            onClick={() => method.is_active && setSelectedMethodId(method.id)}
                            className={`w-full text-left rounded-2xl border p-4 transition-all ${
                              method.is_active
                                ? isSelected
                                  ? "border-[#E05A33] bg-[#FFF7F2] shadow-sm"
                                  : "border-gray-100 bg-white hover:border-[#E05A33]/40"
                                : "border-[#F3D58A] bg-[#FFF9E8]"
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <div
                                className={`w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                                  method.is_active ? "bg-[#FFF0E6] text-[#E05A33]" : "bg-[#FFE7A3] text-[#A77000]"
                                }`}
                              >
                                <Icon size={18} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-3">
                                  <div>
                                    <p className="font-body font-semibold text-sm text-[#1A1A1A]">{method.name}</p>
                                    <p className="font-body text-xs text-[#8C8C8C] mt-1">{method.description}</p>
                                  </div>
                                  <div
                                    className={`w-5 h-5 rounded-full border flex-shrink-0 mt-0.5 ${
                                      isSelected && method.is_active
                                        ? "border-[#E05A33] bg-[#E05A33]"
                                        : method.is_active
                                          ? "border-gray-300 bg-white"
                                          : "border-[#D7B54A] bg-[#FFF3C7]"
                                    }`}
                                  >
                                    {isSelected && method.is_active && (
                                      <span className="block w-2 h-2 rounded-full bg-white m-auto mt-1.5" />
                                    )}
                                  </div>
                                </div>
                                {!method.is_active && (
                                  <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-[#FFF0B8] px-3 py-1 text-[11px] font-body font-semibold text-[#8A6400]">
                                    <AlertCircle size={12} />
                                    {method.unavailable_message || TECHNICAL_MESSAGE}
                                  </div>
                                )}
                              </div>
                            </div>
                          </button>
                        );
                      })}

                      {!paymentMethods.length && (
                        <div className="rounded-2xl border border-dashed border-gray-200 p-4 text-sm font-body text-[#8C8C8C]">
                          {"Hazırda ödəniş metodu tapılmadı."}
                        </div>
                      )}
                    </div>
                  )}

                  {!normalizeWhatsappPhone(whatsappPhone) && (
                    <div className="rounded-2xl border border-[#FFD4C7] bg-[#FFF6F3] px-4 py-3 text-xs font-body text-[#A5533A]">
                      {"WhatsApp sifariş nömrəsi hələ qurulmayıb. Admin paneldən nömrəni qurduqdan sonra checkout aktiv olacaq."}
                    </div>
                  )}

                  {!methodsLoading && paymentMethods.length > 0 && activeMethods.length === 0 && (
                    <div className="rounded-2xl border border-[#F3D58A] bg-[#FFF9E8] px-4 py-3 text-xs font-body text-[#8A6400]">
                      {"Hazırda istifadə edilə bilən ödəniş metodu yoxdur."}
                    </div>
                  )}
                </div>

                <button
                  data-testid="checkout-btn"
                  onClick={handleCheckout}
                  disabled={!canCheckout}
                  className="w-full bg-[#E05A33] hover:bg-[#D94A22] disabled:bg-[#F1B7A8] disabled:cursor-not-allowed text-white py-3.5 rounded-full font-body font-semibold text-sm flex items-center justify-center gap-2 transition-all hover:shadow-lg"
                >
                  {"WhatsApp sifarişi yarat"} <ArrowRight size={16} />
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
