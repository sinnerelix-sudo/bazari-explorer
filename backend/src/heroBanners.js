const HERO_ACTION_TYPES = new Set(["none", "internal", "external", "coupon"]);

function cleanText(value, fallback = "") {
  return typeof value === "string" ? value.trim() : fallback;
}

function cleanNumber(value, fallback) {
  const next = Number(value);
  return Number.isFinite(next) ? next : fallback;
}

function isValidImageRef(value) {
  if (!value) return false;
  if (value.startsWith("/")) return true;
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function normalizeAction(type, value) {
  const actionType = HERO_ACTION_TYPES.has(type) ? type : "none";
  const actionValue = cleanText(value);

  if (actionType === "none") return { action_type: "none", action_value: "" };

  if (actionType === "internal") {
    if (!actionValue.startsWith("/") || actionValue.startsWith("//")) {
    return { error: "Daxili link / ilə başlamalıdır" };
    }
    return { action_type: actionType, action_value: actionValue };
  }

  if (actionType === "external") {
    try {
      const url = new URL(actionValue);
      if (url.protocol !== "http:" && url.protocol !== "https:") {
        return { error: "Xarici link http və ya https olmalıdır" };
      }
      return { action_type: actionType, action_value: actionValue };
    } catch {
      return { error: "Xarici link düzgün URL olmalıdır" };
    }
  }

  if (actionType === "coupon") {
    if (!actionValue) return { error: "Kupon kodu boş ola bilməz" };
    return { action_type: actionType, action_value: actionValue };
  }

  return { action_type: "none", action_value: "" };
}

export function normalizeHeroBannerInput(body = {}, current = null) {
  const title = cleanText(body.title, current?.title || "");
  const subtitle = cleanText(body.subtitle, current?.subtitle || "");
  const eyebrow = cleanText(body.eyebrow, current?.eyebrow || "Xüsusi təklif");
  const image = cleanText(body.image ?? body.image_url, current?.image || "");
  const ctaText = cleanText(body.cta_text ?? body.cta, current?.cta_text || "");
  const durationSeconds = Math.min(Math.max(cleanNumber(body.duration_seconds, current?.duration_seconds || 5), 1), 120);
  const order = cleanNumber(body.order, current?.order || 1);
  const isActive = typeof body.is_active === "boolean" ? body.is_active : current?.is_active ?? true;
  const action = normalizeAction(body.action_type || current?.action_type || "none", body.action_value ?? current?.action_value ?? "");

  if (!title) return { error: "Başlıq tələb olunur" };
  if (!image) return { error: "Banner şəkli tələb olunur" };
  if (!isValidImageRef(image)) return { error: "Şəkil URL-i http, https və ya / yolu olmalıdır" };
  if (action.error) return { error: action.error };

  return {
    title,
    subtitle,
    eyebrow,
    image,
    cta_text: ctaText,
    action_type: ctaText ? action.action_type : "none",
    action_value: ctaText ? action.action_value : "",
    duration_seconds: durationSeconds,
    order,
    is_active: isActive,
  };
}

export function publicHeroBanner(banner) {
  if (!banner) return null;
  const durationSeconds = Number(banner.duration_seconds || 5);

  return {
    id: banner._id.toString(),
    title: banner.title,
    subtitle: banner.subtitle || "",
    eyebrow: banner.eyebrow || "Xüsusi təklif",
    image: banner.image || "",
    cta: banner.cta_text || "",
    cta_text: banner.cta_text || "",
    action_type: banner.action_type || "none",
    action_value: banner.action_value || "",
    duration_seconds: durationSeconds,
    duration_ms: Math.max(durationSeconds, 1) * 1000,
    order: Number(banner.order || 1),
    is_active: banner.is_active !== false,
    created_at: banner.created_at,
    updated_at: banner.updated_at,
  };
}

function firstImage(items) {
  return items.find((item) => item?.images?.[0] || item?.image);
}

export async function ensureDefaultHeroBanners(db) {
  const existing = await db.collection("hero_banners").countDocuments();
  if (existing > 0) return;

  const [products, categories] = await Promise.all([
    db.collection("products").find({ images: { $exists: true, $ne: [] } }).sort({ _id: -1 }).limit(2).toArray(),
    db.collection("categories").find().sort({ name: 1 }).limit(2).toArray(),
  ]);

  const firstProduct = firstImage(products);
  const secondProduct = products.find((product) => product?._id?.toString() !== firstProduct?._id?.toString()) || firstProduct;
  const firstCategory = firstImage(categories) || categories[0];

  const now = new Date();
  const docs = [];

  if (firstProduct?.images?.[0]) {
    docs.push({
      title: `${firstProduct.name} təklifləri`,
      subtitle: "Canlı məhsulları kəşf et və WhatsApp checkout ilə sürətli sifariş ver.",
      eyebrow: "Yeni kampaniya",
      image: firstProduct.images[0],
      cta_text: "İndi al",
      action_type: "internal",
      action_value: `/product/${firstProduct._id.toString()}`,
      duration_seconds: 10,
      order: 1,
      is_active: true,
      seed_key: "default-hero-1",
      created_at: now,
      updated_at: now,
    });
  }

  if (secondProduct?.images?.[0]) {
    docs.push({
      title: firstCategory?.name ? `${firstCategory.name} seçimləri` : "Premium paketlər hazırdır",
      subtitle: "Ən çox seçilən rəqəmsal xidmətlərə bir toxunuşla bax.",
      eyebrow: "Limitli təklif",
      image: secondProduct.images[0],
      cta_text: "Bax",
      action_type: "internal",
      action_value: firstCategory?.slug ? `/category/${firstCategory.slug}` : `/product/${secondProduct._id.toString()}`,
      duration_seconds: 5,
      order: 2,
      is_active: true,
      seed_key: "default-hero-2",
      created_at: now,
      updated_at: now,
    });
  }

  if (docs.length > 0) {
    try {
      await db.collection("hero_banners").insertMany(docs, { ordered: false });
    } catch (err) {
      if (err?.code !== 11000) throw err;
    }
  }
}
