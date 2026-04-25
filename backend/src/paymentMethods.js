import { getDB } from "./db.js";

const INACTIVE_MESSAGE = "Texniki səbəblərdən çalışmır";
const WHATSAPP_SETTING_KEY = "whatsapp_order_phone";

export const DEFAULT_PAYMENT_METHODS = [
  {
    key: "card_to_card",
    name: "Kartdan karta ödəniş",
    description: "Köçürmə ilə ödənişi tamamlayın.",
    is_active: true,
    sort_order: 1,
  },
  {
    key: "card",
    name: "Kartla ödəniş",
    description: "Kart vasitəsilə sifarişi təsdiqləyin.",
    is_active: true,
    sort_order: 2,
  },
  {
    key: "cash_on_delivery",
    name: "Qapıda nağd",
    description: "Məhsulu təhvil alanda nağd ödəyin.",
    is_active: true,
    sort_order: 3,
  },
];

const DEFAULTS_BY_KEY = new Map(DEFAULT_PAYMENT_METHODS.map((method) => [method.key, method]));

export function isValidPaymentMethodKey(key) {
  return DEFAULTS_BY_KEY.has(key);
}

export function normalizeWhatsappOrderPhone(phone) {
  return String(phone || "").replace(/[^\d]/g, "");
}

export function isValidWhatsappOrderPhone(phone) {
  const normalized = normalizeWhatsappOrderPhone(phone);
  return normalized.length >= 10 && normalized.length <= 15;
}

function getEnvWhatsappOrderPhone() {
  return normalizeWhatsappOrderPhone(process.env.WHATSAPP_ORDER_PHONE || "");
}

export async function getWhatsappOrderPhoneConfig() {
  const collection = getDB().collection("app_settings");
  const setting = await collection.findOne({ key: WHATSAPP_SETTING_KEY });
  const storedPhone = normalizeWhatsappOrderPhone(setting?.value);

  if (storedPhone) {
    return {
      phone: storedPhone,
      source: "database",
      updated_at: setting?.updated_at || setting?.created_at || null,
      updated_by: setting?.updated_by || null,
    };
  }

  const envPhone = getEnvWhatsappOrderPhone();
  if (envPhone) {
    return {
      phone: envPhone,
      source: "env",
      updated_at: null,
      updated_by: null,
    };
  }

  return {
    phone: "",
    source: "unset",
    updated_at: setting?.updated_at || setting?.created_at || null,
    updated_by: setting?.updated_by || null,
  };
}

export async function setWhatsappOrderPhone(phone, updatedBy = null) {
  const normalizedPhone = normalizeWhatsappOrderPhone(phone);
  const collection = getDB().collection("app_settings");

  if (!normalizedPhone) {
    await collection.deleteOne({ key: WHATSAPP_SETTING_KEY });
    return getWhatsappOrderPhoneConfig();
  }

  await collection.updateOne(
    { key: WHATSAPP_SETTING_KEY },
    {
      $set: {
        value: normalizedPhone,
        updated_at: new Date(),
        updated_by: updatedBy,
      },
      $setOnInsert: {
        key: WHATSAPP_SETTING_KEY,
        created_at: new Date(),
      },
    },
    { upsert: true }
  );

  return getWhatsappOrderPhoneConfig();
}

export async function ensurePaymentMethods() {
  const collection = getDB().collection("payment_methods");

  await Promise.all(
    DEFAULT_PAYMENT_METHODS.map((method) =>
      collection.updateOne(
        { key: method.key },
        {
          $setOnInsert: {
            ...method,
            unavailable_message: INACTIVE_MESSAGE,
            created_at: new Date(),
            updated_at: new Date(),
          },
        },
        { upsert: true }
      )
    )
  );

  const existing = await collection
    .find({ key: { $in: DEFAULT_PAYMENT_METHODS.map((method) => method.key) } })
    .toArray();

  const existingByKey = new Map(existing.map((method) => [method.key, method]));

  return DEFAULT_PAYMENT_METHODS.map((method) => {
    const current = existingByKey.get(method.key) || {};
    return {
      key: method.key,
      name: current.name || method.name,
      description: current.description || method.description,
      is_active: current.is_active ?? method.is_active,
      sort_order: current.sort_order ?? method.sort_order,
      unavailable_message: current.unavailable_message || INACTIVE_MESSAGE,
      updated_at: current.updated_at || current.created_at || null,
    };
  }).sort((a, b) => a.sort_order - b.sort_order);
}

export function toPublicPaymentMethod(method) {
  return {
    id: method.key,
    name: method.name,
    description: method.description,
    is_active: !!method.is_active,
    unavailable_message: method.is_active ? null : method.unavailable_message || INACTIVE_MESSAGE,
  };
}

export function toAdminPaymentMethod(method) {
  return {
    id: method.key,
    name: method.name,
    description: method.description,
    is_active: !!method.is_active,
    unavailable_message: method.unavailable_message || INACTIVE_MESSAGE,
    updated_at: method.updated_at || null,
  };
}
