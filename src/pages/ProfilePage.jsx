import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import axios from "axios";
import {
  User as UserIcon,
  ShoppingBag,
  Heart,
  Bell,
  Settings,
  LogOut,
  ChevronRight,
  Package,
  MapPin,
  ChevronLeft,
  Mail,
  Phone,
  Lock,
  Trash2,
  Edit2,
  Check,
  Search
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
  const [orders, setOrders] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [profileForm, setProfileForm] = useState({ name: "", phone: "" });
  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [activeSection, setActiveSection] = useState("overview");

  useEffect(() => {
    if (user) {
      setProfileForm({ 
        name: user.name || "", 
        phone: user.phone || "" 
      });
    }
  }, [user]);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate("/login");
      return;
    }
    if (user.role === "admin" || user.role === "seller") {
      navigate("/admin");
      return;
    }

    if (activeSection === "notifications") loadNotifications();
    if (activeSection === "orders") loadOrders();
    if (activeSection === "addresses") loadAddresses();
    if (activeSection === "favorites") loadFavorites();
  }, [user, authLoading, activeSection, navigate]);

  const loadNotifications = async () => {
    try {
      const { data } = await axios.get(`${API}/notifications`, { withCredentials: true });
      setNotifications(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Notifications load error:", err);
    }
  };

  const loadOrders = async () => {
    // Mock orders
    setOrders([
      { id: "ORD-001", date: "2026-04-20", total: 53.85, status: "Tamamlanıb", items: [{ name: "Super Crest 2400W", qty: 1 }] },
    ]);
  };

  const loadAddresses = async () => {
    setAddresses([
      { id: 1, title: "Ev", address: "Bakı ş., Nərimanov r., A.Nemətulla küç. 45", is_default: true },
    ]);
  };

  const loadFavorites = async () => {
    try {
      const { data } = await axios.get(`${API}/products?limit=10`, { withCredentials: true });
      setFavorites(data?.products || []);
    } catch (err) {
      console.error("Favorites load error:", err);
    }
  };

  const handleUpdateProfile = async (e) => {
    if (e) e.preventDefault();
    setUpdatingProfile(true);
    try {
      const { data } = await axios.put(`${API}/auth/profile`, profileForm, { withCredentials: true });
      window.alert("Profil yeniləndi");
      // Optionally update local user state if needed, but AuthContext should re-sync
    } catch (err) {
      window.alert(err.response?.data?.error || "Xəta baş verdi");
    } finally {
      setUpdatingProfile(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-[#FDFCFB] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#E05A33] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const menuItems = [
    { id: "orders", label: "Sifarişlərim", icon: Package, desc: "Sifariş tarixçəsi" },
    { id: "favorites", label: "Sevimlilər", icon: Heart, desc: "Sevimli məhsullar" },
    { id: "notifications", label: "Bildirişlər", icon: Bell, desc: "Bütün bildirişlər" },
    { id: "addresses", label: "Ünvanlarım", icon: MapPin, desc: "Çatdırılma ünvanları" },
    { id: "settings", label: "Hesab parametrləri", icon: Settings, desc: "Profil məlumatları" },
  ];

  return (
    <div data-testid="profile-page" className="min-h-screen bg-[#FDFCFB]">
      <Header />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pb-24 md:pb-12">
        {/* Header navigation */}
        <div className="flex items-center gap-3 py-3">
          <button onClick={() => activeSection === "overview" ? navigate(-1) : setActiveSection("overview")} className="p-2 -ml-2 rounded-xl hover:bg-gray-50">
            <ChevronLeft size={22} />
          </button>
          <span className="font-heading font-bold text-lg">
            {activeSection === "overview" ? "Profilim" : menuItems.find(m => m.id === activeSection)?.label || "Profil"}
          </span>
        </div>

        {activeSection === "overview" ? (
          <>
            {/* Profile Summary */}
            <div data-testid="profile-header" className="bg-white rounded-2xl border border-gray-50 p-5 sm:p-6 mb-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-[#E05A33]/10 flex items-center justify-center flex-shrink-0">
                  <UserIcon size={32} className="text-[#E05A33]" />
                </div>
                <div className="flex-1 min-w-0">
                  <h1 className="font-heading font-bold text-lg text-[#1A1A1A] truncate">{user.name}</h1>
                  <p className="font-body text-sm text-[#8C8C8C] truncate">{user.email}</p>
                  {user.phone && <p className="font-body text-xs text-[#8C8C8C] mt-0.5">{user.phone}</p>}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3 mt-5">
                {[
                  { label: "Səbət", val: cart.count || 0, to: "/cart" },
                  { label: "Sifariş", val: orders.length || 0, to: "#" },
                  { label: "Sevimli", val: favorites.length || 0, to: "#" },
                ].map((s, idx) => (
                  <button key={idx} onClick={() => s.label === "Səbət" ? navigate(s.to) : (s.label === "Sifariş" ? setActiveSection("orders") : setActiveSection("favorites"))} className="bg-[#F5F3F0] rounded-xl p-3 text-center hover:bg-[#EBEBEB] transition-colors">
                    <p className="font-heading font-bold text-lg text-[#1A1A1A]">{s.val}</p>
                    <p className="font-body text-xs text-[#8C8C8C]">{s.label}</p>
                  </button>
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
                    onClick={() => setActiveSection(item.id)}
                    className="w-full flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-50 hover:shadow-sm transition-all text-left"
                  >
                    <div className="w-10 h-10 rounded-xl bg-[#F5F3F0] flex items-center justify-center flex-shrink-0">
                      <Icon size={18} className="text-[#595959]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-body font-semibold text-sm text-[#1A1A1A]">{item.label}</p>
                      <p className="font-body text-xs text-[#8C8C8C]">{item.desc}</p>
                    </div>
                    <ChevronRight size={16} className="text-[#8C8C8C]" />
                  </button>
                );
              })}
            </div>

            <div className="mt-4">
              <PushNotificationToggle />
            </div>

            <button
              data-testid="profile-logout"
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 p-4 mt-4 bg-white rounded-xl border border-gray-50 text-red-500 font-body font-medium text-sm hover:bg-red-50 transition-colors"
            >
              <LogOut size={16} /> Çıxış
            </button>
          </>
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            {activeSection === "notifications" && (
              <div data-testid="profile-notifications" className="bg-white rounded-2xl border border-gray-50 divide-y divide-gray-50 overflow-hidden">
                {notifications.length === 0 ? (
                  <div className="px-4 py-12 text-center font-body text-sm text-[#8C8C8C]">Bildiriş yoxdur</div>
                ) : (
                  notifications.map((n) => (
                    <div key={n.id || Math.random()} className={`px-4 py-4 ${!n.is_read ? "bg-[#FFF9F6]" : ""}`}>
                      <p className="font-body font-semibold text-sm text-[#1A1A1A]">{n.title}</p>
                      <p className="font-body text-xs text-[#595959] mt-0.5">{n.message}</p>
                      <p className="font-body text-[10px] text-[#8C8C8C] mt-2">{new Date(n.created_at).toLocaleDateString("az-AZ")}</p>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeSection === "orders" && (
              <div className="space-y-3">
                {orders.length === 0 ? (
                  <div className="bg-white p-12 rounded-2xl border border-gray-50 text-center font-body text-sm text-[#8C8C8C]">Sifarişiniz yoxdur</div>
                ) : (
                  orders.map((o) => (
                    <div key={o.id} className="bg-white p-5 rounded-2xl border border-gray-50 shadow-sm">
                      <div className="flex justify-between items-center mb-3">
                        <span className="font-heading font-bold text-sm text-[#1A1A1A]">{o.id}</span>
                        <span className="text-[11px] bg-green-50 text-green-600 px-2.5 py-1 rounded-full font-bold">{o.status}</span>
                      </div>
                      <div className="space-y-1">
                        {o.items.map((i, idx) => (
                          <p key={idx} className="text-sm font-body text-[#595959]">{i.name} x {i.qty}</p>
                        ))}
                      </div>
                      <div className="mt-4 pt-4 border-t border-gray-50 flex justify-between items-center">
                        <span className="text-xs text-[#8C8C8C] font-body">{o.date}</span>
                        <span className="font-heading font-bold text-[#E05A33] text-base">{o.total} ₼</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeSection === "favorites" && (
              <div className="grid grid-cols-2 gap-4">
                {favorites.length === 0 ? (
                  <div className="col-span-2 bg-white p-12 rounded-2xl border border-gray-50 text-center font-body text-sm text-[#8C8C8C]">Sevimli məhsulunuz yoxdur</div>
                ) : (
                  favorites.map((f) => (
                    <Link key={f.id} to={`/product/${f.id}`} className="bg-white rounded-2xl border border-gray-50 overflow-hidden hover:shadow-md transition-shadow group">
                      <div className="aspect-square relative overflow-hidden bg-[#F5F3F0]">
                        <img src={f.images?.[0]} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="" />
                      </div>
                      <div className="p-3">
                        <p className="text-xs font-body font-semibold text-[#1A1A1A] truncate">{f.name}</p>
                        <p className="text-sm font-heading font-bold text-[#E05A33] mt-1">{f.price} ₼</p>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            )}

            {activeSection === "addresses" && (
              <div className="space-y-3">
                {addresses.map((a) => (
                  <div key={a.id} className="bg-white p-5 rounded-2xl border border-gray-50 shadow-sm">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <MapPin size={16} className="text-[#E05A33]" />
                        <h4 className="font-heading font-bold text-sm text-[#1A1A1A]">{a.title}</h4>
                      </div>
                      {a.is_default && <span className="text-[10px] bg-green-50 text-green-600 px-2.5 py-1 rounded-full font-bold uppercase tracking-wider">Əsas</span>}
                    </div>
                    <p className="text-sm font-body text-[#595959] leading-relaxed">{a.address}</p>
                    <div className="mt-4 flex gap-3 pt-4 border-t border-gray-50">
                      <button className="text-xs font-body font-semibold text-[#595959] flex items-center gap-1.5 hover:text-[#E05A33] transition-colors">
                        <Edit2 size={14}/> Redaktə
                      </button>
                      <button className="text-xs font-body font-semibold text-red-400 flex items-center gap-1.5 hover:text-red-500 transition-colors">
                        <Trash2 size={14}/> Sil
                      </button>
                    </div>
                  </div>
                ))}
                <button className="w-full py-4 rounded-2xl border-2 border-dashed border-gray-200 text-[#8C8C8C] font-body text-sm hover:border-[#E05A33] hover:text-[#E05A33] hover:bg-[#FFF9F6] transition-all flex items-center justify-center gap-2 mt-2">
                  <Check size={16} /> Yeni ünvan əlavə et
                </button>
              </div>
            )}

            {activeSection === "settings" && (
              <form onSubmit={handleUpdateProfile} className="bg-white p-6 rounded-2xl border border-gray-50 space-y-5 shadow-sm">
                <div>
                  <label className="block text-xs font-body font-semibold text-[#8C8C8C] mb-2 uppercase tracking-wider">Ad Soyad</label>
                  <div className="relative">
                    <UserIcon size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8C8C8C]" />
                    <input
                      required
                      value={profileForm.name}
                      onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                      className="w-full pl-12 pr-4 py-3 rounded-xl bg-[#F5F3F0] font-body text-sm outline-none border border-transparent focus:border-[#E05A33] focus:bg-white transition-all"
                      placeholder="Məsələn: Əli Əliyev"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-body font-semibold text-[#8C8C8C] mb-2 uppercase tracking-wider">Telefon</label>
                  <div className="relative">
                    <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8C8C8C]" />
                    <input
                      value={profileForm.phone}
                      onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                      className="w-full pl-12 pr-4 py-3 rounded-xl bg-[#F5F3F0] font-body text-sm outline-none border border-transparent focus:border-[#E05A33] focus:bg-white transition-all"
                      placeholder="Məsələn: +994 50 123 45 67"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={updatingProfile}
                  className="w-full bg-[#E05A33] hover:bg-[#D94A22] text-white py-3.5 rounded-xl font-body font-bold text-sm transition-all shadow-lg shadow-[#E05A33]/20 active:scale-[0.98] disabled:opacity-50"
                >
                  {updatingProfile ? "Yadda saxlanılır..." : "Məlumatları yenilə"}
                </button>
              </form>
            )}
          </div>
        )}
      </div>
      <MobileBottomNav />
    </div>
  );
}
