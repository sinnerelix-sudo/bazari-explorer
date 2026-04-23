import { Router } from "express";
import { ensurePaymentMethods, getWhatsappOrderPhone, toPublicPaymentMethod } from "../paymentMethods.js";

const r = Router();

r.get("/", async (_req, res) => {
  const methods = await ensurePaymentMethods();
  const whatsappPhone = getWhatsappOrderPhone();

  res.json({
    methods: methods.map(toPublicPaymentMethod),
    whatsapp_phone: whatsappPhone,
    whatsapp_configured: Boolean(whatsappPhone),
  });
});

export default r;
