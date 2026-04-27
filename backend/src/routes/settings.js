import { Router } from "express";
import { getDB } from "../db.js";
import { authRequired, roleRequired } from "../auth.js";

const r = Router();

// Public: Get delivery settings
r.get("/delivery", async (_req, res) => {
  const db = getDB();
  const settings = await db.collection("app_settings").findOne({ key: "delivery_config" });
  res.json(settings?.value || { fee: 5, free_limit: 50 });
});

// Admin: Update delivery settings
r.put("/delivery", authRequired, roleRequired("admin"), async (req, res) => {
  const { fee, free_limit } = req.body || {};
  if (typeof fee !== "number" || typeof free_limit !== "number") {
    return res.status(400).json({ error: "Yanlış rəqəm formatı" });
  }

  const db = getDB();
  await db.collection("app_settings").updateOne(
    { key: "delivery_config" },
    { $set: { value: { fee, free_limit }, updated_at: new Date() } },
    { upsert: true }
  );

  res.json({ ok: true, fee, free_limit });
});

export default r;
