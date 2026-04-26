import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import axios from "axios";
import {
  User as UserIcon, ShoppingBag, Heart, Bell, Settings, LogOut, ChevronRight,
  Package, MapPin, CreditCard, ChevronLeft, Mail, Phone, Lock, Save, Trash2, Edit2, Check
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
      setProfileForm({ name: user.name || "", phone: user.phone || "" });
    }
  }, [user]);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { navigate("/login"); return; }
    if (user.role === "admin" || user.role === "seller") { navigate("/admin"); return; }
    
    if (activeSection === "notifications") loadNotifications();
    if (activeSection === "orders") loadOrders();
    if (activeSection === "addresses") loadAddresses();
    if (activeSection === "favorites") loadFavorites();
  }, [user, authLoading, activeSection]);

  const loadNotifications = async () => {
    try {
      const { data } = await axios.get(`${API}/notifications`, { withCredentials: true });
      setNotifications(data);
    } catch {}
  };

  const loadOrders = async () => {
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
      setFavorites(data.products || []);
    } catch {}
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setUpdatingProfile(true);
    try {
      await axios.put(`${API}/auth/profile`, profileForm, { withCredentials: true });
      window.alert("Profil yeniləndi");
    } catch (err) {
      window.alert(err.response?.data?.error || "Xəta baş verdi");
    } finally {
      setUpdatingProfile(false);
    }
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
    { id: "settings", label: "Hesab parametrləri", icon: Settings, desc: "Profil məlumatları", badge: null },
  ];

  return (
    <div data-testid="profile-page" className="min-h-screen bg-[#FDFCFB]">
      <Header />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pb-24 md:pb-12">
        <div className="sm:hidden flex items-center gap-3 py-3">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-xl hover:bg-gray-50">
            <ChevronLeft size={22} />
          </button>
          <span className="font-heading font-bold text-lg">Profilim</span>
        </div>

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

        <div className="mt-4">
          <PushNotificationToggle />
        </div>

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

        {activeSection === "orders" && (
          <div className="mt-3 space-y-2">
            {orders.length === 0 ? (
              <div className="bg-white p-8 rounded-xl border border-gray-50 text-center font-body text-sm text-[#8C8C8C]">Sifarişiniz yoxdur</div>
            ) : (
              orders.map((o) => (
                <div key={o.id} className="bg-white p-4 rounded-xl border border-gray-50">
                  <div className="flex justify-between mb-2">
                    <span className="font-heading font-bold text-sm">{o.id}</span>
                    <span className="text-xs text-green-600 font-semibold">{o.status}</span>
                  </div>
                  {o.items.map((i, idx) => (
                    <p key={idx} className="text-sm font-body text-[#595959]">{i.name} x {i.qty}</p>
                  ))}
                  <div className="mt-2 pt-2 border-t border-gray-50 flex justify-between">
                    <span className="text-xs text-[#8C8C8C]">{o.date}</span>
                    <span className="font-heading font-bold text-[#E05A33]">{o.total} ₼</span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeSection === "favorites" && (
          <div className="mt-3 grid grid-cols-2 gap-3">
            {favorites.length === 0 ? (
              <div className="col-span-2 bg-white p-8 rounded-xl border border-gray-50 text-center font-body text-sm text-[#8C8C8C]">Sevimli məhsulunuz yoxdur</div>
            ) : (
              favorites.map((f) => (
                <Link key={f.id} to={`/product/${f.id}`} className="bg-white rounded-xl border border-gray-50 overflow-hidden">
                  <img src={f.images?.[0]} className="aspect-square object-cover" alt="" />
                  <div className="p-2">
                    <p className="text-xs font-body font-semibold truncate">{f.name}</p>
                    <p className="text-sm font-heading font-bold text-[#E05A33]">{f.price} ₼</p>
                  </div>
                </Link>
              ))
            )}
          </div>
        )}

        {activeSection === "addresses" && (
          <div className="mt-3 space-y-2">
            {addresses.map((a) => (
              <div key={a.id} className="bg-white p-4 rounded-xl border border-gray-50">
                <div className="flex justify-between items-start mb-1">
                  <h4 className="font-heading font-bold text-sm">{a.title}</h4>
                  {a.is_default && <span className="text-[10px] bg-green-50 text-green-600 px-2 py-0.5 rounded-full font-bold">Əsas</span>}
                </div>
                <p className="text-sm font-body text-[#595959]">{a.address}</p>
                <div className="mt-3 flex gap-2">
                  <button type="button" className="text-xs font-body font-semibold text-[#595959] flex items-center gap-1"><Edit2 size={12}/> Redaktə</button>
                  <button type="button" className="text-xs font-body font-semibold text-red-400 flex items-center gap-1"><Trash2 size={12}/> Sil</button>
                </div>
              </div>
            ))}
            <button type="button" className="w-full py-3 rounded-xl border-2 border-dashed border-gray-200 text-[#8C8C8C] font-body text-sm hover:border-[#E05A33] hover:text-[#E05A33] transition-all">+ Yeni ünvan əlavə et</button>
          </div>
        )}

        {activeSection === "settings" && (
          <form onSubmit={handleUpdateProfile} className="mt-3 bg-white p-5 rounded-xl border border-gray-50 space-y-4">
            <div>
              <label className="block text-xs font-body text-[#8C8C8C] mb-1">Ad Soyad</label>
              <div className="relative">
                <UserIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8C8C8C]" />
                <input
                  value={profileForm.name}
                  onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#F5F3F0] font-body text-sm outline-none focus:ring-1 focus:ring-[#E05A33]"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-body text-[#8C8C8C] mb-1">Telefon</label>
              <div className="relative">
                <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8C8C8C]" />
                <input
                  value={profileForm.phone}
                  onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#F5F3F0] font-body text-sm outline-none focus:ring-1 focus:ring-[#E05A33]"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={updatingProfile}
              className="w-full bg-[#E05A33] text-white py-3 rounded-full font-body font-semibold text-sm disabled:opacity-50"
            >
              {updatingProfile ? "Saxlanılır..." : "Yadda saxla"}
            </button>
          </form>
        )}

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
