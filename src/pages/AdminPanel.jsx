import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { api as ax } from "@/lib/api";
import { uploadToCloudinary } from "@/lib/cloudinaryUpload";
import BrandMark from "@/components/layout/BrandMark";
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
    { id: "products", label: "Məhsullar", icon: Package },
    { id: "categories", label: "Kateqoriyalar", icon: LayoutGrid },
    { id: "campaigns", label: "Hero bannerlər", icon: Tag },
    ...(user?.role === "admin"
      ? [
          { id: "payments", label: "Ödənişlər", icon: CreditCard },
          { id: "users", label: "İstifadəçilər", icon: Users },
          { id: "notifications", label: "Bildirişlər", icon: Bell },
          { id: "security", label: "Təhlükəsizlik", icon: Shield },
        ]
      : []),
  ];
}

function getMobileTabLabel(tabId) {
  switch (tabId) {
    case "dashboard":
      return "Panel";
    case "products":
      return "Məhsul";
    case "categories":
      return "Kateqor.";
    case "campaigns":
      return "Banner";
    case "payments":
      return "Ödəniş";
    case "users":
      return "İstifadəçi";
    case "notifications":
      return "Bildiriş";
    case "security":
      return "2FA";
    default:
      return tabId;
  }
}

const HERO_ACTION_OPTIONS = [
  { value: "none", label: "Link yoxdur" },
  { value: "internal", label: "Məhsul/kateqoriya linki" },
  { value: "coupon", label: "Kupon kopyala" },
  { value: "external", label: "Başqa sayta yönləndir" },
];

function createHeroBannerForm(order = 1) {
  return {
    title: "",
    subtitle: "",
    eyebrow: "Xüsusi təklif",
    image: "",
    cta_text: "İndi al",
    action_type: "internal",
    action_value: "",
    duration_seconds: 5,
    order,
    is_active: true,
  };
}

function heroBannerToForm(banner) {
  return {
    id: banner.id,
    title: banner.title || "",
    subtitle: banner.subtitle || "",
    eyebrow: banner.eyebrow || "Xüsusi təklif",
    image: banner.image || "",
    cta_text: banner.cta_text || banner.cta || "",
    action_type: banner.action_type || "none",
    action_value: banner.action_value || "",
    duration_seconds: banner.duration_seconds || 5,
    order: banner.order || 1,
    is_active: banner.is_active !== false,
  };
}

function getHeroActionPlaceholder(type) {
  if (type === "coupon") return "BAZARI10";
  if (type === "external") return "https://example.com";
  if (type === "internal") return "/category/premium-hesablar və ya /product/id";
  return "CTA linki deaktivdir";
}

function HeroBannerForm({ form, setForm, products, categories, onSave, onCancel, saving }) {
  const [uploading, setUploading] = useState(false);

  const setField = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const internalTargets = [
    ...categories
      .filter((category) => category.slug)
      .map((category) => ({
        value: `/category/${category.slug}`,
        label: `Kateqoriya: ${category.name}`,
      })),
    ...products.map((product) => ({
      value: `/product/${product.id}`,
      label: `Məhsul: ${product.name}`,
    })),
  ];

  const handleUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadToCloudinary(file, { folder: "bazari/hero-banners" });
      setField("image", url);
    } catch (err) {
      console.error(err);
      window.alert("Yükləmə xətası: " + (err?.message || "naməlum"));
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onSave(form);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-50 p-5 mb-5 space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="font-heading font-bold text-lg text-[#1A1A1A]">
            {form.id ? "Hero banneri redaktə et" : "Yeni hero banner"}
          </h2>
          <p className="font-body text-xs text-[#8C8C8C] mt-1">
            Şəkil, CTA yazısı, link tipi və ekranda qalma saniyəsi buradan idarə olunur.
          </p>
        </div>
        <button type="button" onClick={onCancel} className="p-2 rounded-full hover:bg-gray-50">
          <X size={18} className="text-[#8C8C8C]" />
        </button>
      </div>

      <div className="grid lg:grid-cols-[1.2fr_0.8fr] gap-5">
        <div className="space-y-3">
          <div className="grid sm:grid-cols-2 gap-3">
            <input
              value={form.title}
              onChange={(event) => setField("title", event.target.value)}
              placeholder="Başlıq"
              required
              className="px-3 py-2.5 rounded-xl bg-[#F5F3F0] font-body text-sm outline-none focus:ring-1 focus:ring-[#E05A33]"
            />
            <input
              value={form.eyebrow}
              onChange={(event) => setField("eyebrow", event.target.value)}
              placeholder="Kiçik üst yazı"
              className="px-3 py-2.5 rounded-xl bg-[#F5F3F0] font-body text-sm outline-none focus:ring-1 focus:ring-[#E05A33]"
            />
          </div>

          <textarea
            value={form.subtitle}
            onChange={(event) => setField("subtitle", event.target.value)}
            placeholder="Alt açıqlama"
            rows={2}
            className="w-full px-3 py-2.5 rounded-xl bg-[#F5F3F0] font-body text-sm outline-none resize-none focus:ring-1 focus:ring-[#E05A33]"
          />

          <div className="grid sm:grid-cols-[1fr_auto] gap-3">
            <input
              value={form.image}
              onChange={(event) => setField("image", event.target.value)}
              placeholder="Banner şəkil URL"
              required
              className="px-3 py-2.5 rounded-xl bg-[#F5F3F0] font-body text-sm outline-none focus:ring-1 focus:ring-[#E05A33]"
            />
            <label className="cursor-pointer px-4 py-2.5 rounded-xl bg-[#1A1A1A] text-white font-body text-sm font-semibold flex items-center justify-center gap-2">
              <Upload size={15} />
              {uploading ? "Yüklənir..." : "Şəkil yüklə"}
              <input type="file" accept="image/*" className="hidden" onChange={handleUpload} disabled={uploading} />
            </label>
          </div>

          <div className="grid sm:grid-cols-3 gap-3">
            <input
              value={form.cta_text}
              onChange={(event) => setField("cta_text", event.target.value)}
              placeholder="CTA: İndi al, Bax və ya boş"
              className="px-3 py-2.5 rounded-xl bg-[#F5F3F0] font-body text-sm outline-none focus:ring-1 focus:ring-[#E05A33]"
            />
            <input
              type="number"
              min="1"
              max="120"
              value={form.duration_seconds}
              onChange={(event) => setField("duration_seconds", event.target.value)}
              placeholder="Saniyə"
              className="px-3 py-2.5 rounded-xl bg-[#F5F3F0] font-body text-sm outline-none focus:ring-1 focus:ring-[#E05A33]"
            />
            <input
              type="number"
              min="1"
              value={form.order}
              onChange={(event) => setField("order", event.target.value)}
              placeholder="Sıra"
              className="px-3 py-2.5 rounded-xl bg-[#F5F3F0] font-body text-sm outline-none focus:ring-1 focus:ring-[#E05A33]"
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            <select
              value={form.action_type}
              onChange={(event) => {
                const actionType = event.target.value;
                setForm((current) => ({
                  ...current,
                  action_type: actionType,
                  action_value: actionType === "none" ? "" : current.action_value,
                }));
              }}
              className="px-3 py-2.5 rounded-xl bg-[#F5F3F0] font-body text-sm outline-none focus:ring-1 focus:ring-[#E05A33]"
            >
              {HERO_ACTION_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <input
              value={form.action_value}
              onChange={(event) => setField("action_value", event.target.value)}
              placeholder={getHeroActionPlaceholder(form.action_type)}
              disabled={form.action_type === "none"}
              className="px-3 py-2.5 rounded-xl bg-[#F5F3F0] font-body text-sm outline-none disabled:opacity-60 focus:ring-1 focus:ring-[#E05A33]"
            />
          </div>

          {form.action_type === "internal" && internalTargets.length > 0 && (
            <select
              value=""
              onChange={(event) => {
                if (event.target.value) setField("action_value", event.target.value);
              }}
              className="w-full px-3 py-2.5 rounded-xl bg-[#F5F3F0] font-body text-sm outline-none focus:ring-1 focus:ring-[#E05A33]"
            >
              <option value="">Məhsul və ya kateqoriya seç</option>
              {internalTargets.map((target) => (
                <option key={target.value} value={target.value}>
                  {target.label}
                </option>
              ))}
            </select>
          )}

          <label className="inline-flex items-center gap-2 rounded-full bg-[#F5F3F0] px-3 py-2 font-body text-sm text-[#595959]">
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={(event) => setField("is_active", event.target.checked)}
              className="accent-[#E05A33]"
            />
            Aktiv göstər
          </label>
        </div>

        <div className="rounded-2xl overflow-hidden bg-[#1A1A1A] min-h-[220px] relative">
          {form.image ? (
            <img src={form.image} alt="" className="absolute inset-0 w-full h-full object-cover" />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-white/50">
              <ImageIcon size={32} />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/25 to-transparent" />
          <div className="absolute inset-0 p-5 flex flex-col justify-center">
            <span className="text-white/75 text-xs font-body uppercase tracking-wide">{form.eyebrow || "Xüsusi təklif"}</span>
            <h3 className="font-heading font-bold text-2xl text-white mt-2 line-clamp-2">{form.title || "Banner başlığı"}</h3>
            {form.subtitle && <p className="font-body text-sm text-white/85 mt-2 line-clamp-2">{form.subtitle}</p>}
            {form.cta_text && (
              <span className="mt-4 inline-flex w-fit rounded-full bg-[#E05A33] px-5 py-2 text-sm font-body font-semibold text-white">
                {form.cta_text}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="submit"
          disabled={saving || uploading}
          className="bg-[#E05A33] text-white px-5 py-2.5 rounded-full font-body text-sm font-semibold disabled:opacity-60"
        >
          {saving ? "Saxlanır..." : "Saxla"}
        </button>
        <button type="button" onClick={onCancel} className="px-5 py-2.5 rounded-full border border-gray-200 font-body text-sm">
          Ləğv et
        </button>
      </div>
    </form>
  );
}

function Sidebar({ activeTab, setActiveTab, user, onLogout }) {
  const tabs = getAdminTabs(user);

  return (
    <aside data-testid="admin-sidebar" className="w-60 bg-white border-r border-gray-100 min-h-screen hidden lg:flex flex-col p-4">
      <Link to="/" className="flex items-center gap-2 mb-6 px-2">
        <BrandMark className="w-8 h-8 rounded-xl" />
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
        <LogOut size={16} /> {"Çıxış"}
      </button>
    </aside>
  );
}

const EMPTY_PRODUCT_FORM = {
  name: "",
  description: "",
  price: 0,
  bonus_amount: 0,
  original_price: 0,
  bonus_amount: 0,
  discount: 0,
  images: [],
  brand: "",
  stock: 100,
  badge: "",
  category_id: "",
  seo_title: "",
  seo_description: "",
  flash_sale_active: false,
  flash_sale_price: 0,
  bonus_amount: 0,
  flash_sale_limit: 0,
  flash_sale_per_customer_limit: 0,
};

function ProductForm({ product, categories, onSave, onCancel }) {
  const [form, setForm] = useState(() => {
    const source = product || {};
    const flashSale = source.flash_sale || {};
    return {
      ...EMPTY_PRODUCT_FORM,
      ...source,
      flash_sale_active: source.flash_sale_active ?? flashSale.active ?? false,
      flash_sale_price: source.flash_sale_price ?? flashSale.price ?? 0,
      flash_sale_limit: source.flash_sale_limit ?? flashSale.limit ?? 0,
      flash_sale_per_customer_limit:
        source.flash_sale_per_customer_limit ?? flashSale.per_customer_limit ?? flashSale.perCustomerLimit ?? 0,
    };
  });
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
      window.alert("Yükləmə xətası: " + (err?.message || "naməlum"));
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
        <label className="block font-body text-sm text-[#595959] mb-1">Təsvir</label>
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
          <label className="block font-body text-sm text-[#595959] mb-1">Qiymət *</label>
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
          <label className="block font-body text-sm text-[#595959] mb-1">Köhnə qiymət</label>
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

      <section data-testid="flash-sale-section" className="rounded-2xl border-2 border-[#FFE0D5] bg-[#FFF7F2] p-4 sm:p-5 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#E05A33] text-white">
              <Tag size={18} />
            </span>
            <div>
              <h3 className="font-heading text-lg font-bold text-[#1A1A1A]">Flash Endirimlər</h3>
              <p className="mt-1 font-body text-sm text-[#6B6B6B]">
                Məhsulu Flash Endirimlər səhifəsində və telefondakı Endirimlər bölməsində göstər.
              </p>
            </div>
          </div>

          <label className="inline-flex cursor-pointer items-center gap-2 pt-1">
            <span className="hidden sm:inline font-body text-xs font-semibold text-[#8C8C8C]">
              {form.flash_sale_active ? "Aktiv" : "Passiv"}
            </span>
            <input
              data-testid="product-flash-active"
              type="checkbox"
              checked={!!form.flash_sale_active}
              onChange={(event) => setField("flash_sale_active", event.target.checked)}
              className="peer sr-only"
            />
            <span className="relative h-7 w-12 rounded-full bg-[#D9D4CE] transition-colors peer-checked:bg-[#E05A33] after:absolute after:left-1 after:top-1 after:h-5 after:w-5 after:rounded-full after:bg-white after:shadow-sm after:transition-transform peer-checked:after:translate-x-5" />
          </label>
        </div>

        <button
          data-testid="product-flash-toggle"
          type="button"
          onClick={() => setField("flash_sale_active", !form.flash_sale_active)}
          className={`w-full rounded-2xl px-4 py-3 text-left font-body text-sm font-bold transition-colors ${
            form.flash_sale_active ? "bg-[#E05A33] text-white" : "bg-white text-[#E05A33] border border-[#FFD8C8]"
          }`}
        >
          {form.flash_sale_active ? "Flash endirim aktivdir" : "Flash endirim düyməsini aktivləşdir"}
        </button>

        {form.flash_sale_active ? (
          <div data-testid="flash-sale-fields" className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-body text-sm font-semibold text-[#595959] mb-1">Flash Endirimli qiyməti</label>
              <input
                data-testid="product-flash-price"
                type="number"
                step="0.01"
                min="0"
                value={form.flash_sale_price || ""}
                onChange={(event) => setField("flash_sale_price", parseFloat(event.target.value) || 0)}
                className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#FFE0D5] focus:border-[#E05A33] outline-none font-body text-sm"
                placeholder="Misal: 89.50"
              />
            </div>
            <div>
              <label className="block font-body text-sm font-semibold text-[#595959] mb-1">Ümumi limit</label>
              <input
                data-testid="product-flash-limit"
                type="number"
                min="0"
                value={form.flash_sale_limit || ""}
                onChange={(event) => setField("flash_sale_limit", parseInt(event.target.value, 10) || 0)}
                className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#FFE0D5] focus:border-[#E05A33] outline-none font-body text-sm"
                placeholder="Misal: 100"
              />
            </div>
            <div>
              <label className="block font-body text-sm font-semibold text-[#595959] mb-1">Bir müştəri üçün limit</label>
              <input
                data-testid="product-flash-customer-limit"
                type="number"
                min="0"
                value={form.flash_sale_per_customer_limit || ""}
                onChange={(event) => setField("flash_sale_per_customer_limit", parseInt(event.target.value, 10) || 0)}
                className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#FFE0D5] focus:border-[#E05A33] outline-none font-body text-sm"
                placeholder="Misal: 2"
              />
            </div>
          </div>
        ) : (
          <div data-testid="flash-sale-inactive-note" className="rounded-2xl border border-dashed border-[#FFD8C8] bg-white/70 px-4 py-3 font-body text-sm text-[#8C8C8C]">
            Aktivləşdirəndə aşağıda Flash Endirimli qiyməti, Ümumi limit və Bir müştəri üçün limit sahələri açılacaq.
          </div>
        )}
      </section>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block font-body text-sm text-[#595959] mb-1">Kateqoriya</label>
          <select
            value={form.category_id || ""}
            onChange={(event) => setField("category_id", event.target.value)}
            className="w-full px-4 py-2.5 rounded-xl bg-[#F5F3F0] border border-transparent focus:border-[#E05A33] outline-none font-body text-sm"
          >
            <option value="">{"Seçin"}</option>
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
        <label className="block font-body text-sm text-[#595959] mb-2">{"Şəkillər"}</label>
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
            <Upload size={14} /> {uploading ? "Yüklənir..." : "Fayldan"}
            <input type="file" accept="image/*" onChange={handleUpload} className="hidden" disabled={uploading} />
          </label>
          <div className="flex gap-1.5 flex-1 min-w-[200px]">
            <input
              value={imageUrl}
              onChange={(event) => setImageUrl(event.target.value)}
              placeholder="URL əlavə et"
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
          {saving ? "Saxlanır..." : "Saxla"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2.5 rounded-full border border-gray-200 font-body text-sm text-[#595959] hover:bg-gray-50"
        >
          {"Ləğv et"}
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
  const [deliveryFee, setDeliveryFee] = useState(0);
  const [freeLimit, setFreeLimit] = useState(0);
  const [deliverySaving, setDeliverySaving] = useState(false);
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
  const [heroBanners, setHeroBanners] = useState([]);
  const [heroBannerForm, setHeroBannerForm] = useState(null);
  const [heroBannerSaving, setHeroBannerSaving] = useState(false);

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
        const delivRes = await ax.get("/settings/delivery");
        setDeliveryFee(delivRes.data.fee || 0);
        setFreeLimit(delivRes.data.free_limit || 0);
        setWhatsappSource(data?.whatsapp_source || "unset");
        setWhatsappUpdatedAt(data?.whatsapp_updated_at || null);
        setWhatsappFeedback("");
      } else if (tab === "campaigns") {
        if (user.role !== "admin") {
          setHeroBanners([]);
          setHeroBannerForm(null);
          return;
        }
        const [bannersRes, productsRes, categoriesRes] = await Promise.all([
          ax.get("/admin/hero-banners"),
          ax.get("/products?limit=100&count=false"),
          ax.get("/categories"),
        ]);
        setHeroBanners(bannersRes.data || []);
        setProducts(productsRes.data?.products || []);
        setCategories(categoriesRes.data || []);
        setHeroBannerForm(null);
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
    if (!window.confirm("Silmək?")) return;
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
          ? "WhatsApp sifariş nömrəsi yeniləndi."
          : "WhatsApp sifariş nömrəsi sıfırlandı."
      );
  const handleSaveDelivery = async () => {
    setDeliverySaving(true);
    try {
      await ax.put("/settings/delivery", { fee: Number(deliveryFee), free_limit: Number(freeLimit) });
      window.alert("Çatdırılma tənzimləmələri yadda saxlanıldı");
    } catch (err) {
      window.alert(err.response?.data?.error || "Xəta baş verdi");
    } finally {
      setDeliverySaving(false);
    }
  };
    } catch (err) {
      setWhatsappFeedback(err?.response?.data?.error || "WhatsApp nömrəsini saxlamaq mümkün olmadı.");
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

  const handleSaveHeroBanner = async (form) => {
    const payload = {
      ...form,
      duration_seconds: Number(form.duration_seconds) || 5,
      order: Number(form.order) || heroBanners.length + 1,
      is_active: Boolean(form.is_active),
    };

    setHeroBannerSaving(true);
    try {
      if (form.id) await ax.put(`/admin/hero-banners/${form.id}`, payload);
      else await ax.post("/admin/hero-banners", payload);
      setHeroBannerForm(null);
      await load();
    } catch (err) {
      window.alert(err?.response?.data?.error || "Hero banneri saxlamaq mümkün olmadı.");
    } finally {
      setHeroBannerSaving(false);
    }
  };

  const handleDeleteHeroBanner = async (id) => {
    if (!window.confirm("Hero banner silinsin?")) return;
    await ax.delete(`/admin/hero-banners/${id}`);
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
      setTwoFaMsg("Kod yanlışdır");
    }
  };

  const sendNotif = async () => {
    try {
      await ax.post("/push/send", { title: notifTitle, message: notifMsg, url: "/" });
      setNotifTitle("");
      setNotifMsg("");
      window.alert("Push + in-app bildiriş göndərildi!");
    } catch {
      await ax.post("/notifications/send", { title: notifTitle, message: notifMsg, type: "deal" });
      setNotifTitle("");
      setNotifMsg("");
      window.alert("In-app bildiriş göndərildi!");
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
          <p className="font-body text-[#595959] mb-4">Daxil olmaq lazımdır</p>
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
                  { label: "Məhsullar", val: stats.products || 0, color: "text-[#E05A33]" },
                  { label: "İstifadəçilər", val: stats.users || 0, color: "text-blue-600" },
                  { label: "Kateqoriyalar", val: stats.categories || 0, color: "text-green-600" },
                ].map((stat) => (
                  <div key={stat.label} className="bg-white rounded-2xl border border-gray-50 p-5">
                    <p className="font-body text-sm text-[#8C8C8C]">{stat.label}</p>
                    <p className={`font-heading font-bold text-2xl mt-1 ${stat.color}`}>{stat.val}</p>
                  </div>
                ))}
              </div>
              <div className="bg-white rounded-2xl border border-gray-50 p-5">
                <h3 className="font-heading font-semibold text-base mb-3">{"Sürətli hərəkətlər"}</h3>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => {
                      setTab("products");
                      setShowForm(true);
                      setEditProd(null);
                    }}
                    className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#E05A33] text-white font-body text-sm font-medium"
                  >
                    <Plus size={14} /> {"Yeni məhsul"}
                  </button>
                  {user.role === "admin" && (
                    <>
                      <button
                        onClick={() => setTab("payments")}
                        className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#F5F3F0] text-[#595959] font-body text-sm"
                      >
                        <CreditCard size={14} /> {"Ödənişlər"}
                      </button>
                      <button
                        onClick={() => setTab("notifications")}
                        className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#F5F3F0] text-[#595959] font-body text-sm"
                      >
                        <Bell size={14} /> {"Bildiriş göndər"}
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
                <h1 className="font-heading font-bold text-xl">{"Məhsullar"} ({products.length})</h1>
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
                            {product.price} {"₼"}
                          </span>
                          {product.discount > 0 && (
                            <span className="text-[10px] font-bold text-white bg-[#E05A33] px-1.5 py-0.5 rounded">
                              -{product.discount}%
                            </span>
                          )}
                          {product.flash_sale?.active && (
                            <span className="text-[10px] font-bold text-[#E05A33] bg-[#FFF0E6] px-1.5 py-0.5 rounded">
                              Flash
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
                    onClick={() => setCatForm({ name: "", name_ru: "", slug: "", image: "", parent_id: "", order: categories.length + 1 })}
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
                      placeholder={"Şəkil URL"}
                      value={catForm.image}
                      onChange={(event) => setCatForm({ ...catForm, image: event.target.value })}
                      className="px-3 py-2 rounded-xl bg-[#F5F3F0] font-body text-sm outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <select
                      value={catForm.parent_id || ""}
                      onChange={(event) => setCatForm({ ...catForm, parent_id: event.target.value })}
                      className="px-3 py-2 rounded-xl bg-[#F5F3F0] font-body text-sm outline-none"
                    >
                      <option value="">Ümumi kateqoriya</option>
                      {categories
                        .filter((category) => category.id !== catForm.id && !category.parent_id)
                        .map((category) => (
                          <option key={category.id} value={category.id}>
                            Alt kateqoriya: {category.name}
                          </option>
                        ))}
                    </select>
                    <input
                      type="number"
                      placeholder="Sıra"
                      value={catForm.order || ""}
                      onChange={(event) => setCatForm({ ...catForm, order: parseInt(event.target.value, 10) || 0 })}
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
                      {"Ləğv"}
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
                          {"Redaktə"}
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
                  <h1 className="font-heading font-bold text-xl">{"Ödəniş metodları"}</h1>
              <div className="mb-8 bg-white rounded-2xl border-2 border-[#FFF0E6] p-5 sm:p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-[#E05A33] text-white flex items-center justify-center">
                    <Package size={20} />
                  </div>
                  <div>
                    <h2 className="font-heading font-bold text-lg text-[#1A1A1A]">Çatdırılma Tənzimləmələri</h2>
                    <p className="font-body text-xs text-[#8C8C8C]">Pulsuz çatdırılma limiti və standart haqq</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="block font-body text-sm font-semibold text-[#595959]">Standart çatdırılma haqqı (₼)</label>
                    <input
                      type="number"
                      value={deliveryFee}
                      onChange={(e) => setDeliveryFee(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-[#F5F3F0] border border-transparent focus:border-[#E05A33] focus:bg-white outline-none font-body text-sm transition-all"
                      placeholder="Məsələn: 5"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block font-body text-sm font-semibold text-[#595959]">Pulsuz çatdırılma limiti (₼)</label>
                    <input
                      type="number"
                      value={freeLimit}
                      onChange={(e) => setFreeLimit(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-[#F5F3F0] border border-transparent focus:border-[#E05A33] focus:bg-white outline-none font-body text-sm transition-all"
                      placeholder="Məsələn: 50"
                    />
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-50">
                  <button
                    onClick={handleSaveDelivery}
                    disabled={deliverySaving}
                    className="bg-[#E05A33] hover:bg-[#D94A22] text-white px-8 py-3 rounded-full font-body font-bold text-sm transition-all shadow-lg shadow-[#E05A33]/20 active:scale-95 disabled:opacity-50"
                  >
                    {deliverySaving ? "Saxlanılır..." : "Tənzimləmələri Saxla"}
                  </button>
                </div>
              </div>
                  <p className="font-body text-sm text-[#8C8C8C] mt-1">{"Checkout sifarişləri WhatsApp-a yönləndiriləcək."}</p>
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
                      <h2 className="font-heading font-bold text-base text-[#1A1A1A]">{"WhatsApp sifariş xətti"}</h2>
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
                      {"Sifariş CTA-sı buradakı nömrəyə yönlənəcək. `+`, boşluq və mötərizə yaza bilərsiniz, server rəqəmləri avtomatik təmizləyəcək."}
                    </p>
                    {whatsappUpdatedAt && (
                      <p className="font-body text-xs text-[#8C8C8C] mt-2">
                        {"Son yenilənmə: "} {new Date(whatsappUpdatedAt).toLocaleString("az-AZ")}
                      </p>
                    )}
                  </div>

                  <div className="w-full lg:w-[360px]">
                    <label className="block font-body text-sm text-[#595959] mb-2">{"WhatsApp nömrəsi"}</label>
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
                        {whatsappSaving ? "Saxlanır..." : "Nömrəni saxla"}
                      </button>
                      <button
                        type="button"
                        data-testid="reset-whatsapp-phone-btn"
                        onClick={() => handleSaveWhatsappPhone("")}
                        disabled={whatsappSaving || (!whatsappPhone && whatsappSource !== "database")}
                        className="px-4 py-2 rounded-full border border-gray-200 text-sm font-body font-semibold text-[#595959] hover:bg-gray-50 disabled:opacity-50"
                      >
                        {"Sıfırla"}
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

              {!whatsappPhone && (
                <div className="mb-4 rounded-2xl border border-[#FFD4C7] bg-[#FFF6F3] px-4 py-3 text-sm font-body text-[#A5533A] flex items-start gap-2">
                  <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
                  <span>{"WhatsApp sifariş nömrəsi hələ qurulmayıb. Aktiv metodlar görünəcək, amma checkout yönləndirməsi işləməyəcək."}</span>
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
                            {method.unavailable_message || "Texniki səbəblərdən çalışmır"}
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
              <h1 className="font-heading font-bold text-xl mb-5">{"İstifadəçilər"} ({users.length})</h1>
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
                        <option value="user">{"Müştəri"}</option>
                        <option value="seller">{"Satıcı"}</option>
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
              <h1 className="font-heading font-bold text-xl mb-5">{"Bildiriş göndər"}</h1>
              <div className="bg-white rounded-2xl border border-gray-50 p-5 max-w-lg space-y-3">
                <input
                  data-testid="notif-title"
                  placeholder={"Başlıq"}
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
                  <Send size={14} /> {"Hamıya göndər"}
                </button>
              </div>
            </>
          )}

          {tab === "security" && user.role === "admin" && (
            <>
              <h1 className="font-heading font-bold text-xl mb-5">2FA {"Təhlükəsizlik"}</h1>
              <div className="bg-white rounded-2xl border border-gray-50 p-5 max-w-lg">
                {!qrData ? (
                  <div>
                    <p className="font-body text-sm text-[#595959] mb-4">
                      Google Authenticator ilə 2 addımlı doğrulama aktivləşdirin.
                    </p>
                    <button
                      data-testid="setup-2fa-btn"
                      onClick={setup2FA}
                      className="bg-[#E05A33] text-white px-6 py-2.5 rounded-full font-body font-semibold text-sm"
                    >
                      <Shield size={14} className="inline mr-2" />
                      2FA {"Aktivləşdir"}
                    </button>
                    {twoFaMsg && <p className="mt-3 font-body text-sm text-green-600">{twoFaMsg}</p>}
                  </div>
                ) : (
                  <div className="text-center space-y-4">
                    <p className="font-body text-sm text-[#595959]">Google Authenticator ilə QR kodu skan edin:</p>
                    <img src={qrData.qr_code || qrData.qr} alt="QR" className="w-48 h-48 mx-auto rounded-xl" />
                    <p className="font-body text-[10px] text-[#8C8C8C] break-all">{"Gizli açar"}: {qrData.secret}</p>
                    <div className="flex gap-2 justify-center">
                      <input
                        data-testid="totp-code-input"
                        value={totpCode}
                        onChange={(event) => setTotpCode(event.target.value)}
                        placeholder="6 rəqəmli kod"
                        maxLength={6}
                        className="w-32 px-4 py-2.5 rounded-xl bg-[#F5F3F0] text-center font-body text-lg tracking-widest outline-none"
                      />
                      <button
                        data-testid="verify-2fa-btn"
                        onClick={verify2FA}
                        className="bg-[#E05A33] text-white px-5 py-2.5 rounded-full font-body font-semibold text-sm"
                      >
                        {"Təsdiqlə"}
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
            <>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
                <div>
                  <h1 className="font-heading font-bold text-xl">Hero bannerlər ({heroBanners.length})</h1>
                  <p className="font-body text-sm text-[#8C8C8C] mt-1">
                    Ana səhifənin əsas slider şəkilləri, CTA-ları, keçid linkləri və saniyələri.
                  </p>
                </div>
                {user.role === "admin" && (
                  <button
                    type="button"
                    data-testid="add-hero-banner-btn"
                    onClick={() => setHeroBannerForm(createHeroBannerForm(heroBanners.length + 1))}
                    className="bg-[#E05A33] hover:bg-[#D94A22] text-white px-4 py-2 rounded-full font-body font-semibold text-sm flex items-center justify-center gap-2"
                  >
                    <Plus size={16} /> Yeni banner
                  </button>
                )}
              </div>

              {heroBannerForm && (
                <HeroBannerForm
                  form={heroBannerForm}
                  setForm={setHeroBannerForm}
                  products={products}
                  categories={categories}
                  onSave={handleSaveHeroBanner}
                  onCancel={() => setHeroBannerForm(null)}
                  saving={heroBannerSaving}
                />
              )}

              {loading ? (
                <div className="flex justify-center py-12">
                  <div className="w-8 h-8 border-2 border-[#E05A33] border-t-transparent rounded-full animate-spin" />
                </div>
              ) : heroBanners.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl border border-gray-50">
                  <Tag size={40} className="mx-auto text-[#8C8C8C] mb-3" />
                  <p className="font-body text-[#8C8C8C]">Hələ hero banner yoxdur.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {heroBanners.map((banner) => (
                    <div
                      key={banner.id}
                      data-testid={`admin-hero-banner-${banner.id}`}
                      className="bg-white rounded-2xl border border-gray-50 p-3 sm:p-4 flex flex-col sm:flex-row gap-3 sm:items-center"
                    >
                      <div className="relative w-full sm:w-44 aspect-[16/9] rounded-xl overflow-hidden bg-[#F5F3F0] flex-shrink-0">
                        {banner.image ? (
                          <img src={banner.image} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <ImageIcon size={20} className="absolute inset-0 m-auto text-[#8C8C8C]" />
                        )}
                        <span className={`absolute top-2 left-2 rounded-full px-2 py-1 text-[10px] font-body font-bold ${banner.is_active ? "bg-green-500 text-white" : "bg-white/80 text-[#595959]"}`}>
                          {banner.is_active ? "Aktiv" : "Passiv"}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-heading font-bold text-base text-[#1A1A1A] truncate">{banner.title}</h3>
                          <span className="rounded-full bg-[#FFF0E6] px-2 py-1 text-[10px] font-body font-bold text-[#E05A33]">
                            {banner.duration_seconds}s
                          </span>
                          <span className="rounded-full bg-[#F5F3F0] px-2 py-1 text-[10px] font-body font-bold text-[#595959]">
                            Sıra {banner.order}
                          </span>
                        </div>
                        {banner.subtitle && (
                          <p className="font-body text-sm text-[#595959] mt-1 line-clamp-1">{banner.subtitle}</p>
                        )}
                        <div className="flex flex-wrap gap-2 mt-2 text-[11px] font-body text-[#8C8C8C]">
                          <span>CTA: {banner.cta_text || "boş"}</span>
                          <span>Tip: {banner.action_type}</span>
                          {banner.action_value && <span className="truncate max-w-[260px]">Link: {banner.action_value}</span>}
                        </div>
                      </div>
                      {user.role === "admin" && (
                        <div className="flex sm:flex-col gap-1 self-end sm:self-center">
                          <button
                            type="button"
                            onClick={() => setHeroBannerForm(heroBannerToForm(banner))}
                            className="p-2 rounded-lg hover:bg-gray-50"
                            aria-label="Hero banneri redaktə et"
                          >
                            <Pencil size={15} className="text-[#595959]" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteHeroBanner(banner.id)}
                            className="p-2 rounded-lg hover:bg-red-50"
                            aria-label="Hero banneri sil"
                          >
                            <Trash2 size={15} className="text-red-400" />
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
