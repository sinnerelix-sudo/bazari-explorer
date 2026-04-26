import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, LayoutGrid, Flame, ShoppingBag, User, X } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";

const navItems = [
  { id: "home", label: "Ana səhifə", icon: Home, to: "/" },
  { id: "categories", label: "Kateqoriya", icon: LayoutGrid, to: "/" },
  { id: "deals", label: "Endirimlər", icon: Flame, to: "/" },
  { id: "cart", label: "Səbət", icon: ShoppingBag, to: "/cart" },
  { id: "profile", label: "Profil", icon: User, to: "/profile" },
];

let cachedCategories = null;
let categoryRequest = null;

function loadCategories() {
  if (cachedCategories) return Promise.resolve(cachedCategories);
  if (categoryRequest) return categoryRequest;

  categoryRequest = api
    .get("/categories")
    .then(({ data }) => {
      cachedCategories = Array.isArray(data) ? data : [];
      return cachedCategories;
    })
    .catch(() => {
      cachedCategories = [];
      return cachedCategories;
    })
    .finally(() => {
      categoryRequest = null;
    });

  return categoryRequest;
}

export default function MobileBottomNav() {
  const location = useLocation();
  const { cart } = useCart();
  const { user } = useAuth();
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);

  const getActiveId = () => {
    if (location.pathname === "/cart") return "cart";
    if (location.pathname.startsWith("/category/")) return "categories";
    if (location.pathname === "/login" || location.pathname === "/admin") return "profile";
    return "home";
  };

  const active = getActiveId();

  useEffect(() => {
    let ignore = false;
    const run = () => {
      loadCategories().then((items) => {
        if (!ignore) setCategories(items);
      });
    };

    if (typeof window !== "undefined" && "requestIdleCallback" in window) {
      const idleId = window.requestIdleCallback(run, { timeout: 1200 });
      return () => {
        ignore = true;
        window.cancelIdleCallback?.(idleId);
      };
    }

    const timer = window.setTimeout(run, 350);

    return () => {
      ignore = true;
      window.clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    if (!categoryOpen || categories.length > 0) return;

    let ignore = false;
    setCategoriesLoading(true);

    loadCategories()
      .then((items) => {
        if (!ignore) setCategories(items);
      })
      .finally(() => {
        if (!ignore) setCategoriesLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [categoryOpen, categories.length]);

  useEffect(() => {
    if (!categoryOpen) return;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") setCategoryOpen(false);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [categoryOpen]);

  return (
    <>
      {categoryOpen ? (
        <div className="md:hidden fixed inset-0 z-[60]" role="dialog" aria-modal="true" aria-label="Kateqoriyalar">
          <button
            type="button"
            data-testid="category-sheet-backdrop"
            aria-label="Kateqoriya siyahısını bağla"
            onClick={() => setCategoryOpen(false)}
            className="absolute inset-0 bg-black/35 backdrop-blur-[2px]"
          />
          <div
            data-testid="category-sheet"
            className="absolute left-0 right-0 bottom-0 rounded-t-[28px] bg-white shadow-[0_-18px_50px_rgba(0,0,0,0.16)] border-t border-gray-100 overflow-hidden"
            style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 82px)" }}
          >
            <div className="w-11 h-1 rounded-full bg-gray-200 mx-auto mt-3 mb-2" />
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-50">
              <div>
                <h2 className="font-heading font-bold text-lg text-[#1A1A1A]">Kateqoriyalar</h2>
                <p className="font-body text-xs text-[#8C8C8C]">Məhsulları kateqoriyaya görə seçin</p>
              </div>
              <button
                type="button"
                data-testid="category-sheet-close"
                aria-label="Bağla"
                onClick={() => setCategoryOpen(false)}
                className="w-10 h-10 rounded-full bg-[#F5F3F0] text-[#595959] flex items-center justify-center active:scale-95 transition-transform"
              >
                <X size={18} />
              </button>
            </div>

            <div className="max-h-[56vh] overflow-y-auto px-4 py-4 scrollbar-hide">
              {categoriesLoading ? (
                <div className="grid grid-cols-2 gap-3" data-testid="category-sheet-loading">
                  {[1, 2, 3, 4].map((item) => (
                    <div key={item} className="h-16 rounded-2xl bg-[#F5F3F0] animate-pulse" />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {categories.map((category) => (
                    <Link
                      key={category.id || category.slug}
                      to={`/category/${category.slug}`}
                      data-testid={`category-sheet-link-${category.slug}`}
                      onClick={() => setCategoryOpen(false)}
                      className="group flex items-center gap-3 rounded-2xl border border-gray-100 bg-[#FDFCFB] p-3 active:scale-[0.98] transition-all"
                    >
                      <div className="w-12 h-12 rounded-2xl overflow-hidden bg-[#F5F3F0] flex-shrink-0">
                        {category.image ? (
                          <img src={category.image} alt="" className="w-full h-full object-cover group-active:scale-105 transition-transform" loading="lazy" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[#E05A33]">
                            <LayoutGrid size={20} />
                          </div>
                        )}
                      </div>
                      <span className="font-body font-semibold text-sm text-[#1A1A1A] leading-tight line-clamp-2">
                        {category.name}
                      </span>
                    </Link>
                  ))}
                  {categories.length === 0 ? (
                    <div className="col-span-2 rounded-2xl bg-[#F5F3F0] px-4 py-6 text-center font-body text-sm text-[#8C8C8C]">
                      Kateqoriya yoxdur
                    </div>
                  ) : null}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}

      <nav
        data-testid="mobile-bottom-nav"
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 backdrop-blur-2xl bg-white/95 border-t border-gray-100 shadow-[0_-4px_20px_rgba(0,0,0,0.04)]"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      >
        <div className="flex items-center justify-around px-2 pt-2 pb-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = active === item.id || (categoryOpen && item.id === "categories");
            const to = item.id === "profile" ? (user ? (user.role === "admin" ? "/admin" : "/profile") : "/login") : item.to;
            const content = (
              <>
                <div className="relative">
                  <Icon size={22} strokeWidth={isActive ? 2.2 : 1.5} fill={isActive ? "currentColor" : "none"} />
                  {item.id === "cart" && cart.count > 0 ? (
                    <span className="absolute -top-1.5 -right-2.5 w-4 h-4 bg-[#E05A33] text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                      {cart.count > 9 ? "9+" : cart.count}
                    </span>
                  ) : null}
                </div>
                <span className={`text-[10px] font-body transition-all duration-200 ${isActive ? "font-semibold" : "font-medium"}`}>
                  {item.id === "profile" && user ? user.name?.split(" ")[0] || "Profil" : item.label}
                </span>
                {isActive ? <div className="absolute -bottom-1.5 w-5 h-0.5 bg-[#E05A33] rounded-full" /> : null}
              </>
            );
            const className = `flex flex-col items-center justify-center gap-0.5 py-1 px-3 rounded-2xl transition-all duration-200 relative min-w-[56px] ${
              isActive ? "text-[#E05A33]" : "text-[#8C8C8C]"
            }`;

            if (item.id === "categories") {
              return (
                <button
                  key={item.id}
                  type="button"
                  data-testid={`nav-${item.id}`}
                  aria-expanded={categoryOpen}
                  onClick={() => setCategoryOpen((open) => !open)}
                  className={className}
                >
                  {content}
                </button>
              );
            }

            return (
              <Link key={item.id} to={to} data-testid={`nav-${item.id}`} className={className}>
                {content}
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
