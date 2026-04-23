import { Router } from "express";
import { ensurePaymentMethods, getWhatsappOrderPhoneConfig, toPublicPaymentMethod } from "../paymentMethods.js";

const r = Router();

r.get("/", async (_req, res) => {
  const methods = await ensurePaymentMethods();
  const whatsappConfig = await getWhatsappOrderPhoneConfig();

  res.json({
    methods: methods.map(toPublicPaymentMethod),
    whatsapp_phone: whatsappConfig.phone,
    whatsapp_configured: Boolean(whatsappConfig.phone),
  });
});

export default r;
