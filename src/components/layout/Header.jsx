import { useState } from "react";
import { Link } from "react-router-dom";
import { Heart, Home, LayoutGrid, LogIn, Menu, ShoppingBag, Tag, User, X } from "lucide-react";
import SearchAutocomplete from "./SearchAutocomplete";
import NotificationPanel from "./NotificationPanel";
import BrandMark from "./BrandMark";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user } = useAuth();
  const { cart } = useCart();

  const menuItems = [
    { label: "Ana səhifə", to: "/", icon: Home },
    { label: "Kateqoriyalar", to: "/categories", icon: LayoutGrid },
    { label: "Endirimlər", to: "/flash-deals", icon: Tag },
    { label: "Səbət", to: "/cart", icon: ShoppingBag },
    ...(user
      ? [{ label: user.role === "admin" ? "Admin Panel" : "Profil", to: user.role === "admin" ? "/admin" : "/login", icon: User }]
      : [{ label: "Daxil ol", to: "/login", icon: LogIn }]),
  ];

  return (
    <>
      <header data-testid="main-header" className="sticky top-0 z-50 backdrop-blur-xl bg-white/85 border-b border-gray-100/60">
        <div className="bg-[#1A1A1A] text-white text-center py-1.5 px-4">
          <p className="text-xs font-medium tracking-wide font-body">
            Pulsuz çatdırılma 50 ₼-dan yuxarı sifarişlərə
          </p>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <div className="flex items-center gap-3">
              <button
                type="button"
                data-testid="mobile-menu-btn"
                className="lg:hidden p-2 -ml-2 rounded-xl hover:bg-gray-50 transition-colors"
                onClick={() => setMenuOpen(true)}
                aria-label="Menyunu aç"
              >
                <Menu size={22} />
              </button>
              <Link to="/" data-testid="logo-link" className="flex items-center gap-2">
                <BrandMark className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl" />
                <span className="font-heading font-bold text-lg sm:text-xl text-[#1A1A1A] hidden sm:block">Bazari</span>
              </Link>
            </div>

            <SearchAutocomplete />

            <div className="flex items-center gap-1 sm:gap-2">
              <Link to="/favorites" data-testid="favorites-btn" className="hidden sm:flex p-2.5 rounded-xl hover:bg-gray-50 transition-colors">
                <Heart size={20} className="text-[#595959]" />
              </Link>
              <div className="hidden sm:block">
                <NotificationPanel />
              </div>
              <Link to="/cart" data-testid="cart-btn" className="p-2.5 rounded-xl hover:bg-gray-50 transition-colors relative">
                <ShoppingBag size={20} className="text-[#595959]" />
                {cart.count > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-[#E05A33] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {cart.count > 9 ? "9+" : cart.count}
                  </span>
                )}
              </Link>
              {!user && (
                <Link to="/login" data-testid="login-header-btn" className="hidden sm:flex px-4 py-2 rounded-full bg-[#E05A33] text-white font-body font-semibold text-sm hover:bg-[#D94A22] transition-colors">
                  Daxil ol
                </Link>
              )}
              {user && (
                <Link to={user.role === "admin" || user.role === "seller" ? "/admin" : "/login"} className="hidden sm:flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full bg-[#F5F3F0] hover:bg-[#EBEBEB] transition-colors">
                  <div className="w-7 h-7 rounded-full bg-[#E05A33]/10 flex items-center justify-center">
                    <span className="font-heading font-bold text-xs text-[#E05A33]">{user.name?.[0] || "?"}</span>
                  </div>
                  <span className="font-body text-xs font-medium text-[#595959] max-w-[80px] truncate">{user.name}</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      {menuOpen && (
        <div className="lg:hidden fixed inset-0" style={{ zIndex: 9999 }}>
          <button
            type="button"
            className="absolute inset-0 bg-black/40"
            aria-label="Menyunu bağla"
            onClick={() => setMenuOpen(false)}
          />
          <div
            data-testid="mobile-menu-overlay"
            className="absolute top-0 left-0 bottom-0 w-[280px] bg-white flex flex-col shadow-2xl"
          >
            <div className="border-b border-gray-100 px-5 py-4 flex items-center justify-between flex-shrink-0">
              <Link to="/" onClick={() => setMenuOpen(false)} className="flex items-center gap-2">
                <BrandMark className="w-8 h-8 rounded-xl" />
                <span className="font-heading font-bold text-lg text-[#1A1A1A]">Bazari</span>
              </Link>
              <button type="button" data-testid="mobile-menu-close" onClick={() => setMenuOpen(false)} className="p-2 rounded-xl hover:bg-gray-50">
                <X size={20} className="text-[#595959]" />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto py-3 px-3">
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.label}
                    to={item.to}
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-[#1A1A1A] font-body font-medium text-[15px] hover:bg-[#F5F3F0] transition-colors"
                  >
                    <Icon size={20} className="text-[#595959]" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
            {user && (
              <div className="border-t border-gray-100 px-5 py-4 flex-shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#E05A33]/10 flex items-center justify-center">
                    <span className="font-heading font-bold text-sm text-[#E05A33]">{user.name?.[0] || "?"}</span>
                  </div>
                  <div>
                    <p className="font-body font-semibold text-sm text-[#1A1A1A]">{user.name}</p>
                    <p className="font-body text-xs text-[#8C8C8C]">{user.email}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
