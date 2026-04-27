import { Router } from "express";
import { getDB } from "../db.js";

const r = Router();

const WHATSAPP_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN || "EAAVbvnQkOfIBRYxBWAYIEcW6ZAbqkLt4jZC2DveXWkpA9o4yiAamZB589Ll9PaJIyTJIZAOW0PYKMBimHZAH2yfyYm9KtJXR1sWefCeLH9dMq6z2JHcQBmLSsCUXZCutWRN7ASiayY7rvDUz98bMph56EsaiFeGM3YyWS5vCBTzUOm9IIdFvAqP4jZBfaH6vnbbTrtVdaxA2O42t7hr0ZCubmdbTS9YiB268yDrcYV3uPDm9z6FJHPZCmHZBKpDQf9u3JexgRlnAQWp7Jz1MNS9ayVsdWo";
const PHONE_ID = process.env.WHATSAPP_PHONE_NUMBER_ID || "1003782942827710";

// Helper to send WhatsApp message
async function sendWhatsAppMessage(to, code) {
  const url = `https://graph.facebook.com/v18.0/${PHONE_ID}/messages`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${WHATSAPP_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to: to,
      type: "template",
      template: {
        name: "hello_world", // Using the default hello_world template for test
        language: { code: "en_US" }
      }
    }),
  });

  // Note: hello_world template doesn't support custom parameters easily without approval.
  // For a real app, you'd use a custom template like "otp_verification" with a variable.
  // Since we are testing, I'll try to send a text message if the template approach is limited.
  // Actually, for the first message, templates are often required.
  // Let's try sending a simple text message first, if it fails, we know we need templates.
}

async function sendOTPText(to, code) {
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
      type: "text",
      text: { body: `Bazari təsdiqləmə kodunuz: ${code}` }
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

  // Sanitize phone: remove +, spaces, etc.
  const cleanPhone = phone.replace(/\D/g, "");
  
  // Generate 6-digit code
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  
  const db = getDB();
  // Save to DB with expiration (5 mins)
  await db.collection("otps").updateOne(
    { phone: cleanPhone },
    { $set: { code, created_at: new Date() } },
    { upsert: true }
  );

  try {
    await sendOTPText(cleanPhone, code);
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

  // Code is valid - we can delete it now
  await db.collection("otps").deleteOne({ _id: entry._id });
  
  res.json({ ok: true, message: "Phone verified" });
});

export default r;
