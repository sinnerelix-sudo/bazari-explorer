import { Router } from "express";
import { getDB } from "../db.js";

const r = Router();

const WHATSAPP_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN || "EAAVbvnQkOfIBRYxBWAYIEcW6ZAbqkLt4jZC2DveXWkpA9o4yiAamZB589Ll9PaJIyTJIZAOW0PYKMBimHZAH2yfyYm9KtJXR1sWefCeLH9dMq6z2JHcQBmLSsCUXZCutWRN7ASiayY7rvDUz98bMph56EsaiFeGM3YyWS5vCBTzUOm9IIdFvAqP4jZBfaH6vnbbTrtVdaxA2O42t7hr0ZCubmdbTS9YiB268yDrcYV3uPDm9z6FJHPZCmHZBKpDQf9u3JexgRlnAQWp7Jz1MNS9ayVsdWo";
const PHONE_ID = process.env.WHATSAPP_PHONE_NUMBER_ID || "1003782942827710";

async function sendOTPTemplate(to, code) {
  const url = `https://graph.facebook.com/v18.0/${PHONE_ID}/messages`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${WHATSAPP_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: to,
      type: "template",
      template: {
        name: "bazari_otp",
        language: { code: "az" },
        components: [
          {
            type: "body",
            parameters: [
              {
                type: "text",
                text: code.toString()
              }
            ]
          },
          {
            type: "button",
            sub_type: "url",
            index: "0",
            parameters: [
              {
                type: "text",
                text: code.toString()
              }
            ]
          }
        ]
      }
    }),
  });
  
  if (!response.ok) {
    const error = await response.json();
    console.error("WhatsApp API Error:", error);
    throw new Error(error.error?.message || "WhatsApp message failed");
  }
  return response.json();
}

r.post("/send", async (req, res) => {
  const { phone } = req.body;
  if (!phone) return res.status(400).json({ error: "Phone number is required" });

  const cleanPhone = phone.replace(/\D/g, "");
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  
  const db = getDB();
  await db.collection("otps").updateOne(
    { phone: cleanPhone },
    { $set: { code, created_at: new Date() } },
    { upsert: true }
  );

  try {
    await sendOTPTemplate(cleanPhone, code);
    res.json({ ok: true, message: "Code sent" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

r.post("/verify", async (req, res) => {
  const { phone, code } = req.body;
  if (!phone || !code) return res.status(400).json({ error: "Phone and code are required" });

  const cleanPhone = phone.replace(/\D/g, "");
  const db = getDB();
  const entry = await db.collection("otps").findOne({ phone: cleanPhone, code: code.toString() });
  
  if (!entry) {
    return res.status(400).json({ error: "Invalid or expired code" });
  }

  await db.collection("otps").deleteOne({ _id: entry._id });
  res.json({ ok: true, message: "Phone verified" });
});

export default r;
