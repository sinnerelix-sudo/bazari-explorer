import { getDB } from "./db.js";

const INACTIVE_MESSAGE = "Texniki s\u0259b\u0259bl\u0259rd\u0259n \u00E7al\u0131\u015Fm\u0131r";

export const DEFAULT_PAYMENT_METHODS = [
  {
    key: "card_to_card",
    name: "Kartdan karta \u00F6d\u0259ni\u015F",
    description: "K\u00F6\u00E7\u00FCrm\u0259 il\u0259 \u00F6d\u0259ni\u015Fi tamamlay\u0131n.",
    is_active: true,
    sort_order: 1,
  },
  {
    key: "card",
    name: "Kartla \u00F6d\u0259ni\u015F",
    description: "Kart vasit\u0259sil\u0259 sifari\u015Fi t\u0259sdiql\u0259yin.",
    is_active: true,
    sort_order: 2,
  },
  {
    key: "cash_on_delivery",
    name: "Qap\u0131da na\u011Fd",
    description: "M\u0259hsulu t\u0259hvil alanda na\u011Fd \u00F6d\u0259yin.",
    is_active: true,
    sort_order: 3,
  },
];

const DEFAULTS_BY_KEY = new Map(DEFAULT_PAYMENT_METHODS.map((method) => [method.key, method]));

export function isValidPaymentMethodKey(key) {
  return DEFAULTS_BY_KEY.has(key);
}

export function getWhatsappOrderPhone() {
  return (process.env.WHATSAPP_ORDER_PHONE || "").trim();
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
