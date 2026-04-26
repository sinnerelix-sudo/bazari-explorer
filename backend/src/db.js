import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
const dbName = process.env.DB_NAME || "modamall";

if (!uri) {
  console.error("MONGODB_URI is not set");
  process.exit(1);
}

const client = new MongoClient(uri, {
  maxPoolSize: 20,
  serverSelectionTimeoutMS: 10000,
});

let db;

export async function connectDB() {
  if (db) return db;
  await client.connect();
  db = client.db(dbName);
  console.log(`✅ MongoDB connected: ${dbName}`);

  // Indexes (idempotent)
  await Promise.all([
    db.collection("users").createIndex({ email: 1 }, { unique: true }),
    db.collection("products").createIndex({ name: "text", description: "text", brand: "text" }),
    db.collection("products").createIndex({ category_id: 1 }),
    db.collection("products").createIndex({ flash_sale_active: 1, flash_sale_price: 1, _id: -1 }),
    db.collection("categories").createIndex({ slug: 1 }, { unique: true }),
    db.collection("categories").createIndex({ parent_id: 1, name: 1 }),
    db.collection("hero_banners").createIndex({ is_active: 1, order: 1 }),
    db.collection("hero_banners").createIndex({ seed_key: 1 }, { unique: true, sparse: true }),
    db.collection("carts").createIndex({ user_id: 1 }, { unique: true }),
    db.collection("app_settings").createIndex({ key: 1 }, { unique: true }),
    db.collection("payment_methods").createIndex({ key: 1 }, { unique: true }),
    db.collection("reviews").createIndex({ product_id: 1 }),
    db.collection("notifications").createIndex({ user_id: 1, created_at: -1 }),
    db.collection("push_subscriptions").createIndex({ user_id: 1 }),
  ]);

  return db;
}

export function getDB() {
  if (!db) throw new Error("DB not connected");
  return db;
}
