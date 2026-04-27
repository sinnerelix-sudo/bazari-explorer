import { Router } from "express";
import { getDB } from "../db.js";

const r = Router();

// Configuration (Should be in .env)
const VERIFY_TOKEN = "bazari_verify_token_2026";
const WHATSAPP_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN || "EAAVbvnQkOfIBRYxBWAYIEcW6ZAbqkLt4jZC2DveXWkpA9o4yiAamZB589Ll9PaJIyTJIZAOW0PYKMBimHZAH2yfyYm9KtJXR1sWefCeLH9dMq6z2JHcQBmLSsCUXZCutWRN7ASiayY7rvDUz98bMph56EsaiFeGM3YyWS5vCBTzUOm9IIdFvAqP4jZBfaH6vnbbTrtVdaxA2O42t7hr0ZCubmdbTS9YiB268yDrcYV3uPDm9z6FJHPZCmHZBKpDQf9u3JexgRlnAQWp7Jz1MNS9ayVsdWo";
const PHONE_ID = process.env.WHATSAPP_PHONE_NUMBER_ID || "1003782942827710";

// 1. Generate unique code for a phone number
r.post("/generate", async (req, res) => {
  const { phone } = req.body;
  if (!phone) return res.status(400).json({ error: "Nömrə mütləqdir" });

  const cleanPhone = phone.replace(/\D/g, "");
  // Generate a friendly but unique code like BAZARI-123
  const shortId = Math.floor(100 + Math.random() * 899).toString();
  const code = `BAZARI-${shortId}`;
  
  const db = getDB();
  await db.collection("otps").updateOne(
    { phone: cleanPhone },
    { $set: { code, verified: false, created_at: new Date() } },
    { upsert: true }
  );

  res.json({ ok: true, code });
});

// 2. Check if the phone is verified (Polling for frontend)
r.get("/check-status", async (req, res) => {
  const { phone } = req.query;
  if (!phone) return res.status(400).json({ error: "Nömrə mütləqdir" });

  const cleanPhone = phone.replace(/\D/g, "");
  const db = getDB();
  const entry = await db.collection("otps").findOne({ phone: cleanPhone });

  if (entry && entry.verified) {
    return res.json({ verified: true });
  }

  res.json({ verified: false });
});

// 3. WhatsApp Webhook - Verification (GET)
r.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("✅ Webhook verified!");
    return res.status(200).send(challenge);
  }
  res.status(403).send("Forbidden");
});

// 4. WhatsApp Webhook - Receiving messages (POST)
r.post("/webhook", async (req, res) => {
  const body = req.body;

  if (body.object === "whatsapp_business_account") {
    try {
      const entry = body.entry?.[0];
      const changes = entry?.changes?.[0];
      const value = changes?.value;
      const message = value?.messages?.[0];

      if (message && message.type === "text") {
        const senderPhone = message.from; // Sender's phone number
        const text = message.text.body.trim().toUpperCase();

        console.log(`📩 Message from ${senderPhone}: ${text}`);

        // Find matching code in DB
        const db = getDB();
        const otpEntry = await db.collection("otps").findOne({ 
           phone: { $regex: new RegExp(senderPhone.slice(-9)) }, // Match last 9 digits to be safe
           code: text 
        });

        if (otpEntry) {
          console.log(`✅ Code match found for ${senderPhone}! Verifying...`);
          await db.collection("otps").updateOne(
            { _id: otpEntry._id },
            { $set: { verified: true, sender_full_phone: senderPhone } }
          );
        }
      }
    } catch (err) {
      console.error("Webhook processing error:", err);
    }
    return res.status(200).send("EVENT_RECEIVED");
  }
  res.status(404).send();
});

export default r;
