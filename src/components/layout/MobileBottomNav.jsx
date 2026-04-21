import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, LayoutGrid, Flame, ShoppingBag, User } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";

const navItems = [
  { id: "home", label: "Ana səhifə", icon: Home, to: "/" },
  { id: "categories", label: "Kateqoriya", icon: LayoutGrid, to: "/" },
  { id: "deals", label: "Endirimlər", icon: Flame, to: "/" },
  { id: "cart", label: "Səbət", icon: ShoppingBag, to: "/cart" },
  { id: "profile", label: "Profil", icon: User, to: "/profile" },
];

export default function MobileBottomNav() {
  const location = useLocation();
  const { cart } = useCart();
  const { user } = useAuth();

  const getActiveId = () => {
    if (location.pathname === "/cart") return "cart";
    if (location.pathname === "/login" || location.pathname === "/admin") return "profile";
    return "home";
  };

  const active = getActiveId();

  return (
    <nav
      data-testid="mobile-bottom-nav"
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 backdrop-blur-2xl bg-white/95 border-t border-gray-100 shadow-[0_-4px_20px_rgba(0,0,0,0.04)]"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <div className="flex items-center justify-around px-2 pt-2 pb-1.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = active === item.id;
          const to = item.id === "profile" ? (user ? (user.role === "admin" ? "/admin" : "/profile") : "/login") : item.to;

          return (
            <Link
              key={item.id}
              to={to}
              data-testid={`nav-${item.id}`}
              className={`flex flex-col items-center justify-center gap-0.5 py-1 px-3 rounded-2xl transition-all duration-200 relative min-w-[56px] ${
                isActive ? "text-[#E05A33]" : "text-[#8C8C8C]"
              }`}
            >
              <div className="relative">
                <Icon size={22} strokeWidth={isActive ? 2.2 : 1.5} fill={isActive ? "currentColor" : "none"} />
                {item.id === "cart" && cart.count > 0 && (
                  <span className="absolute -top-1.5 -right-2.5 w-4 h-4 bg-[#E05A33] text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                    {cart.count > 9 ? "9+" : cart.count}
                  </span>
                )}
              </div>
              <span className={`text-[10px] font-body transition-all duration-200 ${isActive ? "font-semibold" : "font-medium"}`}>
                {item.id === "profile" && user ? user.name?.split(" ")[0] || "Profil" : item.label}
              </span>
              {isActive && <div className="absolute -bottom-1.5 w-5 h-0.5 bg-[#E05A33] rounded-full" />}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
