import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { api as ax } from "@/lib/api";
import { uploadToCloudinary } from "@/lib/cloudinaryUpload";
import {
  AlertCircle,
  BarChart3,
  Bell,
  ChevronLeft,
  CreditCard,
  Eye,
  Image as ImageIcon,
  LayoutGrid,
  LogOut,
  Package,
  Pencil,
  Plus,
  Send,
  Shield,
  Tag,
  Trash2,
  Upload,
  Users,
  X,
} from "lucide-react";

function getAdminTabs(user) {
  return [
    { id: "dashboard", label: "Dashboard", icon: BarChart3 },
    { id: "products", label: "M\u0259hsullar", icon: Package },
    { id: "categories", label: "Kateqoriyalar", icon: LayoutGrid },
    { id: "campaigns", label: "Kampaniyalar", icon: Tag },
    ...(user?.role === "admin"
      ? [
          { id: "payments", label: "\u00D6d\u0259ni\u015Fl\u0259r", icon: CreditCard },
          { id: "users", label: "\u0130stifad\u0259\u00E7il\u0259r", icon: Users },
          { id: "notifications", label: "Bildiri\u015Fl\u0259r", icon: Bell },
          { id: "security", label: "T\u0259hl\u00FCk\u0259sizlik", icon: Shield },
        ]
      : []),
  ];
}

function getMobileTabLabel(tabId) {
  switch (tabId) {
    case "dashboard":
      return "Panel";
    case "products":
      return "M\u0259hsul";
    case "categories":
      return "Kateqor.";
    case "payments":
      return "\u00D6d\u0259ni\u015F";
    case "users":
      return "\u0130stifad\u0259\u00E7i";
    case "notifications":
      return "Bildiri\u015F";
    case "security":
      return "2FA";
    default:
      return tabId;
  }
}

function Sidebar({ activeTab, setActiveTab, user, onLogout }) {
  const tabs = getAdminTabs(user);

  return (
    <aside data-testid="admin-sidebar" className="w-60 bg-white border-r border-gray-100 min-h-screen hidden lg:flex flex-col p-4">
      <Link to="/" className="flex items-center gap-2 mb-6 px-2">
        <div className="w-8 h-8 rounded-xl bg-[#E05A33] flex items-center justify-center">
          <span className="text-white font-heading font-bold text-sm">M</span>
        </div>
        <span className="font-heading font-bold text-base text-[#1A1A1A]">Admin Panel</span>
      </Link>
      <nav className="space-y-0.5 flex-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              data-testid={`admin-tab-${tab.id}`}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-body text-sm transition-colors ${
                activeTab === tab.id
                  ? "bg-[#FFF0E6] text-[#E05A33] font-semibold"
                  : "text-[#595959] hover:bg-gray-50"
              }`}
            >
              <Icon size={17} /> {tab.label}
            </button>
          );
        })}
      </nav>
      <button onClick={onLogout} className="flex items-center gap-2 text-sm text-[#8C8C8C] hover:text-[#E05A33] font-body px-3 py-2">
        <LogOut size={16} /> {"\u00C7\u0131x\u0131\u015F"}
      </button>
    </aside>
  );
}

function ProductForm({ product, categories, onSave, onCancel }) {
  const [form, setForm] = useState(
    product || {
      name: "",
      description: "",
      price: 0,
      original_price: 0,
      discount: 0,
      images: [],
      brand: "",
      stock: 100,
      badge: "",
      category_id: "",
      seo_title: "",
      seo_description: "",
    }
  );
  const [imageUrl, setImageUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const setField = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const handleUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadToCloudinary(file, { folder: "modamall/products" });
      setField("images", [...form.images, url]);
    } catch (err) {
      console.error(err);
      window.alert("Y\u00FCkl\u0259m\u0259 x\u0259tas\u0131: " + (err?.message || "nam\u0259lum"));
    } finally {
      setUploading(false);
    }
  };

  return (
    <form
      onSubmit={async (event) => {
        event.preventDefault();
        setSaving(true);
        try {
          await onSave(form);
        } finally {
          setSaving(false);
        }
      }}
      className="space-y-4 max-w-2xl"
    >
      <div>
        <label className="block font-body text-sm text-[#595959] mb-1">Ad *</label>
        <input
          data-testid="product-name-input"
          value={form.name}
          onChange={(event) => setField("name", event.target.value)}
          required
          className="w-full px-4 py-2.5 rounded-xl bg-[#F5F3F0] border border-transparent focus:border-[#E05A33] focus:bg-white outline-none font-body text-sm"
        />
      </div>

      <div>
        <label className="block font-body text-sm text-[#595959] mb-1">T\u0259svir</label>
        <textarea
          data-testid="product-desc-input"
          value={form.description}
          onChange={(event) => setField("description", event.target.value)}
          rows={3}
          className="w-full px-4 py-2.5 rounded-xl bg-[#F5F3F0] border border-transparent focus:border-[#E05A33] focus:bg-white outline-none font-body text-sm resize-none"
        />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div>
          <label className="block font-body text-sm text-[#595959] mb-1">Qiym\u0259t *</label>
          <input
            data-testid="product-price-input"
            type="number"
            step="0.01"
            value={form.price}
            onChange={(event) => setField("price", parseFloat(event.target.value) || 0)}
            required
            className="w-full px-4 py-2.5 rounded-xl bg-[#F5F3F0] border border-transparent focus:border-[#E05A33] focus:bg-white outline-none font-body text-sm"
          />
        </div>
        <div>
          <label className="block font-body text-sm text-[#595959] mb-1">K\u00F6hn\u0259 qiym\u0259t</label>
          <input
            type="number"
            step="0.01"
            value={form.original_price}
            onChange={(event) => setField("original_price", parseFloat(event.target.value) || 0)}
            className="w-full px-4 py-2.5 rounded-xl bg-[#F5F3F0] border border-transparent focus:border-[#E05A33] focus:bg-white outline-none font-body text-sm"
          />
        </div>
        <div>
          <label className="block font-body text-sm text-[#595959] mb-1">Endirim %</label>
          <input
            type="number"
            value={form.discount}
            onChange={(event) => setField("discount", parseInt(event.target.value, 10) || 0)}
            className="w-full px-4 py-2.5 rounded-xl bg-[#F5F3F0] border border-transparent focus:border-[#E05A33] focus:bg-white outline-none font-body text-sm"
          />
        </div>
        <div>
          <label className="block font-body text-sm text-[#595959] mb-1">Stok</label>
          <input
            type="number"
            value={form.stock}
            onChange={(event) => setField("stock", parseInt(event.target.value, 10) || 0)}
            className="w-full px-4 py-2.5 rounded-xl bg-[#F5F3F0] border border-transparent focus:border-[#E05A33] focus:bg-white outline-none font-body text-sm"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block font-body text-sm text-[#595959] mb-1">Kateqoriya</label>
          <select
            value={form.category_id || ""}
            onChange={(event) => setField("category_id", event.target.value)}
            className="w-full px-4 py-2.5 rounded-xl bg-[#F5F3F0] border border-transparent focus:border-[#E05A33] outline-none font-body text-sm"
          >
            <option value="">{"Se\u00E7in"}</option>
            {categories?.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block font-body text-sm text-[#595959] mb-1">Brend</label>
          <input
            value={form.brand || ""}
            onChange={(event) => setField("brand", event.target.value)}
            className="w-full px-4 py-2.5 rounded-xl bg-[#F5F3F0] border border-transparent focus:border-[#E05A33] focus:bg-white outline-none font-body text-sm"
          />
        </div>
      </div>

      <div>
        <label className="block font-body text-sm text-[#595959] mb-2">{"\u015E\u0259kill\u0259r"}</label>
        <div className="flex flex-wrap gap-2 mb-3">
          {form.images?.map((image, index) => (
            <div key={index} className="relative w-20 h-20 rounded-xl overflow-hidden border border-gray-200">
              <img src={image} alt="" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => setField("images", form.images.filter((_, imageIndex) => imageIndex !== index))}
                className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center"
              >
                <X size={10} />
              </button>
            </div>
          ))}
        </div>
        <div className="flex gap-2 flex-wrap">
          <label className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#F5F3F0] hover:bg-[#EBEBEB] cursor-pointer font-body text-sm text-[#595959]">
            <Upload size={14} /> {uploading ? "Y\u00FCkl\u0259nir..." : "Fayldan"}
            <input type="file" accept="image/*" onChange={handleUpload} className="hidden" disabled={uploading} />
          </label>
          <div className="flex gap-1.5 flex-1 min-w-[200px]">
            <input
              value={imageUrl}
              onChange={(event) => setImageUrl(event.target.value)}
              placeholder="URL \u0259lav\u0259 et"
              className="flex-1 px-3 py-2 rounded-xl bg-[#F5F3F0] border border-transparent focus:border-[#E05A33] outline-none font-body text-sm"
            />
            <button
              type="button"
              onClick={() => {
                if (!imageUrl.trim()) return;
                setField("images", [...(form.images || []), imageUrl.trim()]);
                setImageUrl("");
              }}
              className="px-3 py-2 rounded-xl bg-[#F5F3F0] hover:bg-[#EBEBEB] font-body text-sm"
            >
              <ImageIcon size={16} />
            </button>
          </div>
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <button
          data-testid="save-product-btn"
          type="submit"
          disabled={saving}
          className="bg-[#E05A33] hover:bg-[#D94A22] text-white px-6 py-2.5 rounded-full font-body font-semibold text-sm disabled:opacity-50"
        >
          {saving ? "Saxlan\u0131r..." : "Saxla"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2.5 rounded-full border border-gray-200 font-body text-sm text-[#595959] hover:bg-gray-50"
        >
          {"L\u0259\u011Fv et"}
        </button>
      </div>
    </form>
  );
}

export default function AdminPanel() {
  const { user, logout, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [tab, setTab] = useState("dashboard");
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [users, setUsers] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [whatsappPhone, setWhatsappPhone] = useState("");
  const [whatsappDraft, setWhatsappDraft] = useState("");
  const [whatsappSource, setWhatsappSource] = useState("unset");
  const [whatsappUpdatedAt, setWhatsappUpdatedAt] = useState(null);
  const [whatsappSaving, setWhatsappSaving] = useState(false);
  const [whatsappFeedback, setWhatsappFeedback] = useState("");
  const [editProd, setEditProd] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});
  const [qrData, setQrData] = useState(null);
  const [totpCode, setTotpCode] = useState("");
  const [twoFaMsg, setTwoFaMsg] = useState("");
  const [notifTitle, setNotifTitle] = useState("");
  const [notifMsg, setNotifMsg] = useState("");
  const [catForm, setCatForm] = useState(null);

  const tabs = useMemo(() => getAdminTabs(user), [user]);

  useEffect(() => {
    if (!user) return;
    if (user.role !== "admin" && user.role !== "seller") {
      navigate("/");
      return;
    }
    load();
  }, [user, tab]);

  const load = async () => {
    setLoading(true);
    try {
      if (tab === "dashboard") {
        const [productsRes, usersRes, categoriesRes] = await Promise.all([
          ax.get("/products?limit=1000"),
          ax.get("/admin/users").catch(() => ({ data: [] })),
          ax.get("/categories"),
        ]);
        setStats({
          products: productsRes.data.total || 0,
          users: usersRes.data?.length || 0,
          categories: categoriesRes.data?.length || 0,
        });
        setCategories(categoriesRes.data || []);
      } else if (tab === "products") {
        const [productsRes, categoriesRes] = await Promise.all([
          ax.get("/products?limit=100"),
          ax.get("/categories"),
        ]);
        setProducts(productsRes.data.products || []);
        setCategories(categoriesRes.data || []);
      } else if (tab === "categories") {
        const { data } = await ax.get("/categories");
        setCategories(data || []);
      } else if (tab === "payments") {
        const { data } = await ax.get("/admin/payment-methods");
        setPaymentMethods(data?.methods || []);
        setWhatsappPhone(data?.whatsapp_phone || "");
        setWhatsappDraft(data?.whatsapp_phone || "");
        setWhatsappSource(data?.whatsapp_source || "unset");
        setWhatsappUpdatedAt(data?.whatsapp_updated_at || null);
        setWhatsappFeedback("");
      } else if (tab === "users") {
        const { data } = await ax.get("/admin/users");
        setUsers(data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProd = async (form) => {
    if (editProd) await ax.put(`/products/${editProd.id}`, form);
    else await ax.post("/products", form);
    setShowForm(false);
    setEditProd(null);
    load();
  };

  const handleDeleteProd = async (id) => {
    if (!window.confirm("Silm\u0259k?")) return;
    await ax.delete(`/products/${id}`);
    load();
  };

  const handleRoleChange = async (userId, role) => {
    await ax.put(`/admin/users/${userId}/role`, { role });
    load();
  };

  const handleTogglePaymentMethod = async (id, isActive) => {
    const { data } = await ax.put(`/admin/payment-methods/${id}`, { is_active: !isActive });
    setPaymentMethods((current) => current.map((method) => (method.id === id ? data : method)));
  };

  const handleSaveWhatsappPhone = async (nextPhone) => {
    setWhatsappSaving(true);
    setWhatsappFeedback("");

    try {
      const { data } = await ax.put("/admin/payment-methods/whatsapp-phone", {
        whatsapp_phone: nextPhone,
      });

      setWhatsappPhone(data?.whatsapp_phone || "");
      setWhatsappDraft(data?.whatsapp_phone || "");
      setWhatsappSource(data?.whatsapp_source || "unset");
      setWhatsappUpdatedAt(data?.whatsapp_updated_at || null);
      setWhatsappFeedback(
        data?.whatsapp_phone
          ? "WhatsApp sifari\u015F n\u00F6mr\u0259si yenil\u0259ndi."
          : "WhatsApp sifari\u015F n\u00F6mr\u0259si s\u0131f\u0131rland\u0131."
      );
    } catch (err) {
      setWhatsappFeedback(err?.response?.data?.error || "WhatsApp n\u00F6mr\u0259sini saxlamaq m\u00FCmk\u00FCn olmad\u0131.");
    } finally {
      setWhatsappSaving(false);
    }
  };

  const handleSaveCat = async (event) => {
    event.preventDefault();
    if (catForm.id) await ax.put(`/categories/${catForm.id}`, catForm);
    else await ax.post("/categories", catForm);
    setCatForm(null);
    load();
  };

  const setup2FA = async () => {
    const { data } = await ax.post("/auth/2fa/setup");
    setQrData(data);
    setTwoFaMsg("");
  };

  const verify2FA = async () => {
    try {
      await ax.post("/auth/2fa/verify", { code: totpCode });
      setTwoFaMsg("2FA aktivdir!");
      setQrData(null);
      setTotpCode("");
    } catch {
      setTwoFaMsg("Kod yanl\u0131\u015Fd\u0131r");
    }
  };

  const sendNotif = async () => {
    try {
      await ax.post("/push/send", { title: notifTitle, message: notifMsg, url: "/" });
      setNotifTitle("");
      setNotifMsg("");
      window.alert("Push + in-app bildiri\u015F g\u00F6nd\u0259rildi!");
    } catch {
      await ax.post("/notifications/send", { title: notifTitle, message: notifMsg, type: "deal" });
      setNotifTitle("");
      setNotifMsg("");
      window.alert("In-app bildiri\u015F g\u00F6nd\u0259rildi!");
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  if (!user && authLoading) {
    return (
      <div className="min-h-screen bg-[#FDFCFB] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#E05A33] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#FDFCFB] flex items-center justify-center">
        <div className="text-center">
          <p className="font-body text-[#595959] mb-4">Daxil olmaq laz\u0131md\u0131r</p>
          <Link to="/login" className="bg-[#E05A33] text-white px-6 py-2.5 rounded-full font-body font-semibold text-sm">
            Daxil ol
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div data-testid="admin-panel" className="min-h-screen bg-[#FDFCFB] flex">
      <Sidebar activeTab={tab} setActiveTab={setTab} user={user} onLogout={handleLogout} />

      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between">
        <button onClick={() => navigate("/")} className="p-1.5 rounded-lg hover:bg-gray-50">
          <ChevronLeft size={20} />
        </button>
        <span className="font-heading font-bold text-base">Admin</span>
        <button onClick={handleLogout} className="p-1.5 rounded-lg hover:bg-gray-50">
          <LogOut size={17} className="text-[#595959]" />
        </button>
      </div>

      <div className="lg:hidden fixed top-[48px] left-0 right-0 z-40 bg-white border-b border-gray-100 flex overflow-x-auto scrollbar-hide px-2">
        {tabs.map((currentTab) => (
          <button
            key={currentTab.id}
            onClick={() => setTab(currentTab.id)}
            className={`px-3 py-2 text-xs font-body whitespace-nowrap border-b-2 ${
              tab === currentTab.id ? "text-[#E05A33] font-semibold border-[#E05A33]" : "text-[#8C8C8C] border-transparent"
            }`}
          >
            {getMobileTabLabel(currentTab.id)}
          </button>
        ))}
      </div>

      <main className="flex-1 p-4 sm:p-6 lg:p-8 pt-24 lg:pt-8 overflow-auto">
        <div className="max-w-5xl mx-auto">
          {tab === "dashboard" && (
            <>
              <h1 className="font-heading font-bold text-xl mb-6">Dashboard</h1>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-8">
                {[
                  { label: "M\u0259hsullar", val: stats.products || 0, color: "text-[#E05A33]" },
                  { label: "\u0130stifad\u0259\u00E7il\u0259r", val: stats.users || 0, color: "text-blue-600" },
                  { label: "Kateqoriyalar", val: stats.categories || 0, color: "text-green-600" },
                ].map((stat) => (
                  <div key={stat.label} className="bg-white rounded-2xl border border-gray-50 p-5">
                    <p className="font-body text-sm text-[#8C8C8C]">{stat.label}</p>
                    <p className={`font-heading font-bold text-2xl mt-1 ${stat.color}`}>{stat.val}</p>
                  </div>
                ))}
              </div>
              <div className="bg-white rounded-2xl border border-gray-50 p-5">
                <h3 className="font-heading font-semibold text-base mb-3">{"S\u00FCr\u0259tli h\u0259r\u0259k\u0259tl\u0259r"}</h3>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => {
                      setTab("products");
                      setShowForm(true);
                      setEditProd(null);
                    }}
                    className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#E05A33] text-white font-body text-sm font-medium"
                  >
                    <Plus size={14} /> {"Yeni m\u0259hsul"}
                  </button>
                  {user.role === "admin" && (
                    <>
                      <button
                        onClick={() => setTab("payments")}
                        className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#F5F3F0] text-[#595959] font-body text-sm"
                      >
                        <CreditCard size={14} /> {"\u00D6d\u0259ni\u015Fl\u0259r"}
                      </button>
                      <button
                        onClick={() => setTab("notifications")}
                        className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#F5F3F0] text-[#595959] font-body text-sm"
                      >
                        <Bell size={14} /> {"Bildiri\u015F g\u00F6nd\u0259r"}
                      </button>
                    </>
                  )}
                </div>
              </div>
            </>
          )}

          {tab === "products" && (
            <>
              <div className="flex items-center justify-between mb-5">
                <h1 className="font-heading font-bold text-xl">{"M\u0259hsullar"} ({products.length})</h1>
                <button
                  data-testid="add-product-btn"
                  onClick={() => {
                    setEditProd(null);
                    setShowForm(true);
                  }}
                  className="bg-[#E05A33] hover:bg-[#D94A22] text-white px-4 py-2 rounded-full font-body font-semibold text-sm flex items-center gap-2"
                >
                  <Plus size={16} /> Yeni
                </button>
              </div>

              {showForm ? (
                <ProductForm
                  product={editProd}
                  categories={categories}
                  onSave={handleSaveProd}
                  onCancel={() => {
                    setShowForm(false);
                    setEditProd(null);
                  }}
                />
              ) : loading ? (
                <div className="flex justify-center py-12">
                  <div className="w-8 h-8 border-2 border-[#E05A33] border-t-transparent rounded-full animate-spin" />
                </div>
              ) : (
                <div className="space-y-2">
                  {products.map((product) => (
                    <div
                      key={product.id}
                      data-testid={`admin-product-${product.id}`}
                      className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-50 hover:shadow-sm"
                    >
                      <div className="w-14 h-14 rounded-lg overflow-hidden bg-[#F5F3F0] flex-shrink-0">
                        {product.images?.[0] ? (
                          <img src={product.images[0]} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <Package size={18} className="m-auto mt-4 text-[#8C8C8C]" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-body font-semibold text-sm text-[#1A1A1A] truncate">{product.name}</h3>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="font-heading font-bold text-sm text-[#E05A33]">
                            {product.price} {"\u20BC"}
                          </span>
                          {product.discount > 0 && (
                            <span className="text-[10px] font-bold text-white bg-[#E05A33] px-1.5 py-0.5 rounded">
                              -{product.discount}%
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Link to={`/product/${product.id}`} className="p-2 rounded-lg hover:bg-gray-50">
                          <Eye size={15} className="text-[#8C8C8C]" />
                        </Link>
                        <button onClick={() => { setEditProd(product); setShowForm(true); }} className="p-2 rounded-lg hover:bg-gray-50">
                          <Pencil size={15} className="text-[#595959]" />
                        </button>
                        <button onClick={() => handleDeleteProd(product.id)} className="p-2 rounded-lg hover:bg-red-50">
                          <Trash2 size={15} className="text-red-400" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {tab === "categories" && (
            <>
              <div className="flex items-center justify-between mb-5">
                <h1 className="font-heading font-bold text-xl">Kateqoriyalar ({categories.length})</h1>
                {user.role === "admin" && (
                  <button
                    onClick={() => setCatForm({ name: "", name_ru: "", slug: "", image: "", order: categories.length + 1 })}
                    className="bg-[#E05A33] text-white px-4 py-2 rounded-full font-body font-semibold text-sm flex items-center gap-2"
                  >
                    <Plus size={16} /> Yeni
                  </button>
                )}
              </div>

              {catForm && (
                <form onSubmit={handleSaveCat} className="bg-white rounded-2xl border border-gray-50 p-5 mb-5 space-y-3 max-w-lg">
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      placeholder="Ad (AZ)"
                      value={catForm.name}
                      onChange={(event) => setCatForm({ ...catForm, name: event.target.value })}
                      required
                      className="px-3 py-2 rounded-xl bg-[#F5F3F0] font-body text-sm outline-none focus:ring-1 focus:ring-[#E05A33]"
                    />
                    <input
                      placeholder="Ad (RU)"
                      value={catForm.name_ru}
                      onChange={(event) => setCatForm({ ...catForm, name_ru: event.target.value })}
                      className="px-3 py-2 rounded-xl bg-[#F5F3F0] font-body text-sm outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      placeholder="Slug"
                      value={catForm.slug}
                      onChange={(event) => setCatForm({ ...catForm, slug: event.target.value })}
                      required
                      className="px-3 py-2 rounded-xl bg-[#F5F3F0] font-body text-sm outline-none"
                    />
                    <input
                      placeholder={"\u015E\u0259kil URL"}
                      value={catForm.image}
                      onChange={(event) => setCatForm({ ...catForm, image: event.target.value })}
                      className="px-3 py-2 rounded-xl bg-[#F5F3F0] font-body text-sm outline-none"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button type="submit" className="bg-[#E05A33] text-white px-5 py-2 rounded-full font-body text-sm font-semibold">
                      Saxla
                    </button>
                    <button
                      type="button"
                      onClick={() => setCatForm(null)}
                      className="px-5 py-2 rounded-full border border-gray-200 font-body text-sm"
                    >
                      {"L\u0259\u011Fv"}
                    </button>
                  </div>
                </form>
              )}

              {loading ? (
                <div className="flex justify-center py-12">
                  <div className="w-8 h-8 border-2 border-[#E05A33] border-t-transparent rounded-full animate-spin" />
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {categories.map((category) => (
                    <div key={category.id} className="bg-white rounded-xl border border-gray-50 p-3 text-center">
                      {category.image && (
                        <img src={category.image} alt="" className="w-16 h-16 rounded-xl object-cover mx-auto mb-2" />
                      )}
                      <p className="font-body font-semibold text-sm text-[#1A1A1A]">{category.name}</p>
                      <p className="font-body text-[10px] text-[#8C8C8C]">{category.name_ru}</p>
                      {user.role === "admin" && (
                        <button
                          onClick={() => setCatForm(category)}
                          className="mt-2 text-[10px] text-[#E05A33] font-body font-medium hover:underline"
                        >
                          {"Redakt\u0259"}
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {tab === "payments" && user.role === "admin" && (
            <>
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h1 className="font-heading font-bold text-xl">{"\u00D6d\u0259ni\u015F metodlar\u0131"}</h1>
                  <p className="font-body text-sm text-[#8C8C8C] mt-1">{"Checkout sifari\u015Fl\u0259ri WhatsApp-a y\u00F6nl\u0259ndiril\u0259c\u0259k."}</p>
                </div>
                <div className="px-3 py-2 rounded-full bg-[#F5F3F0] text-xs font-body text-[#595959]">
                  {paymentMethods.filter((method) => method.is_active).length} aktiv
                </div>
              </div>

              <div className="hidden" aria-hidden="true">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="font-heading font-bold text-base text-[#1A1A1A]">WhatsApp sifariş xətti</h2>
                      <span
                        className={`px-2.5 py-1 rounded-full text-[11px] font-body font-semibold ${
                          whatsappPhone ? "bg-green-50 text-green-700" : "bg-[#FFF0B8] text-[#8A6400]"
                        }`}
                      >
                        {whatsappPhone ? "Hazırdır" : "Qurulmayıb"}
                      </span>
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-body font-semibold bg-[#F5F3F0] text-[#595959]">
                        {whatsappSource === "database"
                          ? "Admin panel"
                          : whatsappSource === "env"
                            ? "Env fallback"
                            : "Boş"}
                      </span>
                    </div>
                    <p className="font-body text-sm text-[#8C8C8C] mt-2">
                      Sifariş CTA-sı buradakı nömrəyə yönlənəcək. `+`, boşluq və mötərizə yaza bilərsiniz, server rəqəmləri avtomatik təmizləyəcək.
                    </p>
                    {whatsappUpdatedAt && (
                      <p className="font-body text-xs text-[#8C8C8C] mt-2">
                        Son yenilənmə: {new Date(whatsappUpdatedAt).toLocaleString("az-AZ")}
                      </p>
                    )}
                  </div>

                  <div className="w-full lg:w-[360px]">
                    <label className="block font-body text-sm text-[#595959] mb-2">WhatsApp nömrəsi</label>
                    <input
                      data-testid="whatsapp-phone-input-legacy"
                      value={whatsappDraft}
                      onChange={(event) => setWhatsappDraft(event.target.value)}
                      placeholder="+994 50 123 45 67"
                      className="w-full px-4 py-3 rounded-2xl bg-[#F5F3F0] border border-transparent focus:border-[#E05A33] focus:bg-white outline-none font-body text-sm"
                    />
                    <div className="mt-3 flex flex-wrap gap-2">
                      <button
                        type="button"
                        data-testid="save-whatsapp-phone-btn-legacy"
                        onClick={() => handleSaveWhatsappPhone(whatsappDraft)}
                        disabled={whatsappSaving}
                        className="bg-[#E05A33] hover:bg-[#D94A22] text-white px-4 py-2 rounded-full text-sm font-body font-semibold disabled:opacity-50"
                      >
                        {whatsappSaving ? "Saxlanır..." : "Nömrəni saxla"}
                      </button>
                      <button
                        type="button"
                        data-testid="reset-whatsapp-phone-btn-legacy"
                        onClick={() => handleSaveWhatsappPhone("")}
                        disabled={whatsappSaving || (!whatsappPhone && whatsappSource !== "database")}
                        className="px-4 py-2 rounded-full border border-gray-200 text-sm font-body font-semibold text-[#595959] hover:bg-gray-50 disabled:opacity-50"
                      >
                        Sıfırla
                      </button>
                    </div>
                    {whatsappFeedback && (
                      <p
                        className={`mt-3 text-xs font-body ${
                          whatsappFeedback.includes("mümkün olmadı") || whatsappFeedback.includes("format")
                            ? "text-[#C33D17]"
                            : "text-green-700"
                        }`}
                      >
                        {whatsappFeedback}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="mb-4 bg-white rounded-2xl border border-gray-50 p-4 sm:p-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="font-heading font-bold text-base text-[#1A1A1A]">{"WhatsApp sifari\u015F x\u0259tti"}</h2>
                      <span
                        className={`px-2.5 py-1 rounded-full text-[11px] font-body font-semibold ${
                          whatsappPhone ? "bg-green-50 text-green-700" : "bg-[#FFF0B8] text-[#8A6400]"
                        }`}
                      >
                        {whatsappPhone ? "Haz\u0131rd\u0131r" : "Qurulmay\u0131b"}
                      </span>
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-body font-semibold bg-[#F5F3F0] text-[#595959]">
                        {whatsappSource === "database"
                          ? "Admin panel"
                          : whatsappSource === "env"
                            ? "Env fallback"
                            : "Bo\u015F"}
                      </span>
                    </div>
                    <p className="font-body text-sm text-[#8C8C8C] mt-2">
                      {"Sifari\u015F CTA-s\u0131 buradak\u0131 n\u00F6mr\u0259y\u0259 y\u00F6nl\u0259n\u0259c\u0259k. `+`, bo\u015Fluq v\u0259 m\u00F6t\u0259riz\u0259 yaza bil\u0259rsiniz, server r\u0259q\u0259ml\u0259ri avtomatik t\u0259mizl\u0259y\u0259c\u0259k."}
                    </p>
                    {whatsappUpdatedAt && (
                      <p className="font-body text-xs text-[#8C8C8C] mt-2">
                        {"Son yenil\u0259nm\u0259: "} {new Date(whatsappUpdatedAt).toLocaleString("az-AZ")}
                      </p>
                    )}
                  </div>

                  <div className="w-full lg:w-[360px]">
                    <label className="block font-body text-sm text-[#595959] mb-2">{"WhatsApp n\u00F6mr\u0259si"}</label>
                    <input
                      data-testid="whatsapp-phone-input"
                      value={whatsappDraft}
                      onChange={(event) => setWhatsappDraft(event.target.value)}
                      placeholder="+994 50 123 45 67"
                      className="w-full px-4 py-3 rounded-2xl bg-[#F5F3F0] border border-transparent focus:border-[#E05A33] focus:bg-white outline-none font-body text-sm"
                    />
                    <div className="mt-3 flex flex-wrap gap-2">
                      <button
                        type="button"
                        data-testid="save-whatsapp-phone-btn"
                        onClick={() => handleSaveWhatsappPhone(whatsappDraft)}
                        disabled={whatsappSaving}
                        className="bg-[#E05A33] hover:bg-[#D94A22] text-white px-4 py-2 rounded-full text-sm font-body font-semibold disabled:opacity-50"
                      >
                        {whatsappSaving ? "Saxlan\u0131r..." : "N\u00F6mr\u0259ni saxla"}
                      </button>
                      <button
                        type="button"
                        data-testid="reset-whatsapp-phone-btn"
                        onClick={() => handleSaveWhatsappPhone("")}
                        disabled={whatsappSaving || (!whatsappPhone && whatsappSource !== "database")}
                        className="px-4 py-2 rounded-full border border-gray-200 text-sm font-body font-semibold text-[#595959] hover:bg-gray-50 disabled:opacity-50"
                      >
                        {"S\u0131f\u0131rla"}
                      </button>
                    </div>
                    {whatsappFeedback && (
                      <p
                        className={`mt-3 text-xs font-body ${
                          whatsappFeedback.includes("m\u00FCmk\u00FCn olmad\u0131") || whatsappFeedback.includes("format")
                            ? "text-[#C33D17]"
                            : "text-green-700"
                        }`}
                      >
                        {whatsappFeedback}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {!whatsappPhone && (
                <div className="mb-4 rounded-2xl border border-[#FFD4C7] bg-[#FFF6F3] px-4 py-3 text-sm font-body text-[#A5533A] flex items-start gap-2">
                  <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
                  <span>{"WhatsApp sifari\u015F n\u00F6mr\u0259si h\u0259l\u0259 qurulmay\u0131b. Aktiv metodlar g\u00F6r\u00FCn\u0259c\u0259k, amma checkout y\u00F6nl\u0259ndirm\u0259si i\u015Fl\u0259m\u0259y\u0259c\u0259k."}</span>
                </div>
              )}

              {!whatsappPhone && (
                <div className="hidden" aria-hidden="true">
                  <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
                  <span>WhatsApp sifariş nömrəsi hələ qurulmayıb. Aktiv metodlar görünəcək, amma checkout yönləndirməsi işləməyəcək.</span>
                </div>
              )}

              {loading ? (
                <div className="flex justify-center py-12">
                  <div className="w-8 h-8 border-2 border-[#E05A33] border-t-transparent rounded-full animate-spin" />
                </div>
              ) : (
                <div className="space-y-3">
                  {paymentMethods.map((method) => (
                    <div key={method.id} className="bg-white rounded-2xl border border-gray-50 p-4 flex flex-col sm:flex-row sm:items-center gap-4">
                      <div
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                          method.is_active ? "bg-[#FFF0E6] text-[#E05A33]" : "bg-[#FFF7D6] text-[#A77000]"
                        }`}
                      >
                        <CreditCard size={18} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-body font-semibold text-sm text-[#1A1A1A]">{method.name}</h3>
                          <span
                            className={`px-2.5 py-1 rounded-full text-[11px] font-body font-semibold ${
                              method.is_active ? "bg-green-50 text-green-700" : "bg-[#FFF0B8] text-[#8A6400]"
                            }`}
                          >
                            {method.is_active ? "Aktiv" : "Deaktiv"}
                          </span>
                        </div>
                        <p className="font-body text-xs text-[#8C8C8C] mt-1">{method.description}</p>
                        {!method.is_active && (
                          <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-[#FFF0B8] px-3 py-1 text-[11px] font-body font-semibold text-[#8A6400]">
                            <AlertCircle size={12} />
                            {method.unavailable_message || "Texniki s\u0259b\u0259bl\u0259rd\u0259n \u00E7al\u0131\u015Fm\u0131r"}
                          </div>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleTogglePaymentMethod(method.id, method.is_active)}
                        className={`sm:self-center self-start px-4 py-2 rounded-full text-sm font-body font-semibold transition-colors ${
                          method.is_active
                            ? "bg-[#FDEAEA] text-[#C33D17] hover:bg-[#F9D9D1]"
                            : "bg-[#E05A33] text-white hover:bg-[#D94A22]"
                        }`}
                      >
                        {method.is_active ? "Deaktiv et" : "Aktiv et"}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {tab === "users" && user.role === "admin" && (
            <>
              <h1 className="font-heading font-bold text-xl mb-5">{"\u0130stifad\u0259\u00E7il\u0259r"} ({users.length})</h1>
              {loading ? (
                <div className="flex justify-center py-12">
                  <div className="w-8 h-8 border-2 border-[#E05A33] border-t-transparent rounded-full animate-spin" />
                </div>
              ) : (
                <div className="space-y-2">
                  {users.map((account) => (
                    <div key={account.user_id} data-testid={`admin-user-${account.user_id}`} className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-50">
                      <div className="w-10 h-10 rounded-full bg-[#E05A33]/10 flex items-center justify-center flex-shrink-0">
                        <span className="font-heading font-bold text-sm text-[#E05A33]">{account.name?.[0] || "?"}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-body font-semibold text-sm truncate">{account.name}</p>
                        <p className="font-body text-xs text-[#8C8C8C] truncate">{account.email}</p>
                      </div>
                      <select
                        value={account.role}
                        onChange={(event) => handleRoleChange(account.user_id, event.target.value)}
                        className="px-2 py-1 rounded-lg bg-[#F5F3F0] font-body text-xs outline-none"
                      >
                        <option value="user">{"M\u00FC\u015Ft\u0259ri"}</option>
                        <option value="seller">{"Sat\u0131c\u0131"}</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {tab === "notifications" && user.role === "admin" && (
            <>
              <h1 className="font-heading font-bold text-xl mb-5">{"Bildiri\u015F g\u00F6nd\u0259r"}</h1>
              <div className="bg-white rounded-2xl border border-gray-50 p-5 max-w-lg space-y-3">
                <input
                  data-testid="notif-title"
                  placeholder={"Ba\u015Fl\u0131q"}
                  value={notifTitle}
                  onChange={(event) => setNotifTitle(event.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#F5F3F0] font-body text-sm outline-none focus:ring-1 focus:ring-[#E05A33]"
                />
                <textarea
                  data-testid="notif-msg"
                  placeholder="Mesaj"
                  value={notifMsg}
                  onChange={(event) => setNotifMsg(event.target.value)}
                  rows={3}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#F5F3F0] font-body text-sm outline-none resize-none"
                />
                <button
                  data-testid="send-notif-btn"
                  onClick={sendNotif}
                  disabled={!notifTitle}
                  className="bg-[#E05A33] text-white px-6 py-2.5 rounded-full font-body font-semibold text-sm flex items-center gap-2 disabled:opacity-50"
                >
                  <Send size={14} /> {"Ham\u0131ya g\u00F6nd\u0259r"}
                </button>
              </div>
            </>
          )}

          {tab === "security" && user.role === "admin" && (
            <>
              <h1 className="font-heading font-bold text-xl mb-5">2FA {"T\u0259hl\u00FCk\u0259sizlik"}</h1>
              <div className="bg-white rounded-2xl border border-gray-50 p-5 max-w-lg">
                {!qrData ? (
                  <div>
                    <p className="font-body text-sm text-[#595959] mb-4">
                      Google Authenticator il\u0259 2 add\u0131ml\u0131 do\u011Frulama aktivl\u0259\u015Fdirin.
                    </p>
                    <button
                      data-testid="setup-2fa-btn"
                      onClick={setup2FA}
                      className="bg-[#E05A33] text-white px-6 py-2.5 rounded-full font-body font-semibold text-sm"
                    >
                      <Shield size={14} className="inline mr-2" />
                      2FA {"Aktivl\u0259\u015Fdir"}
                    </button>
                    {twoFaMsg && <p className="mt-3 font-body text-sm text-green-600">{twoFaMsg}</p>}
                  </div>
                ) : (
                  <div className="text-center space-y-4">
                    <p className="font-body text-sm text-[#595959]">Google Authenticator il\u0259 QR kodu skan edin:</p>
                    <img src={qrData.qr_code || qrData.qr} alt="QR" className="w-48 h-48 mx-auto rounded-xl" />
                    <p className="font-body text-[10px] text-[#8C8C8C] break-all">{"Gizli a\u00E7ar"}: {qrData.secret}</p>
                    <div className="flex gap-2 justify-center">
                      <input
                        data-testid="totp-code-input"
                        value={totpCode}
                        onChange={(event) => setTotpCode(event.target.value)}
                        placeholder="6 r\u0259q\u0259mli kod"
                        maxLength={6}
                        className="w-32 px-4 py-2.5 rounded-xl bg-[#F5F3F0] text-center font-body text-lg tracking-widest outline-none"
                      />
                      <button
                        data-testid="verify-2fa-btn"
                        onClick={verify2FA}
                        className="bg-[#E05A33] text-white px-5 py-2.5 rounded-full font-body font-semibold text-sm"
                      >
                        {"T\u0259sdiql\u0259"}
                      </button>
                    </div>
                    {twoFaMsg && (
                      <p className={`font-body text-sm ${twoFaMsg.includes("aktiv") ? "text-green-600" : "text-red-500"}`}>
                        {twoFaMsg}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </>
          )}

          {tab === "campaigns" && (
            <div className="text-center py-16">
              <Tag size={40} className="mx-auto text-[#8C8C8C] mb-3" />
              <p className="font-body text-[#8C8C8C]">Kampaniya idar\u0259etm\u0259si tezlikl\u0259</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
