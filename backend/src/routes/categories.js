import { Router } from "express";
import { getDB } from "../db.js";
import { authRequired, roleRequired } from "../auth.js";
import { publicCategory, toId } from "../util.js";

const r = Router();

const slugify = (s) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

r.get("/", async (_req, res) => {
  const items = await getDB().collection("categories").find().sort({ parent_id: 1, order: 1, name: 1 }).toArray();
  res.set("Cache-Control", "public, max-age=30, stale-while-revalidate=120");
  res.json(items.map(publicCategory));
});

r.post("/", authRequired, roleRequired("admin"), async (req, res) => {
  const body = req.body || {};
  if (!body.name) return res.status(400).json({ error: "Name required" });
  const doc = {
    name: body.name,
    name_ru: body.name_ru || "",
    slug: body.slug || slugify(body.name),
    image: body.image || "",
    icon: body.icon || "",
    parent_id: toId(body.parent_id),
    order: Number(body.order) || 0,
    created_at: new Date(),
  };
  const { insertedId } = await getDB().collection("categories").insertOne(doc);
  res.json(publicCategory({ ...doc, _id: insertedId }));
});

r.put("/:id", authRequired, roleRequired("admin"), async (req, res) => {
  const id = toId(req.params.id);
  if (!id) return res.status(404).json({ error: "Not found" });
  const update = { ...req.body };
  delete update.id; delete update._id;
  if (update.parent_id !== undefined) update.parent_id = update.parent_id ? toId(update.parent_id) : null;
  if (update.order !== undefined) update.order = Number(update.order) || 0;
  if (update.name && !update.slug) update.slug = slugify(update.name);
  await getDB().collection("categories").updateOne({ _id: id }, { $set: update });
  const c = await getDB().collection("categories").findOne({ _id: id });
  res.json(publicCategory(c));
});

r.delete("/:id", authRequired, roleRequired("admin"), async (req, res) => {
  const id = toId(req.params.id);
  if (!id) return res.status(404).json({ error: "Not found" });
  await getDB().collection("categories").deleteOne({ _id: id });
  res.json({ ok: true });
});

export default r;
