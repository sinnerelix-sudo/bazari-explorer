import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import axios from "axios";
import {
  User, ShoppingBag, Heart, Bell, Settings, LogOut, ChevronRight,
  Package, MapPin, CreditCard, ChevronLeft
} from "lucide-react";
import Header from "@/components/layout/Header";
import MobileBottomNav from "@/components/layout/MobileBottomNav";
import { PushNotificationToggle } from "@/components/notifications/PushNotificationBanner";

import { API_BASE as API } from "@/lib/api";

export default function ProfilePage() {
  const { user, logout, loading: authLoading } = useAuth();
  const { cart } = useCart();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [activeSection, setActiveSection] = useState("overview");

  useEffect(() => {
    if (authLoading) return;
    if (!user) { navigate("/login"); return; }
    if (user.role === "admin" || user.role === "seller") { navigate("/admin"); return; }
    loadNotifications();
  }, [user, authLoading]);

  const loadNotifications = async () => {
    try {
      const { data } = await axios.get(`${API}/notifications`, { withCredentials: true });
      setNotifications(data);
    } catch {}
  };

  const handleLogout = async () => { await logout(); navigate("/"); };

  if (authLoading || !user) return (
    <div className="min-h-screen bg-[#FDFCFB] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-[#E05A33] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const menuItems = [
    { id: "orders", label: "Sifarişlərim", icon: Package, desc: "Sifariş tarixçəsi", badge: null },
    { id: "favorites", label: "Sevimlilər", icon: Heart, desc: "Sevimli məhsullar", badge: null },
    { id: "notifications", label: "Bildirişlər", icon: Bell, desc: "Bütün bildirişlər", badge: notifications.filter((n) => !n.is_read).length || null },
    { id: "addresses", label: "Ünvanlarım", icon: MapPin, desc: "Çatdırılma ünvanları", badge: null },
    { id: "payment", label: "Ödəniş üsulları", icon: CreditCard, desc: "Kart məlumatları", badge: null },
    { id: "settings", label: "Hesab parametrləri", icon: Settings, desc: "Profil məlumatları", badge: null },
  ];

  return (
    <div data-testid="profile-page" className="min-h-screen bg-[#FDFCFB]">
      <Header />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pb-24 md:pb-12">
        {/* Mobile back */}
        <div className="sm:hidden flex items-center gap-3 py-3">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-xl hover:bg-gray-50">
            <ChevronLeft size={22} />
          </button>
          <span className="font-heading font-bold text-lg">Profilim</span>
        </div>

        {/* Profile header */}
        <div data-testid="profile-header" className="bg-white rounded-2xl border border-gray-50 p-5 sm:p-6 mt-2 sm:mt-6 mb-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-[#E05A33]/10 flex items-center justify-center flex-shrink-0">
              {user.picture ? (
                <img src={user.picture} alt="" className="w-full h-full rounded-full object-cover" />
              ) : (
                <span className="font-heading font-bold text-2xl text-[#E05A33]">{user.name?.[0] || "?"}</span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="font-heading font-bold text-lg text-[#1A1A1A]">{user.name}</h1>
              <p className="font-body text-sm text-[#8C8C8C]">{user.email}</p>
              {user.phone && <p className="font-body text-xs text-[#8C8C8C] mt-0.5">{user.phone}</p>}
            </div>
          </div>
          {/* Quick stats */}
          <div className="grid grid-cols-3 gap-3 mt-5">
            {[
              { label: "Səbət", val: cart.count || 0, to: "/cart" },
              { label: "Sifariş", val: 0, to: "#" },
              { label: "Sevimli", val: 0, to: "#" },
            ].map((s) => (
              <Link key={s.label} to={s.to} className="bg-[#F5F3F0] rounded-xl p-3 text-center hover:bg-[#EBEBEB] transition-colors">
                <p className="font-heading font-bold text-lg text-[#1A1A1A]">{s.val}</p>
                <p className="font-body text-xs text-[#8C8C8C]">{s.label}</p>
              </Link>
            ))}
          </div>
        </div>

        {/* Menu items */}
        <div className="space-y-1.5">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                data-testid={`profile-${item.id}`}
                onClick={() => setActiveSection(item.id === activeSection ? "overview" : item.id)}
                className="w-full flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-50 hover:shadow-sm transition-all text-left"
              >
                <div className="w-10 h-10 rounded-xl bg-[#F5F3F0] flex items-center justify-center flex-shrink-0">
                  <Icon size={18} className="text-[#595959]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-body font-semibold text-sm text-[#1A1A1A]">{item.label}</p>
                  <p className="font-body text-xs text-[#8C8C8C]">{item.desc}</p>
                </div>
                {item.badge && (
                  <span className="w-5 h-5 bg-[#E05A33] text-white text-[10px] font-bold rounded-full flex items-center justify-center">{item.badge}</span>
                )}
                <ChevronRight size={16} className="text-[#8C8C8C]" />
              </button>
            );
          })}
        </div>

        {/* Push Notification Toggle */}
        <div className="mt-4">
          <PushNotificationToggle />
        </div>

        {/* Notification section expanded */}
        {activeSection === "notifications" && (
          <div data-testid="profile-notifications" className="mt-3 bg-white rounded-xl border border-gray-50 divide-y divide-gray-50 overflow-hidden">
            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center font-body text-sm text-[#8C8C8C]">Bildiriş yoxdur</div>
            ) : (
              notifications.slice(0, 10).map((n) => (
                <div key={n.id} className={`px-4 py-3 ${!n.is_read ? "bg-[#FDFCFB]" : ""}`}>
                  <p className="font-body font-semibold text-sm text-[#1A1A1A]">{n.title}</p>
                  <p className="font-body text-xs text-[#595959] mt-0.5">{n.message}</p>
                  <p className="font-body text-[10px] text-[#8C8C8C] mt-1">{new Date(n.created_at).toLocaleDateString("az-AZ")}</p>
                </div>
              ))
            )}
          </div>
        )}

        {/* Logout */}
        <button
          data-testid="profile-logout"
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 p-4 mt-4 bg-white rounded-xl border border-gray-50 text-red-500 font-body font-medium text-sm hover:bg-red-50 transition-colors"
        >
          <LogOut size={16} /> Çıxış
        </button>
      </div>
      <MobileBottomNav />
    </div>
  );
}
