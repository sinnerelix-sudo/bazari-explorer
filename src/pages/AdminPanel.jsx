import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { api as ax, API_BASE as API } from "@/lib/api";
import { uploadToCloudinary } from "@/lib/cloudinaryUpload";
import {
  Plus, Pencil, Trash2, Package, Tag, LayoutGrid, Users, LogOut,
  ChevronLeft, Upload, X, Image as ImageIcon, Bell, Shield, BarChart3,
  Send, Eye
} from "lucide-react";

/* ═══════════ Sidebar ═══════════ */
function Sidebar({ activeTab, setActiveTab, user, onLogout }) {
  const tabs = [
    { id: "dashboard", label: "Dashboard", icon: BarChart3 },
    { id: "products", label: "Məhsullar", icon: Package },
    { id: "categories", label: "Kateqoriyalar", icon: LayoutGrid },
    { id: "campaigns", label: "Kampaniyalar", icon: Tag },
    ...(user?.role === "admin" ? [
      { id: "users", label: "İstifadəçilər", icon: Users },
      { id: "notifications", label: "Bildirişlər", icon: Bell },
      { id: "security", label: "Təhlükəsizlik", icon: Shield },
    ] : []),
  ];
  return (
    <aside data-testid="admin-sidebar" className="w-60 bg-white border-r border-gray-100 min-h-screen hidden lg:flex flex-col p-4">
      <Link to="/" className="flex items-center gap-2 mb-6 px-2">
        <div className="w-8 h-8 rounded-xl bg-[#E05A33] flex items-center justify-center">
          <span className="text-white font-heading font-bold text-sm">M</span>
        </div>
        <span className="font-heading font-bold text-base text-[#1A1A1A]">Admin Panel</span>
      </Link>
      <nav className="space-y-0.5 flex-1">
        {tabs.map((t) => {
          const Icon = t.icon;
          return (
            <button key={t.id} data-testid={`admin-tab-${t.id}`} onClick={() => setActiveTab(t.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-body text-sm transition-colors ${activeTab === t.id ? "bg-[#FFF0E6] text-[#E05A33] font-semibold" : "text-[#595959] hover:bg-gray-50"}`}>
              <Icon size={17} /> {t.label}
            </button>
          );
        })}
      </nav>
      <button onClick={onLogout} className="flex items-center gap-2 text-sm text-[#8C8C8C] hover:text-[#E05A33] font-body px-3 py-2">
        <LogOut size={16} /> Çıxış
      </button>
    </aside>
  );
}

/* ═══════════ Product Form ═══════════ */
function ProductForm({ product, categories, onSave, onCancel }) {
  const [form, setForm] = useState(product || { name: "", description: "", price: 0, original_price: 0, discount: 0, images: [], brand: "", stock: 100, badge: "", category_id: "", seo_title: "", seo_description: "" });
  const [imageUrl, setImageUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadToCloudinary(file, { folder: "modamall/products" });
      set("images", [...form.images, url]);
    } catch (err) {
      console.error(err);
      alert("Yükləmə xətası: " + (err?.message || "naməlum"));
    } finally {
      setUploading(false);
    }
  };

  return (
    <form onSubmit={async (e) => { e.preventDefault(); setSaving(true); try { await onSave(form); } finally { setSaving(false); } }} className="space-y-4 max-w-2xl">
      <div><label className="block font-body text-sm text-[#595959] mb-1">Ad *</label>
        <input data-testid="product-name-input" value={form.name} onChange={(e) => set("name", e.target.value)} required className="w-full px-4 py-2.5 rounded-xl bg-[#F5F3F0] border border-transparent focus:border-[#E05A33] focus:bg-white outline-none font-body text-sm" /></div>
      <div><label className="block font-body text-sm text-[#595959] mb-1">Təsvir</label>
        <textarea data-testid="product-desc-input" value={form.description} onChange={(e) => set("description", e.target.value)} rows={3} className="w-full px-4 py-2.5 rounded-xl bg-[#F5F3F0] border border-transparent focus:border-[#E05A33] focus:bg-white outline-none font-body text-sm resize-none" /></div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div><label className="block font-body text-sm text-[#595959] mb-1">Qiymət *</label>
          <input data-testid="product-price-input" type="number" step="0.01" value={form.price} onChange={(e) => set("price", parseFloat(e.target.value) || 0)} required className="w-full px-4 py-2.5 rounded-xl bg-[#F5F3F0] border border-transparent focus:border-[#E05A33] focus:bg-white outline-none font-body text-sm" /></div>
        <div><label className="block font-body text-sm text-[#595959] mb-1">Köhnə qiymət</label>
          <input type="number" step="0.01" value={form.original_price} onChange={(e) => set("original_price", parseFloat(e.target.value) || 0)} className="w-full px-4 py-2.5 rounded-xl bg-[#F5F3F0] border border-transparent focus:border-[#E05A33] focus:bg-white outline-none font-body text-sm" /></div>
        <div><label className="block font-body text-sm text-[#595959] mb-1">Endirim %</label>
          <input type="number" value={form.discount} onChange={(e) => set("discount", parseInt(e.target.value) || 0)} className="w-full px-4 py-2.5 rounded-xl bg-[#F5F3F0] border border-transparent focus:border-[#E05A33] focus:bg-white outline-none font-body text-sm" /></div>
        <div><label className="block font-body text-sm text-[#595959] mb-1">Stok</label>
          <input type="number" value={form.stock} onChange={(e) => set("stock", parseInt(e.target.value) || 0)} className="w-full px-4 py-2.5 rounded-xl bg-[#F5F3F0] border border-transparent focus:border-[#E05A33] focus:bg-white outline-none font-body text-sm" /></div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div><label className="block font-body text-sm text-[#595959] mb-1">Kateqoriya</label>
          <select value={form.category_id || ""} onChange={(e) => set("category_id", e.target.value)} className="w-full px-4 py-2.5 rounded-xl bg-[#F5F3F0] border border-transparent focus:border-[#E05A33] outline-none font-body text-sm">
            <option value="">Seçin</option>
            {categories?.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select></div>
        <div><label className="block font-body text-sm text-[#595959] mb-1">Brend</label>
          <input value={form.brand || ""} onChange={(e) => set("brand", e.target.value)} className="w-full px-4 py-2.5 rounded-xl bg-[#F5F3F0] border border-transparent focus:border-[#E05A33] focus:bg-white outline-none font-body text-sm" /></div>
      </div>
      {/* Images */}
      <div>
        <label className="block font-body text-sm text-[#595959] mb-2">Şəkillər</label>
        <div className="flex flex-wrap gap-2 mb-3">
          {form.images?.map((img, i) => (
            <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden border border-gray-200">
              <img src={img} alt="" className="w-full h-full object-cover" />
              <button type="button" onClick={() => set("images", form.images.filter((_, j) => j !== i))} className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center"><X size={10} /></button>
            </div>
          ))}
        </div>
        <div className="flex gap-2 flex-wrap">
          <label className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#F5F3F0] hover:bg-[#EBEBEB] cursor-pointer font-body text-sm text-[#595959]">
            <Upload size={14} /> {uploading ? "Yüklənir..." : "Fayldan"}
            <input type="file" accept="image/*" onChange={handleUpload} className="hidden" disabled={uploading} />
          </label>
          <div className="flex gap-1.5 flex-1 min-w-[200px]">
            <input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="URL əlavə et" className="flex-1 px-3 py-2 rounded-xl bg-[#F5F3F0] border border-transparent focus:border-[#E05A33] outline-none font-body text-sm" />
            <button type="button" onClick={() => { if (imageUrl.trim()) { set("images", [...(form.images || []), imageUrl.trim()]); setImageUrl(""); } }} className="px-3 py-2 rounded-xl bg-[#F5F3F0] hover:bg-[#EBEBEB] font-body text-sm"><ImageIcon size={16} /></button>
          </div>
        </div>
      </div>
      <div className="flex gap-3 pt-2">
        <button data-testid="save-product-btn" type="submit" disabled={saving} className="bg-[#E05A33] hover:bg-[#D94A22] text-white px-6 py-2.5 rounded-full font-body font-semibold text-sm disabled:opacity-50">{saving ? "Saxlanır..." : "Saxla"}</button>
        <button type="button" onClick={onCancel} className="px-6 py-2.5 rounded-full border border-gray-200 font-body text-sm text-[#595959] hover:bg-gray-50">Ləğv et</button>
      </div>
    </form>
  );
}

/* ═══════════ Main Admin Panel ═══════════ */
export default function AdminPanel() {
  const { user, logout, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState("dashboard");
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [users, setUsers] = useState([]);
  const [editProd, setEditProd] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});
  // 2FA
  const [qrData, setQrData] = useState(null);
  const [totpCode, setTotpCode] = useState("");
  const [twoFaMsg, setTwoFaMsg] = useState("");
  // Notification
  const [notifTitle, setNotifTitle] = useState("");
  const [notifMsg, setNotifMsg] = useState("");
  // Category form
  const [catForm, setCatForm] = useState(null);

  useEffect(() => {
    if (!user) return;
    if (user.role !== "admin" && user.role !== "seller") { navigate("/"); return; }
    load();
  }, [user, tab]);

  const load = async () => {
    setLoading(true);
    try {
      if (tab === "dashboard") {
        const [pRes, uRes, cRes] = await Promise.all([ax.get("/products?limit=1000"), ax.get("/admin/users").catch(() => ({ data: [] })), ax.get("/categories")]);
        setStats({ products: pRes.data.total || 0, users: uRes.data?.length || 0, categories: cRes.data?.length || 0 });
        setCategories(cRes.data || []);
      } else if (tab === "products") {
        const [pRes, cRes] = await Promise.all([ax.get("/products?limit=100"), ax.get("/categories")]);
        setProducts(pRes.data.products || []); setCategories(cRes.data || []);
      } else if (tab === "categories") {
        const { data } = await ax.get("/categories"); setCategories(data || []);
      } else if (tab === "users") {
        const { data } = await ax.get("/admin/users"); setUsers(data || []);
      }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleSaveProd = async (form) => {
    if (editProd) await ax.put(`/products/${editProd.id}`, form);
    else await ax.post("/products", form);
    setShowForm(false); setEditProd(null); load();
  };
  const handleDeleteProd = async (id) => { if (window.confirm("Silmək?")) { await ax.delete(`/products/${id}`); load(); } };
  const handleRoleChange = async (uid, role) => { await ax.put(`/admin/users/${uid}/role`, { role }); load(); };

  const handleSaveCat = async (e) => {
    e.preventDefault();
    if (catForm.id) await ax.put(`/categories/${catForm.id}`, catForm);
    else await ax.post("/categories", catForm);
    setCatForm(null); load();
  };

  const setup2FA = async () => { const { data } = await ax.post("/auth/2fa/setup"); setQrData(data); setTwoFaMsg(""); };
  const verify2FA = async () => {
    try { await ax.post("/auth/2fa/verify", { code: totpCode }); setTwoFaMsg("2FA aktivdir!"); setQrData(null); setTotpCode(""); }
    catch { setTwoFaMsg("Kod yanlışdır"); }
  };
  const sendNotif = async () => {
    try {
      // Send both push + in-app
      await ax.post("/push/send", { title: notifTitle, message: notifMsg, url: "/" });
      setNotifTitle(""); setNotifMsg(""); alert("Push + in-app bildiriş göndərildi!");
    } catch {
      // Fallback to in-app only
      await ax.post("/notifications/send", { title: notifTitle, message: notifMsg, type: "deal" });
      setNotifTitle(""); setNotifMsg(""); alert("In-app bildiriş göndərildi!");
    }
  };

  const handleLogout = async () => { await logout(); navigate("/"); };
  
  // Show loading while auth is checking
  if (!user && authLoading) {
    return (
      <div className="min-h-screen bg-[#FDFCFB] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#E05A33] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  
  // Redirect if not authenticated
  if (!user) {
    return (
      <div className="min-h-screen bg-[#FDFCFB] flex items-center justify-center">
        <div className="text-center">
          <p className="font-body text-[#595959] mb-4">Daxil olmaq lazımdır</p>
          <Link to="/login" className="bg-[#E05A33] text-white px-6 py-2.5 rounded-full font-body font-semibold text-sm">Daxil ol</Link>
        </div>
      </div>
    );
  }

  return (
    <div data-testid="admin-panel" className="min-h-screen bg-[#FDFCFB] flex">
      <Sidebar activeTab={tab} setActiveTab={setTab} user={user} onLogout={handleLogout} />

      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between">
        <button onClick={() => navigate("/")} className="p-1.5 rounded-lg hover:bg-gray-50"><ChevronLeft size={20} /></button>
        <span className="font-heading font-bold text-base">Admin</span>
        <button onClick={handleLogout} className="p-1.5 rounded-lg hover:bg-gray-50"><LogOut size={17} className="text-[#595959]" /></button>
      </div>
      <div className="lg:hidden fixed top-[48px] left-0 right-0 z-40 bg-white border-b border-gray-100 flex overflow-x-auto scrollbar-hide px-2">
        {["dashboard", "products", "categories", ...(user.role === "admin" ? ["users", "notifications", "security"] : [])].map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`px-3 py-2 text-xs font-body whitespace-nowrap border-b-2 ${tab === t ? "text-[#E05A33] font-semibold border-[#E05A33]" : "text-[#8C8C8C] border-transparent"}`}>
            {t === "dashboard" ? "Panel" : t === "products" ? "Məhsul" : t === "categories" ? "Kateqor." : t === "users" ? "İstifadəçi" : t === "notifications" ? "Bildiriş" : "2FA"}
          </button>
        ))}
      </div>

      <main className="flex-1 p-4 sm:p-6 lg:p-8 pt-24 lg:pt-8 overflow-auto">
        <div className="max-w-5xl mx-auto">

          {/* ── Dashboard ── */}
          {tab === "dashboard" && (
            <>
              <h1 className="font-heading font-bold text-xl mb-6">Dashboard</h1>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-8">
                {[
                  { label: "Məhsullar", val: stats.products || 0, color: "bg-[#E05A33]/10 text-[#E05A33]" },
                  { label: "İstifadəçilər", val: stats.users || 0, color: "bg-blue-50 text-blue-600" },
                  { label: "Kateqoriyalar", val: stats.categories || 0, color: "bg-green-50 text-green-600" },
                ].map((s) => (
                  <div key={s.label} className="bg-white rounded-2xl border border-gray-50 p-5">
                    <p className="font-body text-sm text-[#8C8C8C]">{s.label}</p>
                    <p className={`font-heading font-bold text-2xl mt-1 ${s.color.split(" ")[1]}`}>{s.val}</p>
                  </div>
                ))}
              </div>
              <div className="bg-white rounded-2xl border border-gray-50 p-5">
                <h3 className="font-heading font-semibold text-base mb-3">Sürətli hərəkətlər</h3>
                <div className="flex flex-wrap gap-2">
                  <button onClick={() => { setTab("products"); setShowForm(true); setEditProd(null); }} className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#E05A33] text-white font-body text-sm font-medium"><Plus size={14} /> Yeni məhsul</button>
                  <button onClick={() => setTab("notifications")} className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#F5F3F0] text-[#595959] font-body text-sm"><Bell size={14} /> Bildiriş göndər</button>
                </div>
              </div>
            </>
          )}

          {/* ── Products ── */}
          {tab === "products" && (
            <>
              <div className="flex items-center justify-between mb-5">
                <h1 className="font-heading font-bold text-xl">Məhsullar ({products.length})</h1>
                <button data-testid="add-product-btn" onClick={() => { setEditProd(null); setShowForm(true); }} className="bg-[#E05A33] hover:bg-[#D94A22] text-white px-4 py-2 rounded-full font-body font-semibold text-sm flex items-center gap-2"><Plus size={16} /> Yeni</button>
              </div>
              {showForm ? (
                <ProductForm product={editProd} categories={categories} onSave={handleSaveProd} onCancel={() => { setShowForm(false); setEditProd(null); }} />
              ) : loading ? (
                <div className="flex justify-center py-12"><div className="w-8 h-8 border-2 border-[#E05A33] border-t-transparent rounded-full animate-spin" /></div>
              ) : (
                <div className="space-y-2">
                  {products.map((p) => (
                    <div key={p.id} data-testid={`admin-product-${p.id}`} className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-50 hover:shadow-sm">
                      <div className="w-14 h-14 rounded-lg overflow-hidden bg-[#F5F3F0] flex-shrink-0">
                        {p.images?.[0] ? <img src={p.images[0]} alt="" className="w-full h-full object-cover" /> : <Package size={18} className="m-auto mt-4 text-[#8C8C8C]" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-body font-semibold text-sm text-[#1A1A1A] truncate">{p.name}</h3>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="font-heading font-bold text-sm text-[#E05A33]">{p.price} ₼</span>
                          {p.discount > 0 && <span className="text-[10px] font-bold text-white bg-[#E05A33] px-1.5 py-0.5 rounded">-{p.discount}%</span>}
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Link to={`/product/${p.id}`} className="p-2 rounded-lg hover:bg-gray-50"><Eye size={15} className="text-[#8C8C8C]" /></Link>
                        <button onClick={() => { setEditProd(p); setShowForm(true); }} className="p-2 rounded-lg hover:bg-gray-50"><Pencil size={15} className="text-[#595959]" /></button>
                        <button onClick={() => handleDeleteProd(p.id)} className="p-2 rounded-lg hover:bg-red-50"><Trash2 size={15} className="text-red-400" /></button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* ── Categories ── */}
          {tab === "categories" && (
            <>
              <div className="flex items-center justify-between mb-5">
                <h1 className="font-heading font-bold text-xl">Kateqoriyalar ({categories.length})</h1>
                {user.role === "admin" && (
                  <button onClick={() => setCatForm({ name: "", name_ru: "", slug: "", image: "", order: categories.length + 1 })} className="bg-[#E05A33] text-white px-4 py-2 rounded-full font-body font-semibold text-sm flex items-center gap-2"><Plus size={16} /> Yeni</button>
                )}
              </div>
              {catForm && (
                <form onSubmit={handleSaveCat} className="bg-white rounded-2xl border border-gray-50 p-5 mb-5 space-y-3 max-w-lg">
                  <div className="grid grid-cols-2 gap-3">
                    <input placeholder="Ad (AZ)" value={catForm.name} onChange={(e) => setCatForm({ ...catForm, name: e.target.value })} required className="px-3 py-2 rounded-xl bg-[#F5F3F0] font-body text-sm outline-none focus:ring-1 focus:ring-[#E05A33]" />
                    <input placeholder="Ad (RU)" value={catForm.name_ru} onChange={(e) => setCatForm({ ...catForm, name_ru: e.target.value })} className="px-3 py-2 rounded-xl bg-[#F5F3F0] font-body text-sm outline-none" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <input placeholder="Slug" value={catForm.slug} onChange={(e) => setCatForm({ ...catForm, slug: e.target.value })} required className="px-3 py-2 rounded-xl bg-[#F5F3F0] font-body text-sm outline-none" />
                    <input placeholder="Şəkil URL" value={catForm.image} onChange={(e) => setCatForm({ ...catForm, image: e.target.value })} className="px-3 py-2 rounded-xl bg-[#F5F3F0] font-body text-sm outline-none" />
                  </div>
                  <div className="flex gap-2">
                    <button type="submit" className="bg-[#E05A33] text-white px-5 py-2 rounded-full font-body text-sm font-semibold">Saxla</button>
                    <button type="button" onClick={() => setCatForm(null)} className="px-5 py-2 rounded-full border border-gray-200 font-body text-sm">Ləğv</button>
                  </div>
                </form>
              )}
              {loading ? <div className="flex justify-center py-12"><div className="w-8 h-8 border-2 border-[#E05A33] border-t-transparent rounded-full animate-spin" /></div> : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {categories.map((c) => (
                    <div key={c.id} className="bg-white rounded-xl border border-gray-50 p-3 text-center">
                      {c.image && <img src={c.image} alt="" className="w-16 h-16 rounded-xl object-cover mx-auto mb-2" />}
                      <p className="font-body font-semibold text-sm text-[#1A1A1A]">{c.name}</p>
                      <p className="font-body text-[10px] text-[#8C8C8C]">{c.name_ru}</p>
                      {user.role === "admin" && (
                        <button onClick={() => setCatForm(c)} className="mt-2 text-[10px] text-[#E05A33] font-body font-medium hover:underline">Redaktə</button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* ── Users ── */}
          {tab === "users" && user.role === "admin" && (
            <>
              <h1 className="font-heading font-bold text-xl mb-5">İstifadəçilər ({users.length})</h1>
              {loading ? <div className="flex justify-center py-12"><div className="w-8 h-8 border-2 border-[#E05A33] border-t-transparent rounded-full animate-spin" /></div> : (
                <div className="space-y-2">
                  {users.map((u) => (
                    <div key={u.user_id} data-testid={`admin-user-${u.user_id}`} className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-50">
                      <div className="w-10 h-10 rounded-full bg-[#E05A33]/10 flex items-center justify-center flex-shrink-0">
                        <span className="font-heading font-bold text-sm text-[#E05A33]">{u.name?.[0] || "?"}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-body font-semibold text-sm truncate">{u.name}</p>
                        <p className="font-body text-xs text-[#8C8C8C] truncate">{u.email}</p>
                      </div>
                      <select value={u.role} onChange={(e) => handleRoleChange(u.user_id, e.target.value)} className="px-2 py-1 rounded-lg bg-[#F5F3F0] font-body text-xs outline-none">
                        <option value="customer">Müştəri</option>
                        <option value="seller">Satıcı</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* ── Notifications ── */}
          {tab === "notifications" && user.role === "admin" && (
            <>
              <h1 className="font-heading font-bold text-xl mb-5">Bildiriş göndər</h1>
              <div className="bg-white rounded-2xl border border-gray-50 p-5 max-w-lg space-y-3">
                <input data-testid="notif-title" placeholder="Başlıq" value={notifTitle} onChange={(e) => setNotifTitle(e.target.value)} className="w-full px-4 py-2.5 rounded-xl bg-[#F5F3F0] font-body text-sm outline-none focus:ring-1 focus:ring-[#E05A33]" />
                <textarea data-testid="notif-msg" placeholder="Mesaj" value={notifMsg} onChange={(e) => setNotifMsg(e.target.value)} rows={3} className="w-full px-4 py-2.5 rounded-xl bg-[#F5F3F0] font-body text-sm outline-none resize-none" />
                <button data-testid="send-notif-btn" onClick={sendNotif} disabled={!notifTitle} className="bg-[#E05A33] text-white px-6 py-2.5 rounded-full font-body font-semibold text-sm flex items-center gap-2 disabled:opacity-50"><Send size={14} /> Hamıya göndər</button>
              </div>
            </>
          )}

          {/* ── 2FA Security ── */}
          {tab === "security" && user.role === "admin" && (
            <>
              <h1 className="font-heading font-bold text-xl mb-5">2FA Təhlükəsizlik</h1>
              <div className="bg-white rounded-2xl border border-gray-50 p-5 max-w-lg">
                {!qrData ? (
                  <div>
                    <p className="font-body text-sm text-[#595959] mb-4">Google Authenticator ilə 2 addımlı doğrulama aktivləşdirin.</p>
                    <button data-testid="setup-2fa-btn" onClick={setup2FA} className="bg-[#E05A33] text-white px-6 py-2.5 rounded-full font-body font-semibold text-sm"><Shield size={14} className="inline mr-2" />2FA Aktivləşdir</button>
                    {twoFaMsg && <p className="mt-3 font-body text-sm text-green-600">{twoFaMsg}</p>}
                  </div>
                ) : (
                  <div className="text-center space-y-4">
                    <p className="font-body text-sm text-[#595959]">Google Authenticator ilə QR kodu skan edin:</p>
                    <img src={qrData.qr_code} alt="QR" className="w-48 h-48 mx-auto rounded-xl" />
                    <p className="font-body text-[10px] text-[#8C8C8C] break-all">Gizli açar: {qrData.secret}</p>
                    <div className="flex gap-2 justify-center">
                      <input data-testid="totp-code-input" value={totpCode} onChange={(e) => setTotpCode(e.target.value)} placeholder="6 rəqəmli kod" maxLength={6} className="w-32 px-4 py-2.5 rounded-xl bg-[#F5F3F0] text-center font-body text-lg tracking-widest outline-none" />
                      <button data-testid="verify-2fa-btn" onClick={verify2FA} className="bg-[#E05A33] text-white px-5 py-2.5 rounded-full font-body font-semibold text-sm">Təsdiqlə</button>
                    </div>
                    {twoFaMsg && <p className={`font-body text-sm ${twoFaMsg.includes("aktiv") ? "text-green-600" : "text-red-500"}`}>{twoFaMsg}</p>}
                  </div>
                )}
              </div>
            </>
          )}

          {/* Campaigns placeholder */}
          {tab === "campaigns" && (
            <div className="text-center py-16">
              <Tag size={40} className="mx-auto text-[#8C8C8C] mb-3" />
              <p className="font-body text-[#8C8C8C]">Kampaniya idarəetməsi tezliklə</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
