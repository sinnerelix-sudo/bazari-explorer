import { Router } from "express";
import { getDB } from "../db.js";
import { authRequired, roleRequired, publicUser } from "../auth.js";
import { toId } from "../util.js";
import {
  ensurePaymentMethods,
  getWhatsappOrderPhone,
  isValidPaymentMethodKey,
  toAdminPaymentMethod,
} from "../paymentMethods.js";

const r = Router();

r.get("/users", authRequired, roleRequired("admin"), async (_req, res) => {
  const users = await getDB().collection("users").find().sort({ created_at: -1 }).toArray();
  res.json(users.map(publicUser));
});

r.put("/users/:id/role", authRequired, roleRequired("admin"), async (req, res) => {
  const id = toId(req.params.id);
  if (!id) return res.status(404).json({ error: "Not found" });
  const { role } = req.body || {};
  if (!["user", "seller", "admin"].includes(role)) return res.status(400).json({ error: "Bad role" });
  await getDB().collection("users").updateOne({ _id: id }, { $set: { role } });
  res.json({ ok: true });
});

r.get("/payment-methods", authRequired, roleRequired("admin"), async (_req, res) => {
  const methods = await ensurePaymentMethods();
  const whatsappPhone = getWhatsappOrderPhone();

  res.json({
    methods: methods.map(toAdminPaymentMethod),
    whatsapp_phone: whatsappPhone,
    whatsapp_configured: Boolean(whatsappPhone),
  });
});

r.put("/payment-methods/:id", authRequired, roleRequired("admin"), async (req, res) => {
  const key = req.params.id;
  if (!isValidPaymentMethodKey(key)) return res.status(404).json({ error: "Not found" });

  const { is_active } = req.body || {};
  if (typeof is_active !== "boolean") {
    return res.status(400).json({ error: "Bad is_active value" });
  }

  await ensurePaymentMethods();
  await getDB().collection("payment_methods").updateOne(
    { key },
    { $set: { is_active, updated_at: new Date() } }
  );

  const methods = await ensurePaymentMethods();
  const updated = methods.find((method) => method.key === key);
  res.json(toAdminPaymentMethod(updated));
});

export default r;
